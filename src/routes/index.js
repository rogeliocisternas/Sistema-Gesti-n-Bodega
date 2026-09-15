const express = require('express');
const router = express.Router();

const registrosCtrl = require('../controllers/registrosController');
const trabajadoresCtrl = require('../controllers/trabajadoresController');
const asignacionesCtrl = require('../controllers/asignacionesController');

// Módulo 1: Registros de Entrada (OE-1)
router.post('/registros', registrosCtrl.crearRegistro);
router.get('/registros', registrosCtrl.listarRegistros);
router.get('/registros/:codigo', registrosCtrl.obtenerRegistroPorCodigo);
router.put('/registros/:id', registrosCtrl.actualizarRegistro);

// Módulo 2: Asignaciones a Trabajadores (OE-2)
router.post('/trabajadores', trabajadoresCtrl.crearTrabajador);
router.get('/trabajadores', trabajadoresCtrl.listarTrabajadores);
router.get('/trabajadores/:rut', trabajadoresCtrl.obtenerTrabajadorPorRut);

router.post('/asignaciones', asignacionesCtrl.crearAsignacion);
router.get('/asignaciones/trabajador/:trabajadorId', asignacionesCtrl.listarAsignacionesPorTrabajador);
router.patch('/asignaciones/:id/devolver', asignacionesCtrl.devolverAsignacion);

module.exports = router;
