const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');

router.get('/ventas', reportesController.obtenerVentas);
router.get('/productos', reportesController.obtenerProductosMasVendidos);
router.get('/clientes', reportesController.obtenerClientesMasActivos);
router.get('/general', reportesController.obtenerReporteGeneral);

module.exports = router;
