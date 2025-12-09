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
  KeyboardAvoidingView,
  Animated,
  Easing
} from 'react-native';
import Mapbox, { 
  Camera, 
  PointAnnotation, 
  ShapeSource, 
  LineLayer 
} from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { navigate } from '@utils/NavigationUtil';
import { useNavigation } from '@react-navigation/native';

// Configure Mapbox
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYWRhcnNobWlzaHJhNTYzIiwiYSI6ImNtZjlocXQydzBrZmYycnNqNGs5OTk3cXUifQ.jwUMhX7pbAGl7fI9rXt7mw';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

const { width, height } = Dimensions.get('window');
const MAP_HEIGHT = height * 0.42;

const MapboxLocationScreen = () => {

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
  const navigation = useNavigation();

  const [destination, setDestination] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [rideInfo, setRideInfo] = useState(null);
  const [rideFare, setRideFare] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('cash');
  const [showPickupCard, setShowPickupCard] = useState(true);
  const [searchMode, setSearchMode] = useState('destination');
  

  const [animatingDriver, setAnimatingDriver] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [cameraAdjusted, setCameraAdjusted] = useState(false);
  const [driverArrived, setDriverArrived] = useState(false);
  const [movingDriverCoords, setMovingDriverCoords] = useState(null);
  
 
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
  
  // Refs
  const cameraRef = useRef();
  const mapRef = useRef();
  const bottomSheetModalRef = useRef(null);
  const animationRef = useRef(null);
  
  // Animated values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const driverPulseAnim = useRef(new Animated.Value(1)).current;
  
  const snapPoints = useMemo(() => ['58%', '70%', '90%'], []);

  // Initialize
  useEffect(() => {
    requestLocationPermission();
    
   
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
    
    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
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

  // Handle driver animation when ride is booked
  useEffect(() => {
    if (bookingConfirmed && rideInfo && rideInfo.driver) {
      startDriverAnimation(rideInfo.driver);
    } else {
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      setAnimatingDriver(null);
      setAnimationProgress(0);
      setDriverArrived(false);
      setMovingDriverCoords(null);
    }
  }, [bookingConfirmed, rideInfo]);

  // Adjust camera when destination is set
  useEffect(() => {
    if (destination && !cameraAdjusted) {
      adjustCameraToFitPoints();
      setCameraAdjusted(true);
    }
  }, [destination, cameraAdjusted]);

  // Adjust camera when ride is booked to show both points
  useEffect(() => {
    if (bookingConfirmed && pickupLocation && destination) {
      setTimeout(() => {
        adjustCameraToFitPoints();
      }, 500);
    }
  }, [bookingConfirmed, pickupLocation, destination]);

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
        
        const newLocation = {
          latitude,
          longitude,
          address: address || 'Your current location'
        };
        
        setCurrentLocation(newLocation);
        
        // Only update pickup if it's the default one
        if (pickupLocation.address === 'Current Location') {
          setPickupLocation({
            latitude,
            longitude,
            address: address || 'Current Location'
          });
          
          // Regenerate drivers around new location
          generateMockDrivers(latitude, longitude);
        }
        
        setLoading(false);
      },
      (error) => {
        console.log('Error getting location:', error);
        setLoading(false);
        Alert.alert('Error', 'Unable to get your current location');
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000 
      }
    );
  };

  const reverseGeocode = async (lat, lng) => {
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

  const generateMockDrivers = (lat, lng) => {
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
        originalCoordinates: [lng + 0.003, lat + 0.002],
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
        originalCoordinates: [lng - 0.002, lat + 0.001],
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
        originalCoordinates: [lng + 0.001, lat - 0.002],
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
        originalCoordinates: [lng - 0.001, lat - 0.001],
        eta: '2 min',
        distance: '0.5 km',
        availableSeats: 7,
        driverImage: 'https://randomuser.me/api/portraits/men/23.jpg'
      }
    ];
    
    setNearbyDrivers(mockDrivers);
  };

  const updateDriversForNewPickup = (newLat, newLng) => {
    const newDrivers = nearbyDrivers.map(driver => {
      // Calculate new position relative to new pickup
      const latDiff = driver.originalCoordinates[1] - pickupLocation.latitude;
      const lngDiff = driver.originalCoordinates[0] - pickupLocation.longitude;
      
      const newDriverLat = newLat + latDiff;
      const newDriverLng = newLng + lngDiff;
      
      // Update ETA based on distance to new pickup
      const distance = Math.sqrt(Math.pow(lngDiff * 111, 2) + Math.pow(latDiff * 111, 2));
      const newEta = Math.max(1, Math.round(distance * 10)); // Rough estimate
      
      return {
        ...driver,
        coordinates: [newDriverLng, newDriverLat],
        originalCoordinates: [newDriverLng, newDriverLat],
        distance: `${distance.toFixed(1)} km`,
        eta: `${newEta} min`
      };
    });
    
    setNearbyDrivers(newDrivers);
    
    // If a driver was selected, update their position too
    if (selectedDriver) {
      const updatedSelectedDriver = newDrivers.find(d => d.id === selectedDriver.id);
      if (updatedSelectedDriver) {
        setSelectedDriver(updatedSelectedDriver);
      }
    }
  };

  const calculateRoute = async (destCoords) => {
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
  };

  const startDriverAnimation = (driver) => {
    if (animationRef.current) {
      clearInterval(animationRef.current);
    }
    
    // Start driver pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(driverPulseAnim, {
          toValue: 1.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        }),
        Animated.timing(driverPulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true
        })
      ])
    ).start();
    
    setAnimatingDriver(driver);
    setAnimationProgress(0);
    setDriverArrived(false);
    
    // Set initial moving driver coordinates
    setMovingDriverCoords(driver.coordinates);
    
    const animationDuration = 10000; // 10 seconds
    const steps = 100;
    const interval = animationDuration / steps;
    
    let progress = 0;
    
    animationRef.current = setInterval(() => {
      progress += 1;
      setAnimationProgress(progress);
      
      if (progress <= 100) {
        const startLng = driver.originalCoordinates[0];
        const startLat = driver.originalCoordinates[1];
        const endLng = pickupLocation.longitude;
        const endLat = pickupLocation.latitude;
        
        // Smooth easing function
        const easeProgress = 1 - Math.pow(1 - (progress / 100), 2);
        
        const newLng = startLng + (endLng - startLng) * easeProgress;
        const newLat = startLat + (endLat - startLat) * easeProgress;
        
        // Update the moving driver coordinates
        setMovingDriverCoords([newLng, newLat]);
        
        // Also update in the nearbyDrivers array for the marker
        setNearbyDrivers(prev => 
          prev.map(d => 
            d.id === driver.id 
              ? { ...d, coordinates: [newLng, newLat] }
              : d
          )
        );
      }
      
      if (progress >= 100) {
        clearInterval(animationRef.current);
        animationRef.current = null;
        setDriverArrived(true);
        // Stop pulse animation
        driverPulseAnim.stopAnimation();
        
        Alert.alert(
          'Driver Arrived! 🎉',
          `${driver.name} has arrived at your pickup location!\nYour ride is ready to go.`,
          [{ text: 'OK', style: 'default' }]
        );
      }
    }, interval);
  };

 const adjustCameraToFitPoints = () => {
  let pointsToShow = [[pickupLocation.longitude, pickupLocation.latitude]];

  if (destination) {
    pointsToShow.push(destination.coordinates);
  }

  if (selectedDriver && bookingConfirmed) {
    pointsToShow.push(selectedDriver.coordinates);
  }

  if (!destination && nearbyDrivers.length > 0) {
    nearbyDrivers.forEach(driver => {
      pointsToShow.push(driver.coordinates);
    });
  }

  const lngs = pointsToShow.map(p => p[0]);
  const lats = pointsToShow.map(p => p[1]);

  let minLng = Math.min(...lngs);
  let maxLng = Math.max(...lngs);
  let minLat = Math.min(...lats);
  let maxLat = Math.max(...lats);

 
  const expandFactor = 0.08; 
  minLng -= expandFactor;
  maxLng += expandFactor;
  minLat -= expandFactor;
  maxLat += expandFactor;

  if (cameraRef.current) {
    cameraRef.current.fitBounds(
      [minLng, minLat],  
      [maxLng, maxLat],
      {
        padding: {
          top: 160,
          bottom: 260,
          left: 80,
          right: 80,
        },
        animationDuration: 1200,
      }
    );
  }
};


  const focusCameraOnPickup = () => {
    if (cameraRef.current && pickupLocation) {
      cameraRef.current.setCamera({
        centerCoordinate: [pickupLocation.longitude, pickupLocation.latitude],
        zoomLevel: 14,
        animationDuration: 1000,
        animationMode: 'easeTo'
      });
    }
  };

  const handleSelectDriver = (driver) => {
    setSelectedDriver(driver);
  };

  const handleBookRide = async () => {
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
      bookingTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bookingDate: new Date().toLocaleDateString('en-IN', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric' 
      }),
      rideId: `RIDE${Date.now().toString().slice(-6)}`
    };

    setRideInfo(rideDetails);
    setBookingConfirmed(true);
    
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
      'Ride Booked Successfully! 🚗',
      `Your ride with ${selectedDriver.name} has been confirmed.\n\nRide ID: ${rideDetails.rideId}\nEstimated Fare: ₹${rideFare.total}\nEstimated Arrival: ${selectedDriver.eta}`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleChangePickup = () => {
    setSearchMode('pickup');
    setShowSearchModal(true);
  };

  const handleChangeDestination = () => {
    setSearchMode('destination');
    setShowSearchModal(true);
  };

  const handleSelectLocation = async (location) => {
    if (searchMode === 'pickup') {
      const newPickup = {
        latitude: location.coordinates[1],
        longitude: location.coordinates[0],
        address: location.address
      };
      
      setPickupLocation(newPickup);
      
      // Update drivers for new pickup location
      updateDriversForNewPickup(newPickup.latitude, newPickup.longitude);
      
      // Clear any selected driver since pickup location changed
      setSelectedDriver(null);
      setBookingConfirmed(false);
      setRideInfo(null);
      
      if (destination) {
        await calculateRoute(destination.coordinates);
      }
      
      setCameraAdjusted(false);
      
      Alert.alert(
        'Pickup Location Updated ✅',
        `Pickup location set to ${location.name}`,
        [{ text: 'OK', style: 'default' }]
      );
      
      // Focus camera on the new pickup location
      setTimeout(() => {
        focusCameraOnPickup();
      }, 300);
    } else {
      const newDestination = {
        name: location.name,
        address: location.address,
        coordinates: location.coordinates
      };
      
      setDestination(newDestination);
      setCameraAdjusted(false);
      
      await calculateRoute(newDestination.coordinates);
    }
    
    setShowSearchModal(false);
    setShowPickupCard(false);
    
    // Adjust camera after a short delay
    setTimeout(() => {
      adjustCameraToFitPoints();
    }, 300);
  };

  // Render Map Markers
  const renderCurrentLocationMarker = () => (
    <PointAnnotation
      id="currentLocation"
      coordinate={[currentLocation.longitude, currentLocation.latitude]}
    >
      <Animated.View style={[
        styles.currentLocationMarker,
        { transform: [{ scale: pulseAnim }] }
      ]}>
        <View style={styles.currentLocationInner}>
          <Ionicons name="location" size={16} color="#fff" />
        </View>
      </Animated.View>
    </PointAnnotation>
  );

  const renderPickupMarker = () => (
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
  );

  const renderDestinationMarker = () => {
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
  };

  const renderDriverMarkers = () => {
    // Show moving driver animation if booking is confirmed
    if (bookingConfirmed && movingDriverCoords && animatingDriver) {
      return (
        <PointAnnotation
          key={animatingDriver.id}
          id={`moving-driver-${animatingDriver.id}`}
          coordinate={movingDriverCoords}
        >
          <Animated.View style={[
            styles.driverMarker,
            styles.selectedDriverMarker,
            styles.animatingDriverMarker,
            { transform: [{ scale: driverPulseAnim }] }
          ]}>
            <FontAwesome name="car" size={14} color="#fff" />
          </Animated.View>
        </PointAnnotation>
      );
    }
    
    // Show selected driver marker (non-animated)
    if (selectedDriver && !bookingConfirmed) {
      return (
        <PointAnnotation
          key={selectedDriver.id}
          id={`driver-${selectedDriver.id}`}
          coordinate={selectedDriver.coordinates}
        >
          <View style={[styles.driverMarker, styles.selectedDriverMarker]}>
            <FontAwesome name="car" size={14} color="#fff" />
          </View>
        </PointAnnotation>
      );
    }
    
    // Show all drivers when no destination selected
    if (!destination) {
      return nearbyDrivers.map(driver => (
        <PointAnnotation
          key={driver.id}
          id={`driver-${driver.id}`}
          coordinate={driver.coordinates}
          onSelected={() => handleSelectDriver(driver)}
        >
          <View style={styles.driverMarker}>
            <FontAwesome name="car" size={14} color="#fff" />
          </View>
        </PointAnnotation>
      ));
    }
    
    // Show drivers when destination is selected
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
  };

  const renderRoute = () => {
    if (routeCoordinates.length < 2) return null;
    
    return (
      <ShapeSource
        id="routeSource"
        shape={{
          type: 'Feature',
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
  };

  // Driver Item Component
  const DriverItem = ({ driver, isSelected }) => (
    <TouchableOpacity 
      style={[styles.driverItem, isSelected && styles.selectedDriverItem]}
      onPress={() => handleSelectDriver(driver)}
      activeOpacity={0.7}
    >
      <View style={styles.driverIconContainer}>
        <View style={[
          styles.driverIconBackground,
          { backgroundColor: 
            driver.vehicleType === 'suv' ? '#E3F2FD' : 
            driver.vehicleType === 'sedan' ? '#E8F5E9' : '#FFF3E0' 
          }
        ]}>
          <FontAwesome 
            name="car" 
            size={24} 
            color={driver.vehicleType === 'suv' ? '#2196F3' : 
                   driver.vehicleType === 'sedan' ? '#4CAF50' : '#FF9800'} 
          />
        </View>
      </View>
      
      <View style={styles.driverInfo}>
        <View style={styles.driverHeader}>
          <View style={styles.driverNameContainer}>
            <Text style={styles.driverName}>{driver.name}</Text>
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color="#FFD700" />
              <Text style={styles.ratingText}>{driver.rating}</Text>
            </View>
          </View>
          <View style={styles.etaBadge}>
            <Ionicons name="time-outline" size={12} color="#fff" />
            <Text style={styles.etaBadgeText}>{driver.eta}</Text>
          </View>
        </View>
        
        <View style={styles.vehicleDetails}>
          <Text style={styles.vehicleText}>{driver.vehicle}</Text>
          <View style={styles.vehicleTags}>
            <View style={[styles.vehicleTag, { backgroundColor: '#F5F5F5' }]}>
              <Text style={styles.vehicleTagText}>{driver.vehicleColor}</Text>
            </View>
            <View style={[styles.vehicleTag, { backgroundColor: '#F5F5F5' }]}>
              <Ionicons name="people-outline" size={10} color="#666" />
              <Text style={[styles.vehicleTagText, { marginLeft: 2 }]}>{driver.availableSeats}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.driverFooter}>
          <View style={styles.distanceContainer}>
            <Ionicons name="navigate-outline" size={12} color="#666" />
            <Text style={styles.distanceText}>{driver.distance}</Text>
          </View>
          <View style={styles.licenseContainer}>
            <Text style={styles.licenseText}>{driver.licensePlate}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.driverPrice}>
        <Text style={styles.priceText}>₹{driver.pricePerKm}/km</Text>
        <View style={[
          styles.priceRangeBadge,
          { backgroundColor: driver.priceRange === 'Premium' ? '#FFEBEE' : 
                           driver.priceRange === 'Comfort' ? '#F3E5F5' : '#E8F5E9' }
        ]}>
          <Text style={[
            styles.priceRangeText,
            { color: driver.priceRange === 'Premium' ? '#D32F2F' : 
                    driver.priceRange === 'Comfort' ? '#7B1FA2' : '#388E3C' }
          ]}>
            {driver.priceRange}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Recent Trip Item
  const RecentTripItem = ({ trip }) => (
    <View style={styles.recentTripItem}>
      <View style={styles.recentTripIcon}>
        <View style={styles.recentTripIconBackground}>
          <Ionicons name="car" size={16} color="#4CAF50" />
        </View>
      </View>
      <View style={styles.recentTripInfo}>
        <View style={styles.recentTripHeader}>
          <Text style={styles.recentTripDate}>{trip.date}</Text>
          <View style={styles.recentTripPriceContainer}>
            <Text style={styles.recentTripPrice}>{trip.price}</Text>
          </View>
        </View>
        <Text style={styles.recentTripRoute} numberOfLines={1}>
          {trip.from} → {trip.to}
        </Text>
        <View style={styles.recentTripFooter}>
          <Text style={styles.recentTripDriver} numberOfLines={1}>
            {trip.driver} • {trip.vehicle}
          </Text>
          <View style={styles.recentTripRating}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.recentTripRatingText}>{trip.rating}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Bottom Sheet Content
  const renderBottomSheetContent = () => (
    <BottomSheetScrollView 
      style={styles.bottomSheetContent}
      showsVerticalScrollIndicator={false}
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
                <View style={styles.vehicleDetail}>
                  <Text style={styles.vehicleDetailText}>{rideInfo.driver.vehicleColor}</Text>
                </View>
                <View style={styles.vehicleDetail}>
                  <Text style={styles.vehicleDetailText}>{rideInfo.driver.licensePlate}</Text>
                </View>
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
            <TouchableOpacity style={{zIndex:200000}} onPress={()=>{navigation.navigate('Payment');
}}>  <View style={styles.paymentOptions}>
                <TouchableOpacity 
                  style={[styles.paymentOption, selectedPayment === 'cash' && styles.selectedPaymentOption]}
                  onPress={() => {setSelectedPayment('cash');navigation.navigate('Payment');
}}
                  activeOpacity={0.7}
                >
                  <Ionicons name="cash" size={20} color={selectedPayment === 'cash' ? '#4CAF50' : '#666'} />
                  <Text style={[styles.paymentOptionText, selectedPayment === 'cash' && styles.selectedPaymentOptionText]}>
                    Cash
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.paymentOption, selectedPayment === 'card' && styles.selectedPaymentOption]}
                  onPress={() =>{navigation.navigate('Payment');
setSelectedPayment('card')}}
                  activeOpacity={0.7}
                >
                  <Ionicons name="card" size={20} color={selectedPayment === 'card' ? '#4CAF50' : '#666'} />
                  <Text style={[styles.paymentOptionText, selectedPayment === 'card' && styles.selectedPaymentOptionText]}>
                    Card
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.paymentOption, selectedPayment === 'upi' && styles.selectedPaymentOption]}
                  onPress={() => {navigation.navigate('Payment');;setSelectedPayment('upi')}}
                  activeOpacity={0.7}
                >
                  <FontAwesome name="mobile" size={22} color={selectedPayment === 'upi' ? '#4CAF50' : '#666'} />
                  <Text style={[styles.paymentOptionText, selectedPayment === 'upi' && styles.selectedPaymentOptionText]}>
                    UPI
                  </Text>
                </TouchableOpacity>
              </View></TouchableOpacity>
            </View>
            
            {/* Driver Progress */}
            {animatingDriver && (
              <View style={styles.driverProgressSection}>
                <View style={styles.driverProgressHeader}>
                  <Text style={styles.driverProgressTitle}>
                    {driverArrived ? 'Driver Arrived!' : 'Driver On The Way'}
                  </Text>
                  <View style={styles.driverProgressBadge}>
                    <Text style={styles.driverProgressBadgeText}>
                      {driverArrived ? '🎉' : '🚗'}
                    </Text>
                  </View>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBarBackground}>
                    <View 
                      style={[
                        styles.progressBarFill,
                        { width: `${animationProgress}%` }
                      ]} 
                    />
                  </View>
                  <View style={styles.progressBarLabels}>
                    <Text style={styles.progressBarLabelStart}>Driver</Text>
                    <Text style={styles.progressBarLabelEnd}>Pickup</Text>
                  </View>
                </View>
                <Text style={styles.driverProgressText}>
                  {driverArrived 
                    ? `${animatingDriver.name} is waiting for you at the pickup location`
                    : `${animatingDriver.name} is ${(100 - animationProgress) > 50 ? 'on the way' : 'almost here'} (${animationProgress}%)`
                  }
                </Text>
              </View>
            )}
          </View>
          
          <TouchableOpacity 
            style={styles.trackButton}
            onPress={() => navigation.navigate('RideStatus', {
    driver: rideInfo?.driver,
    rideDetails: rideInfo
  })}
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={20} color="#fff" />
            <Text style={styles.trackButtonText}>Track Ride</Text>
          </TouchableOpacity>
          <TouchableOpacity 
  style={{
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
    marginBottom:20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  }}
  onPress={() => navigation.navigate('Rating', {
    driver: rideInfo?.driver,
    rideDetails: rideInfo
  })}
  activeOpacity={0.7}
