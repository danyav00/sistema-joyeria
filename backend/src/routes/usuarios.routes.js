const express = require('express');
const router = express.Router();
const { crearUsuario } = require('../controllers/usuarios.controller');

router.post('/', crearUsuario);

module.exports = router;