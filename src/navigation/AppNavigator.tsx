import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LocationScreen from '../screens/LocationScreen';
import SignUpScreen from '../screens/Signupscreen'
import SignInScreen from '../screens/Signinscreen'
import OTPScreen from '../screens/OTPScreen'
import ProfileScreen from '../screens/Profilescreen'
import PaymentMethodScreen from '../screens/PaymentMethodscreen'
import TripHistoryScreen from '../screens/TripHistoryScreen'
import DriverFoundScreen from '../screens/DriverFoundScreen'
import RideStatusScreen from '../screens/RideStatusScreen'
import RatingScreen from '../screens/RatingScreen'


const Stack = createNativeStackNavigator();




const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="signup"
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
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Payment" component={PaymentMethodScreen} />
                <Stack.Screen name="TripHistory" component={TripHistoryScreen} />
                <Stack.Screen name="DriverFound" component={DriverFoundScreen} />
                <Stack.Screen name="RideStatus" component={RideStatusScreen} />
                <Stack.Screen name="Rating" component={RatingScreen} />






            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
