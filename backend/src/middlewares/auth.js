// src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');

async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuario en BD
    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: { turnos: { where: { estado: "ACTIVO" } } }
    });

    if (!usuario) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    // Inyectar datos en req.user
    req.user = {
      id: usuario.id,
      rol: usuario.rol, // "admin", "empleado", "socio"
      turnoActual: usuario.turnos[0]?.id || null
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "Token inválido" });
  }
}

module.exports = authMiddleware;
