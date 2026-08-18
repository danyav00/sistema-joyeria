const express = require('express');
const router = express.Router();
const { crearGasto, listarGastos } = require('../controllers/gastos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/', verificarToken, crearGasto);
router.get('/', verificarToken, listarGastos);

module.exports = router;