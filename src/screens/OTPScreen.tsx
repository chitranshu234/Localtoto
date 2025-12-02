// OTPScreen.js
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

const OTPScreen = ({ navigation, route }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const { phone } = route.params || {};

  // Create refs for each input field
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const handleOTPChange = (value, index) => {
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input when a digit is entered
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Handle backspace to go to previous input
    if (value === '' && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace key to go to previous input
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      console.log('Verifying OTP:', otpString, 'for phone:', phone);
      navigation.navigate('Profile', { phone });
    }
  };

  const handleResendOTP = () => {
    console.log('Resending OTP to:', phone);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#219653" />

      {/* Circle Background Effect - Same as Signup Screen */}
      <View style={styles.backgroundContainer}>
        {/* Top Left Circle - Darker Green */}
        <View style={styles.circle1} />

        {/* Bottom Right Circle - Lighter Green */}
        <View style={styles.circle2} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/logo_white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.card}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Enter OTP</Text>
            <View style={styles.underline} />
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>
              We have sent a 6-digit verification code to
            </Text>
            <Text style={styles.phoneNumber}>+91 {phone}</Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={(value) => handleOTPChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.verifyBtn, otp.join('').length < 6 && styles.verifyBtnDisabled]}
            onPress={handleVerifyOTP}
            disabled={otp.join('').length < 6}
          >
            <Text style={styles.verifyBtnText}>Verify OTP</Text>
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={handleResendOTP}>
              <Text style={styles.resendLink}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
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
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    zIndex: 1,
  },
  header: {
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 60,
    alignSelf: 'flex-start',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginVertical: -20,
  },
  titleContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  underline: {
    width: 50,
    height: 4,
    backgroundColor: '#27ae60',
    borderRadius: 2,
  },
  descriptionContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 5,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#27ae60',
    backgroundColor: '#f0fff4',
  },
  verifyBtn: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyBtnDisabled: {
    backgroundColor: '#ccc',
  },
  verifyBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27ae60',
  },
});

export default OTPScreen;