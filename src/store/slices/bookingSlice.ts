import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import client from '../../services/api/client';

// Types
interface Location {
    lat: number;
    lng: number;
}

interface LocationWithAddress {
    coords: Location;
    address: string;
}

interface FareResponse {
    success: boolean;
    fare: number;
    distance: number;
    duration?: number;
}

interface BookingResponse {
    success: boolean;
    rideId: number;
    startOtp: string;
    booking: {
        id: number;
        status: string;
        pickupLocation: LocationWithAddress;
        dropoffLocation: LocationWithAddress;
        fare: number;
        rideType: string;
        paymentMethod: string;
    };
}

interface BookingState {
    // Fare calculation
    estimatedFare: number | null;
    estimatedDistance: number | null;
    estimatedDuration: number | null;

    // Active booking
    rideId: number | null;
    startOtp: string | null;
    booking: BookingResponse['booking'] | null;

    // UI state
    isCalculatingFare: boolean;
    isBooking: boolean;
    error: string | null;
}

const initialState: BookingState = {
    estimatedFare: null,
    estimatedDistance: null,
    estimatedDuration: null,
    rideId: null,
    startOtp: null,
    booking: null,
    isCalculatingFare: false,
    isBooking: false,
    error: null,
};

// Async Thunks

/**
 * Calculate fare for a ride
 * POST /bookings/calculate-fare
 */
export const calculateFare = createAsyncThunk(
    'booking/calculateFare',
    async (
        payload: { pickup: Location; dropoff: Location; rideType: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await client.post<FareResponse>('/bookings/calculate-fare', {
                pickup: payload.pickup,
                dropoff: payload.dropoff,
                rideType: payload.rideType,
            });
            console.log('✅ Fare calculated:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Calculate fare error:', error.response?.data);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to calculate fare'
            );
        }
    }
);

/**
 * Book a ride
 * POST /bookings/book
 */
export const bookRide = createAsyncThunk(
    'booking/bookRide',
    async (
        payload: {
            pickupLocation: LocationWithAddress;
            dropoffLocation: LocationWithAddress;
            paymentMethod: string;
            rideType: string;
        },
        { rejectWithValue }
    ) => {
        try {
            const response = await client.post<BookingResponse>('/bookings/book', payload);
            console.log('✅ Ride booked:', response.data);
            console.log('🔐 Start OTP:', response.data.startOtp);
            return response.data;
        } catch (error: any) {
            console.error('❌ Book ride error:', error.response?.data);
            return rejectWithValue(
                error.response?.data?.message || 'Failed to book ride'
            );
        }
    }
);

// Slice
const bookingSlice = createSlice({
    name: 'booking',
    initialState,
    reducers: {
        clearFareEstimate: (state) => {
            state.estimatedFare = null;
            state.estimatedDistance = null;
            state.estimatedDuration = null;
        },
        clearBooking: (state) => {
            state.rideId = null;
            state.startOtp = null;
            state.booking = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        resetBookingState: () => initialState,
    },
    extraReducers: (builder) => {
        // Calculate Fare
        builder
            .addCase(calculateFare.pending, (state) => {
                state.isCalculatingFare = true;
                state.error = null;
            })
            .addCase(calculateFare.fulfilled, (state, action) => {
                state.isCalculatingFare = false;
                state.estimatedFare = action.payload.fare;
                state.estimatedDistance = action.payload.distance;
                state.estimatedDuration = action.payload.duration || null;
            })
            .addCase(calculateFare.rejected, (state, action) => {
                state.isCalculatingFare = false;
                state.error = action.payload as string;
            });

        // Book Ride
        builder
            .addCase(bookRide.pending, (state) => {
                state.isBooking = true;
                state.error = null;
            })
            .addCase(bookRide.fulfilled, (state, action) => {
                state.isBooking = false;
                state.rideId = action.payload.rideId;
                state.startOtp = action.payload.startOtp;
                state.booking = action.payload.booking;
            })
            .addCase(bookRide.rejected, (state, action) => {
                state.isBooking = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearFareEstimate, clearBooking, clearError, resetBookingState } = bookingSlice.actions;
export default bookingSlice.reducer;
