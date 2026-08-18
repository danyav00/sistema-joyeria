const express = require('express');
const router = express.Router();
const { reporteVentas, exportarVentasExcel } = require('../controllers/reportes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/ventas', verificarToken, reporteVentas);
router.get('/ventas/excel', verificarToken, exportarVentasExcel);

module.exports = router;