const prisma = require('../utils/prisma');
const { registrarAuditoria } = require('../utils/auditoria');

function generarFolio() {
  return `D-${Date.now().toString().slice(-8)}`;
}

async function buscarVentaPorFolio(req, res) {
  try {
    const { folio } = req.params;
    const venta = await prisma.venta.findUnique({
      where: { folio },
      include: { detalles: { include: { producto: { include: { codigoPrecio: true } } } } },
    });

    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const diasTranscurridos = Math.floor((new Date() - new Date(venta.fecha)) / (1000 * 60 * 60 * 24));

    res.json({ ...venta, diasTranscurridos });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar la venta' });
  }
}

async function crearDevolucion(req, res) {
  try {
    const { ventaOriginalId, productoDevueltoId, productoNuevoId, metodoPago } = req.body;

    if (!ventaOriginalId || !productoDevueltoId || !productoNuevoId) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const productoDevuelto = await tx.producto.findUnique({
        where: { id: Number(productoDevueltoId) },
        include: { codigoPrecio: true },
      });
      const productoNuevo = await tx.producto.findUnique({
        where: { id: Number(productoNuevoId) },
        include: { codigoPrecio: true },
      });

      if (!productoDevuelto) throw new Error('Producto devuelto no encontrado');
      if (!productoNuevo) throw new Error('Producto nuevo no encontrado');
      if (productoNuevo.estado !== 'DISPONIBLE') throw new Error(`Producto ${productoNuevo.nombre} no esta disponible`);
      if (productoNuevo.existencia < 1) throw new Error(`Producto ${productoNuevo.nombre} sin existencia`);

      const precioDevuelto = Number(productoDevuelto.codigoPrecio.precio);
      const precioNuevo = Number(productoNuevo.codigoPrecio.precio);
      const diferencia = Math.max(0, precioNuevo - precioDevuelto);

      if (diferencia > 0 && !metodoPago) {
        throw new Error('Se requiere metodo de pago para la diferencia');
      }

      // El producto devuelto regresa al inventario
      await tx.producto.update({
        where: { id: productoDevuelto.id },
        data: { existencia: productoDevuelto.existencia + 1, estado: 'DISPONIBLE' },
      });

      await tx.movimientoInventario.create({
        data: {
          productoId: productoDevuelto.id,
          tipoMovimiento: 'DEVOLUCION',
          cantidad: 1,
          usuarioId: req.usuario.id,
          nota: 'Devolucion/cambio de venta',
        },
      });

      // El producto nuevo sale del inventario
      const nuevaExistencia = productoNuevo.existencia - 1;
      await tx.producto.update({
        where: { id: productoNuevo.id },
        data: {
          existencia: nuevaExistencia,
          estado: nuevaExistencia === 0 ? 'VENDIDO' : 'DISPONIBLE',
        },
      });

      await tx.movimientoInventario.create({
        data: {
          productoId: productoNuevo.id,
          tipoMovimiento: 'VENTA',
          cantidad: 1,
          usuarioId: req.usuario.id,
          nota: 'Entregado por cambio/devolucion',
        },
      });

      const devolucion = await tx.devolucion.create({
        data: {
          folio: generarFolio(),
          ventaOriginalId: Number(ventaOriginalId),
          productoDevueltoId: productoDevuelto.id,
          productoNuevoId: productoNuevo.id,
          diferenciaPagada: diferencia,
          usuarioId: req.usuario.id,
        },
        include: {
          productoDevuelto: true,
          productoNuevo: true,
          ventaOriginal: { include: { usuario: { select: { nombre: true } } } },
        },
      });

      return devolucion;
    });

    await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'Registro devolucion/cambio',
      tablaAfectada: 'devoluciones',
      registroId: resultado.id,
      detalle: `Folio ${resultado.folio}, diferencia $${resultado.diferenciaPagada}`,
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al registrar la devolucion' });
  }
}

async function listarDevoluciones(req, res) {
  try {
    const devoluciones = await prisma.devolucion.findMany({
      include: {
        productoDevuelto: true,
        productoNuevo: true,
        ventaOriginal: true,
        usuario: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    res.json(devoluciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar devoluciones' });
  }
}

module.exports = { buscarVentaPorFolio, crearDevolucion, listarDevoluciones };