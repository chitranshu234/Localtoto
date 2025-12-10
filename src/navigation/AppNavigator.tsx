import React, { useEffect, useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Screens
import SplashScreen from '@screens/SplashScreen';
import OnboardingScreen from '@screens/OnboardingScreen';
import LocationScreen from '@screens/LocationScreen';
import SignUpScreen from '@screens/Signupscreen';
import SignInScreen from '@screens/Signinscreen';
import OTPScreen from '@screens/OTPScreen';
import ProfileScreen from '@screens/ProfileSScreen';
import PaymentMethodScreen from '@screens/PaymentMethodscreen';
import TripHistoryScreen from '@screens/TripHistoryScreen';
import DriverFoundScreen from '@screens/DriverFoundScreen';
import RideStatusScreen from '@screens/RideStatusScreen';
import RatingScreen from '@screens/RatingScreen';
import SearchScreen from '@screens/SearchScreen';
import ConfirmScreen from '@screens/ConfirmScreen';
import FindingDriverScreen from '@screens/FindingDriverScreen';
import EditProfileScreen from '@screens/EditProfileScreen';
import MapboxLocationScreen from '@screens/Map';

// Navigation refs for persistence
export const navigationRef = React.createRef<NavigationContainerRef<any>>();
export const routeNameRef = React.createRef<string>();

const Stack = createNativeStackNavigator();

// Storage key for navigation persistence
const PERSISTENCE_KEY = 'NAVIGATION_STATE_V1';

const AppNavigator = () => {
    const [initialState, setInitialState] = useState();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const restoreState = async () => {
            try {
                // Restore navigation state only
                const savedStateString = await AsyncStorage.getItem(PERSISTENCE_KEY);
                const state = savedStateString ? JSON.parse(savedStateString) : undefined;
                if (state) setInitialState(state);
            } catch (error) {
                console.error('Error restoring navigation state:', error);
            } finally {
                setIsReady(true);
            }
        };

        restoreState();
    }, []);

    // Wait for state restoration
    if (!isReady) {
        return null; // Or a simple loading indicator
    }

    return (
        <NavigationContainer
            ref={navigationRef}
            initialState={initialState}
            onStateChange={async (state) => {
                const currentRouteName = state?.routes[state.index].name;
                if (currentRouteName) {
                    routeNameRef.current = currentRouteName;
                }
                await AsyncStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
            }}
        >
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                }}
            >
                {/* Splash Screen - Initial screen */}
                <Stack.Screen name="Splash" component={SplashScreen} />

                {/* Onboarding Flow */}
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Location" component={LocationScreen} />

                {/* Authentication Flow */}
                <Stack.Screen name="signup" component={SignUpScreen} />
                <Stack.Screen name="SignIn" component={SignInScreen} />
                <Stack.Screen name="OTP" component={OTPScreen} />

                {/* Profile Management */}
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="Payment" component={PaymentMethodScreen} />
                <Stack.Screen name="TripHistory" component={TripHistoryScreen} />

                {/* Main App Flow */}
                <Stack.Screen name="Search" component={SearchScreen} />
                <Stack.Screen name="Map" component={MapboxLocationScreen} />
                <Stack.Screen name="Confirm" component={ConfirmScreen} />
                <Stack.Screen name="FindingDriver" component={FindingDriverScreen} />
                <Stack.Screen name="DriverFound" component={DriverFoundScreen} />
                <Stack.Screen name="RideStatus" component={RideStatusScreen} />
                <Stack.Screen name="Rating" component={RatingScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
