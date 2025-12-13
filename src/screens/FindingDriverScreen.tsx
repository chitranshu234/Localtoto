import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from '../components/Button';
const { width } = Dimensions.get('window');
const FindingDriverScreen = ({ navigation }: any) => {
    const pulse1 = useRef(new Animated.Value(0)).current;
    const pulse2 = useRef(new Animated.Value(0)).current;
    const pulse3 = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        const createPulse = (animValue: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(animValue, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animValue, {
                        toValue: 0,
                        duration: 0,
                        useNativeDriver: true,
                    }),
                ])
            );
        };
        Animated.parallel([
            createPulse(pulse1, 0),
            createPulse(pulse2, 400),
            createPulse(pulse3, 800),
        ]).start();
    }, [pulse1, pulse2, pulse3]);
    const handleCancel = () => {
        console.log('Ride request cancelled');
        navigation.goBack();
    };
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <TouchableOpacity
                style={styles.backButton}
                onPress={handleCancel}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
                <Icon name="arrow-left" size={20} color="#2D7C4F" />
            </TouchableOpacity>
            <View style={styles.mapPlaceholder}>
                <View style={styles.pulseContainer}>
                    <Animated.View
                        style={[
                            styles.pulse,
                            {
                                opacity: pulse1.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.6, 0],
                                }),
                                transform: [{
                                    scale: pulse1.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 3],
                                    }),
                                }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.pulse,
                            {
                                opacity: pulse2.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.6, 0],
                                }),
                                transform: [{
                                    scale: pulse2.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 3],
                                    }),
                                }],
                            },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.pulse,
                            {
                                opacity: pulse3.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.6, 0],
                                }),
                                transform: [{
                                    scale: pulse3.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [1, 3],
                                    }),
                                }],
                            },
                        ]}
                    />
                    <View style={styles.centerPin}>
                        <Icon name="map-marker" size={36} color="#2D7C4F" />
                    </View>
                </View>
                <Text style={styles.searchingText}>Finding your driver...</Text>
                <Text style={styles.searchingSubtext}>Please wait</Text>
            </View>
            <View style={styles.bottomCard}>
                <View style={styles.loadingContainer}>
                    <View style={styles.loadingDots}>
                        <View style={[styles.dot, styles.dotAnimated]} />
                        <View style={[styles.dot, styles.dotAnimated]} />
                        <View style={[styles.dot, styles.dotAnimated]} />
                    </View>
                </View>
                <View style={styles.rideInfo}>
                    <View style={styles.vehicleRow}>
                        <View style={styles.vehicleIconCircle}>
                            <Icon name="motorcycle" size={24} color="#2D7C4F" />
                        </View>
                        <View style={styles.vehicleDetails}>
                            <Text style={styles.vehicleName}>Bike</Text>
                            <Text style={styles.vehiclePrice}>₹25</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.tripDetails}>
                        <View style={styles.locationRow}>
                            <View style={styles.greenDot} />
                            <Text style={styles.locationText}>Current Location</Text>
                        </View>
                        <View style={styles.locationRow}>
                            <View style={styles.redDot} />
                            <Text style={styles.locationText}>Central Mall</Text>
                        </View>
                    </View>
                </View>
                <Text style={styles.waitTime}>Estimated wait: 2-3 minutes</Text>
                <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => navigation.navigate('DriverFoundTabs')}
                >
                    <Text style={styles.confirmButtonText}>Confirm Ride</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                    <Text style={styles.cancelButtonText}>Cancel Request</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
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
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseContainer: {
        width: 150,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    pulse: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#2D7C4F',
    },
    centerPin: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    searchingText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2D7C4F',
        marginBottom: 8,
    },
    searchingSubtext: {
        fontSize: 15,
        color: '#666',
    },
    bottomCard: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingVertical: 25,
        paddingHorizontal: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    loadingContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    loadingDots: {
        flexDirection: 'row',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#2D7C4F',
        marginHorizontal: 4,
    },
    dotAnimated: {},
    rideInfo: {
        marginBottom: 20,
    },
    vehicleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
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
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    vehiclePrice: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D7C4F',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 15,
    },
    tripDetails: {
        gap: 12,
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
        fontSize: 14,
        color: '#666',
    },
    waitTime: {
        fontSize: 14,
        color: '#2D7C4F',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 15,
    },
    confirmButton: {
        backgroundColor: '#2D7C4F',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    cancelButton: {
        borderWidth: 2,
        borderColor: '#EB5757',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EB5757',
    },
});
export default FindingDriverScreen;