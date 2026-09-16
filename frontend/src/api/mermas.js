import api from './client';

export const listarMermas = (params = {}) => api.get('/mermas', { params }).then((r) => r.data);
export const crearMerma = (data) => api.post('/mermas', data).then((r) => r.data);
export const aprobarMerma = (id) => api.patch(`/mermas/${id}/aprobar`).then((r) => r.data);
export const rechazarMerma = (id) => api.patch(`/mermas/${id}/rechazar`).then((r) => r.data);
