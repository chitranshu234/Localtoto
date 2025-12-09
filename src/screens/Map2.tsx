import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  PermissionsAndroid,
  Platform,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Animated,
  Modal,
  Keyboard
} from 'react-native';
import Mapbox, {
  Camera,
  PointAnnotation,
  ShapeSource,
  CircleLayer,
  LineLayer
} from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';

// Configure Mapbox
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYWRhcnNobWlzaHJhNTYzIiwiYSI6ImNtZjlocXQydzBrZmYycnNqNGs5OTk3cXUifQ.jwUMhX7pbAGl7fI9rXt7mw';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.42;

// Memoized components
const DriverItem = React.memo(({ driver, isSelected, onSelectDriver }: any) => (
  <TouchableOpacity
    style={[styles.driverItem, isSelected && styles.selectedDriverItem]}
    onPress={() => onSelectDriver(driver)}
  >
    <View style={styles.driverIconContainer}>
      <FontAwesome
        name="car"
        size={28}
        color={driver.vehicleType === 'suv' ? '#2196F3' :
          driver.vehicleType === 'sedan' ? '#4CAF50' : '#FF9800'}
      />
    </View>

    <View style={styles.driverInfo}>
      <View style={styles.driverHeader}>
        <Text style={styles.driverName}>{driver.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{driver.rating}</Text>
        </View>
      </View>

      <View style={styles.vehicleDetails}>
        <Text style={styles.vehicleText}>{driver.vehicle}</Text>
        <View style={styles.vehicleTags}>
          <Text style={styles.vehicleTag}>{driver.vehicleColor}</Text>
          <Text style={styles.vehicleTag}>{driver.availableSeats} seats</Text>
        </View>
      </View>

      <View style={styles.driverFooter}>
        <View style={styles.etaContainer}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.etaText}>{driver.eta}</Text>
        </View>
        <Text style={styles.distanceText}>{driver.distance}</Text>
      </View>
    </View>

    <View style={styles.driverPrice}>
      <Text style={styles.priceText}>₹{driver.pricePerKm}/km</Text>
      <Text style={styles.priceRange}>{driver.priceRange}</Text>
    </View>
  </TouchableOpacity>
));

const RecentTripItem = React.memo(({ trip }: any) => (
  <View style={styles.recentTripItem}>
    <View style={styles.recentTripIcon}>
      <Ionicons name="car" size={20} color="#4CAF50" />
    </View>
    <View style={styles.recentTripInfo}>
      <View style={styles.recentTripHeader}>
        <Text style={styles.recentTripDate}>{trip.date}</Text>
        <Text style={styles.recentTripPrice}>{trip.price}</Text>
      </View>
      <Text style={styles.recentTripRoute}>
        {trip.from} → {trip.to}
      </Text>
      <View style={styles.recentTripFooter}>
        <Text style={styles.recentTripDriver}>{trip.driver} • {trip.vehicle}</Text>
        <View style={styles.recentTripRating}>
          <Ionicons name="star" size={12} color="#FFD700" />
          <Text style={styles.recentTripRatingText}>{trip.rating}</Text>
        </View>
      </View>
    </View>
  </View>
));

