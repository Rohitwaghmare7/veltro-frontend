import axios from 'axios';

// Create an Axios instance with base URL
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token and business context
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        const selectedBusinessId = localStorage.getItem('selectedBusinessId');
        if (selectedBusinessId) {
            config.headers['X-Business-Id'] = selectedBusinessId;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors globally (optional)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized errors (e.g., token expired)
        if (error.response && error.response.status === 401) {
            // Clear local storage and redirect to login if necessary
            // verify we are not already on login page to avoid loops
            // if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            //     localStorage.removeItem('token');
            //     localStorage.removeItem('refreshToken');
            //     window.location.href = '/login';
            // }
        }
        return Promise.reject(error);
    }
);

export default api;
