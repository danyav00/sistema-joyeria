const express = require('express');
const router = express.Router();
const {
  crearUsuario,
  login,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
} = require('../controllers/usuarios.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/roles.middleware');

router.post('/login', login);
router.post('/', verificarToken, permitirRoles('ADMINISTRADOR'), crearUsuario);
router.get('/', verificarToken, permitirRoles('ADMINISTRADOR'), listarUsuarios);
router.get('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), obtenerUsuario);
router.put('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), actualizarUsuario);

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
    res.json(usuarioActualizado);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
}
module.exports = { crearUsuario, login, listarUsuarios, obtenerUsuario, actualizarUsuario };