import React, { useEffect, useState } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppSelector } from '../store/hooks';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Screens
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LocationScreen from '../screens/LocationScreen';
import SignUpScreen from '../screens/Signupscreen';
import OTPScreen from '../screens/OTPScreen';
import ProfileScreen from '../screens/ProfileSScreen';
import PaymentMethodScreen from '../screens/PaymentMethodscreen';
import TripHistoryScreen from '../screens/TripHistoryScreen';
import RideStatusScreen from '../screens/RideStatusScreen';
import RatingScreen from '../screens/RatingScreen';
import ConfirmScreen from '../screens/ConfirmScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import FindingDriverScreen from '../screens/FindingDriverScreen';
import DriverFoundScreen from '../screens/DriverFoundScreen';

// Navigation refs
export const navigationRef = React.createRef<NavigationContainerRef<any>>();
export const routeNameRef = React.createRef<string>();

const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack - For unauthenticated users
const AuthNavigator = () => {
    return (
        <AuthStack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <AuthStack.Screen name="Onboarding" component={OnboardingScreen} />
            <AuthStack.Screen name="Location" component={LocationScreen} />
            <AuthStack.Screen name="signup" component={SignUpScreen} />
            <AuthStack.Screen name="OTP" component={OTPScreen} />
        </AuthStack.Navigator>
    );
};

// Reusable Bottom Tab Navigator Component
const createTabNavigator = (HomeComponent: React.ComponentType<any>) => {
    return ({ route }: any) => (
        <Tab.Navigator
            screenOptions={({ route: tabRoute }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName: string;

                    if (tabRoute.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (tabRoute.name === 'Activity') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (tabRoute.name === 'Account') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else {
                        iconName = 'help-circle-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#2D7C4F',
                tabBarInactiveTintColor: '#8E8E93',
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopColor: '#E5E5EA',
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '600',
                },
            })}
        >
            <Tab.Screen
                name="Home"
                component={HomeComponent}
                initialParams={route.params}
                options={{
                    tabBarLabel: 'Home',
                }}
            />
            <Tab.Screen
                name="Activity"
                component={TripHistoryScreen}
                options={{
                    tabBarLabel: 'Activity',
                }}
            />
            <Tab.Screen
                name="Account"
                component={ProfileScreen}
                options={{
                    tabBarLabel: 'Account',
                }}
            />
        </Tab.Navigator>
    );
};

// Tab Navigators for each screen
const ConfirmTabNavigator = createTabNavigator(ConfirmScreen);
const FindingDriverTabNavigator = createTabNavigator(FindingDriverScreen);
const DriverFoundTabNavigator = createTabNavigator(DriverFoundScreen);

// App Stack - For authenticated users
const MainNavigator = () => {
    return (
        <AppStack.Navigator
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            {/* Main Screens with Bottom Tabs */}
            {/* ConfirmTabs is now the Home Screen (was SearchTabs) */}
            <AppStack.Screen
                name="ConfirmTabs"
                component={ConfirmTabNavigator}
                options={{
                    gestureEnabled: false,
                }}
            />
            <AppStack.Screen
                name="FindingDriverTabs"
                component={FindingDriverTabNavigator}
                options={{
                    gestureEnabled: false,
                }}
            />
            <AppStack.Screen
                name="DriverFoundTabs"
                component={DriverFoundTabNavigator}
                options={{
                    gestureEnabled: false,
                }}
            />


            {/* Profile & Settings - Modal/Stack screens */}
            <AppStack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                    presentation: 'modal',
                }}
            />
            <AppStack.Screen name="Payment" component={PaymentMethodScreen} />
            <AppStack.Screen name="TripHistory" component={TripHistoryScreen} />
            <AppStack.Screen name="Profile" component={ProfileScreen} />

            {/* Ride Flow - Stack screens without tabs */}
            <AppStack.Screen name="RideStatus" component={RideStatusScreen} />
            <AppStack.Screen name="Rating" component={RatingScreen} />
        </AppStack.Navigator>
    );
};

const AppNavigator = () => {
    const { isAuthenticated } = useAppSelector((state) => state.auth);
    const [showSplash, setShowSplash] = useState(true);

    useEffect(() => {
        // Hide splash after 3 seconds
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Show splash screen first
    if (showSplash) {
        return <SplashScreen />;
    }

    // After splash, show appropriate stack based on auth state
    return (
        <NavigationContainer ref={navigationRef}>
            <RootStack.Navigator screenOptions={{ headerShown: false }}>
                {/* Conditionally render Auth or App stack */}
                {!isAuthenticated ? (
                    <RootStack.Screen
                        name="Auth"
                        component={AuthNavigator}
                        options={{
                            animationTypeForReplace: 'pop',
                        }}
                    />
                ) : (
                    <RootStack.Screen
                        name="App"
                        component={MainNavigator}
                        options={{
                            animationTypeForReplace: 'push',
                        }}
                    />
                )}
            </RootStack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;
