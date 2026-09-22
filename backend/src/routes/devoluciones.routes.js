const express = require('express');
const router = express.Router();
const { buscarVentaPorFolio, crearDevolucion, listarDevoluciones, devolverProductosMayorista } = require('../controllers/devoluciones.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/venta/:folio', verificarToken, buscarVentaPorFolio);
router.post('/', verificarToken, crearDevolucion);
router.get('/', verificarToken, listarDevoluciones);
router.post('/mayorista', verificarToken, devolverProductosMayorista);

module.exports = router;