import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://django-backend-production-43a6.up.railway.app/api';

const client = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor - Auto refresh token if missing
client.interceptors.request.use(
    async (config) => {
        let token = await AsyncStorage.getItem('access_token');

        // If no access token, try to refresh
        if (!token) {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (refreshToken) {
                console.log('🔄 No access token, attempting refresh...');
                try {
                    const response = await axios.post(`${BASE_URL}/users/refresh`, {
                        refresh: refreshToken,
                    });
                    // Backend returns 'access' (or sometimes 'token')
                    const newToken = response.data.access || response.data.token;
                    if (newToken) {
                        token = newToken;
                        await AsyncStorage.setItem('access_token', token!);
                        if (response.data.refresh) {
                            await AsyncStorage.setItem('refresh_token', response.data.refresh);
                        }
                        console.log('✅ Token refreshed successfully!');
                    }
                } catch (err) {
                    console.log('❌ Token refresh failed in request interceptor');
                }
            }
        }

        console.log('🔍 TOKEN CHECK:', token ? 'Token found' : 'No token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Debug logging
        console.log('🔵 REQUEST:', config.method?.toUpperCase(), config.url);
        console.log('🔵 REQUEST DATA:', JSON.stringify(config.data));
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

        console.log('🔴 API Error:', error.response?.status, error.config?.url);
        console.log('🔴 Error Data:', JSON.stringify(error.response?.data));

        // Prevent infinite loops
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            console.log('🔄 401 Error - Attempting token refresh...');

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                console.log('🔄 Refresh token:', refreshToken ? 'Present' : 'MISSING');

                if (!refreshToken) {
                    // No refresh token - but don't auto logout, let UI handle it
                    console.log('❌ No refresh token available - cannot refresh');
                    return Promise.reject(error);
                }

                // Call refresh endpoint directly to avoid interceptor loop
                console.log('🔄 Calling refresh endpoint...');
                const response = await axios.post(`${BASE_URL}/users/refresh`, {
                    refresh: refreshToken,
                });

                console.log('✅ Refresh response:', JSON.stringify(response.data));
                // Backend returns 'access' (or sometimes 'token')
                const newAccessToken = response.data.access || response.data.token;
                const newRefreshToken = response.data.refresh;

                if (newAccessToken) {
                    await AsyncStorage.setItem('access_token', newAccessToken);
                    if (newRefreshToken) {
                        await AsyncStorage.setItem('refresh_token', newRefreshToken);
                    }
                    console.log('✅ New tokens saved');

                    // Update header and retry original request
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return client(originalRequest);
                } else {
                    console.log('❌ No token in refresh response');
                    return Promise.reject(error);
                }
            } catch (refreshError: any) {
                // Refresh failed - log but don't auto logout
                console.log('❌ Token refresh failed:', refreshError.response?.status, refreshError.response?.data);
                // Don't call handleLogout() here - let the app handle auth state
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
