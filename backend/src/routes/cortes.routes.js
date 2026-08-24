const express = require('express');
const router = express.Router();
const { generarCorte, obtenerCorte, listarCortes, eliminarCorte } = require('../controllers/cortes.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/roles.middleware');

router.post('/turno/:turnoId', verificarToken, generarCorte);
router.get('/turno/:turnoId', verificarToken, obtenerCorte);
router.get('/', verificarToken, listarCortes);
router.delete('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), eliminarCorte);

module.exports = router;