const state = { records: [], workers: [], assignments: [] };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'No se pudo completar la solicitud');
  return data;
}

function showToast(message, error = false) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.className = `toast show${error ? ' error' : ''}`;
  window.setTimeout(() => { toast.className = 'toast'; }, 3200);
}

function statusPill(status) {
  const label = status.replaceAll('_', ' ');
  return `<span class="status-pill status-${status.toLowerCase()}">${label}</span>`;
}

function renderDashboard() {
  const available = state.records.filter((record) => record.estado === 'DISPONIBLE').length;
  const active = state.assignments.filter((assignment) => assignment.estado === 'ACTIVA').length;
  $('#metric-total').textContent = state.records.length;
  $('#metric-available').textContent = available;
  $('#metric-active').textContent = active;
  $('#metric-workers').textContent = state.workers.length;
  const rows = state.records.slice(-5).reverse();
  $('#recent-records').innerHTML = rows.length ? rows.map((record) => `<tr><td><strong>${record.descripcion}</strong><small class="table-sub">${record.codigo_unico}</small></td><td>${record.tipo_registro}</td><td>${statusPill(record.estado)}</td><td>${record.cantidad} ${record.unidad_medida || 'UNIDAD'}</td></tr>`).join('') : emptyRow(4, 'Todavía no hay registros');
}

function renderInventory() {
  const search = ($('#inventory-search')?.value || '').toLowerCase();
  const filter = $('#inventory-filter')?.value || '';
  const records = state.records.filter((record) => (!filter || record.estado === filter) && `${record.descripcion} ${record.codigo_unico}`.toLowerCase().includes(search));
  $('#inventory-table').innerHTML = records.length ? records.map((record) => `<tr><td><strong>${record.codigo_unico}</strong></td><td>${record.descripcion}</td><td>${record.tipo_registro}</td><td>${record.cantidad} ${record.unidad_medida || 'UNIDAD'}</td><td>${statusPill(record.estado)}</td></tr>`).join('') : emptyRow(5, 'No hay registros que coincidan');
}

function renderPeople() {
  $('#people-grid').innerHTML = state.workers.length ? state.workers.map((worker) => `<article class="person-card"><div class="person-head"><span class="avatar">${initials(worker.nombre_completo)}</span><div><h3>${worker.nombre_completo}</h3><p>${worker.cargo || 'Sin cargo definido'}</p></div></div><div class="person-meta"><div>${worker.rut}</div><div>${worker.email}</div><div>${worker.departamento || 'Sin departamento'}</div></div></article>`).join('') : '<div class="panel empty">Todavía no hay trabajadores registrados.</div>';
}

