const express = require('express');
const router = express.Router();
const {
  abrirCredito,
  listarCreditos,
  obtenerCredito,
  liquidarCredito,
} = require('../controllers/creditosMayorista.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/roles.middleware');

router.post('/', verificarToken, permitirRoles('ADMINISTRADOR', 'EMPLEADO'), abrirCredito);
router.get('/', verificarToken, listarCreditos);
router.get('/:id', verificarToken, obtenerCredito);
router.put('/:id/liquidar', verificarToken, permitirRoles('ADMINISTRADOR', 'EMPLEADO'), liquidarCredito);

module.exports = router;