const prisma = require('../utils/prisma');
const { registrarAuditoria } = require('../utils/auditoria');
const ID_PRODUCTO_CARPETA = 1;

async function crearMayorista(req, res) {
  try {
    const { numeroCliente, nombreCompleto, telefono, tipoBeneficio } = req.body;
    if (!numeroCliente || !nombreCompleto || !telefono) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const mayorista = await prisma.mayorista.create({
      data: { numeroCliente, nombreCompleto, telefono, tipoBeneficio: tipoBeneficio || 'NORMAL' },
    });

      await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'Creo mayorista',
      tablaAfectada: 'mayoristas',
      registroId: mayorista.id,
      detalle: `Cliente ${mayorista.numeroCliente} - ${mayorista.nombreCompleto}`,
    });

    res.status(201).json(mayorista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el mayorista' });
  }
}

async function listarMayoristas(req, res) {
  try {
    const { estado } = req.query;
    const filtros = {};
    if (estado) filtros.estado = estado;

    const mayoristas = await prisma.mayorista.findMany({
      where: filtros,
      orderBy: { id: 'asc' },
    });

    res.json(mayoristas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar mayoristas' });
  }
}

async function obtenerMayorista(req, res) {
  try {
    const { id } = req.params;
    const mayorista = await prisma.mayorista.findUnique({
      where: { id: Number(id) },
      include: { compras: { orderBy: { fecha: 'desc' } } },
    });

    if (!mayorista) return res.status(404).json({ error: 'Mayorista no encontrado' });
    res.json(mayorista);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el mayorista' });
  }
}

// Registra una compra para un mayorista, ligada a una venta ya creada,
// y aplica automaticamente la logica de beneficios.
async function registrarCompra(req, res) {
  try {
    const { id } = req.params;
    const { ventaId } = req.body;

    if (!ventaId) return res.status(400).json({ error: 'La venta es obligatoria' });

    const resultado = await prisma.$transaction(async (tx) => {
      const mayorista = await tx.mayorista.findUnique({ where: { id: Number(id) } });
      if (!mayorista) throw new Error('Mayorista no encontrado');

      const venta = await tx.venta.findUnique({ where: { id: Number(ventaId) } });
      if (!venta) throw new Error('Venta no encontrada');

            const monto = Number(venta.total);
      let carpetaEntregada = false;

      const umbralActivacion = mayorista.tipoBeneficio === 'ESPECIAL' ? 1500 : 4000;
      const umbralReactivacion = mayorista.tipoBeneficio === 'ESPECIAL' ? 1500 : 1500;

      const nuevoAcumulado = Number(mayorista.totalAcumuladoPeriodo) + monto;
      let nuevoEstado = mayorista.estado;

      if (mayorista.estado === 'SUSPENDIDO' && monto >= umbralReactivacion) {
        nuevoEstado = 'ACTIVO';
      }
      if (nuevoAcumulado >= umbralActivacion) {
        nuevoEstado = 'ACTIVO';
      }
      if (monto >= 5000 && mayorista.tipoBeneficio === 'NORMAL') {
        carpetaEntregada = true;

        const carpeta = await tx.producto.findUnique({ where: { id: ID_PRODUCTO_CARPETA } });
        if (carpeta && carpeta.existencia > 0) {
          await tx.producto.update({
            where: { id: ID_PRODUCTO_CARPETA },
            data: { existencia: carpeta.existencia - 1 },
          });

          await tx.movimientoInventario.create({
            data: {
              productoId: ID_PRODUCTO_CARPETA,
              tipoMovimiento: 'AJUSTE',
              cantidad: -1,
              usuarioId: req.usuario.id,
              nota: `Carpeta entregada a mayorista por compra de $${monto}`,
            },
          });
        }
      }

      const mayoristaActualizado = await tx.mayorista.update({
        where: { id: mayorista.id },
        data: {
          totalAcumuladoPeriodo: nuevoAcumulado,
          fechaUltimaCompra: new Date(),
          estado: nuevoEstado,
        },
      });

      await tx.mayoristaCompra.create({
        data: {
          mayoristaId: mayorista.id,
          ventaId: venta.id,
          monto,
          carpetaEntregada,
        },
      });

      await tx.venta.update({
        where: { id: venta.id },
        data: { mayoristaId: mayorista.id },
      });

      return { mayorista: mayoristaActualizado, carpetaEntregada };
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al registrar la compra' });
  }
}

// Revisa todos los mayoristas activos y suspende a los que llevan
// mas de 30 dias sin comprar. Se puede llamar manualmente o con un job.
async function revisarInactivos(req, res) {
  try {
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    const resultado = await prisma.mayorista.updateMany({
      where: {
        estado: 'ACTIVO',
        fechaUltimaCompra: { lt: hace30Dias },
      },
      data: { estado: 'SUSPENDIDO', totalAcumuladoPeriodo: 0 },
    });

    res.json({ mensaje: `${resultado.count} mayoristas suspendidos por inactividad` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al revisar mayoristas inactivos' });
  }
}
async function actualizarMayorista(req, res) {
  try {
    const { id } = req.params;
    const { nombreCompleto, telefono } = req.body;

    const mayoristaActualizado = await prisma.mayorista.update({
      where: { id: Number(id) },
      data: { nombreCompleto, telefono },
    });

    res.json(mayoristaActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el mayorista' });
  }
}
async function reactivarManual(req, res) {
  try {
    const { id } = req.params;

    const mayorista = await prisma.mayorista.findUnique({ where: { id: Number(id) } });
    if (!mayorista) return res.status(404).json({ error: 'Mayorista no encontrado' });
    if (mayorista.estado !== 'SUSPENDIDO') {
      return res.status(400).json({ error: 'El mayorista no esta suspendido' });
    }

    const mayoristaActualizado = await prisma.mayorista.update({
      where: { id: mayorista.id },
      data: { estado: 'ACTIVO', fechaUltimaCompra: new Date() },
    });

    await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'Reactivo mayorista manualmente',
      tablaAfectada: 'mayoristas',
      registroId: mayorista.id,
      detalle: `${mayorista.numeroCliente} - ${mayorista.nombreCompleto}`,
    });

    res.json(mayoristaActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al reactivar el mayorista' });
  }
}

module.exports = {
  crearMayorista,
  listarMayoristas,
  obtenerMayorista,
  registrarCompra,
  revisarInactivos,
  actualizarMayorista,
  reactivarManual,
};