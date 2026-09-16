const express = require('express');
const router = express.Router();
const registrosController = require('../controllers/registrosController');

router.post('/', registrosController.crear);
router.get('/', registrosController.listar);
router.get('/:codigo', registrosController.obtenerPorCodigo);
router.put('/:codigo', registrosController.actualizar);

module.exports = router;
