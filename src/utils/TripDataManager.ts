// Global trip data manager to handle trip information across screens
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TripData, saveTripToHistory } from './TripHistoryHelper';

interface CurrentTripData extends TripData {
  rideId?: string;
  pickupCoords?: { lat: number; lng: number };
  dropoffCoords?: { lat: number; lng: number };
  paymentMethod?: string;
  rideType?: string;
}

class TripDataManager {
  private static instance: TripDataManager;
  private currentTrip: CurrentTripData | null = null;

  private constructor() {}

  static getInstance(): TripDataManager {
    if (!TripDataManager.instance) {
      TripDataManager.instance = new TripDataManager();
    }
    return TripDataManager.instance;
  }

  // Set current trip data (called when booking is confirmed)
  setCurrentTrip(tripData: CurrentTripData): void {
    this.currentTrip = tripData;
    // Also persist to storage for recovery
    AsyncStorage.setItem('@current_trip', JSON.stringify(tripData));
  }

  // Get current trip data
  getCurrentTrip(): CurrentTripData | null {
    return this.currentTrip;
  }

  // Complete and save trip to history
  async completeTrip(): Promise<boolean> {
    if (!this.currentTrip) {
      console.log('❌ No current trip to complete');
      return false;
    }

    try {
      const success = await saveTripToHistory(this.currentTrip);
      if (success) {
        console.log('✅ Trip completed and saved to history:', this.currentTrip);
        // Clear current trip after successful save
        this.clearCurrentTrip();
      } else {
        console.log('❌ Failed to save completed trip');
      }
      return success;
    } catch (error) {
      console.error('Error completing trip:', error);
      return false;
    }
  }

  // Clear current trip data
  clearCurrentTrip(): void {
    this.currentTrip = null;
    AsyncStorage.removeItem('@current_trip');
  }

  // Load persisted trip data (call on app start)
  async loadPersistedTrip(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@current_trip');
      if (stored) {
        this.currentTrip = JSON.parse(stored);
        console.log('📍 Loaded persisted trip data');
      }
    } catch (error) {
      console.error('Error loading persisted trip:', error);
      this.clearCurrentTrip();
    }
  }

  // Update trip data with additional info
  updateTripData(updates: Partial<CurrentTripData>): void {
    if (this.currentTrip) {
      this.currentTrip = { ...this.currentTrip, ...updates };
      AsyncStorage.setItem('@current_trip', JSON.stringify(this.currentTrip));
    }
  }
}

export default TripDataManager.getInstance();