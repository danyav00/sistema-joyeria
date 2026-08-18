const prisma = require('../utils/prisma');

async function abrirTurno(req, res) {
  try {
    const { tipo } = req.body;
    if (!tipo) return res.status(400).json({ error: 'El tipo de turno es obligatorio' });

    const turnoAbierto = await prisma.turno.findFirst({
      where: { usuarioId: req.usuario.id, estado: 'ABIERTO' },
    });
    if (turnoAbierto) {
      return res.status(400).json({ error: 'Ya tienes un turno abierto', turno: turnoAbierto });
    }

    const ahora = new Date();
    const horaTexto = ahora.toTimeString().slice(0, 5);

    const turno = await prisma.turno.create({
      data: {
        tipo,
        usuarioId: req.usuario.id,
        horaApertura: horaTexto,
      },
    });

    res.status(201).json(turno);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al abrir turno' });
  }
}

async function cerrarTurno(req, res) {
  try {
    const { id } = req.params;
    const ahora = new Date();
    const horaTexto = ahora.toTimeString().slice(0, 5);

    const turno = await prisma.turno.update({
      where: { id: Number(id) },
      data: { estado: 'CERRADO', fechaCierre: ahora, horaCierre: horaTexto },
    });

    res.json(turno);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al cerrar turno' });
  }
}

async function turnoActivo(req, res) {
  try {
    const turno = await prisma.turno.findFirst({
      where: { usuarioId: req.usuario.id, estado: 'ABIERTO' },
    });
    res.json(turno || null);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al buscar turno activo' });
  }
}

module.exports = { abrirTurno, cerrarTurno, turnoActivo };