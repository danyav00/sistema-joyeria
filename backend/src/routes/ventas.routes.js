const express = require('express');
const router = express.Router();
const { crearVenta, listarVentas, obtenerVenta } = require('../controllers/ventas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/', verificarToken, crearVenta);
router.get('/', verificarToken, listarVentas);
router.get('/:id', verificarToken, obtenerVenta);

module.exports = router;