import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../../services/api/auth';
import { User, AuthResponse } from '../../types/api';

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Async Thunks
export const loginWithOtp = createAsyncThunk(
    'auth/loginWithOtp',
    async ({ phoneNumber, otp }: { phoneNumber: string; otp: string }, { rejectWithValue }) => {
        try {
            const response: AuthResponse = await authService.verifyOtp({ phoneNumber, otp });

            // Store tokens in AsyncStorage for API client interceptor
            await AsyncStorage.setItem('access_token', response.access);
            await AsyncStorage.setItem('refresh_token', response.refresh);

            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const fetchUserProfile = createAsyncThunk(
    'auth/fetchUserProfile',
    async (_, { rejectWithValue }) => {
        try {
            const user = await authService.getProfile();
            return user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
        }
    }
);

export const updateUserProfile = createAsyncThunk(
    'auth/updateUserProfile',
    async (data: Partial<User> | FormData, { rejectWithValue }) => {
        try {
            const user = await authService.updateProfile(data);
            return user;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
        }
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            state.refreshToken = action.payload.refreshToken;
            state.isAuthenticated = true;
        },
        setAccessToken: (state, action: PayloadAction<string>) => {
            state.accessToken = action.payload;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },
        logout: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
            // Clear AsyncStorage
            AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Login with OTP
        builder
            .addCase(loginWithOtp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginWithOtp.fulfilled, (state, action) => {
                state.isLoading = false;
                state.accessToken = action.payload.access;
                state.refreshToken = action.payload.refresh;
                // User will be set after fetchUserProfile
            })
            .addCase(loginWithOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Fetch User Profile
        builder
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Update User Profile
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { setCredentials, setAccessToken, setUser, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
