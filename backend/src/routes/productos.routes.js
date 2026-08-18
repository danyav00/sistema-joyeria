const express = require('express');
const router = express.Router();
const {
  crearProducto,
  listarProductos,
  obtenerProducto,
  actualizarProducto,
  ajustarInventario,
} = require('../controllers/productos.controller');
const { verificarToken } = require('../middlewares/auth.middleware');
const { permitirRoles } = require('../middlewares/roles.middleware');

router.post('/', verificarToken, permitirRoles('ADMINISTRADOR'), crearProducto);
router.get('/', verificarToken, listarProductos);
router.get('/:id', verificarToken, obtenerProducto);
router.put('/:id', verificarToken, permitirRoles('ADMINISTRADOR'), actualizarProducto);
router.patch('/:id/ajuste', verificarToken, permitirRoles('ADMINISTRADOR'), ajustarInventario);

module.exports = router;