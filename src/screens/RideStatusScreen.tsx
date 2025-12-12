import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Animated,
    StatusBar,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/Button';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
    Onboarding: undefined;
    Location: undefined;
    RideStatus: undefined;
    Rating: undefined;
    MainTabs: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RideStatus'>;

const RideStatusScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [rideStatus, setRideStatus] = useState<'arriving' | 'in-progress' | 'arrived'>('arriving');
    const [timer, setTimer] = useState(120);
    const animatedValue = new Animated.Value(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (rideStatus === 'arriving') {
                        setRideStatus('in-progress');
                        return 600;
                    } else if (rideStatus === 'in-progress') {
                        setRideStatus('arrived');
                        return 0;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [rideStatus]);

    useEffect(() => {
        const pulseAnimation = Animated.loop(
            Animated.sequence([
                Animated.timing(animatedValue, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(animatedValue, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulseAnimation.start();

        return () => pulseAnimation.stop();
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getStatusText = () => {
        switch (rideStatus) {
            case 'arriving':
                return 'Driver is arriving';
            case 'in-progress':
                return 'Ride in progress';
            case 'arrived':
                return 'You have arrived!';
            default:
                return '';
        }
    };

    const getStatusSubtitle = () => {
        switch (rideStatus) {
            case 'arriving':
                return 'Your driver will be at the pickup point in a few minutes';
            case 'in-progress':
                return 'Enjoy your ride! You\'re heading to your destination';
            case 'arrived':
                return 'Thank you for riding with Local Toto!';
            default:
                return '';
        }
    };

    const getStatusIcon = () => {
        switch (rideStatus) {
            case 'arriving':
                return <MaterialCommunityIcons name="walk" size={22} color="#219653" />;
            case 'in-progress':
                return <MaterialCommunityIcons name="car-side" size={22} color="#219653" />;
            case 'arrived':
                return <Ionicons name="checkmark-circle" size={22} color="#219653" />;
            default:
                return null;
        }
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#219653" />

            <View style={styles.backgroundContainer}>
                <View style={styles.circle1} />
                <View style={styles.circle2} />
            </View>

            <View style={styles.content}>
                {/* Header with back button */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleGoBack}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ride Status</Text>
                </View>

                <View style={styles.mapContainer}>
                    <View style={styles.mapPlaceholder}>
                        <MaterialCommunityIcons name="map-outline" size={50} color="rgba(255, 255, 255, 0.5)" />
                        <Text style={styles.mapText}>Live Map View</Text>
                    </View>

                    <Animated.View
                        style={[
                            styles.locationPin,
                            {
                                transform: [{ scale: animatedValue }]
                            }
                        ]}
                    >
                        <Ionicons name="location" size={26} color="#F2C94C" />
                    </Animated.View>
                </View>

                <View style={styles.statusContainer}>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                    >
                        <View style={styles.statusImageContainer}>
                            <Image
                                source={require('../assets/rickshaw_green.png')}
                                style={styles.statusImage}
                                resizeMode="contain"
                            />
                            <View style={styles.statusIndicator}>
                                {getStatusIcon()}
                            </View>
                        </View>

                        <View style={styles.textContainer}>
                            <Text style={styles.statusTitle}>
                                {getStatusText()}
                            </Text>
                            <Text style={styles.statusSubtitle}>
                                {getStatusSubtitle()}
                            </Text>
                        </View>

                        <View style={styles.timerContainer}>
                            <View style={styles.timerCard}>
                                <View style={styles.timerHeader}>
                                    <Ionicons
                                        name={rideStatus === 'arriving' ? 'time-outline' : rideStatus === 'in-progress' ? 'speedometer-outline' : 'checkmark-done-circle-outline'}
                                        size={16}
                                        color="#666"
                                    />
                                    <Text style={styles.timerLabel}>
                                        {rideStatus === 'arriving' ? 'Arrival Time' :
                                            rideStatus === 'in-progress' ? 'Trip Time' : 'Completed'}
                                    </Text>
                                </View>
                                <Text style={styles.timerValue}>
                                    {rideStatus !== 'arrived' ? formatTime(timer) : '0:00'}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.rideProgress}>
                            <View style={styles.progressStep}>
                                <View style={[
                                    styles.progressDot,
                                    rideStatus !== 'arriving' && styles.progressDotCompleted
                                ]}>
                                    <Ionicons
                                        name="location"
                                        size={18}
                                        color={rideStatus !== 'arriving' ? '#FFFFFF' : '#999'}
                                    />
                                </View>
                                <Text style={styles.progressText}>Pickup</Text>
                            </View>

                            <View style={[
                                styles.progressLine,
                                rideStatus !== 'arriving' && styles.progressLineCompleted
                            ]} />

                            <View style={styles.progressStep}>
                                <View style={[
                                    styles.progressDot,
                                    rideStatus === 'arrived' && styles.progressDotCompleted
                                ]}>
                                    <Ionicons
                                        name="flag"
                                        size={18}
                                        color={rideStatus === 'arrived' ? '#FFFFFF' : '#999'}
                                    />
                                </View>
                                <Text style={styles.progressText}>Destination</Text>
                            </View>
                        </View>

                        <View style={styles.driverInfoCard}>
                            <View style={styles.driverRow}>
                                <View style={styles.driverAvatar}>
                                    <Ionicons name="person" size={22} color="#219653" />
                                </View>
                                <View style={styles.driverDetails}>
                                    <Text style={styles.driverName}>Ramesh Sharma</Text>
                                    <View style={styles.infoRow}>
                                        <MaterialCommunityIcons name="motorbike" size={13} color="#666" />
                                        <Text style={styles.vehicleInfo}>Honda Activa • DL-01-AB-1234</Text>
                                    </View>
                                </View>
                                <TouchableOpacity style={styles.callButton}>
                                    <Ionicons name="call" size={19} color="#219653" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.buttonContainer}>
                            {rideStatus === 'arrived' ? (
                                <Button
                                    title="Rate Your Ride"
                                    onPress={() => navigation.navigate('Rating')}
                                    variant="primary"
                                    style={styles.completeButton}
                                />
                            ) : (
                                <>
                                    <TouchableOpacity
                                        style={styles.emergencyButton}
                                        onPress={() => navigation.navigate('Rating')}
                                    >
                                        <MaterialCommunityIcons name="shield-alert-outline" size={19} color="#E74C3C" />
                                        <Text style={styles.emergencyText}>Emergency Contact</Text>
                                    </TouchableOpacity>
                                    <Button
                                        title={rideStatus === 'arriving' ? 'Cancel Ride' : 'Share Location'}
                                        onPress={() => { }}
                                        variant="primary"
                                        style={styles.actionButton}
                                    />
                                </>
                            )}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#219653',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
    },
    circle1: {
        position: 'absolute',
        top: -width * 0.3,
        left: -width * 0.3,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: (width * 0.8) / 2,
        backgroundColor: '#197A42',
        opacity: 0.6,
    },
    circle2: {
        position: 'absolute',
        bottom: -width * 0.2,
        right: -width * 0.3,
        width: width * 0.9,
        height: width * 0.9,
        borderRadius: (width * 0.9) / 2,
        backgroundColor: '#27AE60',
        opacity: 0.4,
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
    mapContainer: {
        flex: 0.3,
        position: 'relative',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
    },
    mapText: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.7,
        marginTop: 10,
        fontWeight: '500',
    },
    locationPin: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -22,
        marginLeft: -22,
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(242, 201, 76, 0.25)',
        borderRadius: 22,
    },
    statusContainer: {
        flex: 0.7,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    scrollContent: {
        paddingHorizontal: 22,
        paddingTop: 22,
        paddingBottom: 100,
    },
    statusImageContainer: {
        alignItems: 'center',
        marginBottom: 14,
        position: 'relative',
    },
    statusImage: {
        width: width * 0.26,
        height: width * 0.17,
    },
    statusIndicator: {
        position: 'absolute',
        top: -6,
        right: '37%',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2C94C',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 18,
    },
    statusTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
        textAlign: 'center',
    },
    statusSubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 10,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 18,
    },
    timerCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 13,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        minWidth: 130,
    },
    timerHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 5,
    },
    timerLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    timerValue: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#219653',
        letterSpacing: 1,
    },
    rideProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        paddingHorizontal: 15,
    },
    progressStep: {
        alignItems: 'center',
        flex: 1,
    },
    progressDot: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#E0E0E0',
        marginBottom: 5,
    },
    progressDotCompleted: {
        backgroundColor: '#219653',
        borderColor: '#219653',
    },
    progressText: {
        fontSize: 11,
        color: '#666',
        fontWeight: '600',
    },
    progressLine: {
        height: 2,
        backgroundColor: '#E0E0E0',
        width: 45,
        marginHorizontal: 6,
    },
    progressLineCompleted: {
        backgroundColor: '#219653',
    },
    driverInfoCard: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 13,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    driverRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F2C94C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 11,
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    vehicleInfo: {
        fontSize: 12,
        color: '#666',
    },
    callButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#219653',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    buttonContainer: {
        width: '100%',
    },
    completeButton: {
        backgroundColor: '#219653',
    },
    emergencyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF5F5',
        borderRadius: 8,
        paddingVertical: 11,
        marginBottom: 9,
        borderWidth: 1,
        borderColor: '#FECCCC',
        gap: 7,
    },
    emergencyText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#E74C3C',
    },
    actionButton: {
        backgroundColor: '#219653',
    },
});

export default RideStatusScreen;