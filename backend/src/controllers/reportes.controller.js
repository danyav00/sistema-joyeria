const prisma = require('../utils/prisma');
const ExcelJS = require('exceljs');

function calcularRangoFechas(periodo) {
  const ahora = new Date();
  let inicio = new Date(ahora);

  if (periodo === 'diario') {
    inicio.setHours(0, 0, 0, 0);
  } else if (periodo === 'semanal') {
    inicio.setDate(ahora.getDate() - 7);
  } else if (periodo === 'mensual') {
    inicio.setMonth(ahora.getMonth() - 1);
  } else if (periodo === 'bimestral') {
    inicio.setMonth(ahora.getMonth() - 2);
  } else {
    inicio.setFullYear(2000);
  }

  return { inicio, fin: ahora };
}

async function reporteVentas(req, res) {
  try {
    const { periodo, usuarioId, metodoPago, material } = req.query;
    const { inicio, fin } = calcularRangoFechas(periodo);

    const filtros = { fecha: { gte: inicio, lte: fin } };
    if (usuarioId) filtros.usuarioId = Number(usuarioId);

    const ventas = await prisma.venta.findMany({
      where: filtros,
      include: {
        detalles: { include: { producto: true } },
        pagos: true,
        usuario: { select: { nombre: true } },
      },
      orderBy: { fecha: 'desc' },
    });

    let ventasFiltradas = ventas;
    if (metodoPago) {
      ventasFiltradas = ventasFiltradas.filter((v) => v.pagos.some((p) => p.metodoPago === metodoPago));
    }
    if (material) {
      ventasFiltradas = ventasFiltradas.filter((v) => v.detalles.some((d) => d.producto.material === material));
    }

    const totalVentas = ventasFiltradas.reduce((suma, v) => suma + Number(v.total), 0);

    res.json({
      periodo: periodo || 'todos',
      totalVentas,
      cantidadVentas: ventasFiltradas.length,
      ventas: ventasFiltradas,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el reporte de ventas' });
  }
}

async function exportarVentasExcel(req, res) {
  try {
    const { periodo } = req.query;
    const { inicio, fin } = calcularRangoFechas(periodo);

    const ventas = await prisma.venta.findMany({
      where: { fecha: { gte: inicio, lte: fin } },
      include: { usuario: { select: { nombre: true } }, pagos: true },
      orderBy: { fecha: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const hoja = workbook.addWorksheet('Ventas');

    hoja.columns = [
      { header: 'Folio', key: 'folio', width: 20 },
      { header: 'Fecha', key: 'fecha', width: 20 },
      { header: 'Usuario', key: 'usuario', width: 20 },
      { header: 'Tipo', key: 'tipoVenta', width: 12 },
      { header: 'Subtotal', key: 'subtotal', width: 12 },
      { header: 'Descuento', key: 'descuento', width: 12 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Metodos de pago', key: 'metodos', width: 25 },
    ];

    ventas.forEach((v) => {
      hoja.addRow({
        folio: v.folio,
        fecha: v.fecha.toLocaleString('es-MX'),
        usuario: v.usuario.nombre,
        tipoVenta: v.tipoVenta,
        subtotal: Number(v.subtotal),
        descuento: Number(v.descuento),
        total: Number(v.total),
        metodos: v.pagos.map((p) => `${p.metodoPago}: $${p.monto}`).join(', '),
      });
    });

    hoja.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al exportar el reporte a Excel' });
  }
}

module.exports = { reporteVentas, exportarVentasExcel };