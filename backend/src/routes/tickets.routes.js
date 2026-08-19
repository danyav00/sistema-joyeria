const express = require('express');
const router = express.Router();
const { generarTicket, listarTicketsPorVenta } = require('../controllers/tickets.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/', verificarToken, generarTicket);
router.get('/venta/:ventaId', verificarToken, listarTicketsPorVenta);

module.exports = router;