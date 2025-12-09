import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LocationScreen from '../screens/LocationScreen';
import SignUpScreen from '../screens/Signupscreen';
import SignInScreen from '../screens/Signinscreen';
import OTPScreen from '../screens/OTPScreen';
import ProfileSScreen from '../screens/ProfileSScreen';
import PaymentMethodScreen from '../screens/PaymentMethodscreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import DriverFoundScreen from '../screens/DriverFoundScreen';
import RideStatusScreen from '../screens/RideStatusScreen';
import RatingScreen from '../screens/RatingScreen';
import SearchScreen from '../screens/SearchScreen';
import ConfirmScreen from '../screens/ConfirmScreen';
import FindingDriverScreen from '../screens/FindingDriverScreen';
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
                <Stack.Screen name="signup" component={SignUpScreen} />
                <Stack.Screen name="SignIn" component={SignInScreen} />
                <Stack.Screen name="OTP" component={OTPScreen} />
                <Stack.Screen name="Profile" component={ProfileSScreen} />
                <Stack.Screen name="Payment" component={PaymentMethodScreen} />
                <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
                <Stack.Screen name="DriverFound" component={DriverFoundScreen} />
                <Stack.Screen name="RideStatus" component={RideStatusScreen} />
                <Stack.Screen name="Rating" component={RatingScreen} />
                <Stack.Screen name="Search" component={SearchScreen} />
                <Stack.Screen name="Confirm" component={ConfirmScreen} />
                <Stack.Screen name="FindingDriver" component={FindingDriverScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
