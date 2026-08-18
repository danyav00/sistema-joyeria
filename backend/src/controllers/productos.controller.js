const prisma = require('../utils/prisma');

async function crearProducto(req, res) {
  try {
    const { sku, codigoPrecioId, nombre, descripcion, material, tipo, existencia } = req.body;

    if (!sku || !codigoPrecioId || !nombre || !material || !tipo) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const producto = await prisma.producto.create({
      data: {
        sku,
        codigoPrecioId: Number(codigoPrecioId),
        nombre,
        descripcion,
        material,
        tipo,
        existencia: Number(existencia) || 0,
      },
      include: { codigoPrecio: true },
    });

    if (producto.existencia > 0) {
      await prisma.movimientoInventario.create({
        data: {
          productoId: producto.id,
          tipoMovimiento: 'ENTRADA',
          cantidad: producto.existencia,
          usuarioId: req.usuario.id,
          nota: 'Entrada inicial al crear producto',
        },
      });
    }

    res.status(201).json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
}

async function listarProductos(req, res) {
  try {
    const { estado, material, tipo } = req.query;

    const filtros = {};
    if (estado) filtros.estado = estado;
    if (material) filtros.material = material;
    if (tipo) filtros.tipo = tipo;

    const productos = await prisma.producto.findMany({
      where: filtros,
      include: { codigoPrecio: true },
      orderBy: { id: 'asc' },
    });

    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar productos' });
  }
}

async function obtenerProducto(req, res) {
  try {
    const { id } = req.params;
    const producto = await prisma.producto.findUnique({
      where: { id: Number(id) },
      include: { codigoPrecio: true, movimientos: { orderBy: { fecha: 'desc' } } },
    });

    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
}

async function actualizarProducto(req, res) {
  try {
    const { id } = req.params;
    const { nombre, descripcion, material, tipo, codigoPrecioId } = req.body;

    const producto = await prisma.producto.update({
      where: { id: Number(id) },
      data: { nombre, descripcion, material, tipo, codigoPrecioId: codigoPrecioId ? Number(codigoPrecioId) : undefined },
      include: { codigoPrecio: true },
    });

    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
}

async function ajustarInventario(req, res) {
  try {
    const { id } = req.params;
    const { cantidad, nota } = req.body;

    if (cantidad === undefined) {
      return res.status(400).json({ error: 'La cantidad es obligatoria' });
    }

    const producto = await prisma.producto.findUnique({ where: { id: Number(id) } });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });

    const nuevaExistencia = producto.existencia + Number(cantidad);
    if (nuevaExistencia < 0) {
      return res.status(400).json({ error: 'La existencia no puede quedar negativa' });
    }

    const productoActualizado = await prisma.$transaction(async (tx) => {
      const actualizado = await tx.producto.update({
        where: { id: Number(id) },
        data: { existencia: nuevaExistencia },
      });

      await tx.movimientoInventario.create({
        data: {
          productoId: producto.id,
          tipoMovimiento: 'AJUSTE',
          cantidad: Number(cantidad),
          usuarioId: req.usuario.id,
          nota: nota || 'Ajuste manual de inventario',
        },
      });

      return actualizado;
    });

    res.json(productoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al ajustar inventario' });
  }
}

module.exports = {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  ajustarInventario,
};