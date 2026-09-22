const express = require('express');
const router = express.Router();
const { abrirTurno, cerrarTurno, turnoActivo } = require('../controllers/turnos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/roles.middleware');

router.post('/abrir', verificarToken, permitirRoles('ADMINISTRADOR', 'EMPLEADO'), abrirTurno);
router.put('/:id/cerrar', verificarToken, permitirRoles('ADMINISTRADOR', 'EMPLEADO'), cerrarTurno);
router.get('/activo', verificarToken, turnoActivo);

module.exports = router;