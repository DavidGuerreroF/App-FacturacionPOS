const express = require('express');
const parqueaderoController = require('../controllers/parqueaderoController');

const router = express.Router();

// Rutas de parqueaderos - ORDEN IMPORTANTE
router.get('/parqueaderos', parqueaderoController.obtenerParqueaderos);
router.post('/parqueaderos', parqueaderoController.crearParqueadero);
router.get('/parqueaderos/:id', parqueaderoController.obtenerParqueaderoDetalle);
router.put('/parqueaderos/:id', parqueaderoController.actualizarParqueadero);
router.get('/parqueaderos/:id/ocupacion', parqueaderoController.obtenerOcupacion);

module.exports = router;