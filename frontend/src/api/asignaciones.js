import api from './client';

export const crearAsignacion = (data) => api.post('/asignaciones', data).then((r) => r.data);
export const listarAsignacionesPorTrabajador = (trabajadorId) =>
  api.get(`/asignaciones/trabajador/${trabajadorId}`).then((r) => r.data);
export const devolverAsignacion = (id) => api.patch(`/asignaciones/${id}/devolver`).then((r) => r.data);
