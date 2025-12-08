import { Platform, PermissionsAndroid, ToastAndroid, Alert } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

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
            // For iOS, we'll check using Geolocation API
            return new Promise((resolve) => {
                Geolocation.getCurrentPosition(
                    () => resolve(true),
                    () => resolve(false),
                    { timeout: 1000 }
                );
            });
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
            // For iOS, permission is requested automatically on first getCurrentPosition call
            return true;
        }
    }

    /**
     * Get current location coordinates
     */
    static async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
        const hasPermission = await this.checkPermission();

        if (!hasPermission) {
            const granted = await this.requestPermission();
            if (!granted) {
                return null;
            }
        }

        return new Promise((resolve) => {
            Geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 10000,
                }
            );
        });
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
                    { text: 'Open Settings', onPress: () => console.log('Open settings') },
                ]
            );
        }
    }
}

export default LocationService;
