const express = require('express');
const router = express.Router();
const { crearCodigoPrecio, listarCodigosPrecio } = require('../controllers/codigosPrecio.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/roles.middleware');

router.post('/', verificarToken, permitirRoles('ADMINISTRADOR'), crearCodigoPrecio);
router.get('/', verificarToken, listarCodigosPrecio);

module.exports = router;