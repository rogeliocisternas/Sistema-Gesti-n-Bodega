import { describe, expect, test } from 'vitest';
import {
  generarCodigoAsignacion,
  generarCodigoRegistro,
  generarFechaCompacta,
  generarSufijo,
} from '../../src/utils/codigoGenerator';

describe('generarSufijo', () => {
  test('devuelve una cadena de la longitud solicitada', () => {
    expect(generarSufijo(5)).toHaveLength(5);
    expect(generarSufijo(8)).toHaveLength(8);
  });

  test('solo contiene caracteres alfanuméricos en mayúscula', () => {
    expect(generarSufijo(20)).toMatch(/^[0-9A-Z]+$/);
  });
});

describe('generarFechaCompacta', () => {
  test('formatea la fecha como YYYYMMDD', () => {
    expect(generarFechaCompacta(new Date(Date.UTC(2026, 8, 15)))).toBe('20260915');
  });

  test('rellena con ceros mes y día de un dígito', () => {
    expect(generarFechaCompacta(new Date(Date.UTC(2026, 0, 5)))).toBe('20260105');
  });
});

describe('generarCodigoRegistro / generarCodigoAsignacion', () => {
  test('producen el formato esperado', () => {
    const fecha = new Date(Date.UTC(2026, 8, 15));
    expect(generarCodigoRegistro(fecha)).toMatch(/^REG-20260915-[0-9A-Z]{5}$/);
    expect(generarCodigoAsignacion(fecha)).toMatch(/^ASIG-20260915-[0-9A-Z]{5}$/);
  });

  test('dos códigos generados en la misma fecha son altamente probables de ser distintos', () => {
    const fecha = new Date(Date.UTC(2026, 8, 15));
    expect(generarCodigoRegistro(fecha)).not.toBe(generarCodigoRegistro(fecha));
  });
});