function renderAssignments() {
  $('#assignments-table').innerHTML = state.assignments.length ? state.assignments.map((assignment) => `<tr><td><strong>${assignment.codigo_asignacion}</strong></td><td>${assignment.Trabajador?.nombre_completo || `Trabajador #${assignment.trabajadorId}`}</td><td>${assignment.Registro?.descripcion || `Registro #${assignment.registroId}`}</td><td>${formatDate(assignment.fecha_estimada_devolucion)}</td><td>${statusPill(assignment.estado)}</td><td>${assignment.estado === 'ACTIVA' ? `<button class="action-button return-button" data-id="${assignment.id}">Devolver</button>` : ''}</td></tr>`).join('') : emptyRow(6, 'Todavía no hay asignaciones');
  $$('.return-button').forEach((button) => button.addEventListener('click', () => returnAssignment(button.dataset.id)));
}

function emptyRow(columns, message) { return `<tr><td colspan="${columns}" class="empty">${message}</td></tr>`; }
function initials(name) { return name.split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase(); }
function formatDate(value) { return new Intl.DateTimeFormat('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value)); }

async function loadData() {
  try {
    const [records, workers] = await Promise.all([api('/registros'), api('/trabajadores')]);
    state.records = records;
    state.workers = workers;
    const assignmentLists = await Promise.all(workers.map((worker) => api(`/asignaciones/trabajador/${worker.id}`)));
    state.assignments = assignmentLists.flat();
    renderDashboard(); renderInventory(); renderPeople(); renderAssignments(); populateAssignmentForm();
  } catch (error) { showToast(error.message, true); }
}

function populateAssignmentForm() {
  $('#assignment-records').innerHTML = state.records.filter((record) => record.estado === 'DISPONIBLE').map((record) => `<option value="${record.id}">${record.descripcion} · ${record.codigo_unico}</option>`).join('') || '<option value="">No hay registros disponibles</option>';
  $('#assignment-workers').innerHTML = state.workers.map((worker) => `<option value="${worker.id}">${worker.nombre_completo} · ${worker.rut}</option>`).join('') || '<option value="">No hay trabajadores registrados</option>';
  const date = new Date(); date.setDate(date.getDate() + 7); $('#assignment-form input[type="date"]').min = new Date().toISOString().slice(0, 10); $('#assignment-form input[type="date"]').value = date.toISOString().slice(0, 10);
}

async function returnAssignment(id) { try { await api(`/asignaciones/${id}/devolver`, { method: 'PATCH' }); showToast('Asignación devuelta correctamente'); await loadData(); } catch (error) { showToast(error.message, true); } }

function switchView(view) { $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.view === view)); $$('.view').forEach((section) => section.classList.toggle('active', section.id === `${view}-view`)); const titles = { dashboard: 'Resumen general', inventory: 'Inventario', people: 'Trabajadores', assignments: 'Asignaciones' }; $('#page-title').textContent = titles[view]; window.location.hash = view; }

function setupNavigation() { $$('.nav-item').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.view))); $$('[data-view-target]').forEach((button) => button.addEventListener('click', () => switchView(button.dataset.viewTarget))); const initial = ['dashboard', 'inventory', 'people', 'assignments'].includes(window.location.hash.slice(1)) ? window.location.hash.slice(1) : 'dashboard'; switchView(initial); }
function setupModals() { $$('[data-open-modal]').forEach((button) => button.addEventListener('click', () => { $( `#${button.dataset.openModal}`).classList.add('open'); })); $$('[data-close-modal]').forEach((button) => button.addEventListener('click', () => button.closest('.modal-backdrop').classList.remove('open'))); $$('.modal-backdrop').forEach((backdrop) => backdrop.addEventListener('click', (event) => { if (event.target === backdrop) backdrop.classList.remove('open'); })); }
function formPayload(form) { return Object.fromEntries(new FormData(form).entries()); }
function setupForms() { $('#record-form').addEventListener('submit', async (event) => { event.preventDefault(); try { await api('/registros', { method: 'POST', body: JSON.stringify({ ...formPayload(event.target), cantidad: Number(event.target.cantidad.value) }) }); event.target.reset(); $('#record-modal').classList.remove('open'); showToast('Registro creado correctamente'); await loadData(); } catch (error) { showToast(error.message, true); } }); $('#worker-form').addEventListener('submit', async (event) => { event.preventDefault(); try { await api('/trabajadores', { method: 'POST', body: JSON.stringify(formPayload(event.target)) }); event.target.reset(); $('#worker-modal').classList.remove('open'); showToast('Trabajador agregado correctamente'); await loadData(); } catch (error) { showToast(error.message, true); } }); $('#assignment-form').addEventListener('submit', async (event) => { event.preventDefault(); try { await api('/asignaciones', { method: 'POST', body: JSON.stringify({ ...formPayload(event.target), registroId: Number(event.target.registroId.value), trabajadorId: Number(event.target.trabajadorId.value), fecha_estimada_devolucion: new Date(`${event.target.fecha_estimada_devolucion.value}T23:59:00`).toISOString() }) }); event.target.reset(); $('#assignment-modal').classList.remove('open'); showToast('Asignación creada correctamente'); await loadData(); } catch (error) { showToast(error.message, true); } }); }

$('#inventory-search').addEventListener('input', renderInventory); $('#inventory-filter').addEventListener('change', renderInventory); $('#refresh-button').addEventListener('click', loadData); $('#current-date').textContent = new Intl.DateTimeFormat('es-CL', { dateStyle: 'long' }).format(new Date()); setupNavigation(); setupModals(); setupForms(); loadData();
