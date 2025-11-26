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
} from 'react-native';

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
      <StatusBar barStyle="light-content" backgroundColor="#27ae60" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerText}>LocalToto</Text>
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

          <View style={styles.facebookContainer}>
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