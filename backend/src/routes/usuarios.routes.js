const express = require('express');
const router = express.Router();
const { crearUsuario, login } = require('../controllers/usuarios.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/roles.middleware');

router.post('/login', login);
router.post('/', verificarToken, permitirRoles('ADMINISTRADOR'), crearUsuario);

module.exports = router;