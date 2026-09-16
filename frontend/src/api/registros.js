import api from './client';

export const listarRegistros = (params = {}) => api.get('/registros', { params }).then((r) => r.data);
export const obtenerRegistroPorCodigo = (codigo) => api.get(`/registros/${codigo}`).then((r) => r.data);
export const crearRegistro = (data) => api.post('/registros', data).then((r) => r.data);
export const actualizarRegistro = (codigo, data) => api.put(`/registros/${codigo}`, data).then((r) => r.data);
