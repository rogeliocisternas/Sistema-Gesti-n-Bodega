const TIPOS_REGISTRO = ['MATERIAL', 'EQUIPO', 'DOCUMENTO', 'OTRO'];
const ESTADOS_REGISTRO = ['DISPONIBLE', 'ASIGNADO', 'EN_MANTENIMIENTO', 'BAJA'];
const RUT_REGEX = /^[0-9]{7,8}-[0-9kK]$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function validarRegistro(body) {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Cuerpo de la solicitud inválido' };
  }
  const { tipo_registro, descripcion, cantidad, unidad_medida } = body;

  if (!TIPOS_REGISTRO.includes(tipo_registro)) {
    return { error: `"tipo_registro" debe ser uno de: ${TIPOS_REGISTRO.join(', ')}` };
  }
  if (typeof descripcion !== 'string' || descripcion.trim().length < 3) {
    return { error: '"descripcion" es requerida (mínimo 3 caracteres)' };
  }
  const cantidadNum = Number(cantidad);
  if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
    return { error: '"cantidad" debe ser un número positivo' };
  }
  if (unidad_medida !== undefined && typeof unidad_medida !== 'string') {
    return { error: '"unidad_medida" debe ser texto' };
  }

  return {
    value: {
      tipo_registro,
      descripcion: descripcion.trim(),
      cantidad: cantidadNum,
      unidad_medida: unidad_medida && unidad_medida.trim() !== '' ? unidad_medida.trim() : 'UNIDAD',
    },
  };
}

export function validarRegistroUpdate(body) {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Cuerpo de la solicitud inválido' };
  }
  const value = {};

  if (body.tipo_registro !== undefined) {
    if (!TIPOS_REGISTRO.includes(body.tipo_registro)) {
      return { error: `"tipo_registro" debe ser uno de: ${TIPOS_REGISTRO.join(', ')}` };
    }
    value.tipo_registro = body.tipo_registro;
  }
  if (body.descripcion !== undefined) {
    if (typeof body.descripcion !== 'string' || body.descripcion.trim().length < 3) {
      return { error: '"descripcion" debe tener al menos 3 caracteres' };
    }
    value.descripcion = body.descripcion.trim();
  }
  if (body.cantidad !== undefined) {
    const cantidadNum = Number(body.cantidad);
    if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
      return { error: '"cantidad" debe ser un número positivo' };
    }
    value.cantidad = cantidadNum;
  }
  if (body.unidad_medida !== undefined) {
    if (typeof body.unidad_medida !== 'string' || body.unidad_medida.trim() === '') {
      return { error: '"unidad_medida" debe ser texto no vacío' };
    }
    value.unidad_medida = body.unidad_medida.trim();
  }
  if (body.estado !== undefined) {
    if (!ESTADOS_REGISTRO.includes(body.estado)) {
      return { error: `"estado" debe ser uno de: ${ESTADOS_REGISTRO.join(', ')}` };
    }
    value.estado = body.estado;
  }

  if (Object.keys(value).length === 0) {
    return { error: 'Debe incluir al menos un campo para actualizar' };
  }

  return { value };
}

export function validarTrabajador(body) {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Cuerpo de la solicitud inválido' };
  }
  const { rut, nombres, apellidos, cargo, departamento, email } = body;

  if (typeof rut !== 'string' || !RUT_REGEX.test(rut)) {
    return { error: 'El RUT debe tener el formato 12345678-9' };
  }
  if (typeof nombres !== 'string' || nombres.trim().length < 2) {
    return { error: '"nombres" es requerido (mínimo 2 caracteres)' };
  }
  if (typeof apellidos !== 'string' || apellidos.trim().length < 2) {
    return { error: '"apellidos" es requerido (mínimo 2 caracteres)' };
  }
  if (email !== undefined && email !== '' && email !== null && !EMAIL_REGEX.test(email)) {
    return { error: '"email" tiene un formato inválido' };
  }

  return {
    value: {
      rut,
      nombres: nombres.trim(),
      apellidos: apellidos.trim(),
      cargo: cargo && String(cargo).trim() !== '' ? String(cargo).trim() : null,
      departamento: departamento && String(departamento).trim() !== '' ? String(departamento).trim() : null,
      email: email && String(email).trim() !== '' ? String(email).trim() : null,
    },
  };
}

export function validarAsignacion(body) {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Cuerpo de la solicitud inválido' };
  }
  const { registroId, trabajadorId, fecha_estimada_devolucion, observaciones } = body;

  const registroIdNum = Number(registroId);
  const trabajadorIdNum = Number(trabajadorId);
  if (!Number.isInteger(registroIdNum) || registroIdNum <= 0) {
    return { error: '"registroId" debe ser un entero positivo' };
  }
  if (!Number.isInteger(trabajadorIdNum) || trabajadorIdNum <= 0) {
    return { error: '"trabajadorId" debe ser un entero positivo' };
  }
  // Se valida como texto YYYY-MM-DD (no como Date) para evitar corrimientos de huso horario.
  if (typeof fecha_estimada_devolucion !== 'string' || !FECHA_REGEX.test(fecha_estimada_devolucion)) {
    return { error: 'La fecha estimada de devolución debe tener el formato YYYY-MM-DD' };
  }

  return {
    value: {
      registroId: registroIdNum,
      trabajadorId: trabajadorIdNum,
      fecha_estimada_devolucion,
      observaciones: observaciones && String(observaciones).trim() !== '' ? String(observaciones).trim() : null,
    },
  };
}

export function validarMerma(body) {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Cuerpo de la solicitud inválido' };
  }
  const { registroId, cantidad, motivo, reportado_por, evidencia_url } = body;

  const registroIdNum = Number(registroId);
  if (!Number.isInteger(registroIdNum) || registroIdNum <= 0) {
    return { error: '"registroId" debe ser un entero positivo' };
  }
  const cantidadNum = Number(cantidad);
  if (!Number.isFinite(cantidadNum) || cantidadNum <= 0) {
    return { error: '"cantidad" debe ser un número positivo' };
  }
  if (typeof motivo !== 'string' || motivo.trim().length < 3) {
    return { error: '"motivo" es requerido (mínimo 3 caracteres)' };
  }
  if (typeof reportado_por !== 'string' || reportado_por.trim().length < 2) {
    return { error: '"reportado_por" es requerido' };
  }

  return {
    value: {
      registroId: registroIdNum,
      cantidad: cantidadNum,
      motivo: motivo.trim(),
      reportado_por: reportado_por.trim(),
      evidencia_url: evidencia_url && String(evidencia_url).trim() !== '' ? String(evidencia_url).trim() : null,
    },
  };
}
