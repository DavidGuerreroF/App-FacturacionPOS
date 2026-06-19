const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.get('/', clientesController.obtenerTodos);
router.get('/:id', clientesController.obtenerPorId);
router.post('/', clientesController.crear);
router.put('/:id', clientesController.actualizar);
router.post('/:id/desactivar', clientesController.desactivar);

module.exports = router;
