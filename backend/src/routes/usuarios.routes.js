const express = require('express');
const router = express.Router();
const { crearUsuario, login } = require('../controllers/usuarios.controller');

router.post('/', crearUsuario);
router.post('/login', login);

module.exports = router;