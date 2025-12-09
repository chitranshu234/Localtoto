// SignUpScreen.js
import React, { useState } from 'react';
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

const SignUpScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');

  const handleSendOTP = () => {
    if (phone.length === 10) {
      console.log('Sending OTP to:', phone);
      navigation?.navigate('OTP', { phone });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#219653" />
      
      {/* Circle Background Effect - Same as Splash Screen */}
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
            <Text style={styles.title}>Sign Up</Text>
            <View style={styles.underline} />
          </View>

          <View style={styles.form}>
            <View style={styles.labelContainer}>
              <Text style={styles.label}>Phone Number</Text>
            </View>
            
            <View style={styles.mobileContainer}>
              <View style={styles.countryCode}>
                <View style={styles.flag}>
                  <View style={[styles.flagPart, { backgroundColor: '#FF9933' }]} />
                  <View style={[styles.flagPart, { backgroundColor: 'white' }]} />
                  <View style={[styles.flagPart, { backgroundColor: '#1F41A0' }]} />
                </View>
                <Text style={styles.countryCodeText}>+91</Text>
              </View>

              <TextInput
                style={styles.mobileInput}
                placeholder="Mobile Number"
                placeholderTextColor="#ccc"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
              />
            </View>

            <TouchableOpacity 
              style={[styles.sendOtpBtn, phone.length < 10 && styles.sendOtpBtnDisabled]}
              onPress={handleSendOTP}
              disabled={phone.length < 10}
            >
              <Text style={styles.sendOtpBtnText}>Send OTP</Text>
            </TouchableOpacity>
          </View>

          {/* <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.facebookBtn}>
              <Text style={styles.socialBtnText}>f Facebook</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#219653', // Main Green - matching splash screen
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
  // Circle background styles matching splash screen
  circle1: {
    position: 'absolute',
    top: -width * 0.2,
    left: -width * 0.2,
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    backgroundColor: '#197A42', // Darker Green
  },
  circle2: {
    position: 'absolute',
    bottom: -width * 0.2,
    right: -width * 0.2,
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: (width * 0.9) / 2,
    backgroundColor: '#27AE60', // Lighter Green
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
    marginVertical:-20
  },
  titleContainer: {
    marginBottom: 25,
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
  form: {
    marginBottom: 20,
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  mobileContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
    alignItems: 'center',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#f9f9f9',
    gap: 6,
  },
  flag: {
    flexDirection: 'row',
    width: 24,
    height: 16,
    borderRadius: 2,
    overflow: 'hidden',
  },
  flagPart: {
    flex: 1,
  },
  countryCodeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  mobileInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  sendOtpBtn: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sendOtpBtnDisabled: {
    backgroundColor: '#ccc',
  },
  sendOtpBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  socialContainer: {
    marginBottom: 15,
  },
  facebookBtn: {
    backgroundColor: '#1877F2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  socialBtnText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SignUpScreen;