const prisma = require('../utils/prisma');
const { registrarAuditoria } = require('../utils/auditoria');

const PORCENTAJE_MINIMO_VENTA = 0.5;
const DIAS_LIMITE = 45;
const MONTO_MINIMO_CREDITO = 2000;

function generarFolio() {
  return `CR-${Date.now()}`;
}

async function abrirCredito(req, res) {
  try {
    const { mayoristaId, productos } = req.body;

    if (!mayoristaId || !productos || productos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const mayorista = await tx.mayorista.findUnique({ where: { id: Number(mayoristaId) } });
      if (!mayorista) throw new Error('Mayorista no encontrado');

      let totalCredito = 0;
      const productosData = [];

      for (const item of productos) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
          include: { codigoPrecio: true },
        });

        if (!producto) throw new Error(`Producto ${item.productoId} no encontrado`);
        if (producto.estado !== 'DISPONIBLE') throw new Error(`Producto ${producto.nombre} no esta disponible`);
        if (producto.existencia < 1) throw new Error(`Producto ${producto.nombre} sin existencia disponible`);
        if (producto.material !== 'ORO_LAMINADO') throw new Error(`Producto ${producto.nombre} no es Oro Laminado, no se acepta en creditos`);

        const precio = Number(producto.codigoPrecio.precio);
        totalCredito += precio;

        productosData.push({ productoId: producto.id, precioAlMomento: precio });

        const nuevaExistencia = producto.existencia - 1;
        await tx.producto.update({
          where: { id: producto.id },
          data: {
            existencia: nuevaExistencia,
            estado: nuevaExistencia === 0 ? 'APARTADO' : 'DISPONIBLE',
          },
        });

        await tx.movimientoInventario.create({
          data: {
            productoId: producto.id,
            tipoMovimiento: 'AJUSTE',
            cantidad: -1,
            usuarioId: req.usuario.id,
            nota: 'Entregado a mayorista en consignacion',
          },
        });
      }

      if (totalCredito < MONTO_MINIMO_CREDITO) {
        throw new Error(`El credito minimo es de $${MONTO_MINIMO_CREDITO}`);
      }

      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + DIAS_LIMITE);

      const credito = await tx.creditoMayorista.create({
        data: {
          folio: generarFolio(),
          mayoristaId: Number(mayoristaId),
          totalCredito,
          fechaLimite,
          usuarioId: req.usuario.id,
          productos: { create: productosData },
        },
        include: { productos: { include: { producto: true } } },
      });

      return credito;
    });

    await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'Abrio credito de mayorista',
      tablaAfectada: 'creditos_mayorista',
      registroId: resultado.id,
      detalle: `Folio ${resultado.folio}, total $${resultado.totalCredito}`,
    });

    const mayoristaCompleto = await prisma.mayorista.findUnique({ where: { id: resultado.mayoristaId } });

    res.status(201).json({ ...resultado, mayorista: mayoristaCompleto });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al abrir el credito' });
  }
}

