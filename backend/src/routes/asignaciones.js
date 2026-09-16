const express = require('express');
const router = express.Router();
const asignacionesController = require('../controllers/asignacionesController');

router.post('/', asignacionesController.crear);
router.get('/trabajador/:id', asignacionesController.listarPorTrabajador);
router.patch('/:id/devolver', asignacionesController.devolver);

module.exports = router;
