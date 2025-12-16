import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import client from '../../services/api/client';

// Types
interface HistoryBooking {
    id: number;
    fare: number;
    status: 'completed' | 'cancelled';
    pickupLocation: {
        address: string;
        coords: { lat: number; lng: number };
    };
    dropoffLocation: {
        address: string;
        coords: { lat: number; lng: number };
    };
    distance?: number;
    duration?: number;
    rideType: string;
    paymentMethod: string;
    driver?: {
        name: string;
        vehicle: string;
        rating?: number;
    };
    createdAt: string;
    completedAt?: string;
}

interface HistoryResponse {
    success: boolean;
    bookings: HistoryBooking[];
}

interface HistoryState {
    bookings: HistoryBooking[];
    isLoading: boolean;
    error: string | null;
}

const initialState: HistoryState = {
    bookings: [],
    isLoading: false,
    error: null,
};

// Async Thunks

/**
 * Get ride history
 * GET /bookings/history
 */
export const getHistory = createAsyncThunk(
    'history/getHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await client.get<HistoryResponse>('/bookings/history');
            console.log('📜 History loaded:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get history error:', error.response?.data);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to load history'
            );
        }
    }
);

// Slice
const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        clearHistory: (state) => {
            state.bookings = [];
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getHistory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(getHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.bookings = action.payload.bookings;
            })
            .addCase(getHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearHistory, clearError } = historySlice.actions;
export default historySlice.reducer;
