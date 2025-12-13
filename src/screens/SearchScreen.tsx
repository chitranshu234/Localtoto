import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    FlatList,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import LocationService from '../services/LocationService';

const MOCK_RESULTS = [
    { id: '1', title: 'Central Mall', address: '123 Main St, City Center', latitude: 28.5355, longitude: 77.3910 },
    { id: '2', title: 'City Park', address: '45 Park Ave, Green District', latitude: 28.5799, longitude: 77.3214 },
    { id: '3', title: 'Train Station', address: 'Station Road, North Side', latitude: 28.6619, longitude: 77.2273 },
    { id: '4', title: 'Grand Hotel', address: '88 Luxury Lane, Downtown', latitude: 28.5700, longitude: 77.3218 },
];

const SAVED_LOCATIONS = [
    { id: 'home', title: 'Home', icon: 'home', latitude: 28.5355, longitude: 77.3910 },
    { id: 'work', title: 'Work', icon: 'briefcase', latitude: 28.5799, longitude: 77.3214 },
    { id: 'gym', title: 'Gym', icon: 'heartbeat', latitude: 28.5700, longitude: 77.3218 },
];

const SearchScreen = ({ navigation, route }: any) => {
    const [pickupQuery, setPickupQuery] = useState('');
    const [dropQuery, setDropQuery] = useState('');
    const [activeInput, setActiveInput] = useState(route?.params?.type || 'drop');
    const [currentLocation, setCurrentLocation] = useState<{
        latitude: number;
        longitude: number;
        accuracy?: number | null;
        altitude?: number | null;
        heading?: number | null;
        speed?: number | null;
    } | null>(null);


    useEffect(() => {
        checkPermission();
        getCurrentLocation();
    }, []);

    const checkPermission = async () => {
        const p = await LocationService.checkPermission();
        if (!p) {
            const granted = await LocationService.requestPermission();
            if (!granted) LocationService.showPermissionDeniedAlert();
        }
    };

    const getCurrentLocation = async () => {
        try {
            const loc = await LocationService.getCurrentLocation();
            if (loc) {
                setCurrentLocation(loc);
                setPickupQuery("Current Location");
            }
        } catch (e) {
            console.log(e);
        }
    };

    const goToFindingDriver = (type: 'pickup' | 'drop', location?: any) => {
        // Navigate to confirm screen
        navigation.navigate('ConfirmTabs', {
            type,
            location: location || currentLocation,
        });
    };

    // Handle search/go button press for destination
    const handleSearch = () => {
        if (dropQuery.trim()) {
            navigation.navigate('ConfirmTabs', {
                pickupLocation: currentLocation,
                pickupQuery: pickupQuery || 'Current Location',
                dropQuery: dropQuery,
            });
        }
    };

    const renderResultItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => {
                setDropQuery(item.title);
                navigation.navigate("ConfirmTabs", {
                    pickupLocation: currentLocation,
                    dropLocation: item
                });
            }}
        >
            <View style={styles.iconContainer}>
                <Icon name="map-marker" size={20} color="#2D7C4F" />
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultAddress}>{item.address}</Text>
            </View>

            <TouchableOpacity onPress={() => goToFindingDriver("drop", item)}>
                <Icon name="map-o" size={18} color="#2D7C4F" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* MAIN CONTENT */}
            <View style={styles.container}>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Icon name="arrow-left" size={20} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Where to?</Text>
                </View>

                {/* Pickup - Editable */}
                <View style={styles.searchBar}>
                    <View style={styles.greenDot} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Pickup location"
                        placeholderTextColor="#999"
                        value={pickupQuery}
                        onChangeText={setPickupQuery}
                    />
                    <Icon name="map-marker" size={18} color="#2D7C4F" />
                </View>

                {/* Drop - Editable with search action */}
                <View style={[styles.searchBar, { marginTop: 12 }]}>
                    <View style={styles.redDot} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Where to?"
                        placeholderTextColor="#999"
                        value={dropQuery}
                        onChangeText={setDropQuery}
                        returnKeyType="search"
                        onSubmitEditing={handleSearch}
                    />
                    <TouchableOpacity onPress={handleSearch}>
                        <Icon name="search" size={18} color="#2D7C4F" />
                    </TouchableOpacity>
                </View>

                {/* Saved */}
                <View style={styles.savedLocationsContainer}>
                    {SAVED_LOCATIONS.map(loc => (
                        <TouchableOpacity key={loc.id} style={styles.savedLocationItem}>
                            <View style={styles.savedIconContainer}>
                                <Icon name={loc.icon} size={22} color="#2D7C4F" />
                            </View>
                            <Text style={styles.savedTitle}>{loc.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent */}
                <Text style={styles.sectionTitle}>Recent Locations</Text>
                <FlatList
                    data={MOCK_RESULTS}
                    renderItem={renderResultItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                />

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

    /* HEADER */
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

    /* SEARCH BARS */
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        height: 50,
        paddingHorizontal: 15,
        borderRadius: 12,
        elevation: 4,
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: "#EEE",
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#219653",
        marginRight: 12,
    },
    redDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#EB5757",
        marginRight: 12,
    },
    locationText: {
        flex: 1,
        fontSize: 16,
        color: "#333",
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: "#333",
        paddingVertical: 0,
    },

    /* SAVED */
    savedLocationsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
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

    /* RESULTS */
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
        borderBottomWidth: 1,
        borderBottomColor: "#EEE",
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#EEE",
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


});

export default SearchScreen;
