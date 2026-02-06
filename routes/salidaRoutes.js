const express = require('express');
const salidaController = require('../controllers/salidaController');

const router = express.Router();

// ⚠️ IMPORTANTE: Rutas más específicas PRIMERO
router.post('/salidas/:ingresoId', salidaController.registrarSalida);
router.get('/salidas/dia/resumen', salidaController.obtenerSalidasDia);
router.get('/salidas/estadisticas/metodos', salidaController.obtenerGananciasPorMetodo);

// Rutas genéricas DESPUÉS
router.get('/salidas', salidaController.obtenerSalidas);
router.get('/salidas/:id', salidaController.obtenerSalidaDetalle);

module.exports = router;