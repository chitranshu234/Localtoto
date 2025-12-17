import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,

    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DriverFound'>;

const DriverFoundScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const handleContactDriver = () => {
        Alert.alert('Contact Driver', 'This would open a communication interface with the driver');
    };

    const handleCancel = () => {
        Alert.alert('Cancel Ride', 'Are you sure you want to cancel this ride?', [
            { text: 'No', style: 'cancel' },
            { text: 'Yes', onPress: () => navigation.goBack() },
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../assets/illustration_confirm.png')}
                        style={styles.driverImage}
                        resizeMode="contain"
                    />
                    <Image
                        source={require('../assets/rickshaw.png')}
                        style={styles.rickshawOverlay}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        Driver <Text style={styles.highlight}>Found!</Text>
                    </Text>
                    <View>
                        <Text style={styles.subtitle}>
                            Your driver is on the way.
                        </Text>

                    </View>



                </View>

                <View style={styles.driverInfoContainer}>
                    <View style={styles.driverCard}>
                        <View style={styles.driverProfile}>
                            <View style={styles.driverAvatar}>
                                <Text style={styles.avatarText}>RS</Text>
                            </View>
                            <View style={styles.driverDetails}>
                                <Text style={styles.driverName}>Ramesh Sharma</Text>
                                <Text style={styles.driverRating}>⭐ 4.8 • Honda Activa</Text>
                                <Text style={styles.driverDistance}>2 mins away • 0.5 km</Text>
                            </View>
                        </View>
                        <View style={styles.driverActions}>
                            <TouchableOpacity style={styles.actionButton} onPress={handleContactDriver}>
                                <Text style={styles.actionIcon}>📞</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionButton}>
                                <Text style={styles.actionIcon}>💬</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.rideDetails}>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Pickup</Text>
                            <Text style={styles.detailValue}>Current Location</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Drop-off</Text>
                            <Text style={styles.detailValue}>Main Market</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Text style={styles.detailLabel}>Estimated Fare</Text>
                            <Text style={styles.detailValue}>₹45</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Track Driver"
                        onPress={() => navigation.navigate('RideStatus')}
                        variant="primary"
                        style={styles.trackButton}
                    />
                    <Button
                        title="Cancel Ride"
                        onPress={handleCancel}
                        variant="secondary"
                        style={styles.cancelButton}
                    />
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 30,
        paddingTop: 40,
        paddingBottom: 30,
    },
    imageContainer: {
        flex: 0.3,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
    },
    driverImage: {
        width: width * 0.6,
        height: width * 0.6,
    },
    rickshawOverlay: {
        position: 'absolute',
        width: width * 0.2,
        height: width * 0.12,
        bottom: '30%',
        right: '25%',
    },
    textContainer: {
        flex: 0.15,
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center',
    },
    highlight: {
        color: '#F2C94C',
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 24,
    },
    driverInfoContainer: {
        flex: 0.35,
        width: '100%',
        justifyContent: 'center',
    },
    driverCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
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
        backgroundColor: '#F2C94C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#219653',
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    driverRating: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        marginBottom: 2,
    },
    driverDistance: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.8,
    },
    driverActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 80,
    },
    actionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionIcon: {
        fontSize: 18,
    },
    rideDetails: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    detailLabel: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.7,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    buttonContainer: {
        flex: 0.15,
        width: '100%',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    trackButton: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    cancelButton: {
        // No extra styles needed for secondary button
    },
});

export default DriverFoundScreen;