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

    const usuario = req.usuario;
    const esEmpleado = usuario.rol === 'EMPLEADO';

    // Filtro de ventas
    let filtroVentas = {};

    if (esEmpleado) {
      // Buscamos el turno abierto del empleado
      const turnoActivo = await prisma.turno.findFirst({
        where: {
          usuarioId: usuario.id,
          estado: 'ABIERTO',
        },
      });

      filtroVentas = {
        usuarioId: usuario.id,
      };

      // Si tiene turno abierto, filtramos también por ese turno
      if (turnoActivo) {
        filtroVentas.turnoId = turnoActivo.id;
      }
    }

    const [
      ventasHoy,
      ventasMes,
      gastosMes,
      totalProductos,
      apartadosActivos,
      mayoristasActivos,
    ] = await Promise.all([
      // Ventas de hoy (filtradas si es empleado)
      prisma.venta.findMany({
        where: {
          ...filtroVentas,
          fecha: { gte: inicioDia, lte: ahora },
        },
        include: {
          pagos: true,
        },
      }),

      // Ventas del mes (solo administradores)
      esEmpleado
        ? Promise.resolve([])
        : prisma.venta.findMany({
            where: {
              fecha: { gte: inicioMes, lte: ahora },
            },
            include: {
              detalles: { include: { producto: true } },
              pagos: true,
            },
          }),

      // Gastos del mes (solo administradores)
      esEmpleado
        ? Promise.resolve([])
        : prisma.gasto.findMany({
            where: { fecha: { gte: inicioMes, lte: ahora } },
          }),

      prisma.producto.count(),
      prisma.apartado.count({ where: { estado: 'ACTIVO' } }),
      prisma.mayorista.count({ where: { estado: 'ACTIVO' } }),
    ]);

    const totalVentasHoy = ventasHoy.reduce((suma, v) => suma + Number(v.total), 0);
    const totalVentasMes = ventasMes.reduce((suma, v) => suma + Number(v.total), 0);
    const totalGastosMes = gastosMes.reduce((suma, g) => suma + Number(g.monto), 0);

    // Productos más vendidos y métodos de pago (solo admin)
    const productosVendidos = {};
    const ventasPorMetodoPago = {};

    if (!esEmpleado) {
      for (const venta of ventasMes) {
        for (const detalle of venta.detalles || []) {
          const nombre = detalle.producto?.nombre || 'Sin nombre';
          productosVendidos[nombre] = (productosVendidos[nombre] || 0) + detalle.cantidad;
        }
        for (const pago of venta.pagos || []) {
          ventasPorMetodoPago[pago.metodoPago] =
            (ventasPorMetodoPago[pago.metodoPago] || 0) + Number(pago.monto);
        }
      }
    } else {
      // Para empleados: métodos de pago solo de sus ventas de hoy
      for (const venta of ventasHoy) {
        for (const pago of venta.pagos || []) {
          ventasPorMetodoPago[pago.metodoPago] =
            (ventasPorMetodoPago[pago.metodoPago] || 0) + Number(pago.monto);
        }
      }
    }

    const productosMasVendidos = Object.entries(productosVendidos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }));

    res.json({
      esEmpleado,
      ventasHoy: totalVentasHoy,
      ventasMes: totalVentasMes,
      gastosMes: totalGastosMes,
      totalProductos,
      apartadosActivos,
      mayoristasActivos,
      productosMasVendidos,
      ventasPorMetodoPago,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el dashboard' });
  }
}

module.exports = { obtenerDashboard };