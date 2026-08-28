const express = require('express');
const router = express.Router();
const {
  crearApartado,
  abonarApartado,
  entregarApartado,
  cancelarApartado,
  listarApartados,
  obtenerApartado,
  exportarExcel,
} = require('../controllers/apartados.controller');
const { verificarToken } = require('../middlewares/auth.middleware');

router.post('/', verificarToken, crearApartado);
router.get('/', verificarToken, listarApartados);
router.get('/excel', verificarToken, exportarExcel);
router.get('/:id', verificarToken, obtenerApartado);
router.post('/:id/abono', verificarToken, abonarApartado);
router.put('/:id/entregar', verificarToken, entregarApartado);
router.put('/:id/cancelar', verificarToken, cancelarApartado);

module.exports = router;