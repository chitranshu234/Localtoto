// ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  
  StatusBar,
  Dimensions,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ route, navigation }) => {
  // Get phone from params or use default/placeholder
  const phoneFromParams = route?.params?.phone;
  
  // State management
  const [phone, setPhone] = useState(phoneFromParams || '');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempPhone, setTempPhone] = useState('');
  const [activeTab, setActiveTab] = useState('profile'); // Profile tab is active

  // Initialize with params or saved data
  useEffect(() => {
    if (phoneFromParams) {
      setPhone(phoneFromParams);
    } else {
      loadSavedPhone();
    }
  }, [phoneFromParams]);

  const loadSavedPhone = async () => {
    try {
      // You can use AsyncStorage here
      // const savedPhone = await AsyncStorage.getItem('userPhone');
      // if (savedPhone) setPhone(savedPhone);
      
      // For now, use a mock or show placeholder
      setPhone('9876543210'); // Default placeholder
    } catch (error) {
      console.error('Error loading phone:', error);
      setPhone('Phone not set');
    }
  };

  const handleEditPhone = () => {
    setTempPhone(phone);
    setIsEditingPhone(true);
  };

  const handleSavePhone = () => {
    // Validate phone number
    if (!tempPhone || tempPhone.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }
    
    setPhone(tempPhone);
    setIsEditingPhone(false);
    
    // You can save to AsyncStorage here
    // await AsyncStorage.setItem('userPhone', tempPhone);
  };

  const handleCancelEdit = () => {
    setIsEditingPhone(false);
    setTempPhone('');
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter your full name');
      return false;
    }
    
    if (!email.trim()) {
      Alert.alert('Email Required', 'Please enter your email address');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return false;
    }
    
    if (!phone || phone.length < 10) {
      Alert.alert('Phone Required', 'Please set a valid phone number');
      return false;
    }
    
    return true;
  };

  const handleCompleteSignUp = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = {
        phone: phone.replace(/\D/g, ''), // Remove non-digits
        name: name.trim(),
        email: email.trim().toLowerCase(),
      };
      
      console.log('Sign Up Complete:', userData);
      
      // Save user data (you can use AsyncStorage or Redux here)
      // await AsyncStorage.setItem('userData', JSON.stringify(userData));
      
      Alert.alert(
        'Profile Complete!',
        'Your profile has been successfully saved.',
        [
          {
            text: 'Continue',
            onPress: () => {
              // Navigate to home screen
              navigation?.navigate('SearchScreen');
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Sign up error:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format phone number for display
  const formatPhoneNumber = (phoneNum) => {
    if (!phoneNum) return '';
    const cleaned = phoneNum.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+91 ${cleaned.substring(0, 5)} ${cleaned.substring(5)}`;
    }
    return `+91 ${phoneNum}`;
  };
const insets=useSafeAreaInsets()
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#219653" />
      
      {/* Circle Background Effect */}
      <View style={styles.backgroundContainer}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View> 

      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.subtitle}>
              Fill in your details to get started
            </Text>
          </View>

          <View style={styles.form}>
            {/* Phone Section */}
            <View style={styles.phoneContainer}>
              <Text style={styles.phoneLabel}>Phone Number</Text>
              
              {isEditingPhone ? (
                <View style={styles.phoneEditContainer}>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="Enter 10-digit phone number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={tempPhone}
                    onChangeText={setTempPhone}
                    maxLength={10}
                    autoFocus
                  />
                  <View style={styles.phoneEditActions}>
                    <TouchableOpacity 
                      style={styles.saveBtn}
                      onPress={handleSavePhone}
                    >
                      <Text style={styles.saveBtnText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.cancelBtn}
                      onPress={handleCancelEdit}
                    >
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.phoneRow}>
                  <Text style={styles.phoneNumber}>
                    {formatPhoneNumber(phone) || 'Phone not set'}
                  </Text>
                  <TouchableOpacity 
                    onPress={handleEditPhone}
                    style={styles.editBtn}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.editBtnText}>✎ Edit</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Name Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Your Full Name"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                returnKeyType="done"
                onSubmitEditing={handleCompleteSignUp}
              />
            </View>

            {/* Complete Button */}
            <TouchableOpacity 
              style={[
                styles.completeBtn, 
                (!name.trim() || !email.trim() || !phone) && styles.completeBtnDisabled
              ]}
              onPress={handleCompleteSignUp}
              disabled={!name.trim() || !email.trim() || !phone || loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.completeBtnText}>Complete Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Help Text */}
            <Text style={styles.helpText}>
              * Required fields
            </Text>
          </View>

          {/* Optional: Skip for now */}
          <TouchableOpacity
            style={styles.skipContainer}
            onPress={() => navigation?.navigate('SearchScreen')}
          >
            <Text style={styles.skipText}>Skip for now →</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BOTTOM TABS - Consistent with other screens */}
      <View style={[styles.bottomTabs,{paddingBottom:insets?.bottom}]}>
        {/* HOME */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => {
            setActiveTab("home");
            navigation.navigate("Search");
          }}
        >
          <Icon
            name="home"
            size={22}
            color={activeTab === "home" ? "#2D7C4F" : "#777"}
          />
          <Text style={[styles.tabText, activeTab === "home" && styles.activeTabText]}>
            Home
          </Text>
        </TouchableOpacity>

        {/* RIDES */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => {
            setActiveTab("rides");
            navigation.navigate("TripHistory");
          }}
        >
          <Icon
            name="car"
            size={22}
            color={activeTab === "rides" ? "#2D7C4F" : "#777"}
          />
          <Text style={[styles.tabText, activeTab === "rides" && styles.activeTabText]}>
            Rides
          </Text>
        </TouchableOpacity>

        {/* PROFILE */}
        <TouchableOpacity
          style={styles.tab}
          onPress={() => {
            setActiveTab("profile");
            // Already on profile screen
          }}
        >
          <Icon
            name="user"
            size={22}
            color={activeTab === "profile" ? "#2D7C4F" : "#777"}
          />
          <Text style={[styles.tabText, activeTab === "profile" && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingBottom: 80, // Space for bottom tabs
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  titleContainer: {
    marginBottom: 25,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  underline: {
    width: 60,
    height: 4,
    backgroundColor: '#27ae60',
    borderRadius: 2,
  },
  form: {
    marginBottom: 20,
  },
  phoneContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  phoneLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
    fontWeight: '500',
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
    flex: 1,
    marginRight: 10,
  },
  phoneEditContainer: {
    marginTop: 8,
  },
  phoneInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
    marginBottom: 10,
  },
  phoneEditActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#27ae60',
    borderRadius: 6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelBtnText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#27ae60',
    borderRadius: 6,
    minWidth: 60,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#27ae60',
    fontSize: 13,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  completeBtn: {
    backgroundColor: '#27ae60',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeBtnDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  completeBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  skipContainer: {
    alignItems: 'center',
    padding: 10,
    marginTop: 10,
  },
  skipText: {
    color: '#27ae60',
    fontSize: 14,
    fontWeight: '600',
  },
  // BOTTOM TABS - Same as other screens
  bottomTabs: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  tab: {
    alignItems: "center",
  },
  tabText: {
    fontSize: 12,
    color: "#777",
    marginTop: 4,
  },
  activeTabText: {
    color: "#2D7C4F",
    fontWeight: "600",
  },
});

export default ProfileScreen;