const prisma = require('../utils/prisma');
const { registrarAuditoria } = require('../utils/auditoria');

function generarFolio(id) {
  return `V-${String(id).padStart(5, '0')}`;
}

async function crearVenta(req, res) {
  try {
    const { turnoId, tipoVenta, productos, pagos, descuento, mayoristaId, tipoDescuento } = req.body;

    if (!turnoId || !tipoVenta || !productos || productos.length === 0 || !pagos || pagos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos obligatorios para la venta' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const detallesData = [];

      const PORCENTAJE_MAYORISTA = 0.5;
      const PORCENTAJE_LOCATARIO = 0.2;

      for (const item of productos) {
        const producto = await tx.producto.findUnique({
          where: { id: item.productoId },
          include: { codigoPrecio: true },
        });

        if (!producto) throw new Error(`Producto ${item.productoId} no encontrado`);
        if (producto.estado !== 'DISPONIBLE') throw new Error(`Producto ${producto.nombre} no esta disponible`);
        if (producto.existencia < item.cantidad) throw new Error(`Existencia insuficiente de ${producto.nombre}`);

        const precioBase = Number(producto.codigoPrecio.precio);
        let precioUnitario = precioBase;

        if (!producto.tieneDescuentoAplicado) {
          if (tipoDescuento === 'MAYORISTA') {
            const porcentaje = producto.material === 'ORO_LAMINADO' ? 0.5 : 0.2;
            precioUnitario = precioBase * (1 - porcentaje);
          } else if (tipoDescuento === 'LOCATARIO') {
            precioUnitario = precioBase * (1 - PORCENTAJE_LOCATARIO);
          }
        }

        const subtotalLinea = precioUnitario * item.cantidad;
        subtotal += subtotalLinea;

        detallesData.push({
          productoId: producto.id,
          cantidad: item.cantidad,
          precioUnitario,
          subtotal: subtotalLinea,
        });

        const nuevaExistencia = producto.existencia - item.cantidad;
        await tx.producto.update({
          where: { id: producto.id },
          data: {
            existencia: nuevaExistencia,
            estado: nuevaExistencia === 0 ? 'VENDIDO' : 'DISPONIBLE',
          },
        });

        await tx.movimientoInventario.create({
          data: {
            productoId: producto.id,
            tipoMovimiento: 'VENTA',
            cantidad: item.cantidad,
            usuarioId: req.usuario.id,
            nota: 'Venta',
          },
        });
      }

      const descuentoAplicado = Number(descuento) || 0;
      const total = subtotal - descuentoAplicado;

      const totalPagos = pagos.reduce((suma, p) => suma + Number(p.monto), 0);
      if (Math.abs(totalPagos - total) > 0.01) {
        throw new Error(`Los pagos ($${totalPagos}) no coinciden con el total de la venta ($${total})`);
      }

      const ventaTemp = await tx.venta.create({
        data: {
          folio: 'TEMP',
          usuarioId: req.usuario.id,
          turnoId: Number(turnoId),
          tipoVenta,
          mayoristaId: mayoristaId ? Number(mayoristaId) : null,
          subtotal,
          descuento: descuentoAplicado,
          total,
          detalles: { create: detallesData },
          pagos: { create: pagos.map((p) => ({ metodoPago: p.metodoPago, monto: Number(p.monto) })) },
        },
        include: { detalles: true, pagos: true },
      });

      const venta = await tx.venta.update({
        where: { id: ventaTemp.id },
        data: { folio: generarFolio(ventaTemp.id) },
        include: { detalles: true, pagos: true },
      });

      return venta;
    });

    await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'Creo venta',
      tablaAfectada: 'ventas',
      registroId: resultado.id,
      detalle: `Folio ${resultado.folio}, total $${resultado.total}`,
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al crear la venta' });
  }
}

async function listarVentas(req, res) {
  try {
    const { turnoId, usuarioId, fecha } = req.query;
    const filtros = {};
    if (turnoId) filtros.turnoId = Number(turnoId);
    if (usuarioId) filtros.usuarioId = Number(usuarioId);
    if (fecha) {
      const inicio = new Date(fecha);
      const fin = new Date(fecha);
      fin.setDate(fin.getDate() + 1);
      filtros.fecha = { gte: inicio, lt: fin };
    }

    const ventas = await prisma.venta.findMany({
      where: filtros,
      include: { detalles: true, pagos: true },
      orderBy: { fecha: 'desc' },
    });

    res.json(ventas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar ventas' });
  }
}

async function obtenerVenta(req, res) {
  try {
    const { id } = req.params;
    const venta = await prisma.venta.findUnique({
      where: { id: Number(id) },
      include: {
        detalles: { include: { producto: true } },
        pagos: true,
        usuario: { select: { nombre: true } },
        mayorista: { select: { nombreCompleto: true } },
      },
    });

    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
}
async function eliminarVenta(req, res) {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (tx) => {
      await tx.ticket.deleteMany({ where: { ventaId: Number(id) } });
      await tx.mayoristaCompra.deleteMany({ where: { ventaId: Number(id) } });
      await tx.creditoMayorista.updateMany({ where: { ventaId: Number(id) }, data: { ventaId: null } });
      await tx.ventaPago.deleteMany({ where: { ventaId: Number(id) } });
      await tx.ventaDetalle.deleteMany({ where: { ventaId: Number(id) } });
      await tx.venta.delete({ where: { id: Number(id) } });
    });

    res.json({ mensaje: 'Venta eliminada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al eliminar la venta' });
  }
}

module.exports = { crearVenta, listarVentas, obtenerVenta, eliminarVenta };
