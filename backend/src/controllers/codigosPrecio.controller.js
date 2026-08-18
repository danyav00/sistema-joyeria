const prisma = require('../utils/prisma');

async function crearCodigoPrecio(req, res) {
  try {
    const { codigo } = req.body;
    if (!codigo) return res.status(400).json({ error: 'El codigo es obligatorio' });

    const codigoNum = parseInt(codigo, 10);
    const precio = (codigoNum + 4) * 10;

    const nuevo = await prisma.codigoPrecio.create({
      data: { codigo, precio },
    });

    res.status(201).json(nuevo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el codigo de precio' });
  }
}

async function listarCodigosPrecio(req, res) {
  try {
    const codigos = await prisma.codigoPrecio.findMany({ orderBy: { codigo: 'asc' } });
    res.json(codigos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar codigos de precio' });
  }
}

module.exports = { crearCodigoPrecio, listarCodigosPrecio };