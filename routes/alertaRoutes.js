const express = require('express');
const alertaController = require('../controllers/alertaController');

const router = express.Router();

// Rutas de alertas
router.get('/alertas', alertaController.obtenerAlertas);
router.get('/alertas/activas', alertaController.obtenerAlertasActivas);
router.get('/alertas/conteo', alertaController.obtenerConteoAlertas);
router.post('/alertas', alertaController.crearAlerta);
router.get('/alertas/:id', alertaController.obtenerAlertaDetalle);
router.put('/alertas/:id', alertaController.actualizarAlerta);
router.get('/alertas/parqueadero/:parqueaderoId', alertaController.obtenerAlertasParqueadero);

module.exports = router;