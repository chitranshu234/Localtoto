import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,

    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/Button';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { rateDriver } from '../store/slices/rideSlice';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
    Onboarding: undefined;
    Location: undefined;
    DriverFound: undefined;
    RideStatus: undefined;
    Rating: { rideId?: number } | undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Rating'>;
type RoutePropType = RouteProp<RootStackParamList, 'Rating'>;

const RatingScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();
    const dispatch = useAppDispatch();
    const { isRating, driver, currentRide } = useAppSelector(state => state.ride);

    // Get rideId from route params
    const rideId = route.params?.rideId;
    const [rating, setRating] = useState(0);
    const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [tip, setTip] = useState<number | null>(null);

    // Generate avatar initials from driver name
    const getAvatarInitials = (name?: string) => {
        if (!name) return 'DR';
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const commonIssues = [
        { id: 'route', icon: 'wrong-location', iconSet: 'MaterialCommunityIcons', label: 'Wrong route' },
        { id: 'rude', icon: 'emoticon-angry', iconSet: 'MaterialCommunityIcons', label: 'Rude behavior' },
        { id: 'clean', icon: 'car-wash', iconSet: 'MaterialCommunityIcons', label: 'Unclean vehicle' },
        { id: 'safety', icon: 'shield-alert', iconSet: 'MaterialCommunityIcons', label: 'Unsafe driving' },
        { id: 'late', icon: 'clock-alert', iconSet: 'MaterialCommunityIcons', label: 'Late arrival' },
        { id: 'other', icon: 'note-text', iconSet: 'MaterialCommunityIcons', label: 'Other issues' },
    ];

    const compliments = [
        { id: 'friendly', icon: 'emoticon-happy', iconSet: 'MaterialCommunityIcons', label: 'Friendly driver' },
        { id: 'safe', icon: 'shield-check', iconSet: 'MaterialCommunityIcons', label: 'Safe driving' },
        { id: 'clean', icon: 'auto-fix', iconSet: 'MaterialCommunityIcons', label: 'Clean vehicle' },
        { id: 'punctual', icon: 'clock-check', iconSet: 'MaterialCommunityIcons', label: 'On time' },
        { id: 'helpful', icon: 'hand-heart', iconSet: 'MaterialCommunityIcons', label: 'Very helpful' },
        { id: 'skilled', icon: 'steering', iconSet: 'MaterialCommunityIcons', label: 'Great driving' },
    ];

    const tipOptions = [
        { amount: 10, label: '₹10' },
        { amount: 20, label: '₹20' },
        { amount: 30, label: '₹30' },
        { amount: 50, label: '₹50' },
    ];

    const handleRating = (star: number) => {
        setRating(star);
        setSelectedIssues([]);
    };

    const toggleIssue = (issueId: string) => {
        setSelectedIssues(prev =>
            prev.includes(issueId)
                ? prev.filter(id => id !== issueId)
                : [...prev, issueId]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating before submitting');
            return;
        }

        // Validate rideId exists
        if (!rideId) {
            Alert.alert('Error', 'Unable to submit rating: Ride information not found');
            return;
        }

        try {
            // Prepare feedback text from selected issues/compliments
            const feedbackItems = selectedIssues.length > 0 ? selectedIssues.join(', ') : '';
            const fullComment = comment ?
                (feedbackItems ? `${feedbackItems}: ${comment}` : comment) :
                feedbackItems;

            // Dispatch the rating action
            const result = await dispatch(rateDriver({
                bookingId: rideId,
                rating: rating,
                comment: fullComment || undefined,
            })).unwrap();

            if (result.success) {
                Alert.alert(
                    'Thank You!',
                    'Your feedback helps us improve our service',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Navigate back and clear ride state
                                navigation.goBack();
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', result.message || 'Failed to submit rating');
            }
        } catch (error: any) {
            console.error('Rating submission error:', error);
            Alert.alert(
                'Error',
                error.message || 'Failed to submit rating. Please try again.'
            );
        }
    };

    const handleBookAnother = () => {
        navigation.goBack();
    };

    const renderStars = () => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                        key={star}
                        style={styles.starButton}
                        onPress={() => handleRating(star)}
                        activeOpacity={0.7}
                    >
                        <FontAwesome
                            name={star <= rating ? 'star' : 'star-o'}
                            size={42}
                            color={star <= rating ? '#F2C94C' : 'rgba(100, 100, 100, 0.3)'}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderOptions = (options: typeof commonIssues) => {
        return (
            <View style={styles.optionsContainer}>
                {options.map((option) => {
                    const IconComponent = option.iconSet === 'MaterialCommunityIcons'
                        ? MaterialCommunityIcons
                        : Icon;

                    return (
                        <TouchableOpacity
                            key={option.id}
                            style={[
                                styles.optionChip,
                                selectedIssues.includes(option.id) && styles.optionChipSelected
                            ]}
                            onPress={() => toggleIssue(option.id)}
                            activeOpacity={0.7}
                        >
                            <IconComponent
                                name={option.icon}
                                size={18}
                                color={selectedIssues.includes(option.id) ? '#27ae60' : '#666'}
                                style={styles.optionIcon}
                            />
                            <Text style={[
                                styles.optionLabel,
                                selectedIssues.includes(option.id) && styles.optionLabelSelected
                            ]}>
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Background circles like SignUpScreen */}
            <View style={styles.backgroundContainer}>
                <View style={styles.circle1} />
                <View style={styles.circle2} />
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.imageContainer}>
                        <View style={styles.successBadge}>
                            <Icon name="check-circle" size={80} color="#27ae60" />
                        </View>
                        <Text style={styles.successTitle}>Trip Completed!</Text>
                        <Text style={styles.successSubtitle}>
                            Your ride has ended successfully
                        </Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.driverCard}>
                            <View style={styles.driverProfile}>
                                <View style={styles.driverAvatar}>
                                    <Text style={styles.avatarText}>{getAvatarInitials(driver?.name)}</Text>
                                </View>
                                <View style={styles.driverDetails}>
                                    <Text style={styles.driverName}>{driver?.name || 'Driver'}</Text>
                                    <Text style={styles.driverInfo}>{driver?.vehicle || 'Vehicle'}{driver?.vehicleNumber ? ` • ${driver.vehicleNumber}` : ''}</Text>
                                    <Text style={styles.tripInfo}>{currentRide ? `₹${currentRide.fare} paid` : 'Fare not available'}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.ratingSection}>
                            <Text style={styles.sectionTitle}>How was your ride?</Text>
                            {renderStars()}
                            {rating > 0 && (
                                <Text style={styles.ratingText}>
                                    {rating === 5 ? 'Excellent!' :
                                        rating === 4 ? 'Very Good' :
                                            rating === 3 ? 'Good' :
                                                rating === 2 ? 'Poor' : 'Very Poor'}
                                </Text>
                            )}
                        </View>

                        {rating > 0 && rating <= 3 && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.feedbackSection}>
                                    <Text style={styles.sectionTitle}>What went wrong?</Text>
                                    {renderOptions(commonIssues)}
                                </View>
                            </>
                        )}

                        {rating >= 4 && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.feedbackSection}>
                                    <Text style={styles.sectionTitle}>What did you like?</Text>
                                    {renderOptions(compliments)}
                                </View>
                            </>
                        )}

                        <View style={styles.divider} />

                        <View style={styles.commentSection}>
                            <Text style={styles.sectionTitle}>Additional feedback (Optional)</Text>
                            <TextInput
                                style={styles.commentInput}
                                placeholder="Tell us more about your experience..."
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                                value={comment}
                                onChangeText={setComment}
                                textAlignVertical="top"
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* <View style={styles.tipSection}>
                            <Text style={styles.sectionTitle}>Add a tip for your driver</Text>
                            <View style={styles.tipOptions}>
                                {tipOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option.amount}
                                        style={[
                                            styles.tipChip,
                                            tip === option.amount && styles.tipChipSelected
                                        ]}
                                        onPress={() => setTip(tip === option.amount ? null : option.amount)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[
                                            styles.tipLabel,
                                            tip === option.amount && styles.tipLabelSelected
                                        ]}>
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View> */}

                        {/* <View style={styles.summarySection}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Trip Fare</Text>
                                <Text style={styles.summaryValue}>₹45.00</Text>
                            </View>
                            {tip && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Driver Tip</Text>
                                    <Text style={styles.summaryValue}>+₹{tip}.00</Text>
                                </View>
                            )}
                            <View style={[styles.summaryRow, styles.summaryRowTotal]}>
                                <Text style={styles.totalLabel}>Total Paid</Text>
                                <Text style={styles.totalValue}>₹{45 + (tip || 0)}.00</Text>
                            </View>
                        </View> */}

                        <View style={styles.buttonContainer}>
                            <Button
                                title={isRating ? "Submitting..." : "Submit Feedback"}
                                onPress={handleSubmit}
                                variant="primary"
                                style={styles.submitButton}
                                disabled={isRating}
                            />
                            <TouchableOpacity
                                style={styles.bookButton}
                                onPress={handleBookAnother}
                                disabled={isRating}
                            >
                                <Text style={styles.bookButtonText}>Book Another Ride</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#219653',
    },
    backgroundContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
    },
    circle1: {
        position: 'absolute',
        top: -width * 0.2,
        left: -width * 0.2,
        width: width * 0.8,
        height: width * 0.8,
        borderRadius: (width * 0.8) / 2,
        backgroundColor: '#197A42',
    },
    circle2: {
        position: 'absolute',
        bottom: -width * 0.2,
        right: -width * 0.2,
        width: width * 0.9,
        height: width * 0.9,
        borderRadius: (width * 0.9) / 2,
        backgroundColor: '#27AE60',
        opacity: 0.6,
    },
    scrollView: {
        flex: 1,
        zIndex: 1,
    },
    content: {
        paddingHorizontal: 20,
        paddingVertical: 30,
        paddingBottom: 50,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    successBadge: {
        marginBottom: 20,
    },
    successTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    successSubtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        opacity: 0.9,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    driverCard: {
        marginBottom: 0,
    },
    driverProfile: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F2C94C',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#27ae60',
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    driverInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 2,
    },
    tripInfo: {
        fontSize: 13,
        color: '#999',
    },
    divider: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 20,
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: 0,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 16,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
        gap: 8,
    },
    starButton: {
        padding: 4,
    },
    ratingText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#27ae60',
        marginTop: 8,
    },
    feedbackSection: {
        marginBottom: 0,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        gap: 8,
    },
    optionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    optionChipSelected: {
        backgroundColor: '#E8F5E9',
        borderColor: '#27ae60',
    },
    optionIcon: {
        marginRight: 6,
    },
    optionLabel: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    optionLabelSelected: {
        color: '#27ae60',
        fontWeight: '600',
    },
    commentSection: {
        marginBottom: 0,
    },
    commentInput: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 14,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        minHeight: 100,
    },
    tipSection: {
        marginBottom: 20,
    },
    tipOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    tipChip: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    tipChipSelected: {
        backgroundColor: '#27ae60',
        borderColor: '#27ae60',
    },
    tipLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#666',
    },
    tipLabelSelected: {
        color: '#FFFFFF',
    },
    summarySection: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryRowTotal: {
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        paddingTop: 12,
        marginTop: 8,
        marginBottom: 0,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#666',
    },
    summaryValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '600',
    },
    totalLabel: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        color: '#27ae60',
        fontWeight: 'bold',
    },
    buttonContainer: {
        width: '100%',
    },
    submitButton: {
        marginBottom: 12,
    },
    bookButton: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    bookButtonText: {
        color: '#27ae60',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default RatingScreen;