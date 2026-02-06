const express = require('express');
const reporteController = require('../controllers/reporteController');

const router = express.Router();

// Rutas de reportes
router.get('/reportes/estadisticas-dia', reporteController.obtenerEstadisticasDia);
router.get('/reportes/movimientos-recientes', reporteController.obtenerMovimientosRecientes);
router.get('/reportes/por-fecha', reporteController.obtenerReportePorFecha);
router.get('/reportes/parqueadero/:parqueaderoId', reporteController.obtenerReporteParqueadero);
router.get('/reportes/resumen-general', reporteController.obtenerResumenGeneral);

module.exports = router;