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
            // Map rideType: 'solo'/'schedule' -> 'private', 'shared' -> 'shared'
            const apiRideType = payload.rideType === 'solo' || payload.rideType === 'schedule'
                ? 'private'
                : payload.rideType;

            const response = await client.post<FareResponse>('/bookings/calculate-fare', {
                pickup: { coords: { lat: payload.pickup.lat, lng: payload.pickup.lng } },
                dropoff: { coords: { lat: payload.dropoff.lat, lng: payload.dropoff.lng } },
                rideType: apiRideType,
            });
            console.log('✅ Fare calculated:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Calculate fare error - Full error object:', error);
            console.error('❌ Calculate fare error - Response status:', error.response?.status);
            console.error('❌ Calculate fare error - Response data:', error.response?.data);
            console.error('❌ Calculate fare error - Response data type:', typeof error.response?.data);

            // Handle different error response formats
            let errorMessage = 'Failed to calculate fare';

            if (error.response?.data) {
                const errorData = error.response.data;

                // Check if errorData is an object with a message property
                if (typeof errorData === 'object') {
                    errorMessage = errorData.message ||
                                 errorData.error ||
                                 errorData.detail ||
                                 errorData.error_message ||
                                 JSON.stringify(errorData);
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            return rejectWithValue(errorMessage);
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
            console.log('📦 BOOKING PAYLOAD BEING SENT:', JSON.stringify(payload, null, 2));

            // Try to make the booking request
            const response = await client.post<BookingResponse>('/bookings/book', payload);

            console.log('✅ Ride booked - FULL RESPONSE:', JSON.stringify(response.data, null, 2));
            console.log('🔐 Start OTP:', response.data.startOtp);
            console.log('📋 Booking Status:', response.data.booking?.status);
            return response.data;
        } catch (error: any) {
            console.error('❌ Book ride error - Full error object:', error);
            console.error('❌ Book ride error - Response status:', error.response?.status);
            console.error('❌ Book ride error - Response data:', error.response?.data);
            console.error('❌ Book ride error - Response data type:', typeof error.response?.data);

            // Additional debugging for 400 errors
            if (error.response?.status === 400) {
                console.error('❌ 400 Bad Request Details:', {
                    data: error.response?.data,
                    message: error.response?.data?.message,
                    error: error.response?.data?.error,
                    validationErrors: error.response?.data?.errors || error.response?.data?.validation_errors,
                    payloadStructure: {
                        hasPickupLocation: !!payload.pickupLocation,
                        hasDropoffLocation: !!payload.dropoffLocation,
                        hasPaymentMethod: !!payload.paymentMethod,
                        hasRideType: !!payload.rideType,
                        pickupStructure: payload.pickupLocation,
                        dropoffStructure: payload.dropoffLocation,
                    }
                });
            }

            // Handle different error response formats
            let errorMessage = 'Failed to book ride';

            // Check for authentication errors specifically
            if (error.response?.status === 401) {
                errorMessage = 'Authentication required. Please log in again.';
            } else if (error.response?.data) {
                const errorData = error.response.data;

                // Check if errorData is an object with a message property
                if (typeof errorData === 'object') {
                    errorMessage = errorData.message ||
                                 errorData.error ||
                                 errorData.detail ||
                                 errorData.error_message ||
                                 errorData.success === false && errorData.message ||
                                 JSON.stringify(errorData);
                } else if (typeof errorData === 'string') {
                    errorMessage = errorData;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            return rejectWithValue(errorMessage);
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
