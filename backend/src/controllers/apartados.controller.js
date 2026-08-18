const prisma = require('../utils/prisma');

function generarFolio() {
  return `A-${Date.now()}`;
}

async function crearApartado(req, res) {
  try {
    const { productoId, clienteNombre, clienteTelefono, anticipo } = req.body;

    if (!productoId || !clienteNombre || !clienteTelefono || !anticipo) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const resultado = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({
        where: { id: Number(productoId) },
        include: { codigoPrecio: true },
      });

      if (!producto) throw new Error('Producto no encontrado');
      if (producto.estado !== 'DISPONIBLE') throw new Error('El producto no esta disponible para apartar');

      const precioTotal = Number(producto.codigoPrecio.precio);
      const minimoRequerido = precioTotal * 0.2;

      if (Number(anticipo) < minimoRequerido) {
        throw new Error(`El anticipo minimo es 20% ($${minimoRequerido.toFixed(2)})`);
      }

      const apartado = await tx.apartado.create({
        data: {
          folio: generarFolio(),
          productoId: producto.id,
          clienteNombre,
          clienteTelefono,
          usuarioId: req.usuario.id,
          precioTotal,
          anticipo: Number(anticipo),
          saldoPendiente: precioTotal - Number(anticipo),
        },
      });

      await tx.producto.update({
        where: { id: producto.id },
        data: { estado: 'APARTADO' },
      });

      await tx.movimientoInventario.create({
        data: {
          productoId: producto.id,
          tipoMovimiento: 'APARTADO',
          cantidad: 1,
          usuarioId: req.usuario.id,
          referencia: apartado.folio,
          nota: 'Producto apartado',
        },
      });

      return apartado;
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al crear el apartado' });
  }
}

async function abonarApartado(req, res) {
  try {
    const { id } = req.params;
    const { monto, metodoPago } = req.body;

    if (!monto || !metodoPago) return res.status(400).json({ error: 'Faltan datos del abono' });

    const resultado = await prisma.$transaction(async (tx) => {
      const apartado = await tx.apartado.findUnique({ where: { id: Number(id) } });
      if (!apartado) throw new Error('Apartado no encontrado');
      if (apartado.estado !== 'ACTIVO') throw new Error('Este apartado ya no esta activo');

      const montoNum = Number(monto);
      if (montoNum > Number(apartado.saldoPendiente)) {
        throw new Error('El abono no puede ser mayor al saldo pendiente');
      }

      const nuevoSaldo = Number(apartado.saldoPendiente) - montoNum;

      const apartadoActualizado = await tx.apartado.update({
        where: { id: apartado.id },
        data: {
          saldoPendiente: nuevoSaldo,
          estado: nuevoSaldo === 0 ? 'LIQUIDADO' : 'ACTIVO',
        },
      });

      await tx.apartadoAbono.create({
        data: {
          apartadoId: apartado.id,
          monto: montoNum,
          metodoPago,
          usuarioId: req.usuario.id,
        },
      });

      return apartadoActualizado;
    });

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al registrar el abono' });
  }
}

async function entregarApartado(req, res) {
  try {
    const { id } = req.params;

    const apartado = await prisma.apartado.findUnique({ where: { id: Number(id) } });
    if (!apartado) return res.status(404).json({ error: 'Apartado no encontrado' });
    if (apartado.estado !== 'LIQUIDADO') return res.status(400).json({ error: 'El apartado debe estar liquidado antes de entregar' });

    const apartadoActualizado = await prisma.apartado.update({
      where: { id: apartado.id },
      data: { estado: 'ENTREGADO' },
    });

    res.json(apartadoActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al entregar el apartado' });
  }
}

async function cancelarApartado(req, res) {
  try {
    const { id } = req.params;

    const resultado = await prisma.$transaction(async (tx) => {
      const apartado = await tx.apartado.findUnique({ where: { id: Number(id) } });
      if (!apartado) throw new Error('Apartado no encontrado');
      if (apartado.estado === 'ENTREGADO') throw new Error('No se puede cancelar un apartado ya entregado');

      const apartadoActualizado = await tx.apartado.update({
        where: { id: apartado.id },
        data: { estado: 'CANCELADO' },
      });

      await tx.producto.update({
        where: { id: apartado.productoId },
        data: { estado: 'DISPONIBLE' },
      });

      await tx.movimientoInventario.create({
        data: {
          productoId: apartado.productoId,
          tipoMovimiento: 'CANCELACION',
          cantidad: 1,
          usuarioId: req.usuario.id,
          referencia: apartado.folio,
          nota: 'Apartado cancelado, producto disponible de nuevo',
        },
      });

      return apartadoActualizado;
    });

    res.json(resultado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al cancelar el apartado' });
  }
}

async function listarApartados(req, res) {
  try {
    const { estado } = req.query;
    const filtros = {};
    if (estado) filtros.estado = estado;

    const apartados = await prisma.apartado.findMany({
      where: filtros,
      include: { producto: true, abonos: true },
      orderBy: { fechaApartado: 'desc' },
    });

    res.json(apartados);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar apartados' });
  }
}

async function obtenerApartado(req, res) {
  try {
    const { id } = req.params;
    const apartado = await prisma.apartado.findUnique({
      where: { id: Number(id) },
      include: { producto: true, abonos: { orderBy: { fecha: 'desc' } } },
    });

    if (!apartado) return res.status(404).json({ error: 'Apartado no encontrado' });
    res.json(apartado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el apartado' });
  }
}

module.exports = {
  crearApartado,
  abonarApartado,
  entregarApartado,
  cancelarApartado,
  listarApartados,
  obtenerApartado,
};