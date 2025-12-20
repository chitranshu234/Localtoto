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
        // Backend returns { success: true, user: {...} }, extract just the user
        return response.data.user || response.data;
    },

    // Note: Backend only supports photo upload, not name/email update
    uploadProfilePhoto: async (photoData: FormData): Promise<User> => {
        const response = await client.post('/users/profile/photo', photoData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    // Update profile with firstName, lastName, email
    updateProfile: async (data: Partial<User> | FormData): Promise<User> => {
        // If it's FormData with a photo, use the photo upload endpoint
        if (data instanceof FormData) {
            const response = await client.post('/users/profile/photo', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return response.data;
        }

        // For name/email updates, use PUT /users/profile
        console.log('📝 Updating profile:', JSON.stringify(data));
        const response = await client.put('/users/profile', {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
        });
        console.log('✅ Profile updated:', JSON.stringify(response.data));
        return response.data;
    },
};

