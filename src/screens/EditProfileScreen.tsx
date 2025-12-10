import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TextInput,
    Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/api/auth';

const EditProfileScreen = ({ navigation }: any) => {
    const { user, updateProfile } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            console.log('Saving profile:', { name, email });
            await authService.updateProfile({ name, email });
            await updateProfile(); // Refresh local user state
            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error('Failed to update profile:', error);
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2D7C4F" />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Icon name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Edit Profile</Text>
            </View>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.profileSection}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatarCircle}>
                            <Text style={styles.avatarText}>
                                {name ? name.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.cameraButton}>
                            <Icon name="camera" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.changePhotoText}>Change Photo</Text>
                </View>
                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="user" size={18} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor="#999"
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Phone Number</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="phone" size={18} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, styles.disabledInput]}
                                value={phone}
                                editable={false}
                                placeholder="Enter phone number"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <View style={styles.inputContainer}>
                            <Icon name="envelope" size={18} color="#666" style={styles.inputIcon} />
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter email address"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.buttonContainer}>
                    <Button
                        title={isLoading ? "Saving..." : "Save Changes"}
                        onPress={handleSave}
                        variant="primary"
                        style={styles.saveButton}
                        disabled={isLoading}
                    />

                    <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={() => navigation.goBack()}
                        disabled={isLoading}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        backgroundColor: '#2D7C4F',
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    profileSection: {
        alignItems: 'center',
        paddingVertical: 30,
        backgroundColor: '#FFFFFF',
        marginBottom: 20,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: 10,
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#D1F2EB',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#2D7C4F',
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#2D7C4F',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFFFFF',
    },
    changePhotoText: {
        fontSize: 14,
        color: '#2D7C4F',
        fontWeight: '600',
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 25,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        paddingHorizontal: 15,
        height: 50,
    },
    inputIcon: {
        marginRight: 12,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    disabledInput: {
        color: '#999',
        backgroundColor: '#F0F0F0',
    },
    buttonContainer: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    saveButton: {
        marginBottom: 12,
        backgroundColor: '#2D7C4F', // Added Green Background
        borderWidth: 0, // Removed white border
    },
    cancelButton: {
        borderWidth: 2,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333', // Changed to dark grey for visibility
    },
});

export default EditProfileScreen;