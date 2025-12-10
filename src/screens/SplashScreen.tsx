import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const ONBOARDING_COMPLETED_KEY = '@localtoto_onboarding_completed';

const SplashScreen = ({ navigation }: any) => {
    // Animation Values
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.8)).current;
    const circle1Scale = useRef(new Animated.Value(0)).current;
    const circle2Scale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Start Animations
        Animated.parallel([
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.timing(circle1Scale, {
                toValue: 1,
                duration: 1200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(circle2Scale, {
                toValue: 1,
                duration: 1200,
                delay: 200,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
            }),
        ]).start();

        // Navigate after animations complete
        const checkOnboardingAndNavigate = async () => {
            try {
                const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
                const isOnboardingCompleted = completed === 'true';

                // Wait for animations to finish (1.5 seconds)
                setTimeout(() => {
                    if (navigation) {
                        navigation.replace(isOnboardingCompleted ? 'Search' : 'Onboarding');
                    }
                }, 1500);
            } catch (error) {
                console.error('Error checking onboarding status:', error);
                // Default to onboarding if error
                setTimeout(() => {
                    if (navigation) {
                        navigation.replace('Onboarding');
                    }
                }, 1500);
            }
        };

        checkOnboardingAndNavigate();
    }, [logoOpacity, logoScale, circle1Scale, circle2Scale, navigation]);

    return (
        <View style={styles.container}>
            {/* Top Left Circle - Darker Green */}
            <Animated.View
                style={[
                    styles.circle1,
                    {
                        transform: [{ scale: circle1Scale }],
                    },
                ]}
            />

            {/* Bottom Right Circle - Lighter Green */}
            <Animated.View
                style={[
                    styles.circle2,
                    {
                        transform: [{ scale: circle2Scale }],
                    },
                ]}
            />

            <Animated.Image
                source={require('../assets/logo_white.png')}
                style={[
                    styles.logo,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    },
                ]}
                resizeMode="contain"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#219653', // Main Green
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden', // Clip circles
    },
    logo: {
        width: width * 0.6,
        height: 100,
        zIndex: 10,
    },
    circle1: {
        position: 'absolute',
        top: -width * 0.2,
        left: -width * 0.2,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: (width * 0.8) / 2,
        backgroundColor: '#197A42', // Darker Green
    },
    circle2: {
        position: 'absolute',
        bottom: -width * 0.2,
        right: -width * 0.2,
        width: width * 0.9,
        height: width * 0.9,
        borderRadius: (width * 0.9) / 2,
        backgroundColor: '#27AE60', // Lighter Green (or slightly different shade)
        opacity: 0.6,
    },
});

export default SplashScreen;
