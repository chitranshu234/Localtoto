import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
    Onboarding: undefined;
    Location: undefined;
    DriverFound: undefined;
    RideStatus: undefined;
    Rating: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RideStatus'>;

const RideStatusScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [rideStatus, setRideStatus] = useState<'arriving' | 'in-progress' | 'arrived'>('arriving');
    const [timer, setTimer] = useState(120); // 2 minutes countdown
    const animatedValue = new Animated.Value(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    // Simulate ride status changes
                    if (rideStatus === 'arriving') {
                        setRideStatus('in-progress');
                        return 600; // 10 minutes ride
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

    const handleEmergency = () => {
        navigation.navigate('Rating');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.mapContainer}>
                    {/* Map placeholder - would integrate with actual map service */}
                    <View style={styles.mapPlaceholder}>
                        <Text style={styles.mapText}>🗺️ Live Map View</Text>
                    </View>

                    <Animated.View
                        style={[
                            styles.locationPin,
                            {
                                transform: [{ scale: animatedValue }]
                            }
                        ]}
                    >
                        <Text style={styles.pinIcon}>📍</Text>
                    </Animated.View>
                </View>

                <View style={styles.statusContainer}>
                    <View style={styles.statusImageContainer}>
                        <Image
                            source={require('../assets/rickshaw_green.png')}
                            style={styles.statusImage}
                            resizeMode="contain"
                        />
                        <View style={styles.statusIndicator}>
                            <Text style={styles.statusText}>
                                {rideStatus === 'arriving' && '🏃‍♂️'}
                                {rideStatus === 'in-progress' && '🛵'}
                                {rideStatus === 'arrived' && '✅'}
                            </Text>
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
                            <Text style={styles.timerLabel}>
                                {rideStatus === 'arriving' ? 'Arrival Time' :
                                 rideStatus === 'in-progress' ? 'Trip Time' : 'Completed'}
                            </Text>
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
                                <Text style={styles.progressIcon}>📍</Text>
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
                                <Text style={styles.progressIcon}>🎯</Text>
                            </View>
                            <Text style={styles.progressText}>Destination</Text>
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
                                <Button
                                    title="Emergency Contact"
                                    onPress={handleEmergency}
                                    variant="secondary"
                                    style={styles.emergencyButton}
                                />
                                <Button
                                    title={rideStatus === 'arriving' ? 'Cancel Ride' : 'Share Location'}
                                    onPress={() => {}}
                                    variant="primary"
                                    style={styles.actionButton}
                                />
                            </>
                        )}
                    </View>
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
    content: {
        flex: 1,
    },
    mapContainer: {
        flex: 0.5,
        position: 'relative',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    mapText: {
        fontSize: 18,
        color: '#FFFFFF',
        opacity: 0.6,
    },
    locationPin: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginTop: -20,
        marginLeft: -20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(242, 201, 76, 0.2)',
        borderRadius: 20,
    },
    pinIcon: {
        fontSize: 20,
    },
    statusContainer: {
        flex: 0.5,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 30,
        paddingTop: 30,
        paddingBottom: 20,
    },
    statusImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
    },
    statusImage: {
        width: width * 0.3,
        height: width * 0.2,
    },
    statusIndicator: {
        position: 'absolute',
        top: -10,
        right: '35%',
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F2C94C',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    statusText: {
        fontSize: 16,
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    statusTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    statusSubtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 22,
        opacity: 0.9,
    },
    timerContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    timerCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    timerLabel: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.8,
        marginBottom: 4,
    },
    timerValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#F2C94C',
    },
    rideProgress: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 30,
    },
    progressStep: {
        alignItems: 'center',
        flex: 1,
    },
    progressDot: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        marginBottom: 8,
    },
    progressDotCompleted: {
        backgroundColor: '#F2C94C',
        borderColor: '#F2C94C',
    },
    progressIcon: {
        fontSize: 18,
    },
    progressText: {
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.8,
    },
    progressLine: {
        height: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        width: 40,
        marginHorizontal: 8,
    },
    progressLineCompleted: {
        backgroundColor: '#F2C94C',
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 10,
    },
    completeButton: {
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    emergencyButton: {
        marginBottom: 16,
    },
    actionButton: {
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
});

export default RideStatusScreen;