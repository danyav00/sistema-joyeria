// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

async function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en BD para obtener nombre y rol
    const usuario = await prisma.usuario.findUnique({
      where: { id: datos.id },
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Inyectar datos completos en req.usuario
    req.usuario = {
      id: usuario.id,
      nombre: usuario.nombre, // 👈 ahora sí
      rol: usuario.rol,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { verificarToken };
