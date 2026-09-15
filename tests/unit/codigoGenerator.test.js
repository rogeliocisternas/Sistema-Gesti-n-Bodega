const { generarCodigoRegistro, generarCodigoAsignacion } = require('../../src/utils/codigoGenerator');

describe('generarCodigoRegistro', () => {
  test('genera formato REG-YYYYMMDD-XXXXX', () => {
    const fecha = new Date(2026, 8, 15); // 15 de septiembre 2026
    const codigo = generarCodigoRegistro(fecha, 42);
    expect(codigo).toBe('REG-20260915-00042');
  });

  test('rellena con ceros a la izquierda el sufijo', () => {
    const fecha = new Date(2026, 0, 1);
    const codigo = generarCodigoRegistro(fecha, 7);
    expect(codigo).toBe('REG-20260101-00007');
  });

  test('genera códigos distintos en llamadas consecutivas sin sufijo fijo', () => {
    const a = generarCodigoRegistro();
    const b = generarCodigoRegistro();
    // Probabilísticamente distintos (1 en 100.000 de colisión); documentado como
    // limitación conocida del prototipo, mitigada en producción con UUID o secuencia DB.
    expect(a).not.toBe(b);
  });
});

describe('generarCodigoAsignacion', () => {
  test('genera formato ASIG-YYYYMMDD-XXXXX', () => {
    const fecha = new Date(2026, 8, 15);
    const codigo = generarCodigoAsignacion(fecha, 5);
    expect(codigo).toBe('ASIG-20260915-00005');
  });
});
