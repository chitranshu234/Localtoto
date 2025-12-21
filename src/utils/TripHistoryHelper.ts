// Simple helper to save trips from any screen
// This can be imported and used anywhere in the app

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TripData {
  pickupLocation?: string;
  dropoffLocation?: string;
  distance?: number;
  duration?: number;
  amount?: string;
  driverName?: string;
  driverRating?: number;
  carType?: string;
}

// Save a completed trip to history
export const saveTripToHistory = async (tripData: TripData): Promise<boolean> => {
  try {
    // Get existing trips
    const existingTrips = await AsyncStorage.getItem('trip_history');
    let allTrips = existingTrips ? JSON.parse(existingTrips) : [];

    const newTrip = {
      id: Date.now(),
      date: 'Just Now',
      time: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      }),
      pickupLocation: tripData.pickupLocation || 'Unknown Pickup',
      dropoffLocation: tripData.dropoffLocation || 'Unknown Destination',
      distance: tripData.distance ? `${tripData.distance} km` : 'Unknown',
      duration: tripData.duration ? `${tripData.duration} mins` : 'Unknown',
      amount: tripData.amount || 'Unknown',
      driverName: tripData.driverName || 'Driver',
      driverRating: tripData.driverRating || 4.8,
      carType: tripData.carType || 'Sedan',
      status: 'Completed',
    };

    // Add new trip to the beginning
    allTrips.unshift(newTrip);

    // Save to storage
    await AsyncStorage.setItem('trip_history', JSON.stringify(allTrips));

    console.log('✅ Trip saved to history:', newTrip);
    return true;
  } catch (error) {
    console.error('Error saving trip to history:', error);
    return false;
  }
};

// Example usage:
/*
import { saveTripToHistory } from '../utils/TripHistoryHelper';

// When a trip is completed, call this function:
const handleTripCompletion = async () => {
  const success = await saveTripToHistory({
    pickupLocation: 'Patna Junction',
    dropoffLocation: 'Danapur Railway Station',
    distance: 12.5,
    duration: 25,
    amount: '₹350',
    driverName: 'Rajesh Kumar',
    driverRating: 4.7,
    carType: 'Auto Rickshaw',
  });

  if (success) {
    Alert.alert('Success', 'Trip saved to history!');
  }
};
*/