const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');

async function crearUsuario(req, res) {
  try {
    const { nombre, usuario, contrasena, rol } = req.body;

    if (!nombre || !usuario || !contrasena || !rol) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const contrasenaEncriptada = await bcrypt.hash(contrasena, 10);

    const nuevoUsuario = await prisma.usuario.create({
      data: {
        nombre,
        usuario,
        contrasena: contrasenaEncriptada,
        rol,
      },
    });

    res.status(201).json({
      id: nuevoUsuario.id,
      nombre: nuevoUsuario.nombre,
      usuario: nuevoUsuario.usuario,
      rol: nuevoUsuario.rol,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
}

module.exports = { crearUsuario };