import axios from 'axios';

// Create a custom Axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('aether_token');

        // If token exists, add it to the Authorization header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
