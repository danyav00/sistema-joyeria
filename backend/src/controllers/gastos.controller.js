const prisma = require('../utils/prisma');
const { registrarAuditoria } = require('../utils/auditoria');

async function crearGasto(req, res) {
  try {
    const { categoria, concepto, monto, metodoPago, turnoId } = req.body;

    if (!categoria || !concepto || !monto || !metodoPago || !turnoId) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }

    const gasto = await prisma.gasto.create({
      data: {
        categoria,
        concepto,
        monto: Number(monto),
        metodoPago,
        turnoId: Number(turnoId),
        usuarioId: req.usuario.id,
      },
    });

    await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'Registro gasto',
      tablaAfectada: 'gastos',
      registroId: gasto.id,
      detalle: `${gasto.concepto} - $${gasto.monto}`,
    });

    res.status(201).json(gasto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar el gasto' });
  }
}

async function listarGastos(req, res) {
  try {
    const { turnoId, usuarioId } = req.query;
    const filtros = {};
    if (turnoId) filtros.turnoId = Number(turnoId);
    if (usuarioId) filtros.usuarioId = Number(usuarioId);

    const gastos = await prisma.gasto.findMany({
      where: filtros,
      orderBy: { fecha: 'desc' },
    });

    res.json(gastos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar gastos' });
  }
}

module.exports = { crearGasto, listarGastos };