const express = require('express');
const authController = require('../controllers/authController');
const { verificarToken, esAdmin } = require('../middlewares/auth');

const router = express.Router();

// Rutas públicas
router.post('/auth/registrar', authController.registrar);
router.post('/auth/login', authController.login);
router.post('/auth/verificar-token', authController.verificarToken);

// Rutas protegidas
router.get('/auth/perfil', verificarToken, authController.obtenerPerfil);

module.exports = router;