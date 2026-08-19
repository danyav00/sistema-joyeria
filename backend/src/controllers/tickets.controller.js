const prisma = require('../utils/prisma');

async function generarTicket(req, res) {
  try {
    const { ventaId, tipo } = req.body;

    if (!ventaId || !tipo) return res.status(400).json({ error: 'Faltan datos obligatorios' });

    const venta = await prisma.venta.findUnique({
      where: { id: Number(ventaId) },
      include: { detalles: { include: { producto: true } }, pagos: true, usuario: { select: { nombre: true } } },
    });

    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const ticket = await prisma.ticket.create({
      data: { ventaId: venta.id, tipo },
    });

    res.status(201).json({ ticket, venta });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar el ticket' });
  }
}

async function listarTicketsPorVenta(req, res) {
  try {
    const { ventaId } = req.params;
    const tickets = await prisma.ticket.findMany({ where: { ventaId: Number(ventaId) } });
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar tickets' });
  }
}

module.exports = { generarTicket, listarTicketsPorVenta };