const MapboxLocationScreen2 = () => {
  // State Management
  const [currentLocation, setCurrentLocation] = useState({
    latitude: 25.3176,
    longitude: 82.9739,
    address: 'Varanasi, Uttar Pradesh'
  });
  const [pickupLocation, setPickupLocation] = useState({
    latitude: 25.3176,
    longitude: 82.9739,
    address: 'Current Location'
  });
  const [destination, setDestination] = useState<any>(null);
  const [nearbyDrivers, setNearbyDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [rideInfo, setRideInfo] = useState<any>(null);
  const [rideFare, setRideFare] = useState<any>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [showPickupCard, setShowPickupCard] = useState(true);
  const [searchMode, setSearchMode] = useState('destination'); // 'pickup' or 'destination'
  const [movingDriverPosition, setMovingDriverPosition] = useState<any>(null);
  const [isDriverMoving, setIsDriverMoving] = useState(false);
  const [cameraAdjusted, setCameraAdjusted] = useState(false);
  const [showDriversOnMap, setShowDriversOnMap] = useState(true);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [modalSearchResults, setModalSearchResults] = useState<any[]>([]);
  const [modalIsSearching, setModalIsSearching] = useState(false);

  // Recent Trips Data
  const [recentTrips, setRecentTrips] = useState([
    {
      id: '1',
      date: 'Today, 10:30 AM',
      from: '123 Main St, Varanasi',
      to: 'Varanasi Junction',
      driver: 'Rajesh Kumar',
      vehicle: 'Maruti Suzuki Swift',
      price: '₹125',
      rating: 4.8,
      status: 'completed'
    },
    {
      id: '2',
      date: 'Yesterday, 3:15 PM',
      from: '456 Market St, Varanasi',
      to: 'BHU Campus',
      driver: 'Amit Singh',
      vehicle: 'Hyundai i10',
      price: '₹95',
      rating: 4.6,
      status: 'completed'
    },
    {
      id: '3',
      date: 'Nov 20, 9:45 AM',
      from: '789 Broadway, Varanasi',
      to: 'Dashashwamedh Ghat',
      driver: 'Vikram Patel',
      vehicle: 'Honda City',
      price: '₹150',
      rating: 4.9,
      status: 'completed'
    }
  ]);

  // Previous Destinations
  const [previousDestinations, setPreviousDestinations] = useState([
    {
      id: '1',
      name: 'Varanasi Junction',
      address: 'Varanasi Cantt, Varanasi, Uttar Pradesh',
      coordinates: [82.9745, 25.3238],
      type: 'train_station'
    },
    {
      id: '2',
      name: 'Banaras Hindu University',
      address: 'BHU, Varanasi, Uttar Pradesh',
      coordinates: [82.9988, 25.2677],
      type: 'university'
    },
    {
      id: '3',
      name: 'Dashashwamedh Ghat',
      address: 'Dashashwamedh Ghat, Varanasi',
      coordinates: [83.0103, 25.3087],
      type: 'tourist_attraction'
    }
  ]);

  // Refs
  const cameraRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const bottomSheetModalRef = useRef<any>(null);
  const searchInputRef = useRef<any>(null);
  const animationIntervalRef = useRef<any>(null);
  const modalSearchTimeoutRef = useRef<any>(null);
  const searchTextRef = useRef<any>('');
  const modalTextRef = useRef<any>('');
  const snapPoints = useMemo(() => ['58%', '70%', '90%'], []);

  // Initialize
  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (hasLocationPermission) {
      getCurrentLocation();
    }
  }, [hasLocationPermission]);

  // Present bottom sheet
  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        bottomSheetModalRef.current?.present();
      }, 1000);
    }
  }, [loading]);

  // Focus search input when modal opens
  useEffect(() => {
    if (showSearchModal && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 300);
    }
  }, [showSearchModal]);

  // Adjust map camera when destination is selected
  useEffect(() => {
    if (destination && !cameraAdjusted) {
      setTimeout(() => {
        adjustMapCameraToShowBothPoints();
      }, 500);
    }
  }, [destination]);

  // Start driver animation when booking is confirmed
  useEffect(() => {
    if (bookingConfirmed && selectedDriver && !isDriverMoving) {
      startDriverAnimation();
    }

    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
      if (modalSearchTimeoutRef.current) {
        clearTimeout(modalSearchTimeoutRef.current);
      }
    };
  }, [bookingConfirmed]);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show nearby points.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasLocationPermission(true);
        } else {
          Alert.alert('Permission denied', 'Location permission is required');
          setLoading(false);
        }
      } catch (err) {
        console.warn(err);
        setLoading(false);
      }
    } else {
      Geolocation.requestAuthorization('whenInUse').then(permission => {
        if (permission === 'granted') {
          setHasLocationPermission(true);
        } else {
          Alert.alert('Permission denied', 'Location permission is required');
          setLoading(false);
        }
      });
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);

    Geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const address = await reverseGeocode(latitude, longitude);

        setCurrentLocation({
          latitude,
          longitude,
          address: address || 'Your current location'
        });

        setPickupLocation({
          latitude,
          longitude,
          address: address || 'Current Location'
        });

        // Generate mock drivers immediately on initial load
        generateMockDrivers(latitude, longitude);

        setLoading(false);
      },
      (error) => {
        console.log('Error getting location:', error);
        setLoading(false);
        Alert.alert('Error', 'Unable to get your current location');

        // Still generate mock drivers even if location fails (for demo)
        generateMockDrivers(25.3176, 82.9739);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000
      }
    );
  };

  const reverseGeocode = async (lat: any, lng: any) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      }
      return null;
    } catch (error) {
      console.error('Reverse geocode error:', error);
      return null;
    }
  };

  const generateMockDrivers = (lat: any, lng: any) => {
    const mockDrivers = [
      {
        id: '1',
        name: 'Rajesh Kumar',
        rating: 4.8,
        pricePerKm: 12,
        priceRange: 'Economy',
        vehicle: 'Maruti Suzuki Swift',
        vehicleType: 'hatchback',
        vehicleColor: 'White',
        licensePlate: 'UP65 AB 1234',
        coordinates: [lng + 0.003, lat + 0.002],
        eta: '3 min',
        distance: '0.8 km',
        availableSeats: 4,
        driverImage: 'https://randomuser.me/api/portraits/men/32.jpg'
      },
      {
        id: '2',
        name: 'Amit Singh',
        rating: 4.6,
        pricePerKm: 10,
        priceRange: 'Economy',
        vehicle: 'Hyundai i10',
        vehicleType: 'hatchback',
        vehicleColor: 'Silver',
        licensePlate: 'UP65 CD 5678',
        coordinates: [lng - 0.002, lat + 0.001],
        eta: '5 min',
        distance: '1.2 km',
        availableSeats: 4,
        driverImage: 'https://randomuser.me/api/portraits/men/67.jpg'
      },
      {
        id: '3',
        name: 'Vikram Patel',
        rating: 4.9,
        pricePerKm: 18,
        priceRange: 'Comfort',
        vehicle: 'Honda City',
        vehicleType: 'sedan',
        vehicleColor: 'Black',
        licensePlate: 'UP65 EF 9012',
        coordinates: [lng + 0.001, lat - 0.002],
        eta: '7 min',
        distance: '1.8 km',
        availableSeats: 4,
        driverImage: 'https://randomuser.me/api/portraits/men/55.jpg'
      },
      {
        id: '4',
        name: 'Suresh Yadav',
        rating: 4.7,
        pricePerKm: 25,
        priceRange: 'Premium',
        vehicle: 'Toyota Innova',
        vehicleType: 'suv',
        vehicleColor: 'Grey',
        licensePlate: 'UP65 GH 3456',
        coordinates: [lng - 0.001, lat - 0.001],
        eta: '2 min',
        distance: '0.5 km',
        availableSeats: 7,
        driverImage: 'https://randomuser.me/api/portraits/men/23.jpg'
      }
    ];

    setNearbyDrivers(mockDrivers);
  };

  const handleModalSearch = useCallback(async (query: any) => {
    if (!query.trim()) {
      setModalSearchResults([]);
      return;
    }

    setModalIsSearching(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `proximity=${currentLocation.longitude},${currentLocation.latitude}&` +
        `access_token=${MAPBOX_ACCESS_TOKEN}&limit=8`
      );
      const data = await response.json();

      if (data.features) {
        const results = data.features.map((feature: any) => ({
          id: feature.id,
          name: feature.text,
          address: feature.place_name,
          coordinates: feature.center
        }));
        setModalSearchResults(results);
      } else {
        setModalSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Mock results for demo
      const mockResults = [
        {
          id: '1',
          name: 'Varanasi Airport',
          address: 'Lal Bahadur Shastri Airport, Varanasi',
          coordinates: [82.8597, 25.4526]
        },
        {
          id: '2',
          name: 'Sarnath',
          address: 'Sarnath, Varanasi, Uttar Pradesh',
          coordinates: [83.0213, 25.3769]
        },
        {
          id: '3',
          name: 'Assi Ghat',
          address: 'Assi Ghat, Varanasi',
          coordinates: [83.0066, 25.2856]
        }
      ];
      setModalSearchResults(mockResults);
    } finally {
      setModalIsSearching(false);
    }
  }, [currentLocation]);

  const handleSelectLocation = useCallback(async (location: any) => {
    if (searchMode === 'pickup') {
      // Update pickup location
      const newPickup = {
        latitude: location.coordinates[1],
        longitude: location.coordinates[0],
        address: location.address
      };

      setPickupLocation(newPickup);

      // If destination exists, recalculate route
      if (destination) {
        await calculateRoute(destination.coordinates);
      }

      // Show success feedback
      Alert.alert(
        'Pickup Updated',
        `Pickup location set to ${location.name}`,
        [{ text: 'OK' }]
      );
    } else {
      // Set destination
      const newDestination = {
        name: location.name,
        address: location.address,
        coordinates: location.coordinates
      };

      setDestination(newDestination);
      setCameraAdjusted(false); // Reset camera adjustment flag

      // Add to previous destinations
      if (!previousDestinations.some(dest => dest.name === location.name)) {
        setPreviousDestinations(prev => [
          { ...location, id: Date.now().toString() },
          ...prev.slice(0, 4)
        ]);
      }

      // Calculate route
      await calculateRoute(newDestination.coordinates);
    }

    // Close modal and reset search
    setShowSearchModal(false);
    setModalSearchQuery('');
    setModalSearchResults([]);
    setShowPickupCard(false);
  }, [searchMode, destination, previousDestinations]);

  const calculateRoute = useCallback(async (destCoords: any) => {
    if (!pickupLocation) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${pickupLocation.longitude},${pickupLocation.latitude};` +
        `${destCoords[0]},${destCoords[1]}?` +
        `geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`
      );
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setRouteCoordinates(route.geometry.coordinates);

        const distanceInKm = route.distance / 1000;
        const baseFare = 50;
        const perKmRate = 12;
        const estimatedFare = Math.round(baseFare + (distanceInKm * perKmRate));

        setRideFare({
          base: baseFare,
          distance: distanceInKm.toFixed(1),
          perKm: perKmRate,
          total: estimatedFare,
          estimatedTime: Math.round(route.duration / 60)
        });
      }
    } catch (error) {
      console.error('Route calculation error:', error);
      // Mock route for demo
      const mockRoute = [
        [pickupLocation.longitude, pickupLocation.latitude],
        [destCoords[0], destCoords[1]]
      ];
      setRouteCoordinates(mockRoute);

      const distance = 8.5;
      const estimatedFare = Math.round(50 + (distance * 12));

      setRideFare({
        base: 50,
        distance: distance.toFixed(1),
        perKm: 12,
        total: estimatedFare,
        estimatedTime: 25
      });
    }
  }, [pickupLocation]);

  const adjustMapCameraToShowBothPoints = useCallback(() => {
    if (!pickupLocation || !destination || cameraAdjusted) return;

    // Calculate center point between pickup and destination
    const centerLongitude = (pickupLocation.longitude + destination.coordinates[0]) / 2;
    const centerLatitude = (pickupLocation.latitude + destination.coordinates[1]) / 2;

    // Calculate approximate distance between points to set zoom level
    const latDiff = Math.abs(pickupLocation.latitude - destination.coordinates[1]);
    const lngDiff = Math.abs(pickupLocation.longitude - destination.coordinates[0]);
    const maxDiff = Math.max(latDiff, lngDiff);

    // Adjust zoom level based on distance
    let zoomLevel = 14;
    if (maxDiff > 0.1) zoomLevel = 12;
    if (maxDiff > 0.2) zoomLevel = 11;
    if (maxDiff > 0.3) zoomLevel = 10;
    if (maxDiff < 0.01) zoomLevel = 15;

    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [centerLongitude, centerLatitude],
        zoomLevel: zoomLevel,
        animationMode: 'flyTo',
        animationDuration: 1000
      });
    }

    setCameraAdjusted(true);
  }, [pickupLocation, destination, cameraAdjusted]);

  const startDriverAnimation = useCallback(() => {
    if (!selectedDriver || !pickupLocation || isDriverMoving) return;

    // Clear any existing animation
    if (animationIntervalRef.current) {
      clearInterval(animationIntervalRef.current);
    }

    // Start driver at their original position
    setMovingDriverPosition(selectedDriver.coordinates);
    setIsDriverMoving(true);

    // Generate animation path (10 seconds = 10000ms)
    const startLat = selectedDriver.coordinates[1];
    const startLng = selectedDriver.coordinates[0];
    const endLat = pickupLocation.latitude;
    const endLng = pickupLocation.longitude;

    const totalSteps = 100; // 100 steps over 10 seconds = 100ms per step
    let currentStep = 0;

    animationIntervalRef.current = setInterval(() => {
      currentStep++;

      if (currentStep >= totalSteps) {
        // Animation complete
        clearInterval(animationIntervalRef.current);
        setIsDriverMoving(false);
        setMovingDriverPosition([endLng, endLat]);

        // Show driver arrived message
        setTimeout(() => {
          Alert.alert(
            'Driver Arrived',
            `${selectedDriver.name} has arrived at your pickup location!`,
            [{ text: 'OK' }]
          );
        }, 500);

        return;
      }

      const progress = currentStep / totalSteps;
      const lat = startLat + (endLat - startLat) * progress;
      const lng = startLng + (endLng - startLng) * progress;

      setMovingDriverPosition([lng, lat]);
    }, 100); // Update every 100ms for 10 seconds total
  }, [selectedDriver, pickupLocation, isDriverMoving]);

  const handleSelectDriver = useCallback((driver: any) => {
    setSelectedDriver(driver);
  }, []);

  const handleBookRide = useCallback(async () => {
    if (!selectedDriver || !destination) {
      Alert.alert('Error', 'Please select a driver and destination first');
      return;
    }

    const rideDetails = {
      driver: selectedDriver,
      pickup: pickupLocation,
      destination: destination,
      fare: rideFare,
      paymentMethod: selectedPayment,
      bookingTime: new Date().toLocaleTimeString(),
      bookingDate: new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      }),
      rideId: `RIDE${Date.now().toString().slice(-6)}`
    };

    setRideInfo(rideDetails);
    setBookingConfirmed(true);

    // Add to recent trips
    const newTrip = {
      id: Date.now().toString(),
      date: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      from: pickupLocation.address,
      to: destination.name,
      driver: selectedDriver.name,
      vehicle: selectedDriver.vehicle,
      price: `₹${rideFare.total}`,
      rating: selectedDriver.rating,
      status: 'upcoming'
    };

    setRecentTrips(prev => [newTrip, ...prev]);

    Alert.alert(
      'Ride Booked!',
      `Your ride with ${selectedDriver.name} has been confirmed.\nRide ID: ${rideDetails.rideId}\nEstimated Fare: ₹${rideFare.total}`,
      [{ text: 'OK' }]
    );
  }, [selectedDriver, destination, pickupLocation, rideFare, selectedPayment]);

  const handleChangePickup = useCallback(() => {
    setSearchMode('pickup');
    setShowSearchModal(true);
  }, []);

  const handleChangeDestination = useCallback(() => {
    setSearchMode('destination');
    setShowSearchModal(true);
  }, []);

  // Memoized map marker components
  const renderCurrentLocationMarker = useMemo(() => (
    <PointAnnotation
      id="currentLocation"
      coordinate={[currentLocation.longitude, currentLocation.latitude]}
    >
      <View style={styles.currentLocationMarker}>
        <View style={styles.currentLocationInner}>
          <Ionicons name="location" size={16} color="#fff" />
        </View>
      </View>
    </PointAnnotation>
  ), [currentLocation]);

  const renderPickupMarker = useMemo(() => (
    <PointAnnotation
      id="pickupLocation"
      coordinate={[pickupLocation.longitude, pickupLocation.latitude]}
    >
      <View style={styles.pickupMarker}>
        <View style={styles.pickupMarkerInner}>
          <View style={styles.pickupMarkerDot} />
        </View>
      </View>
    </PointAnnotation>
  ), [pickupLocation]);

  const renderDestinationMarker = useMemo(() => {
    if (!destination) return null;
    return (
      <PointAnnotation
        id="destination"
        coordinate={destination.coordinates}
      >
        <View style={styles.destinationMarker}>
          <View style={styles.destinationMarkerInner}>
            <Ionicons name="flag" size={16} color="#fff" />
          </View>
        </View>
      </PointAnnotation>
    );
  }, [destination]);

  const renderDriverMarkers = useMemo(() => {
    // Show drivers on map at all times (when no destination or when destination but no driver selected)
    if (!showDriversOnMap || selectedDriver || bookingConfirmed) return null;

    return nearbyDrivers.map(driver => (
      <PointAnnotation
        key={driver.id}
        id={`driver-${driver.id}`}
        coordinate={driver.coordinates}
        onSelected={() => handleSelectDriver(driver)}
      >
        <View style={[
          styles.driverMarker,
          selectedDriver?.id === driver.id && styles.selectedDriverMarker
        ]}>
          <FontAwesome name="car" size={14} color="#fff" />
        </View>
      </PointAnnotation>
    ));
  }, [nearbyDrivers, selectedDriver, bookingConfirmed, showDriversOnMap, handleSelectDriver]);

  const renderMovingDriverMarker = useMemo(() => {
    if (!bookingConfirmed || !selectedDriver || !movingDriverPosition) return null;

    return (
      <PointAnnotation
        id="movingDriver"
        coordinate={movingDriverPosition}
      >
        <View style={styles.movingDriverMarker}>
          <View style={styles.movingDriverInner}>
            <FontAwesome name="car" size={16} color="#4CAF50" />
          </View>
        </View>
      </PointAnnotation>
    );
  }, [bookingConfirmed, selectedDriver, movingDriverPosition]);

  const renderRoute = useMemo(() => {
    if (routeCoordinates.length < 2) return null;

    return (
      <ShapeSource
        id="routeSource"
        shape={{
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeCoordinates
          }
        }}
      >
        <LineLayer
          id="routeLayer"
          style={{
            lineColor: '#4CAF50',
            lineWidth: 4,
            lineOpacity: 0.8,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />
      </ShapeSource>
    );
  }, [routeCoordinates]);

  // Fixed Search Modal Component
  const SearchModal = React.memo(() => {
    const handleModalTextChange = useCallback((text: any) => {
      modalTextRef.current = text;
      setModalSearchQuery(text);

      // Clear previous timeout
      if (modalSearchTimeoutRef.current) {
        clearTimeout(modalSearchTimeoutRef.current);
      }

      // Only search if text length > 2
      if (text.trim().length > 2) {
        modalSearchTimeoutRef.current = setTimeout(() => {
          handleModalSearch(text);
        }, 500);
      } else {
        setModalSearchResults([]);
      }
    }, [handleModalSearch]);

    const handleCloseModal = useCallback(() => {
      setShowSearchModal(false);
      setModalSearchQuery('');
      setModalSearchResults([]);
      Keyboard.dismiss();
    }, []);

    const handleClearSearch = useCallback(() => {
      modalTextRef.current = '';
      setModalSearchQuery('');
      setModalSearchResults([]);
    }, []);

    const searchTitle = searchMode === 'pickup' ? 'Change Pickup Location' : 'Select Destination';
    const placeholder = searchMode === 'pickup'
      ? 'Search for pickup location...'
      : 'Search destination...';

    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSearchModal}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.modalCloseButton}
              >
                <Ionicons name="arrow-back" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{searchTitle}</Text>
              <TouchableOpacity
                onPress={handleCloseModal}
                style={styles.modalDoneButton}
              >
                <Text style={styles.modalDoneText}>Done</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color="#666" />
                <TextInput
                  ref={searchInputRef}
                  style={styles.searchInput}
                  placeholder={placeholder}
                  value={modalSearchQuery}
                  onChangeText={handleModalTextChange}
                  returnKeyType="search"
                  onSubmitEditing={() => handleModalSearch(modalTextRef.current)}
                  autoFocus={true}
                  blurOnSubmit={false}
                />
                {modalSearchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={handleClearSearch}
                    style={styles.clearButton}
                  >
                    <Ionicons name="close-circle" size={18} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.currentLocationOption}
              onPress={() => {
                const location = {
                  id: 'current',
                  name: 'Current Location',
                  address: currentLocation.address,
                  coordinates: [currentLocation.longitude, currentLocation.latitude]
                };
                handleSelectLocation(location);
              }}
            >
              <Ionicons name="locate" size={24} color="#4CAF50" />
              <View style={styles.currentLocationTexts}>
                <Text style={styles.currentLocationTitle}>Use Current Location</Text>
                <Text style={styles.currentLocationAddress}>{currentLocation.address}</Text>
              </View>
            </TouchableOpacity>

            {modalIsSearching ? (
              <View style={styles.searchLoading}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.searchLoadingText}>Searching...</Text>
              </View>
            ) : (
              <FlatList
                data={modalSearchResults.length > 0 ? modalSearchResults : previousDestinations}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={
                  modalSearchResults.length === 0 && modalSearchQuery.length === 0 ? (
                    <Text style={styles.previousDestinationsTitle}>
                      {searchMode === 'pickup' ? 'Recent Locations' : 'Previous Destinations'}
                    </Text>
                  ) : null
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchResultItem}
                    onPress={() => handleSelectLocation(item)}
                  >
                    <Ionicons
                      name={modalSearchResults.length > 0 ? "location-outline" : "time-outline"}
                      size={24}
                      color="#666"
                    />
                    <View style={styles.searchResultTexts}>
                      <Text style={styles.searchResultName}>{item.name}</Text>
                      <Text style={styles.searchResultAddress}>{item.address}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  });

  // Memoized bottom sheet content
  const renderBottomSheetContent = useCallback(() => (
    <BottomSheetScrollView
      style={styles.bottomSheetContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.bottomSheetContentContainer}
    >
      {bookingConfirmed && rideInfo ? (
        <View style={styles.rideConfirmationContainer}>
          <View style={styles.successHeader}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={50} color="#4CAF50" />
            </View>
            <View style={styles.successTexts}>
              <Text style={styles.rideConfirmationTitle}>Ride Confirmed!</Text>
              <Text style={styles.rideId}>ID: {rideInfo.rideId}</Text>
            </View>
          </View>

          <View style={styles.rideDetailsCard}>
            <View style={styles.driverDetailsSection}>
              <View style={styles.driverProfile}>
                <View style={styles.driverAvatar}>
                  <FontAwesome name="user" size={24} color="#4CAF50" />
                </View>
                <View style={styles.driverProfileInfo}>
                  <Text style={styles.driverProfileName}>{rideInfo.driver.name}</Text>
                  <View style={styles.driverProfileRating}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.driverProfileRatingText}>{rideInfo.driver.rating}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.vehicleDetailsLarge}>
                <FontAwesome name="car" size={16} color="#666" />
                <Text style={styles.vehicleTextLarge}>{rideInfo.driver.vehicle}</Text>
                <Text style={styles.vehicleDetail}>{rideInfo.driver.vehicleColor}</Text>
                <Text style={styles.vehicleDetail}>{rideInfo.driver.licensePlate}</Text>
              </View>
            </View>

            <View style={styles.routeDetails}>
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: '#4CAF50' }]} />
                <View style={styles.routeTexts}>
                  <Text style={styles.routeLabel}>PICKUP</Text>
                  <Text style={styles.routeAddress}>{rideInfo.pickup.address}</Text>
                </View>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routeRow}>
                <View style={[styles.routeDot, { backgroundColor: '#FF6B6B' }]} />
                <View style={styles.routeTexts}>
                  <Text style={styles.routeLabel}>DESTINATION</Text>
                  <Text style={styles.routeAddress}>{rideInfo.destination.address}</Text>
                </View>
              </View>
            </View>

            <View style={styles.fareBreakdown}>
              <Text style={styles.fareTitle}>Fare Breakdown</Text>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Base Fare</Text>
                <Text style={styles.fareValue}>₹{rideInfo.fare.base}</Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={styles.fareLabel}>Distance ({rideInfo.fare.distance} km)</Text>
                <Text style={styles.fareValue}>₹{(rideInfo.fare.perKm * rideInfo.fare.distance).toFixed(0)}</Text>
              </View>
              <View style={styles.totalFareRow}>
                <Text style={styles.totalFareLabel}>Total Fare</Text>
                <Text style={styles.totalFareValue}>₹{rideInfo.fare.total}</Text>
              </View>
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.paymentTitle}>Payment Method</Text>
              <View style={styles.paymentOptions}>
                <TouchableOpacity
                  style={[styles.paymentOption, selectedPayment === 'cash' && styles.selectedPaymentOption]}
                  onPress={() => setSelectedPayment('cash')}
                >
                  <Ionicons name="cash" size={20} color={selectedPayment === 'cash' ? '#4CAF50' : '#666'} />
                  <Text style={[styles.paymentOptionText, selectedPayment === 'cash' && styles.selectedPaymentOptionText]}>
                    Cash
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentOption, selectedPayment === 'card' && styles.selectedPaymentOption]}
                  onPress={() => setSelectedPayment('card')}
                >
                  <Ionicons name="card" size={20} color={selectedPayment === 'card' ? '#4CAF50' : '#666'} />
                  <Text style={[styles.paymentOptionText, selectedPayment === 'card' && styles.selectedPaymentOptionText]}>
                    Card
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paymentOption, selectedPayment === 'upi' && styles.selectedPaymentOption]}
                  onPress={() => setSelectedPayment('upi')}
                >
                  <FontAwesome name="mobile" size={22} color={selectedPayment === 'upi' ? '#4CAF50' : '#666'} />
                  <Text style={[styles.paymentOptionText, selectedPayment === 'upi' && styles.selectedPaymentOptionText]}>
                    UPI
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.trackButton}
            onPress={() => Alert.alert('Tracking', 'Tracking your ride...')}
          >
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.trackButtonText}>Track Ride</Text>
          </TouchableOpacity>

          {/* Driver Progress */}
          {isDriverMoving && (
            <View style={styles.driverProgress}>
              <Text style={styles.driverProgressText}>
                {selectedDriver.name} is on the way to your pickup location
              </Text>
              <ActivityIndicator size="small" color="#4CAF50" style={{ marginTop: 8 }} />
            </View>
          )}
        </View>
      ) : (
        <>
          {/* Pickup Location Card - Only show when destination not selected */}
          {!destination && showPickupCard && (
            <TouchableOpacity
              style={styles.pickupCard}
              onPress={handleChangePickup}
            >
              <View style={styles.pickupIcon}>
                <FontAwesome name="circle" size={16} color="#4CAF50" />
              </View>
              <View style={styles.pickupDetails}>
                <Text style={styles.pickupLabel}>PICKUP</Text>
                <Text style={styles.pickupAddress}>{pickupLocation.address}</Text>
                <Text style={styles.pickupInfo}>
                  <Ionicons name="time-outline" size={12} color="#666" />
                  <Text style={styles.pickupInfoText}> Ready for pickup</Text>
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          )}

          {/* Destination Input Card */}
          <TouchableOpacity
            style={styles.destinationCard}
            onPress={handleChangeDestination}
          >
            <View style={styles.destinationIcon}>
              <Ionicons name="flag" size={16} color="#FF6B6B" />
            </View>
            <View style={styles.destinationDetails}>
              <Text style={styles.destinationLabel}>DESTINATION</Text>
              <Text style={styles.destinationPlaceholder}>
                {destination ? destination.name : 'Where do you want to go?'}
              </Text>
              {destination && (
                <Text style={styles.destinationAddress}>{destination.address}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Show Available Drivers on Initial Step (when no destination) */}
          {!destination && (
            <>
              <View style={styles.availableRidesHeader}>
                <Text style={styles.availableRidesTitle}>Available Near You</Text>
                <Text style={styles.driverCount}>{nearbyDrivers.length} drivers nearby</Text>
              </View>

              <View style={styles.driversList}>
                {nearbyDrivers.map((driver) => (
                  <DriverItem
                    key={driver.id}
                    driver={driver}
                    isSelected={selectedDriver?.id === driver.id}
                    onSelectDriver={handleSelectDriver}
                  />
                ))}
              </View>
            </>
          )}

          {/* Recent Trips Section - Only show when destination not selected */}
          {!destination && (
            <View style={styles.recentTripsSection}>
              <Text style={styles.sectionTitle}>Recent Trips</Text>
              <View style={styles.recentTripsList}>
                {recentTrips.slice(0, 3).map((trip) => (
                  <RecentTripItem key={trip.id} trip={trip} />
                ))}
              </View>
            </View>
          )}

          {/* Fare Estimate & Available Rides - Only show when destination selected */}
          {destination && !selectedDriver && (
            <>
              <View style={styles.fareEstimateCard}>
                <View style={styles.fareEstimateHeader}>
                  <Text style={styles.fareEstimateTitle}>Estimated Fare</Text>
                  <Text style={styles.fareEstimateDistance}>{rideFare?.distance || '8.5'} km</Text>
                </View>
                <Text style={styles.fareEstimateAmount}>₹{rideFare?.total || '152'}</Text>
                <View style={styles.fareEstimateDetails}>
                  <Text style={styles.fareDetail}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text> {rideFare?.estimatedTime || 25} min</Text>
                  </Text>
                  <Text style={styles.fareDetail}>
                    <Ionicons name="cash-outline" size={14} color="#666" />
                    <Text> Base ₹{rideFare?.base || 50}</Text>
                  </Text>
                </View>
              </View>

              <View style={styles.availableRidesHeader}>
                <Text style={styles.availableRidesTitle}>Available Rides</Text>
                <Text style={styles.driverCount}>{nearbyDrivers.length} drivers nearby</Text>
              </View>

              <View style={styles.driversList}>
                {nearbyDrivers.map((driver) => (
                  <DriverItem
                    key={driver.id}
                    driver={driver}
                    isSelected={selectedDriver?.id === driver.id}
                    onSelectDriver={handleSelectDriver}
                  />
                ))}
              </View>
            </>
          )}

          {/* Selected Driver Details - Only show when driver selected */}
          {selectedDriver && destination && !bookingConfirmed && (
            <>
              <View style={styles.selectedDriverCard}>
                <View style={styles.selectedDriverHeader}>
                  <View style={styles.selectedDriverInfo}>
                    <FontAwesome name="car" size={24} color="#4CAF50" />
                    <View style={styles.selectedDriverTexts}>
                      <Text style={styles.selectedDriverName}>{selectedDriver.name}</Text>
                      <View style={styles.selectedDriverRating}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.selectedDriverRatingText}>{selectedDriver.rating}</Text>
                        <Text style={styles.selectedDriverVehicle}> • {selectedDriver.vehicle}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedDriver(null)}>
                    <Ionicons name="close" size={24} color="#999" />
                  </TouchableOpacity>
                </View>

                <View style={styles.selectedDriverDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailLabel}>ETA:</Text>
                    <Text style={styles.detailValue}>{selectedDriver.eta}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <FontAwesome name="rupee" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Fare:</Text>
                    <Text style={styles.detailValue}>₹{rideFare?.total || '152'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <FontAwesome name="users" size={16} color="#666" />
                    <Text style={styles.detailLabel}>Seats:</Text>
                    <Text style={styles.detailValue}>{selectedDriver.availableSeats}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={handleBookRide}
                >
                  <Text style={styles.bookButtonText}>Book {selectedDriver.vehicle}</Text>
                  <View style={styles.bookButtonPriceContainer}>
                    <Text style={styles.bookButtonPrice}>₹{rideFare?.total || '152'}</Text>
                    <Ionicons name="arrow-forward" size={20} color="#fff" />
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
    </BottomSheetScrollView>
  ), [
    bookingConfirmed, rideInfo, selectedDriver, destination, pickupLocation,
    nearbyDrivers, recentTrips, rideFare, selectedPayment, isDriverMoving,
    showPickupCard, handleChangePickup, handleChangeDestination,
    handleSelectDriver, handleBookRide
  ]);

  // Memoized map header
  const MapHeader = useMemo(() => (
    showPickupCard && !destination && (
      <TouchableOpacity
        style={styles.pickupOverlay}
        onPress={handleChangePickup}
        activeOpacity={0.8}
      >
        <View style={styles.pickupOverlayContent}>
          <View style={styles.pickupOverlayIcon}>
            <FontAwesome name="circle" size={14} color="#4CAF50" />
          </View>
          <View style={styles.pickupOverlayTexts}>
            <Text style={styles.pickupOverlayLabel}>PICKUP</Text>
            <Text style={styles.pickupOverlayAddress} numberOfLines={1}>
              {pickupLocation.address}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#999" />
        </View>
      </TouchableOpacity>
    )
  ), [showPickupCard, destination, pickupLocation, handleChangePickup]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        {/* Map View */}
        <View style={styles.mapContainer}>
          <Mapbox.MapView
            ref={mapRef}
            style={styles.map}
            styleURL={Mapbox.StyleURL.Street}
            logoEnabled={false}
            attributionEnabled={false}
            scaleBarEnabled={false}
          >
            <Camera
              ref={cameraRef}
              zoomLevel={14}
              centerCoordinate={[pickupLocation.longitude, pickupLocation.latitude]}
              animationMode="flyTo"
              animationDuration={1000}
            />

            {renderRoute}
            {renderCurrentLocationMarker}
            {renderPickupMarker}
            {renderDestinationMarker}
            {renderDriverMarkers}
            {renderMovingDriverMarker}
          </Mapbox.MapView>

          {MapHeader}

          {/* Current Location Button */}
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={getCurrentLocation}
          >
            <Ionicons name="locate" size={22} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Search Modal */}
        <SearchModal />

        {/* Bottom Sheet */}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={styles.bottomSheetBackground}
          handleStyle={styles.bottomSheetHandle}
          enablePanDownToClose={false}
        >
          {renderBottomSheetContent}
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: MAP_HEIGHT,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  // Marker Styles
  currentLocationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  pickupMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickupMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  pickupMarkerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
  },
  destinationMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationMarkerInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  driverMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF9800',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  selectedDriverMarker: {
    borderColor: '#4CAF50',
    borderWidth: 4,
  },
  // Moving Driver Marker
  movingDriverMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  movingDriverInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 4,
  },
  driverProgress: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    alignItems: 'center',
  },
  driverProgressText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  // Pickup Overlay on Map
  pickupOverlay: {
    position: 'absolute',
    top: 49,
    left: 10,
    right: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  pickupOverlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupOverlayIcon: {
    marginRight: 10,
  },
  pickupOverlayTexts: {
    flex: 1,
  },
  pickupOverlayLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
    marginBottom: 2,
  },
  pickupOverlayAddress: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 10,
    right: 16,
    backgroundColor: '#fff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '90%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalCloseButton: {
    marginRight: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalDoneButton: {
    padding: 8,
  },
  modalDoneText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  searchContainer: {
    margin: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  currentLocationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  currentLocationTexts: {
    marginLeft: 15,
    flex: 1,
  },
  currentLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  currentLocationAddress: {
    fontSize: 14,
    color: '#666',
  },
  searchLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  searchLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  previousDestinationsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 20,
    marginVertical: 15,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchResultTexts: {
    marginLeft: 15,
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  searchResultAddress: {
    fontSize: 14,
    color: '#666',
  },
  // Bottom Sheet Styles
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomSheetHandle: {
    backgroundColor: '#e0e0e0',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
  },
  bottomSheetContent: {
    flex: 1,
  },
  bottomSheetContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // Pickup Card
  pickupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  pickupIcon: {
    marginRight: 12,
  },
  pickupDetails: {
    flex: 1,
  },
  pickupLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  pickupAddress: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupInfoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  // Destination Card
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  destinationIcon: {
    marginRight: 12,
  },
  destinationDetails: {
    flex: 1,
  },
  destinationLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  destinationPlaceholder: {
    fontSize: 16,
    color: '#999',
    paddingVertical: 4,
  },
  destinationAddress: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  // Recent Trips
  recentTripsSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  recentTripsList: {
    gap: 10,
  },
  recentTripItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  recentTripIcon: {
    marginRight: 12,
  },
  recentTripInfo: {
    flex: 1,
  },
  recentTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentTripDate: {
    fontSize: 12,
    color: '#666',
  },
  recentTripPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  recentTripRoute: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
  },
  recentTripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentTripDriver: {
    fontSize: 12,
    color: '#666',
  },
  recentTripRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentTripRatingText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
  },
  // Fare Estimate
  fareEstimateCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  fareEstimateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fareEstimateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  fareEstimateDistance: {
    fontSize: 14,
    color: '#666',
  },
  fareEstimateAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  fareEstimateDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  fareDetail: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Available Rides
  availableRidesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  availableRidesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  driverCount: {
    fontSize: 14,
    color: '#666',
  },
  driversList: {
    marginBottom: 16,
    gap: 10,
  },
  // Driver Item
  driverItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedDriverItem: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#F0F9F0',
  },
  driverIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  driverInfo: {
    flex: 1,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  vehicleDetails: {
    marginBottom: 8,
  },
  vehicleText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  vehicleTags: {
    flexDirection: 'row',
    gap: 6,
  },
  vehicleTag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  driverFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  etaText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  distanceText: {
    fontSize: 12,
    color: '#666',
  },
  driverPrice: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  priceRange: {
    fontSize: 12,
    color: '#666',
  },
  // Selected Driver Card
  selectedDriverCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDriverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedDriverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDriverTexts: {
    marginLeft: 12,
  },
  selectedDriverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  selectedDriverRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDriverRatingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  selectedDriverVehicle: {
    fontSize: 14,
    color: '#666',
  },
  selectedDriverDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  // Book Button
  bookButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  bookButtonPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButtonPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 12,
  },
  // Ride Confirmation
  rideConfirmationContainer: {
    paddingVertical: 8,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: {
    marginRight: 16,
  },
  successTexts: {
    flex: 1,
  },
  rideConfirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  rideId: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  rideDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  driverDetailsSection: {
    marginBottom: 20,
  },
  driverProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  driverProfileInfo: {
    flex: 1,
  },
  driverProfileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  driverProfileRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverProfileRatingText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  vehicleDetailsLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  vehicleTextLarge: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  vehicleDetail: {
    fontSize: 12,
    color: '#666',
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  routeDetails: {
    marginBottom: 20,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 15,
    marginTop: 4,
  },
  routeTexts: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 14,
    color: '#333',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 5,
    marginBottom: 8,
  },
  fareBreakdown: {
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  fareTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 14,
    color: '#666',
  },
  fareValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalFareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalFareLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalFareValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  selectedPaymentOption: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  paymentOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedPaymentOptionText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  trackButton: {
    backgroundColor: '#4CAF50',
    padding: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default MapboxLocationScreen2;