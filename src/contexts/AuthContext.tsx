import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthResponse } from '../types/api';
import { authService } from '../services/api/auth';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (phoneNumber: string, otp: string) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            if (token) {
                await updateProfile();
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            await logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (phoneNumber: string, otp: string) => {
        setIsLoading(true);
        try {
            const response: AuthResponse = await authService.verifyOtp({ phoneNumber, otp });
            await AsyncStorage.setItem('access_token', response.access);
            await AsyncStorage.setItem('refresh_token', response.refresh);
            await updateProfile();
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
            setUser(null);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const updateProfile = async () => {
        try {
            const userProfile = await authService.getProfile();
            setUser(userProfile);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
