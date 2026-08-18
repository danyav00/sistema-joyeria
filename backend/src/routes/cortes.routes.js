const express = require('express');
const router = express.Router();
const { generarCorte, obtenerCorte, listarCortes } = require('../controllers/cortes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/turno/:turnoId', verificarToken, generarCorte);
router.get('/turno/:turnoId', verificarToken, obtenerCorte);
router.get('/', verificarToken, listarCortes);

module.exports = router;