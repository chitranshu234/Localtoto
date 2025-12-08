import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import LocationService from '../services/LocationService';
const { width } = Dimensions.get('window');
const MOCK_RESULTS = [
    { id: '1', title: 'Central Mall', address: '123 Main St, City Center' },
    { id: '2', title: 'City Park', address: '45 Park Ave, Green District' },
    { id: '3', title: 'Train Station', address: 'Station Road, North Side' },
    { id: '4', title: 'Grand Hotel', address: '88 Luxury Lane, Downtown' },
];
const SAVED_LOCATIONS = [
    { id: 'home', title: 'Home', icon: 'home' },
    { id: 'work', title: 'Work', icon: 'briefcase' },
    { id: 'gym', title: 'Gym', icon: 'heartbeat' },
];
const SearchScreen = ({ navigation, route }: any) => {
    const insets = useSafeAreaInsets();
    const [pickupQuery, setPickupQuery] = useState('');
    const [dropQuery, setDropQuery] = useState('');
    const [activeInput, setActiveInput] = useState(route?.params?.type || 'drop');
    // Check location permission when screen loads (Ola/Uber style)
    useEffect(() => {
        checkLocationPermission();
    }, []);
    const checkLocationPermission = async () => {
        const hasPermission = await LocationService.checkPermission();
        if (!hasPermission) {
            const granted = await LocationService.requestPermission();
            if (!granted) {
                LocationService.showPermissionDeniedAlert();
            }
        }
    };
    const renderResultItem = ({ item }: { item: typeof MOCK_RESULTS[0] }) => (
        <TouchableOpacity
            style={styles.resultItem}
            onPress={() => navigation.navigate('Confirm')}
        >
            <View style={styles.iconContainer}>
                <Icon name="map-marker" size={20} color="#2D7C4F" />
            </View>
            <View style={styles.resultTextContainer}>
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultAddress}>{item.address}</Text>
            </View>
        </TouchableOpacity>
    );
    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Icon name="arrow-left" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Where to?</Text>
            </View>
            <View style={styles.searchContainer}>
                {/* Pickup Input */}
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setActiveInput('pickup')}
                >
                    <View style={[
                        styles.searchBar,
                        activeInput === 'pickup' && styles.activeSearchBar
                    ]}>
                        <View style={styles.greenDot} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Pickup location"
                            placeholderTextColor="#999"
                            value={pickupQuery}
                            onChangeText={setPickupQuery}
                            onFocus={() => setActiveInput('pickup')}
                        />
                    </View>
                </TouchableOpacity>
                {/* Drop Input */}
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setActiveInput('drop')}
                >
                    <View style={[
                        styles.searchBar,
                        { marginTop: 12 },
                        activeInput === 'drop' && styles.activeSearchBar
                    ]}>
                        <View style={styles.redDot} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Where to?"
                            placeholderTextColor="#999"
                            value={dropQuery}
                            onChangeText={setDropQuery}
                            onFocus={() => setActiveInput('drop')}
                        />
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.savedLocationsContainer}>
                {SAVED_LOCATIONS.map((loc) => (
                    <TouchableOpacity
                        key={loc.id}
                        style={styles.savedLocationItem}
                        onPress={() => navigation.navigate('Confirm')}
                    >
                        <View style={styles.savedIconContainer}>
                            <Icon name={loc.icon} size={22} color="#2D7C4F" />
                        </View>
                        <Text style={styles.savedTitle}>{loc.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={styles.resultsContainer}>
                <Text style={styles.sectionTitle}>Recent Locations</Text>
                <FlatList
                    data={MOCK_RESULTS}
                    renderItem={renderResultItem}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginLeft: 20,
    },
    searchContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    activeSearchBar: {
        borderColor: '#219653',
        borderWidth: 2,
    },
    greenDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#219653',
        marginRight: 12,
    },
    redDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EB5757',
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    savedLocationsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom: 25,
    },
    savedLocationItem: {
        alignItems: 'center',
    },
    savedIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    savedTitle: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
    },
    resultsContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F5F5',
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    resultTextContainer: {
        flex: 1,
    },
    resultTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    resultAddress: {
        fontSize: 14,
        color: '#888',
    },
});
export default SearchScreen;