const express = require('express');
const router = express.Router();
const { abrirTurno, cerrarTurno, turnoActivo } = require('../controllers/turnos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/abrir', verificarToken, abrirTurno);
router.put('/:id/cerrar', verificarToken, cerrarTurno);
router.get('/activo', verificarToken, turnoActivo);

module.exports = router;