const rawApiUrl = import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5000';

export const API_URL = rawApiUrl.replace(/\/+$/, '').replace(/\/api$/i, '');

export const apiUrl = (path: string) => {
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	return `${API_URL}${normalizedPath}`;
};