import axios from 'axios';

// Por defecto usa una ruta relativa ("/api"): funciona sin configurar nada cuando el
// frontend y el backend se sirven desde el mismo origen (Cloudflare Worker + assets,
// o wrangler dev). Para desarrollo local contra el backend Node/Express en otro puerto,
// definir VITE_API_URL en frontend/.env (ver .env.example).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export default api;
