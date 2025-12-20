import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    StatusBar,
    Dimensions,
    Alert,
    Easing,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Mapbox, { Camera, PointAnnotation, ShapeSource, LineLayer } from '@rnmapbox/maps';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Redux
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getRideDetails, cancelRide, clearRide } from '../store/slices/rideSlice';
import { geocodingService } from '../services/api/geocoding';
import RazorpayCheckout from 'react-native-razorpay';
import client from '@services/api/client';
import { getRazorpayKey } from '@services/razorpay';


const { width, height } = Dimensions.get('window');

// Mapbox Access Token
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYWRhcnNobWlzaHJhNTYzIiwiYSI6ImNtZjlocXQydzBrZmYycnNqNGs5OTk3cXUifQ.jwUMhX7pbAGl7fI9rXt7mw';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// Ride type icon mapping
const RIDE_TYPE_ICONS: { [key: string]: string } = {
    'solo': 'person',
    'private': 'person', // API returns 'private' for solo rides
    'shared': 'people',
    'schedule': 'time',
};

const RIDE_TYPE_NAMES: { [key: string]: string } = {
    'solo': 'Solo Ride',
    'private': 'Solo Ride', // API returns 'private' for solo rides
    'shared': 'Shared Ride',
    'schedule': 'Scheduled Ride',
};

interface Driver {
    id: string;
    name: string;
    rating: number;
    coordinates: [number, number];
    originalCoordinates: [number, number];
    vehicleNumber: string;
    vehicleType: string;
}

