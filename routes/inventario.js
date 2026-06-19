const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventarioController');

router.get('/movimientos', inventarioController.obtenerMovimientos);
router.post('/movimientos', inventarioController.crearMovimiento);
router.get('/reporte', inventarioController.obtenerReporte);

module.exports = router;
