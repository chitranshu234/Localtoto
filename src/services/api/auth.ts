import client from './client';
import { SendOtpRequest, VerifyOtpRequest, AuthResponse, User } from '../../types/api';

export const authService = {
    sendOtp: async (data: SendOtpRequest): Promise<void> => {
        await client.post('/users/send-otp', data);
    },

    verifyOtp: async (data: VerifyOtpRequest): Promise<AuthResponse> => {
        const response = await client.post('/users/verify-otp', data);
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await client.get('/users/profile');
        return response.data;
    },

    // Note: Backend only supports photo upload, not name/email update
    uploadProfilePhoto: async (photoData: FormData): Promise<User> => {
        const response = await client.post('/users/profile/photo', photoData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Keep for compatibility but note it won't work for name/email
    updateProfile: async (data: Partial<User> | FormData): Promise<User> => {
        // If it's FormData with a photo, use the photo upload endpoint
        if (data instanceof FormData) {
            const response = await client.post('/users/profile/photo', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }
        // For name/email updates, there's no backend endpoint - just return current profile
        console.warn('⚠️ Backend does not support name/email updates. Only photo upload is available.');
        const response = await client.get('/users/profile');
        return response.data;
    },
};

