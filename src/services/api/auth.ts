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

    updateProfile: async (data: Partial<User>): Promise<User> => {
        const response = await client.patch('/users/profile', data);
        return response.data;
    },
};
