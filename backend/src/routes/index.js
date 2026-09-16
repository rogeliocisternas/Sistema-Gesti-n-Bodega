const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

router.use('/registros', require('./registros'));
router.use('/trabajadores', require('./trabajadores'));
router.use('/asignaciones', require('./asignaciones'));

module.exports = router;
