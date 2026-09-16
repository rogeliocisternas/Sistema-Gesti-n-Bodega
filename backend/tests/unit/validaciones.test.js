const {
  registroSchema,
  registroUpdateSchema,
  trabajadorSchema,
  asignacionSchema,
} = require('../../src/utils/validaciones');

describe('registroSchema', () => {
  test('acepta un registro válido', () => {
    const { error } = registroSchema.validate({
      tipo_registro: 'MATERIAL',
      descripcion: 'Cemento en sacos',
      cantidad: 10,
      unidad_medida: 'SACO',
    });
    expect(error).toBeUndefined();
  });

  test('rechaza un tipo_registro fuera del enum', () => {
    const { error } = registroSchema.validate({
      tipo_registro: 'INVALIDO',
      descripcion: 'Algo',
      cantidad: 1,
    });
    expect(error).toBeDefined();
  });

  test('rechaza cantidad negativa o cero', () => {
    const { error } = registroSchema.validate({
      tipo_registro: 'EQUIPO',
      descripcion: 'Taladro',
      cantidad: 0,
    });
    expect(error).toBeDefined();
  });

  test('rechaza descripción faltante', () => {
    const { error } = registroSchema.validate({
      tipo_registro: 'EQUIPO',
      cantidad: 1,
    });
    expect(error).toBeDefined();
  });
});

describe('registroUpdateSchema', () => {
  test('rechaza un objeto vacío', () => {
    const { error } = registroUpdateSchema.validate({});
    expect(error).toBeDefined();
  });

  test('acepta actualización parcial de estado', () => {
    const { error } = registroUpdateSchema.validate({ estado: 'EN_MANTENIMIENTO' });
    expect(error).toBeUndefined();
  });
});

describe('trabajadorSchema', () => {
  test('acepta un trabajador válido', () => {
    const { error } = trabajadorSchema.validate({
      rut: '15899839-4',
      nombres: 'Rogelio',
      apellidos: 'Cisternas',
      email: 'rogelio@example.com',
    });
    expect(error).toBeUndefined();
  });

  test('rechaza un RUT con formato inválido', () => {
    const { error } = trabajadorSchema.validate({
      rut: '158998394',
      nombres: 'Rogelio',
      apellidos: 'Cisternas',
    });
    expect(error).toBeDefined();
  });

  test('rechaza un email con formato inválido', () => {
    const { error } = trabajadorSchema.validate({
      rut: '15899839-4',
      nombres: 'Rogelio',
      apellidos: 'Cisternas',
      email: 'no-es-un-email',
    });
    expect(error).toBeDefined();
  });
});

describe('asignacionSchema', () => {
  test('acepta una asignación válida', () => {
    const { error } = asignacionSchema.validate({
      registroId: 1,
      trabajadorId: 2,
      fecha_estimada_devolucion: '2026-10-01',
    });
    expect(error).toBeUndefined();
  });

  test('rechaza cuando falta fecha_estimada_devolucion', () => {
    const { error } = asignacionSchema.validate({ registroId: 1, trabajadorId: 2 });
    expect(error).toBeDefined();
  });
});
