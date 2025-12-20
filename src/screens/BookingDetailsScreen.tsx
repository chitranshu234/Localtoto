import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    ScrollView,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

type RideType = 'solo' | 'shared' | 'schedule';

interface BookingDetailsScreenProps {
    navigation: any;
    route?: any;
}

const BookingDetailsScreen: React.FC<BookingDetailsScreenProps> = ({ navigation, route }) => {
    const [selectedRide, setSelectedRide] = useState<RideType>('solo');

    // Get pickup and dropoff from route params or use defaults
    const pickup = route?.params?.pickup || 'Current Location';
    const dropoff = route?.params?.dropoff || 'Central Mall';

    const rideOptions = [
        {
            id: 'solo' as RideType,
            name: 'Solo',
            time: '76 mins',
            price: '₹273',
        },
        {
            id: 'shared' as RideType,
            name: 'Shared',
            time: '76 mins',
            price: '₹172',
        },
        {
            id: 'schedule' as RideType,
            name: 'Schedule',
            subtitle: 'Book for later',
            price: '₹273',
        },
    ];

    const handleBookRide = () => {
        navigation.navigate('FindingDriverTabs', {
            rideType: selectedRide,
            pickup,
            dropoff,
        });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#D1E7DD" translucent />

            {/* Map/Background Area with Back Button */}
            <View style={styles.mapArea}>
                {/* Back Button - positioned below status bar */}
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Icon name="arrow-left" size={18} color="#333" />
                </TouchableOpacity>

                {/* Location Details Card */}
                <View style={styles.locationCard}>
                    {/* Pickup Location */}
                    <View style={styles.locationSection}>
                        <Text style={styles.locationLabel}>PICKUP</Text>
                        <View style={styles.locationAddressRow}>
                            <View style={styles.greenDot} />
                            <Text style={styles.locationAddress}>{pickup}</Text>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Dropoff Location */}
                    <View style={styles.locationSection}>
                        <Text style={styles.locationLabel}>DROP</Text>
                        <View style={styles.locationAddressRow}>
                            <View style={styles.redDot} />
                            <Text style={styles.locationAddress}>{dropoff}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Card - Ride Options */}
            <View style={styles.bottomCard}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={styles.sectionTitle}>Choose Ride Type</Text>

                    {/* Ride Options */}
                    {rideOptions.map((option) => (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.rideOption,
                                selectedRide === option.id && styles.rideOptionSelected,
                            ]}
                            onPress={() => setSelectedRide(option.id)}
                        >
                            <View style={styles.rideOptionLeft}>
                                <Text style={[
                                    styles.rideOptionName,
                                    selectedRide === option.id && styles.rideOptionNameSelected,
                                ]}>
                                    {option.name}
                                </Text>
                                {option.time && (
                                    <Text style={styles.rideOptionTime}>{option.time}</Text>
                                )}
                                {option.subtitle && (
                                    <Text style={styles.rideOptionTime}>{option.subtitle}</Text>
                                )}
                            </View>
                            <Text style={[
                                styles.rideOptionPrice,
                                selectedRide === option.id && styles.rideOptionPriceSelected,
                            ]}>
                                {option.price}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {/* Book Ride Button */}
                    <TouchableOpacity style={styles.bookButton} onPress={handleBookRide}>
                        <Text style={styles.bookButtonText}>Book Ride</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        </View>
    );
};

const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 44;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#D1E7DD',
    },
    mapArea: {
        flex: 1,
        backgroundColor: '#D1E7DD',
        paddingTop: STATUSBAR_HEIGHT,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 16,
        marginTop: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    locationCard: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 16,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    locationSection: {
    },
    locationLabel: {
        fontSize: 11,
        color: '#9CA3AF',
        fontWeight: '500',
        letterSpacing: 0.5,
        marginBottom: 6,
        marginLeft: 22,
    },
    locationAddressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    greenDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#22C55E',
        marginRight: 12,
    },
    redDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        marginRight: 12,
    },
    locationAddress: {
        flex: 1,
        fontSize: 16,
        color: '#1F2937',
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 16,
    },
    bottomCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 16,
    },
    rideOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        marginBottom: 12,
        backgroundColor: '#FFFFFF',
    },
    rideOptionSelected: {
        borderColor: '#22C55E',
        backgroundColor: '#F0FDF4',
    },
    rideOptionLeft: {
        flex: 1,
    },
    rideOptionName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    rideOptionNameSelected: {
        color: '#166534',
    },
    rideOptionTime: {
        fontSize: 13,
        color: '#6B7280',
    },
    rideOptionPrice: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    rideOptionPriceSelected: {
        color: '#166534',
    },
    bookButton: {
        backgroundColor: '#22C55E',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 8,
    },
    bookButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default BookingDetailsScreen;
