const express = require('express');
const ingresoController = require('../controllers/ingresoController');

const router = express.Router();

router.post('/ingresos', ingresoController.registrarIngreso);
router.get('/ingresos', ingresoController.obtenerIngresos);
router.get('/ingresos/activos', ingresoController.obtenerIngresosActivos);
router.get('/ingresos/activo/:placa', ingresoController.buscarIngresoActivoPorPlaca);
router.get('/ingresos/:id', ingresoController.obtenerIngresoDetalle);
router.get('/ingresos/dia/resumen', ingresoController.obtenerIngresosDia);

module.exports = router;