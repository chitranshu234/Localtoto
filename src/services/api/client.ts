import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://django-backend-production-43a6.up.railway.app/api';

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
client.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        console.log('🔍 TOKEN CHECK:', token ? 'Token found' : 'No token');
        console.log('🔍 TOKEN VALUE:', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Debug logging
        console.log('🔵 REQUEST:', config.method?.toUpperCase(), config.url);
        console.log('🔵 REQUEST DATA:', JSON.stringify(config.data));
        console.log('🔵 REQUEST HEADERS:', JSON.stringify(config.headers));
        console.log('🔵 AUTHORIZATION HEADER:', config.headers.Authorization);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor
client.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (!refreshToken) {
                    // No refresh token, logout user
                    await handleLogout();
                    return Promise.reject(error);
                }

                // Call refresh endpoint directly to avoid interceptor loop
                const response = await axios.post(`${BASE_URL}/users/refresh`, {
                    refresh: refreshToken,
                });

                const { token } = response.data;
                await AsyncStorage.setItem('access_token', token);

                // Update header and retry original request
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return client(originalRequest);
            } catch (refreshError) {
                // Refresh failed, logout user
                await handleLogout();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

const handleLogout = async () => {
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user_profile']);
    // You might want to emit an event or use a callback to redirect the user
    // For now, we just clear storage. The AuthContext should react to this or check validity.
};

export default client;
