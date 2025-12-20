import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import client from '../../services/api/client';

// Types
interface Location {
    lat: number;
    lng: number;
}

interface Driver {
    id: number;
    name: string;
    phoneNumber?: string;
    vehicle: string;
    vehicleNumber?: string;
    rating?: number;
    profilePhoto?: string;
}

interface RideDetails {
    success: boolean;
    booking: {
        id: number;
        status: 'requested' | 'searching' | 'confirmed' | 'accepted' | 'arrived' | 'started' | 'in_progress' | 'completed' | 'cancelled';
        eta?: string;
        fare: number;
        startOtp?: string;
    };
    driver?: Driver;
    driverLocation?: Location;
    near: boolean;
    arrived: boolean;
}

interface RideState {
    // Current ride
    currentRide: RideDetails['booking'] | null;
    driver: Driver | null;
    driverLocation: Location | null;

    // Status flags
    isDriverNear: boolean;
    hasDriverArrived: boolean;
    rideStatus: string | null;

    // UI state
    isLoading: boolean;
    isPolling: boolean;
    isRating: boolean;
    error: string | null;
}

const initialState: RideState = {
    currentRide: null,
    driver: null,
    driverLocation: null,
    isDriverNear: false,
    hasDriverArrived: false,
    rideStatus: null,
    isLoading: false,
    isPolling: false,
    isRating: false,
    error: null,
};

// Async Thunks

/**
 * Get ride details (for polling)
 * GET /bookings/details/{booking_id}
 */
export const getRideDetails = createAsyncThunk(
    'ride/getRideDetails',
    async (bookingId: number, { rejectWithValue }) => {
        try {
            const response = await client.get<RideDetails>(`/bookings/details/${bookingId}`);
            console.log('🚗 Ride details:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Get ride details error:', error.response?.data);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to get ride details'
            );
        }
    }
);

/**
 * Rate driver after ride completion
 * POST /bookings/rate-driver/{booking_id}
 */
export const rateDriver = createAsyncThunk(
    'ride/rateDriver',
    async (
        payload: { bookingId: number; rating: number; comment?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await client.post(`/bookings/rate-driver/${payload.bookingId}`, {
                rating: payload.rating,
                comment: payload.comment || '',
            });
            console.log('⭐ Rating submitted:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Rate driver error:', error.response?.data);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to submit rating'
            );
        }
    }
);

/**
 * Cancel ride
 * POST /bookings/cancel/{booking_id}
 */
export const cancelRide = createAsyncThunk(
    'ride/cancelRide',
    async (bookingId: number, { rejectWithValue }) => {
        try {
            const response = await client.post(`/bookings/cancel/${bookingId}`);
            console.log('🚫 Ride cancelled:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Cancel ride error:', error.response?.data);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to cancel ride'
            );
        }
    }
);

// Slice
const rideSlice = createSlice({
    name: 'ride',
    initialState,
    reducers: {
        setPolling: (state, action: PayloadAction<boolean>) => {
            state.isPolling = action.payload;
        },
        updateDriverLocation: (state, action: PayloadAction<Location>) => {
            state.driverLocation = action.payload;
        },
        setRideStatus: (state, action: PayloadAction<string>) => {
            state.rideStatus = action.payload;
        },
        clearRide: (state) => {
            state.currentRide = null;
            state.driver = null;
            state.driverLocation = null;
            state.isDriverNear = false;
            state.hasDriverArrived = false;
            state.rideStatus = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetRideState: () => initialState,
    },
    extraReducers: (builder) => {
        // Get Ride Details
        builder
            .addCase(getRideDetails.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getRideDetails.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentRide = action.payload.booking;
                state.driver = action.payload.driver || null;
                state.driverLocation = action.payload.driverLocation || null;
                state.isDriverNear = action.payload.near;
                state.hasDriverArrived = action.payload.arrived;
                state.rideStatus = action.payload.booking.status;
            })
            .addCase(getRideDetails.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });

        // Rate Driver
        builder
            .addCase(rateDriver.pending, (state) => {
                state.isRating = true;
                state.error = null;
            })
            .addCase(rateDriver.fulfilled, (state) => {
                state.isRating = false;
            })
            .addCase(rateDriver.rejected, (state, action) => {
                state.isRating = false;
                state.error = action.payload as string;
            });

        // Cancel Ride
        builder
            .addCase(cancelRide.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(cancelRide.fulfilled, (state) => {
                state.isLoading = false;
                state.currentRide = null;
                state.driver = null;
                state.rideStatus = 'cancelled';
            })
            .addCase(cancelRide.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    setPolling,
    updateDriverLocation,
    setRideStatus,
    clearRide,
    clearError,
    resetRideState,
} = rideSlice.actions;
export default rideSlice.reducer;
