import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    FlatList,
    NativeSyntheticEvent,
    NativeScrollEvent,
    SafeAreaView,
    PermissionsAndroid,
    Platform,
    ToastAndroid,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Pagination from '../components/Pagination';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

const slides = [
    {
        id: '1',
        type: 'onboarding',
        title: 'Book an\ne-Rickshaw\nin Your City',
        subtitle: '',
        image: require('../assets/illustration_location.png'),
    },
    {
        id: '2',
        type: 'onboarding',
        title: 'Confirm your\ndriver',
        subtitle: 'Huge drivers network helps you find\ncomforable, safe and cheap ride',
        image: require('../assets/illustration_confirm.png'),
    },
    {
        id: '3',
        type: 'location',
        title: 'Hi, nice to meet you!',
        subtitle: 'Choose your location to start find\ndrivers around you.',
        image: require('../assets/illustration_book.png'),
    },
];

type RootStackParamList = {
    Onboarding: undefined;
    Location: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;

const OnboardingScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);

    const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const index = Math.round(event.nativeEvent.contentOffset.x / width);
        setCurrentIndex(index);
    };

    const requestLocationPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                    {
                        title: 'Location Permission',
                        message:
                            'Local Toto needs access to your location ' +
                            'to find drivers around you.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('You can use the location');
                    ToastAndroid.show('Location permission granted', ToastAndroid.SHORT);
                    // Here you could navigate to main app or proceed
                } else {
                    console.log('Location permission denied');
                    ToastAndroid.show('Location permission denied', ToastAndroid.SHORT);
                }
            } catch (err) {
                console.warn(err);
            }
        }
    };

    const renderItem = ({ item }: { item: typeof slides[0] }) => {
        if (item.type === 'location') {
            // Location slide with buttons
            return (
                <View style={styles.slide}>
                    <View style={styles.imageContainer}>
                        <Image source={item.image} style={styles.locationImage} resizeMode="contain" />
                        <Image
                            source={require('../assets/rickshaw_green.png')}
                            style={styles.greenRickshawOverlay}
                            resizeMode="contain"
                        />
                    </View>
                    <View style={styles.locationTextContainer}>
                        <Text style={styles.locationTitle}>
                            Hi, nice to <Text style={styles.highlight}>meet</Text> you!
                        </Text>
                        <Text style={styles.locationSubtitle}>{item.subtitle}</Text>
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
                                console.log('Select manually');
                            }}
                            variant="secondary"
                            style={styles.secondaryBtn}
                        />
                    </View>
                </View>
            );
        }

        // Regular onboarding slides
        return (
            <View style={styles.slide}>
                <View style={styles.imageContainer}>
                    <Image source={item.image} style={styles.image} resizeMode="contain" />
                    {item.id === '1' && (
                        <Image
                            source={require('../assets/rickshaw.png')}
                            style={styles.rickshawOverlay}
                            resizeMode="contain"
                        />
                    )}
                </View>
                <View style={styles.textContainer}>
                    <Text style={styles.title}>
                        {item.id === '1' ? (
                            <>
                                Book an{'\n'}
                                <Text style={styles.highlight}>e-Rickshaw</Text>{'\n'}
                                in Your City
                            </>
                        ) : (
                            <>
                                Confirm <Text style={styles.highlight}>your</Text>{'\n'}
                                driver
                            </>
                        )}
                    </Text>
                    {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={slides}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={onScroll}
                scrollEventThrottle={16}
                bounces={false}
            />
            <View style={styles.footer}>
                <Pagination total={slides.length} currentIndex={currentIndex} />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#219653',
    },
    slide: {
        width,
        height: height,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageContainer: {
        flex: 0.5,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    image: {
        width: width * 0.7,
        height: width * 0.7,
    },
    locationImage: {
        width: width,
        height: width * 0.7,
    },
    rickshawOverlay: {
        position: 'absolute',
        width: width * 0.25,
        height: width * 0.15,
        bottom: '43%',
        right: '26%',
    },
    greenRickshawOverlay: {
        position: 'absolute',
        width: width * 0.25,
        height: width * 0.15,
        bottom: '27%',
        left: '40%',
    },
    textContainer: {
        flex: 0.35,
        alignItems: 'flex-start',
        paddingHorizontal: 40,
        width: '100%',
        justifyContent: 'flex-start',
        paddingTop: 20,
    },
    locationTextContainer: {
        flex: 0.2,
        alignItems: 'center',
        paddingHorizontal: 30,
        width: '100%',
    },
    title: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 20,
    },
    locationTitle: {
        fontSize: 32,
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
        lineHeight: 24,
    },
    locationSubtitle: {
        fontSize: 18,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 26,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
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

export default OnboardingScreen;
