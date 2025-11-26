import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LocationScreen from '../screens/LocationScreen';
import SignUpScreen from '../../src/screens/Signupscreen'
import SignInScreen from '../screens/Signinscreen'
import ProfileScreen from '../screens/Profilescreen'
import PaymentMethodScreen from '../screens/PaymentMethodscreen'
import TripHistoryScreen from '../screens/TripHistoryScreen'


const Stack = createNativeStackNavigator();




const AppNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Splash"
                screenOptions={{
                    headerShown: false,
                }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                <Stack.Screen name="Location" component={LocationScreen} />
                <Stack.Screen name="signup" component={SignUpScreen} />
                <Stack.Screen name="SignIn" component={SignInScreen} />
                <Stack.Screen name="Profile" component={ProfileScreen} />
                <Stack.Screen name="Payment" component={PaymentMethodScreen} />
                          <Stack.Screen name="TripHistory" component={TripHistoryScreen} />






            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
