const {
  generarCodigoRegistro,
  generarCodigoAsignacion,
  generarSufijo,
  generarFechaCompacta,
} = require('../../src/utils/codigoGenerator');

describe('codigoGenerator', () => {
  test('generarSufijo devuelve una cadena de la longitud solicitada', () => {
    expect(generarSufijo(5)).toHaveLength(5);
    expect(generarSufijo(8)).toHaveLength(8);
  });

  test('generarSufijo solo contiene caracteres alfanuméricos en mayúscula', () => {
    const sufijo = generarSufijo(20);
    expect(sufijo).toMatch(/^[0-9A-Z]+$/);
  });

  test('generarFechaCompacta formatea la fecha como YYYYMMDD', () => {
    const fecha = new Date(2026, 8, 15); // 15-09-2026
    expect(generarFechaCompacta(fecha)).toBe('20260915');
  });

  test('generarFechaCompacta rellena con ceros mes y día de un dígito', () => {
    const fecha = new Date(2026, 0, 5); // 05-01-2026
    expect(generarFechaCompacta(fecha)).toBe('20260105');
  });

  test('generarCodigoRegistro produce el formato REG-YYYYMMDD-XXXXX', () => {
    const fecha = new Date(2026, 8, 15);
    const codigo = generarCodigoRegistro(fecha);
    expect(codigo).toMatch(/^REG-20260915-[0-9A-Z]{5}$/);
  });

  test('generarCodigoAsignacion produce el formato ASIG-YYYYMMDD-XXXXX', () => {
    const fecha = new Date(2026, 8, 15);
    const codigo = generarCodigoAsignacion(fecha);
    expect(codigo).toMatch(/^ASIG-20260915-[0-9A-Z]{5}$/);
  });

  test('dos códigos generados en la misma fecha son altamente probables de ser distintos', () => {
    const fecha = new Date(2026, 8, 15);
    const codigo1 = generarCodigoRegistro(fecha);
    const codigo2 = generarCodigoRegistro(fecha);
    expect(codigo1).not.toBe(codigo2);
  });
});
