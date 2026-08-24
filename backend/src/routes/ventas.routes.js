const express = require('express');
const router = express.Router();
const { crearVenta, listarVentas, obtenerVenta, eliminarVenta } = require('../controllers/ventas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/roles.middleware');

router.post('/', verificarToken, crearVenta);
router.get('/', verificarToken, listarVentas);
router.get('/:id', verificarToken, obtenerVenta);
router.delete('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), eliminarVenta);

module.exports = router;