async function listarCreditos(req, res) {
  try {
    const { estado, mayoristaId } = req.query;
    const filtros = {};
    if (estado) filtros.estado = estado;
    if (mayoristaId) filtros.mayoristaId = Number(mayoristaId);

    const creditos = await prisma.creditoMayorista.findMany({
      where: filtros,
      include: { mayorista: true, productos: { include: { producto: true } } },
      orderBy: { fechaEntrega: 'desc' },
    });

    res.json(creditos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar creditos' });
  }
}

async function obtenerCredito(req, res) {
  try {
    const { id } = req.params;
    const credito = await prisma.creditoMayorista.findUnique({
      where: { id: Number(id) },
      include: { mayorista: true, productos: { include: { producto: true } } },
    });

    if (!credito) return res.status(404).json({ error: 'Credito no encontrado' });
    res.json(credito);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el credito' });
  }
}

async function liquidarCredito(req, res) {
  try {
    const { id } = req.params;
    const { productosVendidos, productosDevueltos, turnoId, pagos } = req.body;

    if (!turnoId || !pagos) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const credito = await tx.creditoMayorista.findUnique({
        where: { id: Number(id) },
        include: { productos: { include: { producto: true } } },
      });

      if (!credito) throw new Error('Credito no encontrado');
      if (credito.estado !== 'ACTIVO') throw new Error('Este credito ya fue liquidado o cancelado');

      const idsVendidos = productosVendidos || [];
      const idsDevueltos = productosDevueltos || [];

      const totalVendidoReal = credito.productos
        .filter((p) => idsVendidos.includes(p.id))
        .reduce((suma, p) => suma + Number(p.precioAlMomento), 0);

      const porcentajeVendido = totalVendidoReal / Number(credito.totalCredito);
      const cumpleMinimo = porcentajeVendido >= PORCENTAJE_MINIMO_VENTA;

      let totalAPagar = 0;

      for (const detalle of credito.productos) {
        const seVendio = idsVendidos.includes(detalle.id);
        const seDevuelve = idsDevueltos.includes(detalle.id);

        if (seVendio && seDevuelve) {
          throw new Error(`El producto ${detalle.producto.sku} no puede estar marcado como vendido y devuelto a la vez`);
        }

        if (seDevuelve) {
          if (!cumpleMinimo) {
            throw new Error('No cumple el minimo de venta (50%), no se pueden devolver productos');
          }
          if (detalle.producto.material !== 'ORO_LAMINADO') {
            throw new Error(`El producto ${detalle.producto.sku} no es Oro Laminado, no se acepta devolucion`);
          }

          const productoDevuelto = await tx.producto.findUnique({ where: { id: detalle.productoId } });
          await tx.producto.update({
            where: { id: detalle.productoId },
            data: { existencia: productoDevuelto.existencia + 1, estado: 'DISPONIBLE' },
          });

          await tx.creditoMayoristaProducto.update({
            where: { id: detalle.id },
            data: { devuelto: true },
          });

          await tx.movimientoInventario.create({
            data: {
              productoId: detalle.productoId,
              tipoMovimiento: 'DEVOLUCION',
              cantidad: 1,
              usuarioId: req.usuario.id,
              nota: 'Devolucion de credito de mayorista',
            },
          });
        } else {
          totalAPagar += Number(detalle.precioAlMomento);

          await tx.creditoMayoristaProducto.update({
            where: { id: detalle.id },
            data: { vendido: seVendio },
          });
        }
      }

      const totalPagos = pagos.reduce((suma, p) => suma + Number(p.monto), 0);
      if (Math.abs(totalPagos - totalAPagar) > 0.01) {
        throw new Error(`Los pagos ($${totalPagos}) no coinciden con el total a pagar ($${totalAPagar.toFixed(2)})`);
      }

      const venta = await tx.venta.create({
        data: {
          folio: `V-CR-${Date.now()}`,
          usuarioId: req.usuario.id,
          turnoId: Number(turnoId),
          tipoVenta: 'MAYOREO',
          mayoristaId: credito.mayoristaId,
          subtotal: totalAPagar,
          descuento: 0,
          total: totalAPagar,
          pagos: { create: pagos.map((p) => ({ metodoPago: p.metodoPago, monto: Number(p.monto) })) },
        },
      });

      const creditoActualizado = await tx.creditoMayorista.update({
        where: { id: credito.id },
        data: {
          totalVendido: totalVendidoReal,
          estado: 'LIQUIDADO',
          fechaLiquidacion: new Date(),
          ventaId: venta.id,
        },
      });

      const mayorista = await tx.mayorista.findUnique({ where: { id: credito.mayoristaId } });
      const nuevoAcumulado = Number(mayorista.totalAcumuladoPeriodo) + totalAPagar;
      let nuevoEstado = mayorista.estado;
      if (mayorista.estado === 'SUSPENDIDO' && totalAPagar >= 1500) nuevoEstado = 'ACTIVO';
      if (nuevoAcumulado >= 4000) nuevoEstado = 'ACTIVO';

      await tx.mayorista.update({
        where: { id: mayorista.id },
        data: { totalAcumuladoPeriodo: nuevoAcumulado, fechaUltimaCompra: new Date(), estado: nuevoEstado },
      });

      await tx.mayoristaCompra.create({
        data: {
          mayoristaId: mayorista.id,
          ventaId: venta.id,
          monto: totalAPagar,
          carpetaEntregada: totalAPagar >= 5000 && mayorista.tipoBeneficio === 'NORMAL',
        },
      });

      return creditoActualizado;
    });

    await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'Liquido credito de mayorista',
      tablaAfectada: 'creditos_mayorista',
      registroId: resultado.id,
      detalle: `Folio ${resultado.folio}, vendido $${resultado.totalVendido}`,
    });

    const creditoCompleto = await prisma.creditoMayorista.findUnique({
      where: { id: resultado.id },
      include: { mayorista: true, productos: { include: { producto: true } } },
    });

    res.json(creditoCompleto);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al liquidar el credito' });
  }
}

module.exports = { abrirCredito, listarCreditos, obtenerCredito, liquidarCredito };
