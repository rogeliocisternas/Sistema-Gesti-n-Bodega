const { registroSchema, trabajadorSchema, asignacionSchema } = require('../../src/utils/validaciones');

describe('registroSchema', () => {
  test('acepta un registro válido', () => {
    const { error } = registroSchema.validate({
      tipo_registro: 'MATERIAL',
      descripcion: 'Cemento 25kg',
      cantidad: 10
    });
    expect(error).toBeUndefined();
  });

  test('rechaza tipo_registro inválido', () => {
    const { error } = registroSchema.validate({
      tipo_registro: 'INEXISTENTE',
      descripcion: 'X',
      cantidad: 1
    });
    expect(error).toBeDefined();
  });

  test('rechaza cantidad negativa o cero', () => {
    const { error } = registroSchema.validate({
      tipo_registro: 'MATERIAL',
      descripcion: 'X',
      cantidad: 0
    });
    expect(error).toBeDefined();
  });

  test('rechaza descripción vacía', () => {
    const { error } = registroSchema.validate({
      tipo_registro: 'MATERIAL',
      descripcion: '',
      cantidad: 5
    });
    expect(error).toBeDefined();
  });
});

describe('trabajadorSchema', () => {
  test('acepta un trabajador válido', () => {
    const { error } = trabajadorSchema.validate({
      rut: '12345678-9',
      nombre_completo: 'Juan Pérez',
      email: 'juan@empresa.cl'
    });
    expect(error).toBeUndefined();
  });

  test('rechaza RUT con formato incorrecto', () => {
    const { error } = trabajadorSchema.validate({
      rut: '123456789',
      nombre_completo: 'Juan Pérez',
      email: 'juan@empresa.cl'
    });
    expect(error).toBeDefined();
  });

  test('rechaza email inválido', () => {
    const { error } = trabajadorSchema.validate({
      rut: '12345678-9',
      nombre_completo: 'Juan Pérez',
      email: 'no-es-un-email'
    });
    expect(error).toBeDefined();
  });
});

describe('asignacionSchema', () => {
  test('rechaza fecha de devolución en el pasado', () => {
    const { error } = asignacionSchema.validate({
      registroId: 1,
      trabajadorId: 1,
      fecha_estimada_devolucion: '2020-01-01'
    });
    expect(error).toBeDefined();
  });

  test('acepta fecha de devolución futura', () => {
    const futuro = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const { error } = asignacionSchema.validate({
      registroId: 1,
      trabajadorId: 1,
      fecha_estimada_devolucion: futuro.toISOString()
    });
    expect(error).toBeUndefined();
  });
});
