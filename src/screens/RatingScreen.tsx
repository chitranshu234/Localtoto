import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/Button';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
    Onboarding: undefined;
    Location: undefined;
    DriverFound: undefined;
    RideStatus: undefined;
    Rating: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Rating'>;

const RatingScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [rating, setRating] = useState(0);
    const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
    const [comment, setComment] = useState('');
    const [tip, setTip] = useState<number | null>(null);

    const commonIssues = [
        { id: 'route', icon: '🗺️', label: 'Wrong route' },
        { id: 'rude', icon: '😠', label: 'Rude behavior' },
        { id: 'clean', icon: '🧹', label: 'Unclean vehicle' },
        { id: 'safety', icon: '⚠️', label: 'Unsafe driving' },
        { id: 'late', icon: '⏰', label: 'Late arrival' },
        { id: 'other', icon: '📝', label: 'Other issues' },
    ];

    const compliments = [
        { id: 'friendly', icon: '😊', label: 'Friendly driver' },
        { id: 'safe', icon: '🛡️', label: 'Safe driving' },
        { id: 'clean', icon: '✨', label: 'Clean vehicle' },
        { id: 'punctual', icon: '⏱️', label: 'On time' },
        { id: 'helpful', icon: '🤝', label: 'Very helpful' },
        { id: 'skilled', icon: '👍', label: 'Great driving' },
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

    const handleSubmit = () => {
        if (rating === 0) {
            Alert.alert('Rating Required', 'Please select a star rating before submitting');
            return;
        }

        Alert.alert(
            'Thank You!',
            'Your feedback helps us improve our service',
            [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]
        );
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
                        <Text style={[
                            styles.star,
                            star <= rating ? styles.starFilled : styles.starEmpty
                        ]}>
                            {star <= rating ? '⭐' : '☆'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderOptions = (options: typeof commonIssues) => {
        return (
            <View style={styles.optionsContainer}>
                {options.map((option) => (
                    <TouchableOpacity
                        key={option.id}
                        style={[
                            styles.optionChip,
                            selectedIssues.includes(option.id) && styles.optionChipSelected
                        ]}
                        onPress={() => toggleIssue(option.id)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.optionIcon}>{option.icon}</Text>
                        <Text style={[
                            styles.optionLabel,
                            selectedIssues.includes(option.id) && styles.optionLabelSelected
                        ]}>
                            {option.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../assets/rickshaw_green.png')}
                            style={styles.successImage}
                            resizeMode="contain"
                        />
                        <View style={styles.successBadge}>
                            <Text style={styles.successIcon}>✅</Text>
                        </View>
                    </View>

                    <View style={styles.headerContainer}>
                        <Text style={styles.title}>
                            Trip <Text style={styles.highlight}>Completed!</Text>
                        </Text>
                        <Text style={styles.subtitle}>
                            Your ride has ended successfully.{'\n'}
                            Rate your experience with the driver.
                        </Text>
                    </View>

                    <View style={styles.driverCard}>
                        <View style={styles.driverProfile}>
                            <View style={styles.driverAvatar}>
                                <Text style={styles.avatarText}>RS</Text>
                            </View>
                            <View style={styles.driverDetails}>
                                <Text style={styles.driverName}>Ramesh Sharma</Text>
                                <Text style={styles.driverInfo}>Honda Activa • DL-01-AB-1234</Text>
                                <Text style={styles.tripInfo}>15 Oct, 3:30 PM • ₹45 paid</Text>
                            </View>
                        </View>
                    </View>

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
                        <View style={styles.feedbackSection}>
                            <Text style={styles.sectionTitle}>What went wrong?</Text>
                            {renderOptions(commonIssues)}
                        </View>
                    )}

                    {rating >= 4 && (
                        <View style={styles.feedbackSection}>
                            <Text style={styles.sectionTitle}>What did you like?</Text>
                            {renderOptions(compliments)}
                        </View>
                    )}

                    <View style={styles.commentSection}>
                        <Text style={styles.sectionTitle}>Additional feedback</Text>
                        <TextInput
                            style={styles.commentInput}
                            placeholder="Tell us more about your experience..."
                            placeholderTextColor="rgba(255, 255, 255, 0.5)"
                            multiline
                            numberOfLines={4}
                            value={comment}
                            onChangeText={setComment}
                            textAlignVertical="top"
                        />
                    </View>

                    <View style={styles.tipSection}>
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
                    </View>

                    <View style={styles.summarySection}>
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
                    </View>

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Submit Feedback"
                            onPress={handleSubmit}
                            variant="primary"
                            style={styles.submitButton}
                        />
                        <Button
                            title="Book Another Ride"
                            onPress={handleBookAnother}
                            variant="secondary"
                            style={styles.bookButton}
                        />
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
    scrollView: {
        flex: 1,
    },
    content: {
        paddingHorizontal: 30,
        paddingVertical: 30,
        paddingBottom: 50,
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 30,
        position: 'relative',
    },
    successImage: {
        width: width * 0.4,
        height: width * 0.3,
    },
    successBadge: {
        position: 'absolute',
        top: -10,
        right: '35%',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F2C94C',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    successIcon: {
        fontSize: 24,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 12,
        textAlign: 'center',
    },
    highlight: {
        color: '#F2C94C',
    },
    subtitle: {
        fontSize: 16,
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.9,
    },
    driverCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
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
        color: '#219653',
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    driverInfo: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.8,
        marginBottom: 2,
    },
    tripInfo: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.7,
    },
    ratingSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 16,
        textAlign: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 12,
    },
    starButton: {
        marginHorizontal: 8,
    },
    star: {
        fontSize: 40,
    },
    starFilled: {
        color: '#F2C94C',
    },
    starEmpty: {
        color: 'rgba(255, 255, 255, 0.3)',
    },
    ratingText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#F2C94C',
    },
    feedbackSection: {
        marginBottom: 30,
    },
    optionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
    },
    optionChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginHorizontal: 6,
        marginVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    optionChipSelected: {
        backgroundColor: 'rgba(242, 201, 76, 0.2)',
        borderColor: '#F2C94C',
    },
    optionIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    optionLabel: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
    },
    optionLabelSelected: {
        color: '#F2C94C',
        fontWeight: '600',
    },
    commentSection: {
        marginBottom: 30,
    },
    commentInput: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#FFFFFF',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        minHeight: 100,
    },
    tipSection: {
        marginBottom: 30,
    },
    tipOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    tipChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    tipChipSelected: {
        backgroundColor: '#F2C94C',
        borderColor: '#F2C94C',
    },
    tipLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    tipLabelSelected: {
        color: '#219653',
    },
    summarySection: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryRowTotal: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
        paddingTop: 8,
        marginTop: 8,
        marginBottom: 0,
    },
    summaryLabel: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.8,
    },
    summaryValue: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '500',
    },
    totalLabel: {
        fontSize: 16,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    totalValue: {
        fontSize: 18,
        color: '#F2C94C',
        fontWeight: 'bold',
    },
    buttonContainer: {
        width: '100%',
    },
    submitButton: {
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    bookButton: {
        // No extra styles needed for secondary button
    },
});

export default RatingScreen;