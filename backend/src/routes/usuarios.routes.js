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

module.exports = router;