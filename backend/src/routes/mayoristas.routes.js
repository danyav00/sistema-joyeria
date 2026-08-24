const express = require('express');
const router = express.Router();
const {
  crearMayorista,
  listarMayoristas,
  obtenerMayorista,
  registrarCompra,
  revisarInactivos,
  actualizarMayorista,
} = require('../controllers/mayoristas.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/roles.middleware');

router.post('/', verificarToken, permitirRoles('ADMINISTRADOR'), crearMayorista);
router.put('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), actualizarMayorista);
router.get('/', verificarToken, listarMayoristas);
router.get('/:id', verificarToken, obtenerMayorista);
router.post('/:id/compra', verificarToken, registrarCompra);
router.post('/revisar-inactivos', verificarToken, permitirRoles('ADMINISTRADOR'), revisarInactivos);

module.exports = router;