import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    FlatList,
    TextInput,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mapbox Access Token (same as Map.tsx)
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiYWRhcnNobWlzaHJhNTYzIiwiYSI6ImNtZjlocXQydzBrZmYycnNqNGs5OTk3cXUifQ.jwUMhX7pbAGl7fI9rXt7mw';

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

const RECENT_ADDRESSES_KEY = '@localtoto_recent_addresses';

const SearchScreen = ({ navigation, route }: any) => {
    // Get existing locations from params (when editing from ConfirmScreen)
    const existingPickup = route?.params?.pickup;
    const existingDropoff = route?.params?.dropoff;
    const editType = route?.params?.type; // 'pickup' or 'drop'

    const [pickupQuery, setPickupQuery] = useState(
        existingPickup?.address || 'Current Location'
    );
    const [dropQuery, setDropQuery] = useState(
        existingDropoff?.address || ''
    );
    const [activeInput, setActiveInput] = useState<'pickup' | 'drop'>(editType || 'drop');
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentAddresses, setRecentAddresses] = useState<LocationSuggestion[]>([]);
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
        address: string;
    } | null>(null);
    const [pickupLocation, setPickupLocation] = useState<LocationSuggestion | null>(
        existingPickup ? {
            id: 'existing-pickup',
            title: existingPickup.address?.split(',')[0] || 'Pickup',
            address: existingPickup.address,
            latitude: existingPickup.latitude,
            longitude: existingPickup.longitude,
        } : null
    );
    const [dropLocation, setDropLocation] = useState<LocationSuggestion | null>(
        existingDropoff ? {
            id: 'existing-dropoff',
            title: existingDropoff.address?.split(',')[0] || 'Drop',
            address: existingDropoff.address,
            latitude: existingDropoff.latitude,
            longitude: existingDropoff.longitude,
        } : null
    );

    useEffect(() => {
        requestPermissionAndGetLocation();
        loadRecentAddresses();
    }, []);

    // Load recent addresses from AsyncStorage
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

    // Save a new address to recent addresses
    const saveRecentAddress = async (location: LocationSuggestion) => {
        try {
            // Don't save Current Location
            if (location.id === 'current' || location.title === 'Current Location') {
                return;
            }

            const stored = await AsyncStorage.getItem(RECENT_ADDRESSES_KEY);
            let addresses: LocationSuggestion[] = stored ? JSON.parse(stored) : [];

            // Remove duplicate if exists
            addresses = addresses.filter(addr => addr.address !== location.address);

            // Add to beginning (most recent first)
            addresses.unshift(location);

            // Keep only last 5
            addresses = addresses.slice(0, 5);

            await AsyncStorage.setItem(RECENT_ADDRESSES_KEY, JSON.stringify(addresses));
            setRecentAddresses(addresses);
        } catch (error) {
            console.error('Error saving recent address:', error);
        }
    };

    const requestPermissionAndGetLocation = async () => {
        try {
            if (Platform.OS === 'android') {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                    Alert.alert('Permission denied', 'Location permission is required');
                    return;
                }
            }
            getCurrentLocation();
        } catch (err) {
            console.warn(err);
        }
    };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const address = await reverseGeocode(latitude, longitude);

                const location = {
                    latitude,
                    longitude,
                    address: address || 'Current Location',
                };
                setCurrentLocation(location);
                // Only set pickup if no existing pickup was passed
                if (!existingPickup) {
                    setPickupLocation({
                        id: 'current',
                        title: 'Current Location',
                        address: address || 'Your current location',
                        latitude,
                        longitude,
                    });
                    setPickupQuery('Current Location');
                }
            },
            (error) => {
                console.log('Error getting location:', error);
                // Use default location
                setCurrentLocation({
                    latitude: 29.0333,
                    longitude: 79.4833,
                    address: 'Current Location',
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 10000,
            }
        );
    };

    const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
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

    // Debounced search function
    const searchPlaces = useCallback(async (query: string) => {
        if (query.length < 2 || query === 'Current Location') {
            setSuggestions([]);
            return;
        }

        setIsSearching(true);
        try {
            // Get proximity from current location for better results
            const proximity = currentLocation
                ? `${currentLocation.longitude},${currentLocation.latitude}`
                : '79.4833,29.0333'; // Default to Pantnagar area

            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
                `access_token=${MAPBOX_ACCESS_TOKEN}&` +
                `proximity=${proximity}&` +
                `country=IN&` +
                `limit=5&` +
                `types=poi,address,place,locality`
            );
            const data = await response.json();

            if (data.features) {
                const formattedSuggestions: LocationSuggestion[] = data.features.map((feature: any, index: number) => ({
                    id: feature.id || `${index}`,
                    title: feature.text || feature.place_name.split(',')[0],
                    address: feature.place_name,
                    latitude: feature.center[1],
                    longitude: feature.center[0],
                }));
                setSuggestions(formattedSuggestions);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSuggestions([]);
        } finally {
            setIsSearching(false);
        }
    }, [currentLocation]);

    // Handle text input changes with debounce
    useEffect(() => {
        const query = activeInput === 'pickup' ? pickupQuery : dropQuery;
        const timeoutId = setTimeout(() => {
            searchPlaces(query);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [pickupQuery, dropQuery, activeInput, searchPlaces]);

    const handleSelectSuggestion = (suggestion: LocationSuggestion) => {
        if (activeInput === 'pickup') {
            setPickupQuery(suggestion.title);
            setPickupLocation(suggestion);
        } else {
            setDropQuery(suggestion.title);
            setDropLocation(suggestion);
        }
        setSuggestions([]);
        Keyboard.dismiss();

        // If both locations are set, navigate to ConfirmScreen
        if (activeInput === 'drop' && pickupLocation) {
            saveRecentAddress(suggestion); // Save dropoff to recent
            navigateToConfirm(pickupLocation, suggestion);
        } else if (activeInput === 'pickup' && dropLocation) {
            saveRecentAddress(suggestion); // Save pickup to recent
            navigateToConfirm(suggestion, dropLocation);
        }
    };

    const handleSavedLocationPress = (savedLoc: typeof SAVED_LOCATIONS[0]) => {
        const location: LocationSuggestion = {
            id: savedLoc.id,
            title: savedLoc.title,
            address: savedLoc.title,
            latitude: savedLoc.latitude,
            longitude: savedLoc.longitude,
        };

        if (activeInput === 'pickup') {
            setPickupQuery(savedLoc.title);
            setPickupLocation(location);
        } else {
            setDropQuery(savedLoc.title);
            setDropLocation(location);
            // Navigate if pickup is set
            if (pickupLocation) {
                navigateToConfirm(pickupLocation, location);
            }
        }
    };

    const navigateToConfirm = (pickup: LocationSuggestion, drop: LocationSuggestion) => {
        navigation.navigate('ConfirmTabs', {
            pickup: {
                address: pickup.address,
                latitude: pickup.latitude,
                longitude: pickup.longitude,
            },
            dropoff: {
                address: drop.address,
                latitude: drop.latitude,
                longitude: drop.longitude,
            },
        });
    };

    const handleSearch = () => {
        if (dropQuery.trim() && pickupLocation) {
            // If drop location is selected, use it; otherwise create from query
            if (dropLocation) {
                navigateToConfirm(pickupLocation, dropLocation);
            } else if (suggestions.length > 0) {
                // Use first suggestion
                handleSelectSuggestion(suggestions[0]);
            }
        }
    };

    const handleUseCurrentLocation = () => {
        if (currentLocation) {
            const location: LocationSuggestion = {
                id: 'current',
                title: 'Current Location',
                address: currentLocation.address,
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
            };
            setPickupQuery('Current Location');
            setPickupLocation(location);
            setSuggestions([]);
            setActiveInput('drop');
        }
    };

    const renderSuggestionItem = ({ item }: { item: LocationSuggestion }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => handleSelectSuggestion(item)}
        >
            <View style={styles.iconContainer}>
                <Icon name="map-marker" size={20} color="#2D7C4F" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultAddress} numberOfLines={1}>{item.address}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={20} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Where to?</Text>
                </View>

                {/* Pickup Input */}
                <TouchableOpacity
                    style={[
                        styles.searchBar,
                        activeInput === 'pickup' && styles.activeSearchBar
                    ]}
                    onPress={() => setActiveInput('pickup')}
                    activeOpacity={1}
                >
                    <View style={styles.greenDot} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Pickup location"
                        placeholderTextColor="#999"
                        value={pickupQuery}
                        onChangeText={(text) => {
                            setPickupQuery(text);
                            setActiveInput('pickup');
                        }}
                        onFocus={() => setActiveInput('pickup')}
                    />
                    {pickupQuery === 'Current Location' ? (
                        <Ionicons name="locate" size={18} color="#2D7C4F" />
                    ) : (
                        <TouchableOpacity onPress={handleUseCurrentLocation}>
                            <Ionicons name="locate-outline" size={18} color="#2D7C4F" />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                {/* Drop Input */}
                <TouchableOpacity
                    style={[
                        styles.searchBar,
                        { marginTop: 12 },
                        activeInput === 'drop' && styles.activeSearchBar
                    ]}
                    onPress={() => setActiveInput('drop')}
                    activeOpacity={1}
                >
                    <View style={styles.redDot} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Where to?"
                        placeholderTextColor="#999"
                        value={dropQuery}
                        onChangeText={(text) => {
                            setDropQuery(text);
                            setActiveInput('drop');
                        }}
                        onFocus={() => setActiveInput('drop')}
                        returnKeyType="search"
                        onSubmitEditing={handleSearch}
                        autoFocus={activeInput === 'drop'}
                    />
                    {isSearching ? (
                        <ActivityIndicator size="small" color="#2D7C4F" />
                    ) : (
                        <TouchableOpacity onPress={handleSearch}>
                            <Icon name="search" size={18} color="#2D7C4F" />
                        </TouchableOpacity>
                    )}
                </TouchableOpacity>

                {/* Suggestions List */}
                {suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        <FlatList
                            data={suggestions}
                            renderItem={renderSuggestionItem}
                            keyExtractor={(item) => item.id}
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        />
                    </View>
                )}

                {/* Show saved locations and recent when no suggestions */}
                {suggestions.length === 0 && (
                    <>
                        {/* Saved Locations */}
                        <View style={styles.savedLocationsContainer}>
                            {SAVED_LOCATIONS.map(loc => (
                                <TouchableOpacity
                                    key={loc.id}
                                    style={styles.savedLocationItem}
                                    onPress={() => handleSavedLocationPress(loc)}
                                >
                                    <View style={styles.savedIconContainer}>
                                        <Icon name={loc.icon} size={22} color="#2D7C4F" />
                                    </View>
                                    <Text style={styles.savedTitle}>{loc.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Use Current Location Button */}
                        {activeInput === 'pickup' && (
                            <TouchableOpacity
                                style={styles.currentLocationBtn}
                                onPress={handleUseCurrentLocation}
                            >
                                <Ionicons name="locate" size={20} color="#2D7C4F" />
                                <Text style={styles.currentLocationText}>Use current location</Text>
                            </TouchableOpacity>
                        )}

                        {/* Recent Addresses */}
                        <Text style={styles.sectionTitle}>Recent Addresses</Text>
                        {recentAddresses.length > 0 ? (
                            <FlatList
                                data={recentAddresses}
                                renderItem={renderSuggestionItem}
                                keyExtractor={(item, index) => `recent-${item.id}-${index}`}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            <Text style={styles.noRecentText}>No recent addresses yet. Your searched locations will appear here.</Text>
                        )}
                    </>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 24,
        marginLeft: 20,
        fontWeight: "bold",
        color: "#333",
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        height: 50,
        paddingHorizontal: 15,
        borderRadius: 12,
        elevation: 2,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#EEE",
    },
    activeSearchBar: {
        borderColor: "#219653",
        borderWidth: 2,
    },
    greenDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#219653",
        marginRight: 12,
    },
    redDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: "#EB5757",
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        paddingVertical: 0,
    },
    suggestionsContainer: {
        marginTop: 10,
        backgroundColor: '#FFF',
        borderRadius: 12,
        elevation: 3,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        maxHeight: 300,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    savedLocationsContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginVertical: 25,
    },
    savedLocationItem: {
        alignItems: "center",
    },
    savedIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
    },
    savedTitle: {
        marginTop: 6,
        fontSize: 13,
        color: "#333",
    },
    currentLocationBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#F0FFF4',
        borderRadius: 12,
    },
    currentLocationText: {
        marginLeft: 12,
        fontSize: 16,
        color: '#219653',
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    resultItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 15,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F0FFF4",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 2,
    },
    resultAddress: {
        fontSize: 13,
        color: "#777",
    },
    noRecentText: {
        fontSize: 14,
        color: "#999",
        textAlign: "center",
        paddingVertical: 20,
        fontStyle: "italic",
    },
});

export default SearchScreen;
