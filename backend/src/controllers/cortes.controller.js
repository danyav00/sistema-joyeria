const prisma = require('../utils/prisma');

async function generarCorte(req, res) {
  try {
    const { turnoId } = req.params;

    const resultado = await prisma.$transaction(async (tx) => {
      const turno = await tx.turno.findUnique({ where: { id: Number(turnoId) } });
      if (!turno) throw new Error('Turno no encontrado');

      const corteExistente = await tx.corte.findUnique({ where: { turnoId: Number(turnoId) } });
      if (corteExistente) throw new Error('Este turno ya tiene un corte generado');

      const ventas = await tx.venta.findMany({
        where: { turnoId: Number(turnoId) },
        include: { pagos: true },
      });

      const gastos = await tx.gasto.findMany({ where: { turnoId: Number(turnoId) } });

      const totalVentas = ventas.reduce((suma, v) => suma + Number(v.total), 0);
      const totalGastos = gastos.reduce((suma, g) => suma + Number(g.monto), 0);
      const totalDevoluciones = ventas
        .filter((v) => v.estado === 'CON_DEVOLUCION')
        .reduce((suma, v) => suma + Number(v.total), 0);

      let totalEfectivo = 0, totalTarjeta = 0, totalTransferencia = 0, totalDeposito = 0;
      for (const venta of ventas) {
        for (const pago of venta.pagos) {
          const monto = Number(pago.monto);
          if (pago.metodoPago === 'EFECTIVO') totalEfectivo += monto;
          if (pago.metodoPago === 'TARJETA') totalTarjeta += monto;
          if (pago.metodoPago === 'TRANSFERENCIA') totalTransferencia += monto;
          if (pago.metodoPago === 'DEPOSITO') totalDeposito += monto;
        }
      }

      const totalFinal = totalVentas - totalGastos - totalDevoluciones;

      const corte = await tx.corte.create({
        data: {
          turnoId: Number(turnoId),
          totalVentas,
          totalGastos,
          totalDevoluciones,
          totalEfectivo,
          totalTarjeta,
          totalTransferencia,
          totalDeposito,
          totalFinal,
          usuarioId: req.usuario.id,
        },
      });

      await tx.turno.update({
        where: { id: Number(turnoId) },
        data: { estado: 'CERRADO', fechaCierre: new Date(), horaCierre: new Date().toTimeString().slice(0, 5) },
      });

      return corte;
    });

    res.status(201).json(resultado);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message || 'Error al generar el corte' });
  }
}

async function obtenerCorte(req, res) {
  try {
    const { turnoId } = req.params;
    const corte = await prisma.corte.findUnique({
      where: { turnoId: Number(turnoId) },
      include: { turno: true, usuario: { select: { nombre: true } } },
    });

    if (!corte) return res.status(404).json({ error: 'Corte no encontrado' });
    res.json(corte);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el corte' });
  }
}

async function listarCortes(req, res) {
  try {
    const cortes = await prisma.corte.findMany({
      include: { turno: true, usuario: { select: { nombre: true } } },
      orderBy: { fecha: 'desc' },
    });
    res.json(cortes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar cortes' });
  }
}

module.exports = { generarCorte, obtenerCorte, listarCortes };