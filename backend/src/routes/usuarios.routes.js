const express = require('express');
const router = express.Router();
const {
  crearUsuario,
  login,
  listarUsuarios,
  obtenerUsuario,
  actualizarUsuario,
  cambiarContrasena,
  resetearContrasena,
} = require('../controllers/usuarios.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/roles.middleware');

router.post('/login', login);
router.put('/cambiar-contrasena', verificarToken, cambiarContrasena);
router.post('/', verificarToken, permitirRoles('ADMINISTRADOR'), crearUsuario);
router.get('/', verificarToken, permitirRoles('ADMINISTRADOR'), listarUsuarios);
router.get('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), obtenerUsuario);
router.put('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), actualizarUsuario);
router.put('/:id/resetear-contrasena', verificarToken, permitirRoles('ADMINISTRADOR'), resetearContrasena);

module.exports = router;