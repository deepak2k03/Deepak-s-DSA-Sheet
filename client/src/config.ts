// If VITE_API_URL is not set (which it isn't locally), it falls back to string
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";