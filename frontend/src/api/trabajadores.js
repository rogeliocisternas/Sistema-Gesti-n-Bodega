import api from './client';

export const listarTrabajadores = (params = {}) => api.get('/trabajadores', { params }).then((r) => r.data);
export const obtenerTrabajadorPorRut = (rut) => api.get(`/trabajadores/${rut}`).then((r) => r.data);
export const crearTrabajador = (data) => api.post('/trabajadores', data).then((r) => r.data);
