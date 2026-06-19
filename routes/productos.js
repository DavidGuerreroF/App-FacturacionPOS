const express = require('express');
const router = express.Router();
const productosController = require('../controllers/productosController');

router.get('/', productosController.obtenerTodos);
router.get('/bajo-stock', productosController.obtenerBajoStock);
router.get('/:id', productosController.obtenerPorId);
router.post('/', productosController.crear);
router.put('/:id', productosController.actualizar);
router.delete('/:id', productosController.eliminar);

module.exports = router;
