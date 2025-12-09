import { Platform, PermissionsAndroid, ToastAndroid, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

class LocationService {
    /**
     * Check if location permission is granted
     */
    static async checkPermission(): Promise<boolean> {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.check(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
            );
            return granted;
        } else {
            // For iOS, use the geolocation service method
            try {
                const permission = await Geolocation.requestAuthorization('whenInUse');
                return permission === 'granted';
            } catch (error) {
                console.warn('Error checking iOS permission:', error);
                return false;
            }
        }
    }

    /**
     * Request location permission from user
     */
    static async requestPermission(): Promise<boolean> {
        if (Platform.OS === 'android') {
            try {
                // First check if already granted
                const alreadyGranted = await this.checkPermission();
                if (alreadyGranted) {
                    return true;
                }

                // Request permission
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message:
                            'LocalToto needs access to your location ' +
                            'to find drivers around you and show your current position.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );

                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn('Location permission error:', err);
                return false;
            }
        } else {
            // For iOS, request authorization
            try {
                const permission = await Geolocation.requestAuthorization('whenInUse');
                return permission === 'granted';
            } catch (error) {
                console.warn('Error requesting iOS permission:', error);
                return false;
            }
        }
    }

    /**
     * Get current location coordinates with better error handling
     */
    static async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
        try {
            const hasPermission = await this.checkPermission();

            if (!hasPermission) {
                const granted = await this.requestPermission();
                if (!granted) {
                    this.showPermissionDeniedAlert();
                    return null;
                }
            }

            return new Promise((resolve, reject) => {
                Geolocation.getCurrentPosition(
                    (position) => {
                        resolve({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            accuracy: position.coords.accuracy,
                            altitude: position.coords.altitude,
                            heading: position.coords.heading,
                            speed: position.coords.speed,
                        });
                    },
                    (error) => {
                        console.error('Error getting location:', error);
                        reject(error);
                    },
                    {
                        enableHighAccuracy: true,
                        timeout: 15000,
                        maximumAge: 10000,
                        distanceFilter: 0,
                        forceRequestLocation: true,
                        showLocationDialog: true,
                    }
                );
            });
        } catch (error) {
            console.error('Location service error:', error);
            return null;
        }
    }

    /**
     * Watch location changes
     */
    static watchLocation(
        callback: (position: any) => void,
        errorCallback?: (error: any) => void
    ): number | null {
        try {
            return Geolocation.watchPosition(
                callback,
                errorCallback || ((error) => console.error('Watch location error:', error)),
                {
                    enableHighAccuracy: true,
                    distanceFilter: 10,
                    interval: 5000,
                    fastestInterval: 2000,
                    useSignificantChanges: false,
                }
            );
        } catch (error) {
            console.error('Error starting location watch:', error);
            return null;
        }
    }

    /**
     * Stop watching location
     */
    static stopWatching(watchId: number | null): void {
        if (watchId !== null) {
            Geolocation.clearWatch(watchId);
        }
    }

    /**
     * Check if location services are enabled
     */
    static async isLocationEnabled(): Promise<boolean> {
        if (Platform.OS === 'android') {
            try {
                return await Geolocation.requestAuthorization('whenInUse') === 'granted';
            } catch (error) {
                console.warn('Error checking location enabled:', error);
                return false;
            }
        } else {
            // For iOS, we'll try to get a location to check if services are enabled
            return new Promise((resolve) => {
                Geolocation.getCurrentPosition(
                    () => resolve(true),
                    () => resolve(false),
                    { timeout: 5000 }
                );
            });
        }
    }

    /**
     * Show alert if permission is denied
     */
    static showPermissionDeniedAlert() {
        if (Platform.OS === 'android') {
            ToastAndroid.show(
                'Location permission required to find nearby drivers',
                ToastAndroid.LONG
            );
        } else {
            Alert.alert(
                'Location Permission Required',
                'Please enable location access in Settings to find nearby drivers.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { 
                        text: 'Open Settings', 
                        onPress: () => {
                            // For iOS, you might want to open app settings
                            if (Platform.OS === 'ios') {
                                // You can use Linking to open settings
                                // Linking.openURL('app-settings:');
                            }
                        }
                    },
                ]
            );
        }
    }

    /**
     * Calculate distance between two coordinates in meters (Haversine formula)
     */
    static calculateDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // Distance in meters
    }

    /**
     * Get location with fallback options
     */
    static async getLocationWithRetry(maxRetries: number = 3): Promise<{ latitude: number; longitude: number } | null> {
        for (let i = 0; i < maxRetries; i++) {
            try {
                const location = await this.getCurrentLocation();
                if (location) {
                    return location;
                }
                
                // Wait before retrying (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
            } catch (error) {
                console.warn(`Location attempt ${i + 1} failed:`, error);
            }
        }
        
        console.error('Failed to get location after', maxRetries, 'attempts');
        return null;
    }
}

export default LocationService;
