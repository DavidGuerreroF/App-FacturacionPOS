const express = require('express');
const espacioController = require('../controllers/espacioController');

const router = express.Router();

// ⚠️ IMPORTANTE: Poner las rutas más específicas PRIMERO
// Si no, la ruta genérica /espacios/:id atrapa todas las llamadas

// Rutas con parámetros específicos PRIMERO
router.get('/parqueaderos/:parqueaderoId/espacios-disponibles', espacioController.obtenerEspaciosDisponibles);
router.get('/espacios/disponibles/:parqueaderoId', espacioController.obtenerEspaciosDisponibles);
router.get('/espacios/estadisticas/:parqueaderoId', espacioController.obtenerEstadisticasEspacios);

// Rutas genéricas DESPUÉS
router.get('/espacios/parqueadero/:parqueaderoId', espacioController.obtenerEspacios);
router.post('/espacios', espacioController.crearEspacios);
router.get('/espacios/:id', espacioController.obtenerEspacioDetalle);
router.put('/espacios/:id', espacioController.actualizarEstadoEspacio);

module.exports = router;