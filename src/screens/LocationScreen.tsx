import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    PermissionsAndroid,
    Platform,
    Alert,
    ToastAndroid,
} from 'react-native';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

const LocationScreen = () => {
    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message:
                            'Local Toto needs access to your location ' +
                            'to find restaurants around you.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('You can use the location');
                    ToastAndroid.show('Location permission granted', ToastAndroid.SHORT);
                    // Here you would typically trigger the location fetching logic
                } else {
                    console.log('Location permission denied');
                    ToastAndroid.show('Location permission denied', ToastAndroid.SHORT);
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image
                        source={require('../assets/illustration_location.png')}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </View>

                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        Hi, nice to <Text style={styles.highlight}>meet</Text> you!
                    </Text>
                    <Text style={styles.subtitle}>
                        Choose your location to start find{'\n'}drivers around you.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Use current location"
                        onPress={requestLocationPermission}
                        variant="primary"
                        style={styles.primaryBtn}
                    />
                    <Button
                        title="Select it manually"
                        onPress={() => {
                            console.log("Select manually");
                            // Navigate to manual selection screen if it existed
                        }}
                        variant="secondary"
                        style={styles.secondaryBtn}
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
        paddingVertical: 40,
    },
    imageContainer: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 40,
    },
    image: {
        width: width * 0.9,
        height: width * 0.7,
    },
    textContainer: {
        flex: 0.2,
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 28,
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
    buttonContainer: {
        flex: 0.3,
        width: '100%',
        paddingHorizontal: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryBtn: {
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    secondaryBtn: {
        // No extra styles needed
    },
});

export default LocationScreen;