>
  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    <View style={{
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#FFF8E1',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12
    }}>
      <Ionicons name="star" size={22} color="#FFB300" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4
      }}>
        Rate your experience
      </Text>
      <Text style={{
        fontSize: 13,
        color: '#666'
      }}>
        Help us improve by rating your ride with {rideInfo?.driver?.name || 'driver'}
      </Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#999" />
  </View>
</TouchableOpacity>
        </View>
      ) : (
        <>
          {!destination && showPickupCard && (
            <TouchableOpacity 
              style={styles.pickupCard}
              onPress={handleChangePickup}
              activeOpacity={0.8}
            >
              <View style={styles.pickupIcon}>
                <View style={styles.pickupIconCircle}>
                  <FontAwesome name="circle" size={14} color="#4CAF50" />
                </View>
              </View>
              <View style={styles.pickupDetails}>
                <Text style={styles.pickupLabel}>PICKUP</Text>
                <Text style={styles.pickupAddress}>{pickupLocation.address}</Text>
                <View style={styles.pickupInfo}>
                  <Ionicons name="time-outline" size={12} color="#666" />
                  <Text style={styles.pickupInfoText}> Ready for pickup</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.destinationCard}
            onPress={handleChangeDestination}
            activeOpacity={0.8}
          >
            <View style={styles.destinationIcon}>
              <View style={styles.destinationIconCircle}>
                <Ionicons name="flag" size={14} color="#FF6B6B" />
              </View>
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
          
          {destination && !selectedDriver && (
            <>
              <View style={styles.fareEstimateCard}>
                <View style={styles.fareEstimateHeader}>
                  <Text style={styles.fareEstimateTitle}>Estimated Fare</Text>
                  <View style={styles.fareEstimateDistanceBadge}>
                    <Ionicons name="navigate-outline" size={12} color="#666" />
                    <Text style={styles.fareEstimateDistance}>{rideFare?.distance || '8.5'} km</Text>
                  </View>
                </View>
                <Text style={styles.fareEstimateAmount}>₹{rideFare?.total || '152'}</Text>
                <View style={styles.fareEstimateDetails}>
                  <View style={styles.fareDetail}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.fareDetailText}> {rideFare?.estimatedTime || 25} min</Text>
                  </View>
                  <View style={styles.fareDetail}>
                    <Ionicons name="cash-outline" size={14} color="#666" />
                    <Text style={styles.fareDetailText}> Base ₹{rideFare?.base || 50}</Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.availableRidesHeader}>
                <View style={styles.availableRidesTitleContainer}>
                  <Text style={styles.availableRidesTitle}>Available Rides</Text>
                  <View style={styles.driverCountBadge}>
                    <Text style={styles.driverCount}>{nearbyDrivers.length}</Text>
                  </View>
                </View>
                <TouchableOpacity 
                  onPress={() => focusCameraOnPickup()}
                  style={styles.viewOnMapButton}
                >
                  <Ionicons name="map-outline" size={16} color="#4CAF50" />
                  <Text style={styles.viewOnMapText}>View Pickup</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.driversList}>
                {nearbyDrivers.map((driver) => (
                  <DriverItem 
                    key={driver.id} 
                    driver={driver} 
                    isSelected={selectedDriver?.id === driver.id}
                  />
                ))}
              </View>
            </>
          )}
          
          {selectedDriver && destination && !bookingConfirmed && (
            <>
              <View style={styles.selectedDriverCard}>
                <View style={styles.selectedDriverHeader}>
                  <View style={styles.selectedDriverInfo}>
                    <View style={styles.selectedDriverIcon}>
                      <FontAwesome name="car" size={24} color="#4CAF50" />
                    </View>
                    <View style={styles.selectedDriverTexts}>
                      <Text style={styles.selectedDriverName}>{selectedDriver.name}</Text>
                      <View style={styles.selectedDriverRating}>
                        <Ionicons name="star" size={14} color="#FFD700" />
                        <Text style={styles.selectedDriverRatingText}>{selectedDriver.rating}</Text>
                        <Text style={styles.selectedDriverVehicle}> • {selectedDriver.vehicle}</Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity 
                    onPress={() => setSelectedDriver(null)}
                    style={styles.unselectButton}
                  >
                    <Ionicons name="close" size={24} color="#999" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.selectedDriverDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <Ionicons name="time-outline" size={16} color="#666" />
                    </View>
                    <Text style={styles.detailLabel}>ETA:</Text>
                    <Text style={styles.detailValue}>{selectedDriver.eta}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <FontAwesome name="rupee" size={16} color="#666" />
                    </View>
                    <Text style={styles.detailLabel}>Fare:</Text>
                    <Text style={styles.detailValue}>₹{rideFare?.total || '152'}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailIcon}>
                      <FontAwesome name="users" size={16} color="#666" />
                    </View>
                    <Text style={styles.detailLabel}>Seats:</Text>
                    <Text style={styles.detailValue}>{selectedDriver.availableSeats}</Text>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.bookButton}
                  onPress={handleBookRide}
                  activeOpacity={0.8}
                >
                  <View style={styles.bookButtonContent}>
                    <Text style={styles.bookButtonText}>Book {selectedDriver.vehicle}</Text>
                    <View style={styles.bookButtonPriceContainer}>
                      <Text style={styles.bookButtonPrice}>₹{rideFare?.total || '152'}</Text>
                      <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          )}
        </>
      )}
    </BottomSheetScrollView>
  );

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

            {renderRoute()}
            {renderCurrentLocationMarker()}
            {renderPickupMarker()}
            {renderDestinationMarker()}
            {renderDriverMarkers()}
          </Mapbox.MapView>

          {/* Pickup Location Overlay */}
          {showPickupCard && !destination && (
            <TouchableOpacity 
              style={styles.pickupOverlay}
              onPress={handleChangePickup}
              activeOpacity={0.8}
            >
              <View style={styles.pickupOverlayContent}>
                <View style={styles.pickupOverlayIcon}>
                  <View style={styles.pickupOverlayIconCircle}>
                    <FontAwesome name="circle" size={12} color="#4CAF50" />
                  </View>
                </View>
                <View style={styles.pickupOverlayTexts}>
                  <Text style={styles.pickupOverlayLabel}>PICKUP</Text>
                  <Text style={styles.pickupOverlayAddress} numberOfLines={1}>
                    {pickupLocation.address}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#999" />
              </View>
            </TouchableOpacity>
          )}

          {/* Current Location Button */}
          <TouchableOpacity 
            style={styles.currentLocationButton}
            onPress={() => {
              getCurrentLocation();
              setTimeout(() => focusCameraOnPickup(), 500);
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="locate" size={22} color="#4CAF50" />
          </TouchableOpacity>
        </View>

        {/* Search Modal */}
        {showSearchModal && (
          <SearchModal
            searchMode={searchMode}
            currentLocation={currentLocation}
            onClose={() => setShowSearchModal(false)}
            onSelectLocation={handleSelectLocation}
          />
        )}

        {/* Bottom Sheet */}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          index={0}
          snapPoints={snapPoints}
          backgroundStyle={styles.bottomSheetBackground}
          handleStyle={styles.bottomSheetHandle}
          handleIndicatorStyle={styles.bottomSheetHandleIndicator}
          enablePanDownToClose={false}
        >
          {renderBottomSheetContent()}
        </BottomSheetModal>
      </View>
    </BottomSheetModalProvider>
  );
};