const FindingDriverScreen = ({ navigation, route }: any) => {
    // Get params from ConfirmScreen
    const routeParams = route?.params || {};
    const pickup = routeParams.pickup || { address: 'Current Location', latitude: 29.0333, longitude: 79.4833 };
    const dropoff = routeParams.dropoff || { address: 'Destination', latitude: 29.0400, longitude: 79.4900 };
    const selectedVehicle = routeParams.vehicle || '1';
    const fare = routeParams.fare || 25;
    const rideType = routeParams.rideType || 'solo';
    const rideId = routeParams.rideId; // From booking API
    const startOtp = routeParams.startOtp; // OTP to show driver

    // Redux
    const dispatch = useAppDispatch();
    const { driver: apiDriver, driverLocation: apiDriverLocation, rideStatus, isDriverNear, hasDriverArrived } = useAppSelector(state => state.ride);

    // State
    const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
    const [nearbyDrivers, setNearbyDrivers] = useState<Driver[]>([]);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [driverArrived, setDriverArrived] = useState(false);
    const [movingDriverCoords, setMovingDriverCoords] = useState<[number, number] | null>(null);
    const [searchingText, setSearchingText] = useState('Finding your driver...');
    const [orderid, setOrderId] = useState('');
    const [paymentid, setPaymentId] = useState('');

    // Ride phase state: searching → driver_found → arriving → in_progress → arrived
    const [ridePhase, setRidePhase] = useState<'searching' | 'driver_found' | 'arriving' | 'in_progress' | 'arrived'>('searching');
    const [rideTimer, setRideTimer] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(14); // Timer in seconds

    // Refs
    const cameraRef = useRef<any>(null);
    const animationRef = useRef<any>(null);
    const noDriverTimeoutRef = useRef<any>(null);

    // Animations
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const driverPulseAnim = useRef(new Animated.Value(1)).current;
    const searchDotsAnim = useRef(new Animated.Value(0)).current;

    // Format timer
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Generate mock drivers near pickup
    const generateMockDrivers = (lat: number, lng: number): Driver[] => {
        const drivers: Driver[] = [];
        const driverNames = ['Ramesh K.', 'Suresh P.', 'Anil S.', 'Vikram M.'];
        const vehicleTypes = ['Bike', 'E-Rickshaw', 'Toto'];

        for (let i = 0; i < 4; i++) {
            const offsetLat = (Math.random() - 0.5) * 0.015;
            const offsetLng = (Math.random() - 0.5) * 0.015;
            const coords: [number, number] = [lng + offsetLng, lat + offsetLat];

            drivers.push({
                id: `driver-${i}`,
                name: driverNames[i],
                rating: 4.5 + Math.random() * 0.5,
                coordinates: coords,
                originalCoordinates: coords,
                vehicleNumber: `UK 07 ${1000 + Math.floor(Math.random() * 9000)}`,
                vehicleType: vehicleTypes[i % 3],
            });
        }
        return drivers;
    };


    const onPay = async () => {
        try {
            let currentPaymentId = '';
            let currentOrderId = '';

            // STEP 1: Create Order (Same backend)
            if (!currentPaymentId) {
                const or = await client.post('/payments/create-order', {
                    bookingId: rideId,
                    amount: fare
                });

                if (!or.data?.success) {
                    Alert.alert('Payment Error', or.data?.message || 'Order creation failed');
                    return;
                }

                currentOrderId = or.data.orderId;
                currentPaymentId = or.data.paymentId;

                setOrderId(currentOrderId);
                setPaymentId(currentPaymentId);
            }

            if (!currentOrderId) {
                Alert.alert('Payment Error', 'Order ID missing');
                return;
            }

            // STEP 2: Get Razorpay Key
            const razorpayKey = await getRazorpayKey();
            if (!razorpayKey) {
                Alert.alert('Payment Error', 'Payment gateway unavailable');
                return;
            }

            // STEP 3: Open Razorpay Checkout
            const options = {
                key: razorpayKey,
                amount: Math.round(Number(fare) * 100),
                currency: 'INR',
                name: 'LocalToto',
                description: 'Ride Payment',
                order_id: currentOrderId,
                prefill: {
                    contact: 'sdfkshf',
                    email: 'dsfdgdfgc',
                },
                theme: { color: '#219653' },
            };

            const response = await RazorpayCheckout.open(options);

            // STEP 4: Verify Payment (Backend)
            const vr = await client.post('/payments/verify-razorpay', {
                bookingId: rideId,
                paymentId: currentPaymentId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
            });

            if (vr.data?.success) {
                Alert.alert('Success', 'Payment completed successfully');
                // navigate / update status
            } else {
                Alert.alert('Payment Failed', vr.data?.message || 'Verification failed');
            }

        } catch (err: any) {
            console.log('Razorpay Error:', err);
            Alert.alert(
                'Payment Cancelled',
                err?.description || 'Payment was not completed'
            );
        }
    };








    // Calculate route using backend API
    const calculateRoute = async () => {
        try {
            const routeData = await geocodingService.getRoute(
                { lat: pickup.latitude, lng: pickup.longitude },
                { lat: dropoff.latitude, lng: dropoff.longitude }
            );

            if (routeData.success && routeData.coordinates && routeData.coordinates.length > 0) {
                setRouteCoordinates(routeData.coordinates);
            } else {
                // Fallback to straight line if route fails
                setRouteCoordinates([
                    [pickup.longitude, pickup.latitude],
                    [dropoff.longitude, dropoff.latitude],
                ]);
            }
        } catch (error) {
            console.error('Route calculation error:', error);
            setRouteCoordinates([
                [pickup.longitude, pickup.latitude],
                [dropoff.longitude, dropoff.latitude],
            ]);
        }
    };

    // Adjust camera to fit points
    const adjustCameraToFitPoints = () => {
        const pointsToShow = [
            [pickup.longitude, pickup.latitude],
            [dropoff.longitude, dropoff.latitude],
        ];

        nearbyDrivers.forEach(driver => {
            pointsToShow.push(driver.coordinates);
        });

        const lngs = pointsToShow.map(p => p[0]);
        const lats = pointsToShow.map(p => p[1]);

        const minLng = Math.min(...lngs) - 0.01;
        const maxLng = Math.max(...lngs) + 0.01;
        const minLat = Math.min(...lats) - 0.01;
        const maxLat = Math.max(...lats) + 0.01;

        if (cameraRef.current) {
            cameraRef.current.fitBounds(
                [minLng, minLat],
                [maxLng, maxLat],
                {
                    padding: { top: 100, bottom: 300, left: 50, right: 50 },
                    animationDuration: 1200,
                }
            );
        }
    };

    // Start driver animation toward pickup
    const startDriverAnimation = (driver: Driver) => {
        if (animationRef.current) {
            clearInterval(animationRef.current);
        }

        Animated.loop(
            Animated.sequence([
                Animated.timing(driverPulseAnim, {
                    toValue: 1.3,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(driverPulseAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();

        setMovingDriverCoords(driver.originalCoordinates);
        setRidePhase('driver_found');

        const animationDuration = 8000;
        const steps = 80;
        const interval = animationDuration / steps;
        let progress = 0;

        animationRef.current = setInterval(() => {
            progress += 1;

            if (progress <= 100) {
                const startLng = driver.originalCoordinates[0];
                const startLat = driver.originalCoordinates[1];
                const endLng = pickup.longitude;
                const endLat = pickup.latitude;

                const easeProgress = 1 - Math.pow(1 - (progress / 100), 2);

                const newLng = startLng + (endLng - startLng) * easeProgress;
                const newLat = startLat + (endLat - startLat) * easeProgress;

                setMovingDriverCoords([newLng, newLat]);

                // Update phase as driver approaches
                if (progress > 30 && ridePhase === 'driver_found') {
                    setRidePhase('arriving');
                    setSearchingText('Driver is arriving...');
                }
            }

            if (progress >= 100) {
                clearInterval(animationRef.current);
                animationRef.current = null;
                setDriverArrived(true);
                driverPulseAnim.stopAnimation();
                setRidePhase('in_progress');
                setSearchingText('Enjoy your ride!');
            }
        }, interval);
    };

    // Initialize
    useEffect(() => {
        // Clear any previous ride state when entering this screen
        dispatch(clearRide());

        const drivers = generateMockDrivers(pickup.latitude, pickup.longitude);
        setNearbyDrivers(drivers);
        calculateRoute();

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

        Animated.loop(
            Animated.timing(searchDotsAnim, {
                toValue: 3,
                duration: 1500,
                useNativeDriver: false,
            })
        ).start();

        // NOTE: Removed fake auto-selection of mock drivers
        // Driver is now only assigned when backend returns real driver data via API polling
        // Mock drivers shown on map are for visual effect only

        // Timeout: Show alert if no driver found within 3 minutes
        noDriverTimeoutRef.current = setTimeout(() => {
            if (!selectedDriver && !apiDriver) {
                Alert.alert(
                    'No Drivers Available',
                    "We couldn't find a driver at the moment. Please try again.",
                    [
                        { text: 'Go Back', onPress: () => navigation.goBack() },
                        { text: 'Keep Waiting', style: 'cancel' }
                    ]
                );
            }
        }, 180000);

        return () => {
            if (noDriverTimeoutRef.current) clearTimeout(noDriverTimeoutRef.current);
            if (animationRef.current) {
                clearInterval(animationRef.current);
            }
        };
    }, []);

    // Adjust camera when route and drivers are ready
    useEffect(() => {
        if (routeCoordinates.length > 0 && nearbyDrivers.length > 0) {
            setTimeout(adjustCameraToFitPoints, 500);
        }
    }, [routeCoordinates, nearbyDrivers]);

    // Poll ride status from API
    useEffect(() => {
        if (!rideId) return;

        const pollInterval = setInterval(() => {
            dispatch(getRideDetails(rideId));
        }, 5000);

        dispatch(getRideDetails(rideId));

        return () => clearInterval(pollInterval);
    }, [rideId, dispatch]);

    // React to API driver assignment and ride status
    useEffect(() => {
        if (apiDriver && (rideStatus === 'confirmed' || rideStatus === 'accepted')) {
            console.log('✅ DRIVER ASSIGNED! Status:', rideStatus, 'Driver:', apiDriver?.name);

            // Cancel the "no driver" timeout since we found a driver
            if (noDriverTimeoutRef.current) {
                clearTimeout(noDriverTimeoutRef.current);
                noDriverTimeoutRef.current = null;
            }

            setSearchingText(`${apiDriver.name} is on the way!`);
            setRidePhase('driver_found');

            if (apiDriverLocation) {
                console.log('📍 Setting driver marker at:', apiDriverLocation);
                setMovingDriverCoords([apiDriverLocation.lng, apiDriverLocation.lat]);
            } else {
                console.log('⚠️ No driver location available');
            }
        }

        // Handle cancellation from backend (driver rejection is handled server-side, keeps searching)
        if (rideStatus === 'cancelled') {
            Alert.alert('Ride Cancelled', 'Your ride has been cancelled.', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
            return;
        }

        if (rideStatus === 'driver_arriving') {
            setRidePhase('arriving');
            setSearchingText('Driver is arriving at pickup...');
        } else if (rideStatus === 'in_progress') {
            setRidePhase('in_progress');
            setSearchingText('Enjoy your ride!');
        } else if (hasDriverArrived || rideStatus === 'arrived' || rideStatus === 'completed') {
            setRidePhase('arrived');
            setSearchingText('You have arrived!');
        }
    }, [apiDriver, rideStatus, hasDriverArrived, apiDriverLocation]);

    // Timer for ride phases
    useEffect(() => {
        if (ridePhase === 'arriving' || ridePhase === 'in_progress') {
            const interval = setInterval(() => {
                setRideTimer(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [ridePhase]);
    // Update route to show driver location → destination when ride is in progress
    useEffect(() => {
        const updateRouteFromDriver = async () => {
            // Only update when ride is in progress and we have driver's location
            if ((ridePhase === 'in_progress' || hasDriverArrived) && apiDriverLocation) {
                console.log('🗺️ Updating route from driver location to destination');
                try {
                    const routeData = await geocodingService.getRoute(
                        { lat: apiDriverLocation.lat, lng: apiDriverLocation.lng },
                        { lat: dropoff.latitude, lng: dropoff.longitude }
                    );

                    if (routeData.success && routeData.coordinates && routeData.coordinates.length > 0) {
                        setRouteCoordinates(routeData.coordinates);
                        console.log('✅ Route updated from driver to destination');

                        // Also update driver marker position
                        setMovingDriverCoords([apiDriverLocation.lng, apiDriverLocation.lat]);

                        // Adjust camera to show driver and destination
                        if (cameraRef.current) {
                            const points = [
                                [apiDriverLocation.lng, apiDriverLocation.lat],
                                [dropoff.longitude, dropoff.latitude],
                            ];
                            const lngs = points.map(p => p[0]);
                            const lats = points.map(p => p[1]);

                            cameraRef.current.fitBounds(
                                [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
                                [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
                                {
                                    padding: { top: 100, bottom: 300, left: 50, right: 50 },
                                    animationDuration: 1000,
                                }
                            );
                        }
                    }
                } catch (error) {
                    console.error('Route update error:', error);
                }
            }
        };

        updateRouteFromDriver();
    }, [ridePhase, hasDriverArrived, apiDriverLocation]);


    // Navigate to Rating when ride is complete
    useEffect(() => {
        if (ridePhase === 'arrived') {
            const timeout = setTimeout(() => {
                navigation.navigate('RatingTabs', {
                    driver: apiDriver || selectedDriver,
                    pickup: pickup,
                    dropoff: dropoff,
                    fare: fare,
                    rideId: rideId,
                });
            }, 2000);
            return () => clearTimeout(timeout);
        }
    }, [ridePhase]);

    // Route GeoJSON
    const routeGeoJSON = useMemo(() => ({
        type: 'Feature' as const,
        properties: {},
        geometry: {
            type: 'LineString' as const,
            coordinates: routeCoordinates,
        },
    }), [routeCoordinates]);

    const handleCancel = () => {
        Alert.alert(
            'Cancel Ride',
            'Are you sure you want to cancel this ride?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: () => navigation.goBack()
                },
            ]
        );
    };


    // Zoom controls
    const handleZoomIn = () => {
        const newZoom = Math.min(zoomLevel + 1, 18);
        setZoomLevel(newZoom);
        cameraRef.current?.setCamera({
            zoomLevel: newZoom,
            animationDuration: 300,
        });
    };

    const handleZoomOut = () => {
        const newZoom = Math.max(zoomLevel - 1, 3);
        setZoomLevel(newZoom);
        cameraRef.current?.setCamera({
            zoomLevel: newZoom,
            animationDuration: 300,
        });
    };

    // Get current driver info
    const currentDriver = apiDriver || selectedDriver;

    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Mapbox Map */}
            <View style={styles.mapContainer}>
                <Mapbox.MapView
                    style={styles.map}
                    styleURL={Mapbox.StyleURL.Street}
                    logoEnabled={false}
                    attributionEnabled={false}
                >
                    <Camera
                        ref={cameraRef}
                        zoomLevel={14}
                        centerCoordinate={[pickup.longitude, pickup.latitude]}
                        animationMode="flyTo"
                        animationDuration={1000}
                    />

                    {/* Route Line */}
                    {routeCoordinates.length > 0 && (
                        <ShapeSource id="routeSource" shape={routeGeoJSON}>
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
                    <PointAnnotation
                        id="pickup"
                        coordinate={[pickup.longitude, pickup.latitude]}
                    >
                        <Animated.View style={[
                            styles.pickupMarkerOuter,
                            { transform: [{ scale: pulseAnim }] }
                        ]}>
                            <View style={styles.pickupMarker}>
                                <View style={styles.pickupMarkerDot} />
                            </View>
                        </Animated.View>
                    </PointAnnotation>

                    {/* Destination Marker */}
                    <PointAnnotation
                        id="destination"
                        coordinate={[dropoff.longitude, dropoff.latitude]}
                    >
                        <View style={styles.destinationMarker}>
                            <Ionicons name="location" size={18} color="#fff" />
                        </View>
                    </PointAnnotation>

                    {/* Driver Markers */}
                    {!selectedDriver && nearbyDrivers.map(driver => (
                        <PointAnnotation
                            key={driver.id}
                            id={driver.id}
                            coordinate={driver.coordinates}
                        >
                            <View style={styles.driverMarker}>
                                <Icon name="car" size={12} color="#fff" />
                            </View>
                        </PointAnnotation>
                    ))}

                    {/* Moving Driver (selected/assigned) - Show for both mock selectedDriver and real apiDriver */}
                    {(selectedDriver || apiDriver) && movingDriverCoords && (
                        <PointAnnotation
                            id="moving-driver"
                            coordinate={movingDriverCoords}
                        >
                            <Animated.View style={[
                                styles.selectedDriverMarker,
                                { transform: [{ scale: driverPulseAnim }] }
                            ]}>
                                <Icon name="car" size={14} color="#fff" />
                            </Animated.View>
                        </PointAnnotation>
                    )}
                </Mapbox.MapView>

                {/* Back Button */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={handleCancel}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Icon name="arrow-left" size={20} color="#333" />
                </TouchableOpacity>

                {/* Zoom Controls */}
                <View style={styles.zoomControls}>
                    <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
                        <Ionicons name="add" size={24} color="#333" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
                        <Ionicons name="remove" size={24} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Finding Driver Overlay */}
                <View style={styles.searchingOverlay}>
                    <View style={styles.searchingBadge}>
                        {ridePhase === 'searching' && (
                            <View style={styles.loadingDots}>
                                <View style={[styles.dot, styles.dotActive]} />
                                <View style={[styles.dot, styles.dotActive]} />
                                <View style={[styles.dot, styles.dotActive]} />
                            </View>
                        )}
                        {ridePhase !== 'searching' && (
                            <MaterialCommunityIcons
                                name={ridePhase === 'arrived' ? 'check-circle' : 'car-side'}
                                size={18}
                                color="#219653"
                                style={{ marginRight: 8 }}
                            />
                        )}
                        <Text style={styles.searchingText}>{searchingText}</Text>
                    </View>

                    {/* Timer for ride phases */}
                    {(ridePhase === 'arriving' || ridePhase === 'in_progress') && (
                        <View style={styles.timerBadge}>
                            <Ionicons name="time-outline" size={14} color="#666" />
                            <Text style={styles.timerText}>{formatTime(rideTimer)}</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Bottom Card */}
            <View style={styles.bottomCard}>
                {/* OTP Display - Show only AFTER driver is assigned */}
                {apiDriver && startOtp && (
                    <View style={styles.otpContainer}>
                        <View>
                            <Text style={styles.otpLabel}>OTP for Driver</Text>
                            <Text style={styles.otpHint}>Share this code</Text>
                        </View>
                        <Text style={styles.otpCode}>{startOtp}</Text>
                    </View>
                )}

                <View style={styles.rideInfo}>
                    <View style={styles.vehicleRow}>
                        <View style={styles.vehicleIconCircle}>
                            <Ionicons
                                name={RIDE_TYPE_ICONS[rideType] || 'person'}
                                size={24}
                                color="#2D7C4F"
                            />
                        </View>
                        <View style={styles.vehicleDetails}>
                            <Text style={styles.vehicleName}>
                                {RIDE_TYPE_NAMES[rideType] || 'Solo Ride'}
                            </Text>
                            <Text style={styles.vehiclePrice}>₹{fare}</Text>
                        </View>
                        <View style={styles.rideTypeBadge}>
                            <Text style={styles.rideTypeText}>
                                {(rideType === 'solo' || rideType === 'private') ? 'Solo' : rideType === 'shared' ? 'Shared' : 'Schedule'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.tripDetails}>
                        <View style={styles.locationRow}>
                            <View style={styles.greenDot} />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {pickup.address}
                            </Text>
                        </View>
                        <View style={styles.locationRow}>
                            <View style={styles.redDot} />
                            <Text style={styles.locationText} numberOfLines={1}>
                                {dropoff.address}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Driver Info Card - Enhanced */}
                {currentDriver ? (
                    <View style={styles.driverCard}>
                        <View style={styles.driverRow}>
                            <View style={styles.driverAvatar}>
                                <Text style={styles.driverAvatarText}>
                                    {currentDriver.name?.charAt(0) || 'D'}
                                </Text>
                            </View>
                            <View style={styles.driverDetails}>
                                <Text style={styles.driverName}>{currentDriver.name}</Text>
                                <Text style={styles.driverVehicle}>
                                    {currentDriver.vehicleNumber} • ⭐ {currentDriver.rating?.toFixed(1) || '4.5'}
                                </Text>
                            </View>
                            <View style={styles.driverActions}>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Ionicons name="call" size={18} color="#219653" />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.actionBtn}>
                                    <Ionicons name="chatbubble" size={18} color="#219653" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                ) : (
                    <View style={styles.waitTimeContainer}>
                        <Text style={styles.waitTime}>Estimated wait: 2-3 minutes</Text>
                        <Text style={styles.waitTimeHint}>We're finding the best driver for you ✨</Text>
                    </View>
                )}

                {/* Action Button based on phase */}
                {ridePhase === 'arrived' ? (
                    <TouchableOpacity
                        style={[styles.cancelButton, { backgroundColor: '#219653', borderColor: '#219653' }]}
                        onPress={() => navigation.navigate('RatingTabs', { rideId })}
                    >
                        <Text style={[styles.cancelButtonText, { color: '#fff' }]}>Rate Your Ride</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelButtonText}>Cancel Request</Text>
                    </TouchableOpacity>

                )}
               Payment Row */
            /* <View style={styles.compactPaymentRow}>
                <Text style={styles.compactPaymentLabel}>Pay by</Text>
                <View style={styles.compactPaymentOptions}>
                   <TouchableOpacity
  style={[styles.compactPaymentBtn, styles.compactPaymentBtnActive]}
  onPress={() =>
    Alert.alert(
      'Payment Method',
      'You selected Cash payment',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'OK', onPress: () => console.log('Cash selected') },
      ],
      { cancelable: true }
    )
  }
>
  <Text style={[styles.compactPaymentText, styles.compactPaymentTextActive]}>
    Cash
  </Text>
</TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.compactPaymentBtn, styles.compactPaymentBtnActive]}
                       onPress={onPay}
                    >
                        <Text style={[styles.compactPaymentText, styles.compactPaymentTextActive]}>UPI</Text>
                    </TouchableOpacity>
                </View>
            </View>

            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    mapContainer: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    searchingOverlay: {
        position: 'absolute',
        top: 100,
        left: 20,
        right: 20,
        alignItems: 'center',
    },
    searchingBadge: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    timerBadge: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        elevation: 3,
    },
    timerText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginLeft: 6,
    },
    loadingDots: {
        flexDirection: 'row',
        marginRight: 10,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#CCC',
        marginHorizontal: 2,
    },
    dotActive: {
        backgroundColor: '#2D7C4F',
    },
    searchingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
    },
    pickupMarkerOuter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupMarker: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(33, 150, 83, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickupMarkerDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#219653',
    },
    destinationMarker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#EB5757',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    driverMarker: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#666',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
    },
    selectedDriverMarker: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2D7C4F',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        borderWidth: 3,
        borderColor: '#fff',
    },
    bottomCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingVertical: 20,
        paddingHorizontal: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    otpContainer: {
        backgroundColor: '#F0FFF4',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        borderWidth: 1.5,
        borderColor: '#219653',
        borderStyle: 'dashed',
    },
    otpLabel: {
        fontSize: 10,
        color: '#666',
        fontWeight: '500',
    },
    otpCode: {
        fontSize: 18,
        fontWeight: '800',
        color: '#219653',
        letterSpacing: 3,
    },
    otpHint: {
        fontSize: 8,
        color: '#888',
    },
    rideInfo: {
        marginBottom: 15,
    },
    vehicleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    vehicleIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#D1F2EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    vehicleDetails: {
        flex: 1,
    },
    vehicleName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    vehiclePrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#2D7C4F',
    },
    rideTypeBadge: {
        backgroundColor: '#219653',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    rideTypeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 12,
    },
    tripDetails: {
        gap: 10,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greenDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#219653',
        marginRight: 12,
    },
    redDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EB5757',
        marginRight: 12,
    },
    locationText: {
        fontSize: 13,
        color: '#444',
        flex: 1,
        fontWeight: '500',
    },
    driverCard: {
        backgroundColor: '#F8F9FA',
        padding: 14,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    driverRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F2C94C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    driverAvatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#219653',
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    driverVehicle: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    driverActions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#219653',
    },
    waitTimeContainer: {
        alignItems: 'center',
        marginBottom: 15,
        paddingVertical: 10,
    },
    waitTime: {
        fontSize: 15,
        color: '#2D7C4F',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 2,
    },
    waitTimeHint: {
        fontSize: 11,
        color: '#888',
        textAlign: 'center',
    },
    cancelButton: {
        borderWidth: 2,
        borderColor: '#EB5757',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EB5757',
    },
    zoomControls: {
        position: 'absolute',
        right: 20,
        top: 120,
        backgroundColor: 'transparent',
    },
    zoomButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    button: {
        backgroundColor: '#0A8F08',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4, // Android shadow
    },
    text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
      compactPaymentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        marginTop: 12,
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

export default FindingDriverScreen;