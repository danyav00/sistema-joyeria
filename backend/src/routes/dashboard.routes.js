const express = require('express');
const router = express.Router();
const { obtenerDashboard } = require('../controllers/dashboard.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.get('/', verificarToken, obtenerDashboard);

module.exports = router;