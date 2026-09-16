const express = require('express');
const router = express.Router();
const trabajadoresController = require('../controllers/trabajadoresController');

router.post('/', trabajadoresController.crear);
router.get('/', trabajadoresController.listar);
router.get('/:rut', trabajadoresController.obtenerPorRut);

module.exports = router;
