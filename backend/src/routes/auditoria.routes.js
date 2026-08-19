const express = require('express');
const router = express.Router();
const { listarAuditoria } = require('../controllers/auditoria.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/roles.middleware');

router.get('/', verificarToken, permitirRoles('ADMINISTRADOR'), listarAuditoria);

module.exports = router;