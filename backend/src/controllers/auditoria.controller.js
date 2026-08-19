const prisma = require('../utils/prisma');

async function listarAuditoria(req, res) {
  try {
    const { usuarioId, tablaAfectada } = req.query;
    const filtros = {};
    if (usuarioId) filtros.usuarioId = Number(usuarioId);
    if (tablaAfectada) filtros.tablaAfectada = tablaAfectada;

    const registros = await prisma.auditoria.findMany({
      where: filtros,
      include: { usuario: { select: { nombre: true } } },
      orderBy: { fecha: 'desc' },
      take: 100,
    });

    res.json(registros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar auditoria' });
  }
}

module.exports = { listarAuditoria };