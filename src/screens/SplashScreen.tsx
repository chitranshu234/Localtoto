import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions, Easing } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserProfile, logout } from '../store/slices/authSlice';

const { width, height } = Dimensions.get('window');

const ONBOARDING_COMPLETED_KEY = '@localtoto_onboarding_completed';

const SplashScreen = ({ navigation }: any) => {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((state) => state.auth);

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

        // Check auth state - navigation happens automatically via AppNavigator conditional rendering
        const checkAuthState = async () => {
            try {
                // First check AsyncStorage directly
                let accessToken = await AsyncStorage.getItem('access_token');
                const refreshToken = await AsyncStorage.getItem('refresh_token');

                console.log('🔍 Checking auth state:', {
                    hasAccessToken: !!accessToken,
                    hasRefreshToken: !!refreshToken,
                    reduxAuthenticated: isAuthenticated
                });

                // If no access token but we have a refresh token, try to refresh
                if (!accessToken && refreshToken) {
                    console.log('🔄 Access token missing, attempting refresh...');
                    try {
                        const response = await fetch(
                            'https://django-backend-production-43a6.up.railway.app/api/users/refresh',
                            {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ refresh: refreshToken }),
                            }
                        );
                        const data = await response.json();

                        if (data.token) {
                            console.log('✅ Token refreshed successfully!');
                            await AsyncStorage.setItem('access_token', data.token);
                            accessToken = data.token;
                        } else {
                            console.log('❌ Token refresh failed - response:', data);
                        }
                    } catch (refreshError) {
                        console.error('❌ Token refresh error:', refreshError);
                    }
                }

                // If still no token and Redux says authenticated, force logout
                if (!accessToken && isAuthenticated) {
                    console.log('🔄 No valid token - forcing logout...');
                    dispatch(logout());
                    return;
                }

                // If we have a token, try to load user profile
                if (accessToken) {
                    try {
                        console.log('✅ Token found, fetching user profile...');
                        await dispatch(fetchUserProfile()).unwrap();
                        console.log('✅ User profile loaded - AppNavigator will show App stack');
                    } catch (error: any) {
                        console.warn('⚠️ Profile fetch failed:', error);
                        // Don't logout here - the Axios interceptor will handle 401s
                    }
                }

                // Wait for splash animation to complete
                setTimeout(() => {
                    console.log('✅ Splash complete - AppNavigator will navigate based on auth state');
                }, 2500);
            } catch (error) {
                console.error('Error checking auth status:', error);
            }
        };

        checkAuthState();
    }, [logoOpacity, logoScale, circle1Scale, circle2Scale, dispatch, isAuthenticated, user]);

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