// Separate SearchModal Component with its own state
const SearchModal = ({ searchMode, currentLocation, onClose, onSelectLocation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Previous destinations
  const [previousDestinations] = useState([
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

  // Focus input when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?` +
        `proximity=${currentLocation.longitude},${currentLocation.latitude}&` +
        `access_token=${MAPBOX_ACCESS_TOKEN}&limit=8`
      );
      const data = await response.json();
      
      if (data.features) {
        const results = data.features.map(feature => ({
          id: feature.id,
          name: feature.text,
          address: feature.place_name,
          coordinates: feature.center
        }));
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
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
      setSearchResults(mockResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (text.length > 2) handleSearch();
    }, 500);
  };

  const handleLocationSelect = (location) => {
    onSelectLocation(location);
    onClose();
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.searchViewContainer}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.searchViewContent}>
        {/* Header */}
        <View style={styles.searchViewHeader}>
          <TouchableOpacity 
            onPress={onClose}
            style={styles.searchViewBackButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.searchViewTitle}>
            {searchMode === 'pickup' ? 'Change Pickup Location' : 'Select Destination'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Search Input */}
        <View style={styles.searchViewInputContainer}>
          <View style={styles.searchViewInputWrapper}>
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchViewInput}
              placeholder={
                searchMode === 'pickup' 
                  ? 'Search for pickup location...' 
                  : 'Search destination...'
              }
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearchChange}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoFocus={true}
              autoCorrect={false}
              autoCapitalize="none"
              blurOnSubmit={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity 
                onPress={() => setSearchQuery('')}
                style={styles.searchViewClearButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Current Location Option */}
        <TouchableOpacity 
          style={styles.searchViewCurrentLocation}
          onPress={() => {
            const location = {
              id: 'current',
              name: 'Current Location',
              address: currentLocation.address,
              coordinates: [currentLocation.longitude, currentLocation.latitude]
            };
            handleLocationSelect(location);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.searchViewCurrentLocationIcon}>
            <View style={styles.searchViewCurrentLocationIconCircle}>
              <Ionicons name="locate" size={20} color="#4CAF50" />
            </View>
          </View>
          <View style={styles.searchViewCurrentLocationTexts}>
            <Text style={styles.searchViewCurrentLocationTitle}>Use Current Location</Text>
            <Text style={styles.searchViewCurrentLocationAddress} numberOfLines={1}>
              {currentLocation.address}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#999" />
        </TouchableOpacity>

        {/* Search Results */}
        {isSearching ? (
          <View style={styles.searchViewLoading}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.searchViewLoadingText}>Searching...</Text>
          </View>
        ) : (
          <FlatList
            data={searchResults.length > 0 ? searchResults : previousDestinations}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              searchResults.length === 0 && searchQuery.length === 0 && (
                <Text style={styles.searchViewPreviousTitle}>
                  {searchMode === 'pickup' ? 'Recent Locations' : 'Previous Destinations'}
                </Text>
              )
            }
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.searchViewResultItem}
                onPress={() => handleLocationSelect(item)}
                activeOpacity={0.7}
              >
                <View style={styles.searchViewResultIcon}>
                  <Ionicons 
                    name={searchResults.length > 0 ? "location-outline" : "time-outline"} 
                    size={20} 
                    color="#666" 
                  />
                </View>
                <View style={styles.searchViewResultTexts}>
                  <Text style={styles.searchViewResultName}>{item.name}</Text>
                  <Text style={styles.searchViewResultAddress} numberOfLines={2}>
                    {item.address}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              searchQuery.length > 0 && !isSearching ? (
                <View style={styles.searchViewEmpty}>
                  <Ionicons name="search-outline" size={50} color="#ccc" />
                  <Text style={styles.searchViewEmptyText}>No results found</Text>
                  <Text style={styles.searchViewEmptySubtext}>Try a different search term</Text>
                </View>
              ) : null
            }
          />
        )}
      </View>
    </KeyboardAvoidingView>
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
    fontWeight: '500',
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
    shadowRadius: 3,
    elevation: 5,
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
    shadowRadius: 3,
    elevation: 5,
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
    shadowRadius: 3,
    elevation: 5,
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
    shadowRadius: 3,
    elevation: 5,
  },
  selectedDriverMarker: {
    borderColor: '#4CAF50',
    borderWidth: 4,
    backgroundColor: '#4CAF50',
  },
  animatingDriverMarker: {
    backgroundColor: '#4CAF50',
    borderColor: '#fff',
    borderWidth: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 8,
  },
  // Pickup Overlay on Map
  pickupOverlay: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 50,
    left: 12,
    right: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  pickupOverlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupOverlayIcon: {
    marginRight: 10,
  },
  pickupOverlayIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F9F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupOverlayTexts: {
    flex: 1,
  },
  pickupOverlayLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  pickupOverlayAddress: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    lineHeight: 20,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 16,
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  // Search View Styles (Full screen absolute)
  searchViewContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    zIndex: 1000,
  },
  searchViewContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  searchViewBackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  searchViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  searchViewInputContainer: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchViewInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchViewInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
    padding: 0,
    includeFontPadding: false,
  },
  searchViewClearButton: {
    padding: 6,
  },
  searchViewCurrentLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchViewCurrentLocationIcon: {
    marginRight: 14,
  },
  searchViewCurrentLocationIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchViewCurrentLocationTexts: {
    flex: 1,
  },
  searchViewCurrentLocationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  searchViewCurrentLocationAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  searchViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  searchViewLoadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  searchViewPreviousTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  searchViewResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  searchViewResultIcon: {
    marginRight: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchViewResultTexts: {
    flex: 1,
  },
  searchViewResultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  searchViewResultAddress: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  searchViewEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  searchViewEmptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginTop: 12,
  },
  searchViewEmptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  // Bottom Sheet Styles
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  bottomSheetHandle: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  bottomSheetHandleIndicator: {
    backgroundColor: '#e0e0e0',
    width: 48,
    height: 5,
    borderRadius: 2.5,
  },
  bottomSheetContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  // Pickup Card
  pickupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  pickupIcon: {
    marginRight: 12,
  },
  pickupIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F9F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickupDetails: {
    flex: 1,
  },
  pickupLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  pickupAddress: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    lineHeight: 22,
  },
  pickupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickupInfoText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  // Destination Card
  destinationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  destinationIcon: {
    marginRight: 12,
  },
  destinationIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationDetails: {
    flex: 1,
  },
  destinationLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  destinationPlaceholder: {
    fontSize: 17,
    color: '#999',
    paddingVertical: 4,
    fontWeight: '400',
  },
  destinationAddress: {
    fontSize: 17,
    color: '#999',
    paddingVertical: 4,
    fontWeight: '400',
  },
  destinationAddress: {
    fontSize: 15,
    color: '#333',
    marginTop: 4,
    fontWeight: '500',
    lineHeight: 20,
  },
  // Recent Trips
  recentTripsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  recentTripsList: {
    gap: 12,
  },
  recentTripItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  recentTripIcon: {
    marginRight: 12,
  },
  recentTripIconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentTripInfo: {
    flex: 1,
  },
  recentTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentTripDate: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  recentTripPriceContainer: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recentTripPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#388E3C',
  },
  recentTripRoute: {
    fontSize: 15,
    color: '#333',
    marginBottom: 10,
    fontWeight: '500',
    lineHeight: 20,
  },
  recentTripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentTripDriver: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    marginRight: 10,
  },
  recentTripRating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  recentTripRatingText: {
    fontSize: 12,
    color: '#FF8F00',
    fontWeight: '600',
    marginLeft: 3,
  },
  // Fare Estimate
  fareEstimateCard: {
    backgroundColor: '#E8F5E9',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  fareEstimateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fareEstimateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  fareEstimateDistanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  fareEstimateDistance: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 6,
  },
  fareEstimateAmount: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 12,
  },
  fareEstimateDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  fareDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  fareDetailText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 8,
  },
  // Available Rides
  availableRidesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  availableRidesTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableRidesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 10,
  },
  driverCountBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  driverCount: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  viewOnMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#F0F9F0',
  },
  viewOnMapText: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 6,
  },
  driversList: {
    marginBottom: 20,
    gap: 12,
  },
  // Driver Item
  driverItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedDriverItem: {
    borderColor: '#4CAF50',
    borderWidth: 2,
    backgroundColor: '#F0F9F0',
    shadowColor: '#4CAF50',
    shadowOpacity: 0.1,
  },
  driverIconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  driverIconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
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
  driverNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#FF8F00',
    fontWeight: '600',
    marginLeft: 2,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  etaBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  vehicleDetails: {
    marginBottom: 8,
  },
  vehicleText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  vehicleTags: {
    flexDirection: 'row',
    gap: 8,
  },
  vehicleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  vehicleTagText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  driverFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  licenseContainer: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  licenseText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  driverPrice: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 80,
  },
  priceText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  priceRangeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priceRangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Selected Driver Card
  selectedDriverCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
  selectedDriverIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  selectedDriverTexts: {
    flex: 1,
  },
  selectedDriverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  selectedDriverRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedDriverRatingText: {
    fontSize: 15,
    color: '#666',
    marginLeft: 4,
    fontWeight: '500',
  },
  selectedDriverVehicle: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  unselectButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  selectedDriverDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 6,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  // Book Button
  bookButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    overflow: 'hidden',
  },
  bookButtonContent: {
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  bookButtonPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookButtonPrice: {
    fontSize: 24,
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
  },
  rideId: {
    fontSize: 15,
    color: '#666',
    marginTop: 6,
    fontWeight: '500',
  },
  rideDetailsCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  driverDetailsSection: {
    marginBottom: 20,
  },
  driverProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  driverProfileInfo: {
    flex: 1,
  },
  driverProfileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  driverProfileRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverProfileRatingText: {
    marginLeft: 4,
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  vehicleDetailsLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  vehicleTextLarge: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  vehicleDetail: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  vehicleDetailText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  routeDetails: {
    marginBottom: 20,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  routeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 14,
    marginTop: 4,
  },
  routeTexts: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  routeAddress: {
    fontSize: 15,
    color: '#333',
    lineHeight: 20,
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#e0e0e0',
    marginLeft: 6,
    marginBottom: 10,
  },
  fareBreakdown: {
    marginBottom: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  fareTitle: {
    fontSize: 18,
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
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  fareValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  totalFareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  totalFareLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  totalFareValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  paymentSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  selectedPaymentOption: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  paymentOptionText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  selectedPaymentOptionText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  // Driver Progress Section
  driverProgressSection: {
    marginTop: 20,
    padding: 18,
    backgroundColor: '#F0F9F0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  driverProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  driverProgressBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverProgressBadgeText: {
    fontSize: 18,
    color: '#fff',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  progressBarLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressBarLabelStart: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  progressBarLabelEnd: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  driverProgressText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  trackButton: {
    backgroundColor: '#4CAF50',
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  trackButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
});
export default MapboxLocationScreen; 