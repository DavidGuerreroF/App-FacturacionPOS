const express = require('express');
const router = express.Router();
const facturasController = require('../controllers/facturasController');

router.get('/', facturasController.obtenerTodas);
router.get('/:id', facturasController.obtenerPorId);
router.post('/', facturasController.crear);
router.put('/:id/estado', facturasController.actualizarEstado);
router.post('/:id/cancelar', facturasController.cancelar);

module.exports = router;
