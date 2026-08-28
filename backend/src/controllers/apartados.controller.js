const prisma = require('../utils/prisma');
const { registrarAuditoria } = require('../utils/auditoria');
const ExcelJS = require('exceljs');

function generarFolio() {
  return `A-${Date.now().toString().slice(-8)}`;
}

async function crearApartado(req, res) {
  try {
    const { productoId, clienteNombre, clienteTelefono, anticipo, cantidad } = req.body;

    if (!productoId || !clienteNombre || !clienteTelefono || !anticipo) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const cantidadFinal = Number(cantidad) || 1;

    const resultado = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({
        where: { id: Number(productoId) },
        include: { codigoPrecio: true },
      });

      if (!producto) throw new Error('Producto no encontrado');
      if (producto.estado !== 'DISPONIBLE') throw new Error('El producto no esta disponible para apartar');
      if (producto.existencia < cantidadFinal) throw new Error(`Existencia insuficiente (disponible: ${producto.existencia})`);

      const precioUnitario = Number(producto.codigoPrecio.precio);
      const precioTotal = precioUnitario * cantidadFinal;
      const minimoRequerido = precioTotal * 0.2;

      if (Number(anticipo) < minimoRequerido) {
        throw new Error(`El anticipo minimo es 20% ($${minimoRequerido.toFixed(2)})`);
      }

      const apartado = await tx.apartado.create({
        data: {
          folio: generarFolio(),
          productoId: producto.id,
          cantidad: cantidadFinal,
          clienteNombre,
          clienteTelefono,
          usuarioId: req.usuario.id,
          precioTotal,
          anticipo: Number(anticipo),
          saldoPendiente: precioTotal - Number(anticipo),
        },
      });

      const nuevaExistencia = producto.existencia - cantidadFinal;
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
          tipoMovimiento: 'APARTADO',
          cantidad: cantidadFinal,
          usuarioId: req.usuario.id,
          referencia: apartado.folio,
          nota: 'Producto apartado',
        },
      });

      return apartado;
    });

    await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'Creo apartado',
      tablaAfectada: 'apartados',
      registroId: resultado.id,
      detalle: `Folio ${resultado.folio}, cliente ${resultado.clienteNombre}`,
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

      const producto = await tx.producto.findUnique({ where: { id: apartado.productoId } });
      await tx.producto.update({
        where: { id: apartado.productoId },
        data: { existencia: producto.existencia + apartado.cantidad, estado: 'DISPONIBLE' },
      });

      await tx.movimientoInventario.create({
        data: {
          productoId: apartado.productoId,
          tipoMovimiento: 'CANCELACION',
          cantidad: apartado.cantidad,
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
async function exportarExcel(req, res) {
  try {
    const apartados = await prisma.apartado.findMany({
      include: { producto: true, abonos: { orderBy: { fecha: 'asc' } } },
      orderBy: [{ clienteNombre: 'asc' }, { fechaApartado: 'desc' }],
    });

    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet('Apartados por cliente');

    hoja.columns = [
      { header: 'Cliente / Detalle', key: 'col1', width: 30 },
      { header: 'Teléfono / Fecha', key: 'col2', width: 20 },
      { header: 'Producto / Monto', key: 'col3', width: 20 },
      { header: 'Total', key: 'col4', width: 15 },
      { header: 'Saldo pendiente', key: 'col5', width: 15 },
      { header: 'Estado', key: 'col6', width: 15 },
    ];
    hoja.getRow(1).font = { bold: true };

    const clientes = {};
    apartados.forEach((a) => {
      const clave = `${a.clienteNombre}|${a.clienteTelefono}`;
      if (!clientes[clave]) clientes[clave] = [];
      clientes[clave].push(a);
    });

    for (const clave in clientes) {
      const [nombre, telefono] = clave.split('|');
      const listaApartados = clientes[clave];

      const filaCliente = hoja.addRow({ col1: `CLIENTE: ${nombre}`, col2: `Tel: ${telefono}` });
      filaCliente.font = { bold: true };
      filaCliente.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE4C8' } };
      });

      listaApartados.forEach((a) => {
        hoja.addRow({
          col1: `  Folio: ${a.folio}`,
          col2: new Date(a.fechaApartado).toLocaleDateString('es-MX'),
          col3: `${a.producto.sku} - ${a.producto.nombre} x${a.cantidad}`,
          col4: Number(a.precioTotal),
          col5: Number(a.saldoPendiente),
          col6: a.estado,
        });

        a.abonos.forEach((ab) => {
          hoja.addRow({
            col1: '    Abono',
            col2: new Date(ab.fecha).toLocaleDateString('es-MX'),
            col3: ab.metodoPago,
            col4: Number(ab.monto),
          });
        });
      });

      hoja.addRow({});
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=apartados_por_cliente.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al exportar el reporte a Excel' });
  }
}

module.exports = {
  crearApartado,
  abonarApartado,
  entregarApartado,
  cancelarApartado,
  listarApartados,
  obtenerApartado,
  exportarExcel,
};