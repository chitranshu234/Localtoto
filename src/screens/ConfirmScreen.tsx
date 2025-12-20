import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Pressable,
    StyleSheet,
    Dimensions,
    StatusBar,
    TextInput,
    Modal,
    PermissionsAndroid,
    Platform,
    Alert,
    ActivityIndicator,
    Animated,
    Easing,
    FlatList,
    Keyboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Button from '../components/Button';
import Mapbox, { Camera, PointAnnotation, ShapeSource, LineLayer } from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ReanimatedModule, { useSharedValue, useAnimatedStyle, withSpring, interpolate, Extrapolate } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { geocodingService } from '../services/api/geocoding';
// Redux
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { calculateFare as calculateFareAPI, bookRide, clearBooking } from '../store/slices/bookingSlice';

const { width, height } = Dimensions.get('window');

// Mapbox Access Token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYWRhcnNobWlzaHJhNTYzIiwiYSI6ImNtZjlocXQydzBrZmYycnNqNGs5OTk3cXUifQ.jwUMhX7pbAGl7fI9rXt7mw';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

const RECENT_ADDRESSES_KEY = '@localtoto_recent_addresses';


// Ride Types: Solo, Shared, Schedule
const RIDE_TYPES = [
    {
        id: 'solo',
        name: 'Solo',
        description: 'Private ride just for you',
        icon: 'person',
        iconOutline: 'person-outline',
        color: '#2D7C4F',
    },
    {
        id: 'shared',
        name: 'Shared',
        description: 'Share & save more',
        icon: 'people',
        iconOutline: 'people-outline',
        color: '#3498db',
    },
    {
        id: 'schedule',
        name: 'Schedule',
        description: 'Book for later',
        icon: 'time',
        iconOutline: 'time-outline',
        color: '#9b59b6',
    },
];

const SAVED_LOCATIONS = [
    { id: 'home', title: 'Home', icon: 'home', latitude: 28.5355, longitude: 77.3910 },
    { id: 'work', title: 'Work', icon: 'briefcase', latitude: 28.5799, longitude: 77.3214 },
    { id: 'gym', title: 'Gym', icon: 'heartbeat', latitude: 28.5700, longitude: 77.3218 },
];

interface LocationSuggestion {
    id: string;
    title: string;
    address: string;
    latitude: number;
    longitude: number;
}

