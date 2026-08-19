const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const { registrarAuditoria } = require('../utils/auditoria');

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

async function login(req, res) {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ error: 'Usuario y contraseña son obligatorios' });
    }

    const usuarioEncontrado = await prisma.usuario.findUnique({
      where: { usuario },
    });

    if (!usuarioEncontrado) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    if (!usuarioEncontrado.activo) {
      return res.status(403).json({ error: 'Usuario desactivado' });
    }

    const contrasenaValida = await bcrypt.compare(contrasena, usuarioEncontrado.contrasena);

    if (!contrasenaValida) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: usuarioEncontrado.id, rol: usuarioEncontrado.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuarioEncontrado.id,
        nombre: usuarioEncontrado.nombre,
        usuario: usuarioEncontrado.usuario,
        rol: usuarioEncontrado.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
}
async function listarUsuarios(req, res) {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nombre: true, usuario: true, rol: true, activo: true, fechaCreacion: true },
      orderBy: { id: 'asc' },
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al listar usuarios' });
  }
}

async function obtenerUsuario(req, res) {
  try {
    const { id } = req.params;
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(id) },
      select: { id: true, nombre: true, usuario: true, rol: true, activo: true, fechaCreacion: true },
    });
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
}

async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, rol, activo } = req.body;
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: { nombre, rol, activo },
      select: { id: true, nombre: true, usuario: true, rol: true, activo: true },
    });
        await registrarAuditoria({
      usuarioId: req.usuario.id,
      accion: 'Actualizo usuario',
      tablaAfectada: 'usuarios',
      registroId: usuarioActualizado.id,
      detalle: JSON.stringify({ nombre, rol, activo }),
    });
    res.json(usuarioActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
}
module.exports = { crearUsuario, login, listarUsuarios, obtenerUsuario, actualizarUsuario };
