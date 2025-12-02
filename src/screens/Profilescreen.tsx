// ProfileScreen.js
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

const ProfileScreen = ({ route, navigation }) => {
  const { phone } = route.params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleCompleteSignUp = () => {
    if (name.trim() && email.trim()) {
      console.log('Sign Up Complete:', { phone, name, email });
      // Navigate to home or next screen
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
            <Text style={styles.title}>Complete Profile</Text>
            <View style={styles.underline} />
          </View>

          <View style={styles.form}>
            <View style={styles.phoneContainer}>
              <Text style={styles.phoneLabel}>Phone Number</Text>
              <View style={styles.phoneRow}>
                <Text style={styles.phoneNumber}>+91 {phone}</Text>
                <TouchableOpacity 
                  onPress={() => navigation?.goBack()}
                  style={styles.editBtn}
                >
                  <Text style={styles.editBtnText}>✎ Edit</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.labelContainer}>
              <Text style={styles.label}>Full Name</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter Your Full Name"
              placeholderTextColor="#ccc"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.labelContainer}>
              <Text style={styles.label}>Email Address</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#ccc"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity 
              style={[styles.completeBtn, (!name.trim() || !email.trim()) && styles.completeBtnDisabled]}
              onPress={handleCompleteSignUp}
              disabled={!name.trim() || !email.trim()}
            >
              <Text style={styles.completeBtnText}>Complete Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* <View style={styles.facebookContainer}>
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
  phoneContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  phoneLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  phoneRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#27ae60',
    borderRadius: 6,
  },
  editBtnText: {
    color: '#27ae60',
    fontSize: 12,
    fontWeight: '600',
  },
  labelContainer: {
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 15,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  completeBtn: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  completeBtnDisabled: {
    backgroundColor: '#ccc',
  },
  completeBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  facebookContainer: {
    marginTop: 10,
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

export default ProfileScreen;