const ConfirmScreen = ({ navigation, route }: any) => {
    // Redux
    const dispatch = useAppDispatch();
    const { estimatedFare, estimatedDistance, isCalculatingFare, isBooking } = useAppSelector(state => state.booking);

    // --- State: Booking Stage ---
    // 'search': User is searching for destination
    // 'vehicle': User has selected pickup & drop, choosing vehicle
    const [bookingStage, setBookingStage] = useState<'search' | 'vehicle'>('search');

    // --- State: Location & Search ---
    const [pickupLocation, setPickupLocation] = useState<LocationSuggestion | null>(null);
    const [dropLocation, setDropLocation] = useState<LocationSuggestion | null>(null);

    const [pickupQuery, setPickupQuery] = useState('Current Location');
    const [dropQuery, setDropQuery] = useState('');
    const [activeInput, setActiveInput] = useState<'pickup' | 'drop'>('drop');

    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [recentAddresses, setRecentAddresses] = useState<LocationSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [loadingLocation, setLoadingLocation] = useState(true);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);

    // --- State: Ride Type Selection ---
    const [selectedRideType, setSelectedRideType] = useState<'solo' | 'shared' | 'schedule'>('solo');
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [promoCode, setPromoCode] = useState('');

    // --- State: Nearby Drivers ---
    const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);

    // --- State: Bottom Sheet Position ---
    const [sheetPosition, setSheetPosition] = useState(height * 0.55); // Start at 45% visible (55% from top)
    const [sheetIndex, setSheetIndex] = useState(0); // 0 = partially open, 1 = fully expanded

    // --- Button Animation ---
    const buttonScaleAnim = useRef(new Animated.Value(1)).current;

    // --- Ripple Animation - Only 2 ripples for subtle effect ---
    const rippleAnims = useRef([
        new Animated.Value(0),
        new Animated.Value(0),
    ]).current;
    const [showRipples, setShowRipples] = useState(false);

    // --- Locate Button Fade Animation ---
    const locateButtonOpacity = useRef(new Animated.Value(1)).current;

    // --- State: Route & Map ---
    const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
    const [rideFare, setRideFare] = useState<any>(null);

    // --- State: Individual Fares for each ride type ---
    const [privateFare, setPrivateFare] = useState<number | null>(null);
    const [sharedFare, setSharedFare] = useState<number | null>(null);

    // --- Refs ---
    const bottomSheetModalRef = useRef<any>(null);
    const cameraRef = useRef<any>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

    // --- Snap Points ---
    const snapPoints = useMemo(() => {
        if (bookingStage === 'search') return ['45%', '85%'];
        // Fixed height for vehicle selection - non-draggable
        return ['48%'];
    }, [bookingStage]);

    // --- Effects ---

    // 0. Debug: Check Auth Token Status
    useEffect(() => {
        const checkAuthStatus = async () => {
            const accessToken = await AsyncStorage.getItem('access_token');
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            const userProfile = await AsyncStorage.getItem('user_profile');

            console.log('🔐 ConfirmScreen - Auth Status Check:');
            console.log('  📌 Access Token:', accessToken ? `Present (${accessToken.substring(0, 20)}...)` : '❌ MISSING');
            console.log('  📌 Refresh Token:', refreshToken ? `Present (${refreshToken.substring(0, 20)}...)` : '❌ MISSING');
            console.log('  📌 User Profile:', userProfile ? 'Present' : '❌ MISSING');

            if (!accessToken && !refreshToken) {
                console.log('⚠️ User is NOT authenticated - booking will fail!');
            }
        };
        checkAuthStatus();
    }, []);

    // 1. Initialize: Request Location & Load Recents
    useEffect(() => {
        requestLocationPermission();
        loadRecentAddresses();
        startPulseAnimation();
        generateNearbyDrivers();
    }, []);

    // 2. Get Location when permission granted
    useEffect(() => {
        if (hasLocationPermission) {
            getCurrentLocation();
        }
    }, [hasLocationPermission]);

    // 3. Present Bottom Sheet
    useEffect(() => {
        // Wait a bit for layout
        const timer = setTimeout(() => {
            bottomSheetModalRef.current?.present();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // 4. Calculate Route when both locations set
    useEffect(() => {
        if (pickupLocation && dropLocation) {
            setBookingStage('vehicle');
            calculateRoute();
        } else {
            setBookingStage('search');
            setRouteCoordinates([]);
        }
    }, [pickupLocation, dropLocation]);

    // 4b. (Removed - fares are now calculated together in calculateRoute)

    // 5. Adjust Camera
    useEffect(() => {
        if (routeCoordinates.length > 0) {
            setTimeout(adjustCameraToFitPoints, 500);
        } else if (pickupLocation && !dropLocation) {
            // Focus on pickup if only pickup is set - higher zoom for better visibility
            cameraRef.current?.setCamera({
                centerCoordinate: [pickupLocation.longitude, pickupLocation.latitude],
                zoomLevel: 16,
                animationDuration: 1000,
            });
        }
    }, [routeCoordinates, pickupLocation]);

    // --- Helper Functions ---

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const loadRecentAddresses = async () => {
        try {
            const stored = await AsyncStorage.getItem(RECENT_ADDRESSES_KEY);
            if (stored) {
                setRecentAddresses(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading recent addresses:', error);
        }
    };

    const saveRecentAddress = async (location: LocationSuggestion) => {
        try {
            if (location.id === 'current' || location.title === 'Current Location') return;

            const stored = await AsyncStorage.getItem(RECENT_ADDRESSES_KEY);
            let addresses: LocationSuggestion[] = stored ? JSON.parse(stored) : [];
            addresses = addresses.filter(addr => addr.address !== location.address);
            addresses.unshift(location);
            addresses = addresses.slice(0, 5);

            await AsyncStorage.setItem(RECENT_ADDRESSES_KEY, JSON.stringify(addresses));
            setRecentAddresses(addresses);
        } catch (error) {
            console.error('Error saving recent address:', error);
        }
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setHasLocationPermission(true);
                } else {
                    setLoadingLocation(false);
                    Alert.alert('Permission denied', 'Location permission is required.');
                }
            } catch (err) {
                console.warn(err);
                setLoadingLocation(false);
            }
        } else {
            Geolocation.requestAuthorization('whenInUse').then(permission => {
                if (permission === 'granted') setHasLocationPermission(true);
                else setLoadingLocation(false);
            });
        }
    };

    // Generate nearby drivers around pickup location
    const generateNearbyDrivers = () => {
        // Mock drivers near current location
        const mockDrivers = [
            { id: '1', name: 'Rajesh', lat: 0.002, lng: 0.003, eta: '2 min' },
            { id: '2', name: 'Amit', lat: -0.001, lng: 0.002, eta: '3 min' },
            { id: '3', name: 'Suresh', lat: 0.001, lng: -0.002, eta: '4 min' },
            { id: '4', name: 'Vikram', lat: -0.002, lng: -0.001, eta: '5 min' },
        ];
        setNearbyDrivers(mockDrivers);
    };

    // Button press animation
    const animateButtonPress = () => {
        Animated.sequence([
            Animated.timing(buttonScaleAnim, {
                toValue: 0.85,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(buttonScaleAnim, {
                toValue: 1,
                useNativeDriver: true,
                friction: 3,
                tension: 100,
            }),
        ]).start();
    };

    // Water ripple animation for confirm button - soft and professional
    const triggerRippleAnimation = () => {
        setShowRipples(true);
        // Reset all ripples
        rippleAnims.forEach(anim => anim.setValue(0));

        // Staggered ripple animations - slower and smoother
        const animations = rippleAnims.map((anim, index) =>
            Animated.timing(anim, {
                toValue: 1,
                duration: 900, // Slower for smoother effect
                delay: index * 200, // Gentler stagger
                easing: Easing.out(Easing.cubic), // Smoother easing
                useNativeDriver: true,
            })
        );

        Animated.parallel(animations).start(() => {
            setShowRipples(false);
            rippleAnims.forEach(anim => anim.setValue(0));
        });
    };

    // Handle bottom sheet position change
    const handleSheetChange = useCallback((index: number) => {
        // Track sheet index for button visibility
        setSheetIndex(index);
        // Calculate position based on snap point
        const currentSnapPoints = bookingStage === 'search' ? ['45%', '85%'] : ['40%', '70%'];
        const snapPercent = parseFloat(currentSnapPoints[index]) / 100;
        const newPosition = height * (1 - snapPercent);
        setSheetPosition(newPosition);

        // Smooth fade animation for locate button
        Animated.timing(locateButtonOpacity, {
            toValue: index === 0 ? 1 : 0, // Fade in when partially open, fade out when fully expanded
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [bookingStage, locateButtonOpacity]);

    // Service area check - Patna region (approx 30km radius)
    const isInServiceArea = (lat: number, lng: number): boolean => {
        // Patna center: 25.5941, 85.1376
        // Allow coordinates roughly within Bihar/Patna region
        const minLat = 24.5, maxLat = 27.0;
        const minLng = 83.5, maxLng = 87.0;
        return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
    };

    // Default Patna location for testing
    const DEFAULT_PATNA_LOCATION = {
        id: 'default',
        title: 'Patna Junction',
        address: 'Patna Junction, Patna, Bihar',
        latitude: 25.6093,
        longitude: 85.1376,
    };

    const getCurrentLocation = () => {
        setLoadingLocation(true);
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log('📍 GPS Location:', latitude, longitude);

                // Check if GPS location is in service area
                if (!isInServiceArea(latitude, longitude)) {
                    console.log('⚠️ GPS outside service area, using default Patna location');
                    setPickupLocation(DEFAULT_PATNA_LOCATION);
                    setPickupQuery(DEFAULT_PATNA_LOCATION.address);
                    setLoadingLocation(false);
                    cameraRef.current?.setCamera({
                        centerCoordinate: [DEFAULT_PATNA_LOCATION.longitude, DEFAULT_PATNA_LOCATION.latitude],
                        zoomLevel: 15,
                        animationDuration: 1000,
                    });
                    return;
                }

                const address = await reverseGeocode(latitude, longitude);

                const location = {
                    id: 'current',
                    title: 'Current Location',
                    address: address || 'Current Location',
                    latitude,
                    longitude,
                };

                setPickupLocation(location);
                setPickupQuery(location.address);
                setLoadingLocation(false);
                cameraRef.current?.setCamera({
                    centerCoordinate: [longitude, latitude],
                    zoomLevel: 17,
                    animationDuration: 1000,
                });

            },
            (error) => {
                console.log('Error getting location:', error);
                // On error, also use default Patna location
                console.log('⚠️ Using default Patna location due to GPS error');
                setPickupLocation(DEFAULT_PATNA_LOCATION);
                setPickupQuery(DEFAULT_PATNA_LOCATION.address);
                setLoadingLocation(false);
                cameraRef.current?.setCamera({
                    centerCoordinate: [DEFAULT_PATNA_LOCATION.longitude, DEFAULT_PATNA_LOCATION.latitude],
                    zoomLevel: 15,
                    animationDuration: 1000,
                });
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    };

    // Handle Locate Me button - focus on pickup location
    const handleLocateMe = () => {
        if (pickupLocation) {
            console.log('📍 Locate Me pressed - focusing on pickup:', pickupLocation.latitude, pickupLocation.longitude);

            if (cameraRef.current) {
                cameraRef.current.flyTo([pickupLocation.longitude, pickupLocation.latitude], 800);
                setTimeout(() => {
                    cameraRef.current?.zoomTo(16, 500);
                }, 850);
            }
        } else {
            Alert.alert('No Pickup Set', 'Please set a pickup location first.');
        }
    };

    const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
        try {
            const result = await geocodingService.reverseGeocode(lat, lng);
            return result.address || null;
        } catch (error) {
            console.error('Reverse geocode error:', error);
            return null;
        }
    };

    const searchPlaces = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            const results = await geocodingService.geocode(query);

            if (results && results.length > 0) {
                const formattedSuggestions: LocationSuggestion[] = results.map((result: any, index: number) => ({
                    id: result.id || result.place_id || `${index}`,
                    title: result.name || result.address?.split(',')[0] || 'Location',
                    address: result.address || result.display_name || '',
                    latitude: result.lat,
                    longitude: result.lng,
                }));
                setSuggestions(formattedSuggestions);
            } else {
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    }, [pickupLocation, activeInput]);

    const calculateRoute = async () => {
        if (!pickupLocation || !dropLocation) return;

        try {
            const routeResult = await geocodingService.getRoute(
                { lat: pickupLocation.latitude, lng: pickupLocation.longitude },
                { lat: dropLocation.latitude, lng: dropLocation.longitude }
            );

            if (routeResult.success && routeResult.coordinates && routeResult.coordinates.length > 0) {
                setRouteCoordinates(routeResult.coordinates);

                const distanceInKm = parseFloat(routeResult.distanceKm) || routeResult.distance / 1000;
                const estimatedTime = routeResult.durationMinutes || Math.round(routeResult.duration / 60);

                // Calculate BOTH private and shared fares
                const pickupCoords = { lat: pickupLocation.latitude, lng: pickupLocation.longitude };
                const dropoffCoords = { lat: dropLocation.latitude, lng: dropLocation.longitude };

                // Fetch private fare
                let fareDistance = 0;
                let fareDuration = 0;
                try {
                    const privateResult = await dispatch(calculateFareAPI({
                        pickup: pickupCoords,
                        dropoff: dropoffCoords,
                        rideType: 'private',
                    })).unwrap();
                    setPrivateFare(privateResult.fare);
                    // Use distance/duration from fare API (more accurate for pricing)
                    fareDistance = privateResult.distance || 0;
                    fareDuration = privateResult.duration || 0;
                } catch (e) {
                    console.error('Private fare error:', e);
                }

                // Fetch shared fare
                try {
                    const sharedResult = await dispatch(calculateFareAPI({
                        pickup: pickupCoords,
                        dropoff: dropoffCoords,
                        rideType: 'shared',
                    })).unwrap();
                    setSharedFare(sharedResult.fare);
                } catch (e) {
                    console.error('Shared fare error:', e);
                }

                setRideFare({
                    distance: Math.round(fareDistance),
                    estimatedTime: fareDuration,
                });
            }
        } catch (error) {
            console.error('Route calculation error:', error);
            // Fallback line
            setRouteCoordinates([
                [pickupLocation.longitude, pickupLocation.latitude],
                [dropLocation.longitude, dropLocation.latitude],
            ]);
        }
    };

    const adjustCameraToFitPoints = () => {
        if (!pickupLocation || !dropLocation) return;

        const pointsToShow = [
            [pickupLocation.longitude, pickupLocation.latitude],
            [dropLocation.longitude, dropLocation.latitude],
        ];

        const lngs = pointsToShow.map(p => p[0]);
        const lats = pointsToShow.map(p => p[1]);
        const minLng = Math.min(...lngs) - 0.01;
        const maxLng = Math.max(...lngs) + 0.01;
        const minLat = Math.min(...lats) - 0.01;
        const maxLat = Math.max(...lats) + 0.01;

        cameraRef.current?.fitBounds(
            [minLng, minLat],
            [maxLng, maxLat],
            {
                padding: { top: 120, bottom: height * 0.4, left: 50, right: 50 },
                animationDuration: 1200,
            }
        );
    };

    // --- Handlers ---

    const handleSearchTextChange = (text: string) => {
        if (activeInput === 'pickup') {
            setPickupQuery(text);
        } else {
            setDropQuery(text);
        }
        // Properly debounce search - clear previous timeout before setting new one
        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }
        searchDebounceRef.current = setTimeout(() => {
            searchPlaces(text);
        }, 500); // 500ms debounce
    };

    const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
        if (activeInput === 'pickup') {
            setPickupQuery(suggestion.title);
            setPickupLocation(suggestion);
            // Switch to dropoff search after pickup selection
            setActiveInput('drop');
            // If dropoff is already set, calculate route
            if (dropLocation) {
                // Route calculation effect will trigger
            } else {
                // Open bottom sheet for dropoff
                bottomSheetModalRef.current?.expand();
            }
        } else {
            setDropQuery(suggestion.title);
            setDropLocation(suggestion);
            saveRecentAddress(suggestion);
        }
        setSuggestions([]);
        Keyboard.dismiss();
    };

    const handleRideTypeSelect = (rideType: 'solo' | 'shared' | 'schedule') => {
        setSelectedRideType(rideType);
    };

    const handleConfirmRide = async () => {
        if (!pickupLocation || !dropLocation) return;

        // Animate button on press
        animateButtonPress();

        const rideType = selectedRideType === 'shared' ? 'shared' : 'private';
        const fare = selectedRideType === 'shared' ? (sharedFare || 0) : (privateFare || 0);

        try {
            const result = await dispatch(bookRide({
                pickupLocation: {
                    coords: { lat: pickupLocation.latitude, lng: pickupLocation.longitude },
                    address: pickupLocation.address,
                },
                dropoffLocation: {
                    coords: { lat: dropLocation.latitude, lng: dropLocation.longitude },
                    address: dropLocation.address,
                },
                paymentMethod: paymentMethod,
                rideType: rideType,
            })).unwrap();

            navigation.navigate('FindingDriverTabs', {
                pickup: pickupLocation,
                dropoff: dropLocation,
                vehicle: selectedRideType,
                rideType: selectedRideType,
                paymentMethod: paymentMethod,
                fare: fare,
                rideId: result.rideId,
                startOtp: result.startOtp,
            });
        } catch (error: any) {
            Alert.alert('Booking Failed', error.message || 'Failed to book ride.');
        }
    };

    const handleBackToSearch = () => {
        setDropLocation(null);
        setDropQuery('');
        setRouteCoordinates([]);
        setBookingStage('search');
        setActiveInput('drop');
        // Reset camera to pickup
        if (pickupLocation) {
            cameraRef.current?.setCamera({
                centerCoordinate: [pickupLocation.longitude, pickupLocation.latitude],
                zoomLevel: 16,
                animationDuration: 1000,
            });
        }
    };

    const handlePickupPress = () => {
        setActiveInput('pickup');
        setBookingStage('search');
        setSuggestions([]);
        setPickupQuery(''); // Clear for new search
        bottomSheetModalRef.current?.expand();
    };

    // --- Render Components ---

    const renderSearchSection = () => (
        <View style={styles.searchContainer}>
            <Text style={styles.sectionTitle}>
                {activeInput === 'pickup' ? 'Enter Pickup Location' : 'Enter Destination'}
            </Text>

            <View style={styles.searchBar}>
                <Icon name="search" size={18} color="#2D7C4F" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder={activeInput === 'pickup' ? "Enter pickup location" : "Where to?"}
                    placeholderTextColor="#999"
                    value={activeInput === 'pickup' ? pickupQuery : dropQuery}
                    onChangeText={handleSearchTextChange}
                    autoFocus={true}
                />
                {isSearching && <ActivityIndicator size="small" color="#2D7C4F" />}
            </View>

            {/* Suggestions */}
            {suggestions.length > 0 ? (
                <FlatList
                    data={suggestions}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.suggestionItem} onPress={() => handleSelectSuggestion(item)}>
                            <View style={styles.suggestionIcon}>
                                <Icon name="map-marker" size={16} color="#2D7C4F" />
                            </View>
                            <View>
                                <Text style={styles.suggestionTitle}>{item.title}</Text>
                                <Text style={styles.suggestionAddress} numberOfLines={1}>{item.address}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                    scrollEnabled={false}
                />
            ) : (
                <>
                    {/* Saved Locations */}
                    <View style={styles.savedLocationsRow}>
                        {SAVED_LOCATIONS.map(loc => (
                            <TouchableOpacity
                                key={loc.id}
                                style={styles.savedLocationItem}
                                onPress={() => handleSelectSuggestion({
                                    id: loc.id,
                                    title: loc.title,
                                    address: loc.title, // Simplified
                                    latitude: loc.latitude,
                                    longitude: loc.longitude
                                })}
                            >
                                <View style={styles.savedIconContainer}>
                                    <Icon name={loc.icon} size={20} color="#2D7C4F" />
                                </View>
                                <Text style={styles.savedTitle}>{loc.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Recent Addresses */}
                    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Recent Searches</Text>
                    {recentAddresses.length > 0 ? (
                        recentAddresses.map((item, index) => (
                            <TouchableOpacity
                                key={`recent-${index}`}
                                style={styles.recentItem}
                                onPress={() => handleSelectSuggestion(item)}
                            >
                                <Icon name="history" size={16} color="#888" style={{ marginRight: 15 }} />
                                <Text style={styles.recentText} numberOfLines={1}>{item.title}</Text>
                                <Icon name="chevron-right" size={12} color="#ccc" style={{ marginLeft: 'auto' }} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.noRecentText}>No recent searches</Text>
                    )}
                </>
            )}
        </View>
    );

    const renderVehicleSelection = () => (
        <View style={styles.compactVehicleCard}>
            {/* Location Summary - Now at TOP */}
            <View style={styles.compactLocationSummary}>
                <TouchableOpacity
                    style={styles.compactLocationRow}
                    onPress={() => {
                        setActiveInput('pickup');
                        setBookingStage('search');
                        setSuggestions([]);
                        setTimeout(() => bottomSheetModalRef.current?.present(), 100);
                    }}
                >
                    <View style={styles.greenDotSmall} />
                    <Text style={styles.compactLocationText} numberOfLines={1}>
                        {pickupLocation?.address || 'Select pickup'}
                    </Text>
                    <Icon name="pencil" size={12} color="#888" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.compactLocationRow}
                    onPress={() => {
                        setActiveInput('drop');
                        setBookingStage('search');
                        setSuggestions([]);
                        setTimeout(() => bottomSheetModalRef.current?.present(), 100);
                    }}
                >
                    <View style={styles.redDotSmall} />
                    <Text style={styles.compactLocationText} numberOfLines={1}>
                        {dropLocation?.address || 'Select destination'}
                    </Text>
                    <Icon name="pencil" size={12} color="#888" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
            </View>

            {/* Section Title */}
            <Text style={styles.sectionTitle}>Choose your ride</Text>

            {/* Ride Type Cards - Stacked Vertically */}
            <View style={styles.rideTypeList}>
                {RIDE_TYPES.map((rideType) => (
                    <TouchableOpacity
                        key={rideType.id}
                        style={[
                            styles.rideTypeCard,
                            selectedRideType === rideType.id && styles.selectedRideTypeCard,
                        ]}
                        onPress={() => handleRideTypeSelect(rideType.id as any)}
                        activeOpacity={0.8}
                    >
                        <View style={[
                            styles.rideTypeIconContainer,
                            { backgroundColor: selectedRideType === rideType.id ? rideType.color : '#f5f5f5' }
                        ]}>
                            <Ionicons
                                name={selectedRideType === rideType.id ? rideType.icon : rideType.iconOutline}
                                size={24}
                                color={selectedRideType === rideType.id ? '#fff' : rideType.color}
                            />
                        </View>
                        <View style={styles.rideTypeInfo}>
                            <Text style={[
                                styles.rideTypeName,
                                selectedRideType === rideType.id && { color: rideType.color }
                            ]}>{rideType.name}</Text>
                            <Text style={styles.rideTypeDescription}>
                                {rideFare ? `${Math.round(rideFare.distance)} km • ${rideFare.estimatedTime}` : rideType.description}
                            </Text>
                        </View>
                        <View style={styles.rideTypePriceContainer}>
                            {isCalculatingFare ? (
                                <ActivityIndicator size="small" color={rideType.color} />
                            ) : (
                                <Text style={[
                                    styles.rideTypePrice,
                                    selectedRideType === rideType.id && { color: rideType.color }
                                ]}>₹{rideType.id === 'shared' ? (sharedFare || '-') : (privateFare || '-')}</Text>
                            )}
                            {selectedRideType === rideType.id && (
                                <Ionicons name="checkmark-circle" size={20} color={rideType.color} />
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Payment Row */}
            <View style={styles.compactPaymentRow}>
                <Text style={styles.compactPaymentLabel}>Pay by</Text>
                <View style={styles.compactPaymentOptions}>
                    <TouchableOpacity
                        style={[styles.compactPaymentBtn, paymentMethod === 'cash' && styles.compactPaymentBtnActive]}
                        onPress={() => setPaymentMethod('cash')}
                    >
                        <Text style={[styles.compactPaymentText, paymentMethod === 'cash' && styles.compactPaymentTextActive]}>Cash</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.compactPaymentBtn, paymentMethod === 'upi' && styles.compactPaymentBtnActive]}
                        onPress={() => setPaymentMethod('upi')}
                    >
                        <Text style={[styles.compactPaymentText, paymentMethod === 'upi' && styles.compactPaymentTextActive]}>UPI</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Confirm Button - with extra bottom margin for tab bar */}
            <Pressable
                style={styles.compactConfirmButton}
                onPress={handleConfirmRide}
                disabled={isBooking || isCalculatingFare}
            >
                <Text style={styles.compactConfirmText}>
                    {isBooking ? 'Booking...' : isCalculatingFare ? 'Calculating...' : `Confirm Ride • ₹${selectedRideType === 'shared' ? (sharedFare || '-') : (privateFare || '-')}`}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 6 }} />
            </Pressable>
        </View>
    );

    const renderFooter = () => {
        // Ripple styles - visible but elegant
        const buttonHeight = 56;
        const getRippleStyle = (animValue: Animated.Value, index: number) => ({
            position: 'absolute' as const,
            top: buttonHeight / 2 - 25, // Center vertically
            left: (width - 40) / 2 - 25, // Center horizontally (width minus padding)
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: 'rgba(255, 255, 255, 0.3)', // More visible
            transform: [
                {
                    scale: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 6 + index], // Gentle expansion
                    })
                }
            ],
            opacity: animValue.interpolate({
                inputRange: [0, 0.4, 1],
                outputRange: [0.45, 0.25, 0], // More visible opacity
            }),
        });

        const handleButtonPress = () => {
            triggerRippleAnimation();
            // Only ripple, no scale animation
            handleConfirmRide();
        };

        return (
            <View style={styles.footer}>
                <View style={{ width: '100%', overflow: 'hidden', borderRadius: 14 }}>
                    <Pressable
                        style={[styles.animatedConfirmButton]}
                        onPress={handleButtonPress}
                    >
                        {/* Water Ripple Effects */}
                        {showRipples && rippleAnims.map((anim, index) => (
                            <Animated.View
                                key={`ripple-${index}`}
                                style={getRippleStyle(anim, index)}
                                pointerEvents="none"
                            />
                        ))}

                        <Text style={styles.confirmButtonText}>
                            {isCalculatingFare ? 'Calculating...' : `Confirm Ride • ₹${selectedRideType === 'shared' ? (sharedFare || '-') : (privateFare || '-')}`}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
                    </Pressable>
                </View>
            </View>
        );
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <BottomSheetModalProvider>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

                {/* Pickup Bar - Fixed at Top */}
                <View style={styles.topPickupBar}>
                    <TouchableOpacity
                        style={styles.pickupRow}
                        onPress={() => {
                            console.log('📍 Pickup bar pressed - opening search');
                            setActiveInput('pickup');
                            setBookingStage('search');
                            setSuggestions([]);
                            setPickupQuery(''); // Clear for new search
                            setTimeout(() => {
                                bottomSheetModalRef.current?.present();
                            }, 100);
                        }}
                    >
                        <View style={styles.greenDotSmall} />
                        <Text style={[styles.pickupAddressText, { marginLeft: 12 }]} numberOfLines={1}>
                            {pickupLocation?.address || 'Select pickup location'}
                        </Text>
                        <Icon name="pencil" size={12} color="#666" style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>

                {/* Map Section - Takes remaining space above bottom card */}
                <View style={[styles.mapContainer, bookingStage === 'vehicle' && styles.mapContainerSmall]}>
                    <Mapbox.MapView
                        style={styles.map}
                        styleURL={Mapbox.StyleURL.Street}
                        logoEnabled={false}
                        attributionEnabled={false}
                    >
                        <Camera
                            ref={cameraRef}
                            zoomLevel={18}
                            centerCoordinate={[79.4833, 29.0333]}
                            animationMode="flyTo"
                            animationDuration={1000}
                        />

                        {/* Route Line */}
                        {routeCoordinates.length > 0 && (
                            <ShapeSource id="routeSource" shape={{
                                type: 'Feature',
                                properties: {},
                                geometry: { type: 'LineString', coordinates: routeCoordinates }
                            }}>
                                <LineLayer
                                    id="routeLine"
                                    style={{
                                        lineColor: '#219653',
                                        lineWidth: 4,
                                        lineCap: 'round',
                                        lineJoin: 'round',
                                    }}
                                />
                            </ShapeSource>
                        )}

                        {/* Pickup Marker */}
                        {pickupLocation && (
                            <PointAnnotation
                                id="pickup"
                                coordinate={[pickupLocation.longitude, pickupLocation.latitude]}
                            >
                                <Animated.View style={[
                                    styles.pickupMarkerOuter,
                                    { transform: [{ scale: pulseAnim }] }
                                ]}>
                                    <View style={styles.pickupMarker}>
                                        <View style={styles.pickupMarkerInner}>
                                            <View style={styles.pickupMarkerDot} />
                                        </View>
                                    </View>
                                </Animated.View>
                            </PointAnnotation>
                        )}

                        {/* Destination Marker */}
                        {dropLocation && (
                            <PointAnnotation
                                id="destination"
                                coordinate={[dropLocation.longitude, dropLocation.latitude]}
                            >
                                <View style={styles.destinationMarker}>
                                    <Ionicons name="location" size={18} color="#fff" />
                                </View>
                            </PointAnnotation>
                        )}

                        {/* Nearby Driver Markers */}
                        {pickupLocation && nearbyDrivers.map((driver) => (
                            <PointAnnotation
                                key={`driver-${driver.id}`}
                                id={`driver-${driver.id}`}
                                coordinate={[
                                    pickupLocation.longitude + driver.lng,
                                    pickupLocation.latitude + driver.lat
                                ]}
                            >
                                <View style={styles.driverMarker}>
                                    <Ionicons name="car-sport" size={14} color="#fff" />
                                </View>
                            </PointAnnotation>
                        ))}
                    </Mapbox.MapView>

                    {/* Locate Me Button - Always visible */}
                    <TouchableOpacity
                        style={styles.locateMeButton}
                        onPress={handleLocateMe}
                    >
                        <Ionicons name="locate" size={22} color="#219653" />
                    </TouchableOpacity>
                </View>

                {/* Fixed Bottom Card for Vehicle Selection (like FindingDriverScreen) */}
                {bookingStage === 'vehicle' && renderVehicleSelection()}

                {/* Bottom Sheet - Only for Search Stage (Fixed, non-draggable) */}
                {bookingStage === 'search' && (
                    <BottomSheetModal
                        ref={bottomSheetModalRef}
                        index={0}
                        snapPoints={['60%']}
                        enablePanDownToClose={false}
                        enableHandlePanningGesture={false}
                        enableContentPanningGesture={false}
                        backgroundStyle={styles.bottomSheetBackground}
                        handleIndicatorStyle={{ display: 'none' }}
                        onChange={handleSheetChange}
                        keyboardBehavior="extend"
                        keyboardBlurBehavior="restore"
                        android_keyboardInputMode="adjustResize"
                    >
                        <BottomSheetScrollView contentContainerStyle={styles.bottomSheetContent}>
                            {renderSearchSection()}
                        </BottomSheetScrollView>
                    </BottomSheetModal>
                )}

            </BottomSheetModalProvider>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    topBar: {
        position: 'absolute',
        top: StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 50,
        left: 20,
        right: 20,
        zIndex: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuButton: {
        padding: 5,
    },
    pickupInputContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 15,
        marginRight: 10,
    },
    greenDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#219653',
    },
    greenDotSmall: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#219653',
    },
    redDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EB5757',
    },
    dotConnector: {
        width: 1,
        height: 20,
        backgroundColor: '#ccc',
        marginTop: 4,
    },
    locationSummary: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        padding: 12,
        marginBottom: 15,
    },
    locationSummaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    locationSummaryText: {
        flex: 1,
        fontSize: 15,
        color: '#333',
        marginLeft: 10,
    },
    topPickupBar: {
        position: 'absolute',
        top: 45,
        left: 15,
        right: 15,
        zIndex: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    pickupRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    pickupAddressText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    locationCard: {
        position: 'absolute',
        top: 50,
        left: 15,
        right: 15,
        zIndex: 10,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    locationDotContainer: {
        width: 24,
        alignItems: 'center',
    },
    locationTextContainer: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
    },
    locationLabel: {
        fontSize: 11,
        color: '#888',
        fontWeight: '500',
    },
    locationAddress: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        marginTop: 2,
    },
    pickupText: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    heartButton: {
        padding: 5,
    },
    mapContainer: {
        flex: 1,
        marginBottom: 0,
    },
    mapContainerSmall: {
        height: height * 0.38, // 38% of screen for map when vehicle card is shown
        flex: 0,
    },
    map: {
        flex: 1,
    },
    locateButton: {
        position: 'absolute',
        bottom: height * 0.45, // Position above the bottom sheet (45% snap point + some margin)
        right: 15,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        zIndex: 100,
    },
    locateButtonInSheet: {
        position: 'absolute',
        top: -60, // Position above the bottom sheet
        right: 15,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        zIndex: 1000,
    },
    locateButtonFloating: {
        position: 'absolute',
        right: 15,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        zIndex: 1000,
    },
    locateButtonInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locateMeBtn: {
        position: 'absolute',
        bottom: 450,
        right: 15,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 10,
    },
    locateMeButtonFloating: {
        position: 'absolute',
        bottom: 380,
        right: 15,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        zIndex: 999,
    },
    bottomSheetBackground: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    handleIndicator: {
        backgroundColor: '#ccc',
        width: 40,
    },
    bottomSheetContent: {
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: 20,
    },
    bottomSheetContentFixed: {
        paddingHorizontal: 20,
        paddingTop: 10,
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 6,
    },
    sectionSubtitle: {
        fontSize: 16,
        color: '#2D7C4F',
        fontWeight: '500',
        marginTop: -4,
        marginBottom: 15,
    },
    searchContainer: {
        marginTop: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        paddingHorizontal: 15,
        height: 50,
        marginBottom: 20,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    savedLocationsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    savedLocationItem: {
        alignItems: 'center',
        width: '30%',
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#eee',
    },
    savedIconContainer: {
        marginBottom: 5,
    },
    savedTitle: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    recentText: {
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
    noRecentText: {
        color: '#999',
        fontStyle: 'italic',
        marginTop: 10,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    suggestionIcon: {
        width: 30,
        alignItems: 'center',
        marginRight: 10,
    },
    suggestionTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
    },
    suggestionAddress: {
        fontSize: 12,
        color: '#777',
    },
    // Header Styles
    vehicleHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    // Ride Type Selection Styles
    rideTypeList: {
        marginBottom: 8,
    },
    rideTypeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 8,
        borderWidth: 1.5,
        borderColor: '#eee',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
    },
    selectedRideTypeCard: {
        borderColor: '#2D7C4F',
        backgroundColor: '#F0FFF4',
        borderWidth: 2,
    },
    rideTypeIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rideTypeInfo: {
        flex: 1,
    },
    rideTypeDescription: {
        fontSize: 13,
        color: '#888',
        marginTop: 2,
    },
    rideTypePriceContainer: {
        alignItems: 'flex-end',
    },
    rideTypePrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingBottom: 30,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    animatedConfirmButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#219653',
        paddingVertical: 16,
        borderRadius: 14,
        elevation: 4,
        shadowColor: '#219653',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
    },
    confirmButtonText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    confirmButton: {
        width: '100%',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        marginBottom: 60, // Push above tab bar
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 30,
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    rideTypeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    rideTypeOptionSelected: {
        backgroundColor: '#F9F9F9',
    },
    rideTypeLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rideTypeTextContainer: {
        marginLeft: 15,
    },
    rideTypeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    rideTypeNameSelected: {
        color: '#219653',
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterSelected: {
        borderColor: '#219653',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#219653',
    },
    bikeNote: {
        fontSize: 12,
        color: '#f39c12',
        marginBottom: 15,
        backgroundColor: '#fff3e0',
        padding: 8,
        borderRadius: 5,
    },
    // Map Markers
    pickupMarkerOuter: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(33, 150, 83, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupMarker: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupMarkerInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#219653',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupMarkerDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#fff',
    },
    destinationMarker: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EB5757',
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: '#fff',
    },
    driverMarker: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3498db',
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: '#fff',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    // Payment & Promo Styles
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 10,
    },
    paymentMethodsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    paymentMethodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        width: '30%',
        backgroundColor: '#fff',
    },
    paymentMethodSelected: {
        backgroundColor: '#219653',
        borderColor: '#219653',
    },
    paymentMethodText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
    },
    paymentMethodTextSelected: {
        color: '#fff',
    },
    promoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    promoInput: {
        flex: 1,
        height: 45,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingHorizontal: 15,
        color: '#333',
        marginRight: 10,
    },
    applyButton: {
        backgroundColor: '#219653',
        height: 45,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    // Locate Me Button Style
    locateMeButton: {
        position: 'absolute',
        bottom: 20,
        right: 15,
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        zIndex: 100,
    },
    // Compact Vehicle Card Styles (Fixed Bottom Card like FindingDriverScreen)
    compactVehicleCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        paddingTop: 20,
        paddingHorizontal: 16,
        paddingBottom: 80,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    compactRideRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    compactIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#D1F2EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    compactRideInfo: {
        flex: 1,
    },
    compactRideName: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
    },
    compactRidePrice: {
        fontSize: 20,
        fontWeight: '800',
        color: '#2D7C4F',
    },
    compactRideToggle: {
        flexDirection: 'row',
        gap: 8,
    },
    compactToggleBtn: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
    },
    compactToggleBtnActive: {
        backgroundColor: '#219653',
    },
    compactToggleText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#666',
    },
    compactToggleTextActive: {
        color: '#fff',
    },
    compactLocationSummary: {
        backgroundColor: '#f8f8f8',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 10,
    },
    compactLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingLeft: 4,
    },
    compactLocationText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        marginLeft: 18, // Increased spacing from dot
        fontWeight: '500',
    },
    redDotSmall: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EB5757',
    },
    compactPaymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        marginTop: 4,
    },
    compactPaymentLabel: {
        fontSize: 15,
        color: '#555',
        fontWeight: '600',
    },
    compactPaymentOptions: {
        flexDirection: 'row',
        gap: 12,
    },
    compactPaymentBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 18,
        backgroundColor: '#f5f5f5',
    },
    compactPaymentBtnActive: {
        backgroundColor: '#219653',
    },
    compactPaymentText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
    },
    compactPaymentTextActive: {
        color: '#fff',
    },
    compactConfirmButton: {
        backgroundColor: '#219653',
        borderRadius: 12,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
    },
    compactConfirmText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '700',
    },
});

export default ConfirmScreen;
