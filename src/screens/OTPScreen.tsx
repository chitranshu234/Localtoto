import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Dimensions,
    Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from '../components/Button';

const { width } = Dimensions.get('window');

const OTPScreen = ({ navigation }: any) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        // Focus first input on mount
        setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 100);

        // Timer countdown
        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const handleOtpChange = (value: string, index: number) => {
        // Extract only numbers
        const numericValue = value.replace(/[^0-9]/g, '');
        
        // If nothing numeric, don't update at all
        if (value.length > 0 && numericValue.length === 0) {
            return;
        }

        const newOtp = [...otp];
        
        // Take only the last digit
        if (numericValue.length > 0) {
            newOtp[index] = numericValue.slice(-1);
            setOtp(newOtp);
            
            // Move to next box
            if (index < 5) {
                inputRefs.current[index + 1]?.focus();
            }
        } else {
            // Empty value - this is a delete/backspace
            newOtp[index] = '';
            setOtp(newOtp);
            
            // Move to previous box
            if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        const key = e.nativeEvent.key;

        // Handle backspace specially
        if (key === 'Backspace') {
            if (otp[index]) {
                // Has value - will be cleared by onChangeText, then move back
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
            // Always move back on backspace (if not first box)
            if (index > 0) {
                setTimeout(() => {
                    inputRefs.current[index - 1]?.focus();
                }, 50);
            }
        }
    };

    const handleVerify = () => {
        if (!isComplete) return;
        
        const otpCode = otp.join('');
        console.log('Verifying OTP:', otpCode);
        
        // Navigate to Map screen
        navigation.navigate('Map');
    };

    const handleResend = () => {
        if (timer === 0) {
            setTimer(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            console.log('Resending OTP');
        }
    };

    const isComplete = otp.every(digit => digit !== '');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Back Button */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
                <Icon name="arrow-left" size={20} color="#333" />
            </TouchableOpacity>

            <View style={styles.content}>
                {/* Logo Circle */}
                <View style={styles.logoCircle}>
                    <Text style={styles.logoText}>LT</Text>
                </View>

                {/* Title */}
                <Text style={styles.title}>Enter OTP</Text>
                <Text style={styles.subtitle}>
                    We've sent a 6-digit code to{'\n'}
                    <Text style={styles.phoneNumber}>+91 98765 43210</Text>
                </Text>

                {/* OTP Input Boxes */}
                <View style={styles.otpContainer}>
                    {otp.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => { inputRefs.current[index] = ref; }}
                            style={[
                                styles.otpBox,
                                digit ? styles.otpBoxFilled : null,
                            ]}
                            value={digit}
                            onChangeText={(value) => handleOtpChange(value, index)}
                            onKeyPress={(e) => handleKeyPress(e, index)}
                            keyboardType="number-pad"
                            maxLength={2}
                            selectTextOnFocus
                            contextMenuHidden
                            textContentType="oneTimeCode"
                            importantForAutofill="no"
                        />
                    ))}
                </View>

                {/* Resend OTP */}
                <View style={styles.resendContainer}>
                    {timer > 0 ? (
                        <View style={styles.timerRow}>
                            <Icon name="clock-o" size={14} color="#666" />
                            <Text style={styles.timerText}>
                                {' '}Resend OTP in <Text style={styles.timerHighlight}>{timer}s</Text>
                            </Text>
                        </View>
                    ) : (
                        <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
                            <Icon name="refresh" size={14} color="#2D7C4F" />
                            <Text style={styles.resendText}> Resend OTP</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Verify Button */}
                <TouchableOpacity
                    style={[
                        styles.verifyButton,
                        isComplete ? styles.verifyButtonActive : styles.verifyButtonInactive,
                    ]}
                    onPress={handleVerify}
                    disabled={!isComplete}
                    activeOpacity={0.8}
                >
                    <Text style={styles.verifyButtonText}>Verify</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    content: {
        flex: 1,
        paddingHorizontal: 30,
        paddingTop: 120,
        alignItems: 'center',
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#2D7C4F',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    logoText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 15,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
        lineHeight: 22,
    },
    phoneNumber: {
        fontWeight: '600',
        color: '#2D7C4F',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    otpBox: {
        width: 50,
        height: 55,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        marginHorizontal: 5,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        backgroundColor: '#FFFFFF',
    },
    otpBoxFilled: {
        borderColor: '#2D7C4F',
        backgroundColor: '#F0FFF4',
    },
    resendContainer: {
        marginBottom: 40,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerText: {
        fontSize: 14,
        color: '#666',
    },
    timerHighlight: {
        color: '#2D7C4F',
        fontWeight: '600',
    },
    resendButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendText: {
        fontSize: 15,
        color: '#2D7C4F',
        fontWeight: '600',
    },
    verifyButton: {
        width: width - 60,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: 30,
    },
    verifyButtonActive: {
        backgroundColor: '#2D7C4F',
    },
    verifyButtonInactive: {
        backgroundColor: '#E0E0E0',
    },
    verifyButtonText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default OTPScreen;