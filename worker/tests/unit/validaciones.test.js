import { describe, expect, test } from 'vitest';
import {
  validarAsignacion,
  validarRegistro,
  validarRegistroUpdate,
  validarTrabajador,
} from '../../src/utils/validaciones';

describe('validarRegistro', () => {
  test('acepta un registro válido', () => {
    const { error, value } = validarRegistro({
      tipo_registro: 'MATERIAL',
      descripcion: 'Cemento en sacos',
      cantidad: 10,
      unidad_medida: 'SACO',
    });
    expect(error).toBeUndefined();
    expect(value.cantidad).toBe(10);
  });

  test('rechaza un tipo_registro fuera del enum', () => {
    const { error } = validarRegistro({ tipo_registro: 'INVALIDO', descripcion: 'Algo', cantidad: 1 });
    expect(error).toBeDefined();
  });

  test('rechaza cantidad negativa o cero', () => {
    const { error } = validarRegistro({ tipo_registro: 'EQUIPO', descripcion: 'Taladro', cantidad: 0 });
    expect(error).toBeDefined();
  });

  test('rechaza descripción faltante', () => {
    const { error } = validarRegistro({ tipo_registro: 'EQUIPO', cantidad: 1 });
    expect(error).toBeDefined();
  });

  test('usa UNIDAD como unidad_medida por defecto', () => {
    const { value } = validarRegistro({ tipo_registro: 'OTRO', descripcion: 'Caja', cantidad: 2 });
    expect(value.unidad_medida).toBe('UNIDAD');
  });
});

describe('validarRegistroUpdate', () => {
  test('rechaza un objeto vacío', () => {
    const { error } = validarRegistroUpdate({});
    expect(error).toBeDefined();
  });

  test('acepta actualización parcial de estado', () => {
    const { error, value } = validarRegistroUpdate({ estado: 'EN_MANTENIMIENTO' });
    expect(error).toBeUndefined();
    expect(value).toEqual({ estado: 'EN_MANTENIMIENTO' });
  });

  test('rechaza un estado fuera del enum', () => {
    const { error } = validarRegistroUpdate({ estado: 'NO_EXISTE' });
    expect(error).toBeDefined();
  });
});

describe('validarTrabajador', () => {
  test('acepta un trabajador válido', () => {
    const { error } = validarTrabajador({
      rut: '15899839-4',
      nombres: 'Rogelio',
      apellidos: 'Cisternas',
      email: 'rogelio@example.com',
    });
    expect(error).toBeUndefined();
  });

  test('rechaza un RUT con formato inválido', () => {
    const { error } = validarTrabajador({ rut: '158998394', nombres: 'Rogelio', apellidos: 'Cisternas' });
    expect(error).toBeDefined();
  });

  test('rechaza un email con formato inválido', () => {
    const { error } = validarTrabajador({
      rut: '15899839-4',
      nombres: 'Rogelio',
      apellidos: 'Cisternas',
      email: 'no-es-un-email',
    });
    expect(error).toBeDefined();
  });

  test('normaliza cargo/departamento/email vacíos a null', () => {
    const { value } = validarTrabajador({
      rut: '15899839-4',
      nombres: 'Rogelio',
      apellidos: 'Cisternas',
      cargo: '',
      departamento: '',
      email: '',
    });
    expect(value.cargo).toBeNull();
    expect(value.departamento).toBeNull();
    expect(value.email).toBeNull();
  });
});

describe('validarAsignacion', () => {
  test('acepta una asignación válida', () => {
    const { error } = validarAsignacion({
      registroId: 1,
      trabajadorId: 2,
      fecha_estimada_devolucion: '2026-10-01',
    });
    expect(error).toBeUndefined();
  });

  test('rechaza cuando falta fecha_estimada_devolucion', () => {
    const { error } = validarAsignacion({ registroId: 1, trabajadorId: 2 });
    expect(error).toBeDefined();
  });

  test('rechaza una fecha que no sea YYYY-MM-DD', () => {
    const { error } = validarAsignacion({
      registroId: 1,
      trabajadorId: 2,
      fecha_estimada_devolucion: '01/10/2026',
    });
    expect(error).toBeDefined();
  });

  test('preserva la fecha tal cual, sin convertirla a Date', () => {
    const { value } = validarAsignacion({
      registroId: 1,
      trabajadorId: 2,
      fecha_estimada_devolucion: '2026-01-12',
    });
    expect(value.fecha_estimada_devolucion).toBe('2026-01-12');
  });
});
