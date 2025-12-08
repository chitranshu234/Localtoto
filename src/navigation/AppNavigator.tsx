import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LocationScreen from '../screens/LocationScreen';
import SearchScreen from '../screens/SearchScreen';
import ConfirmScreen from '../screens/ConfirmScreen';
import OTPScreen from '../screens/OTPScreen';
import FindingDriverScreen from '../screens/FindingDriverScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

const ONBOARDING_COMPLETED_KEY = '@localtoto_onboarding_completed';

const AppNavigator = () => {
    const [isOnboardingCompleted, setIsOnboardingCompleted] = useState<boolean | null>(null);

    useEffect(() => {
        checkOnboardingStatus();
    }, []);

    const checkOnboardingStatus = async () => {
        try {
            const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
            setIsOnboardingCompleted(completed === 'true');
        } catch (error) {
            console.error('Error checking onboarding status:', error);
            setIsOnboardingCompleted(false);
        }
    };

    // Show splash screen while checking onboarding status
    if (isOnboardingCompleted === null) {
        return (
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Splash" component={SplashScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={isOnboardingCompleted ? 'Search' : 'Onboarding'}
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Location" component={LocationScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />
                <Stack.Screen name="Confirm" component={ConfirmScreen} />
                <Stack.Screen name="OTP" component={OTPScreen} />
                <Stack.Screen name="FindingDriver" component={FindingDriverScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ headerShown: false }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
