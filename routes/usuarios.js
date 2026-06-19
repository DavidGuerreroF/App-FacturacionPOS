const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuariosController');
const authMiddleware = require('../middlewares/auth');

// Rutas públicas
router.post('/login', usuariosController.login);
router.post('/registro', usuariosController.registro);

// Rutas protegidas
router.get('/me', authMiddleware, usuariosController.getPerfil);
router.get('/', authMiddleware, usuariosController.obtenerTodos);
router.put('/:id', authMiddleware, usuariosController.actualizar);
router.post('/cambiar-contraseña', authMiddleware, usuariosController.cambiarContraseña);
router.post('/:id/desactivar', authMiddleware, usuariosController.desactivar);

module.exports = router;
