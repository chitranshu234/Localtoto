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
} from 'react-native';

const SignUpScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');

  const handleSendOTP = () => {
    if (phone.length === 10) {
      console.log('Sending OTP to:', phone);
      navigation?.navigate('Profile', { phone });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#27ae60" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>LocalToto</Text>
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

          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.facebookBtn}>
              <Text style={styles.socialBtnText}>f Facebook</Text>
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
    backgroundColor: '#27ae60',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 30,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
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