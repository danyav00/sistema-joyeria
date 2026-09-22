const prisma = require('../utils/prisma');

function inicioDelDia() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return hoy;
}

function inicioDelMes() {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth(), 1);
}

async function obtenerDashboard(req, res) {
  try {
    const inicioDia = inicioDelDia();
    const inicioMes = inicioDelMes();
    const ahora = new Date();

    const usuario = req.usuario; // ← correcto

    // 🔒 Filtrado por rol
    let filtroVentas = {};

    if (usuario.rol === 'EMPLEADO') {   // asegúrate que el rol esté en mayúsculas como en tu BD
      filtroVentas = {
        usuarioId: usuario.id,          // ← campo correcto
      };
    }

    const [
      ventasHoy,
      ventasMes,
      gastosMes,
      totalProductos,
      apartadosActivos,
      mayoristasActivos,
    ] = await Promise.all([
      prisma.venta.findMany({
        where: {
          ...filtroVentas,
          fecha: { gte: inicioDia, lte: ahora },
        },
      }),
      prisma.venta.findMany({
        where: {
          ...filtroVentas,
          fecha: { gte: inicioMes, lte: ahora },
        },
        include: {
          detalles: { include: { producto: true } },
          pagos: true,
        },
      }),
      prisma.gasto.findMany({
        where: { fecha: { gte: inicioMes, lte: ahora } },
      }),
      prisma.producto.count(),
      prisma.apartado.count({ where: { estado: 'ACTIVO' } }),
      prisma.mayorista.count({ where: { estado: 'ACTIVO' } }),
    ]);

    const totalVentasHoy = ventasHoy.reduce((suma, v) => suma + Number(v.total), 0);
    const totalVentasMes = ventasMes.reduce((suma, v) => suma + Number(v.total), 0);
    const totalGastosMes = gastosMes.reduce((suma, g) => suma + Number(g.monto), 0);

    const productosVendidos = {};
    const ventasPorMaterial = {};
    const ventasPorMetodoPago = {};

    for (const venta of ventasMes) {
      for (const detalle of venta.detalles) {
        const nombre = detalle.producto?.nombre || 'Sin nombre';
        productosVendidos[nombre] = (productosVendidos[nombre] || 0) + detalle.cantidad;

        const material = detalle.producto?.material || 'OTRO';
        ventasPorMaterial[material] = (ventasPorMaterial[material] || 0) + Number(detalle.subtotal);
      }

      for (const pago of venta.pagos) {
        ventasPorMetodoPago[pago.metodoPago] =
          (ventasPorMetodoPago[pago.metodoPago] || 0) + Number(pago.monto);
      }
    }

    const productosMasVendidos = Object.entries(productosVendidos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    res.json({
      ventasHoy: totalVentasHoy,
      ventasMes: totalVentasMes,
      gastosMes: totalGastosMes,
      totalProductos,
      apartadosActivos,
      mayoristasActivos,
      productosMasVendidos,
      ventasPorMaterial,
      ventasPorMetodoPago,
    });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el dashboard' });
  }
}

module.exports = { obtenerDashboard };