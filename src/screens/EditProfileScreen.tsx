import React, { useState, useEffect } from 'react';
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
    Image,
    Platform,
    PermissionsAndroid,
    Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { launchImageLibrary } from 'react-native-image-picker';
import Button from '../components/Button';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserProfile } from '../store/slices/authSlice';
import { authService } from '../services/api/auth';

const EditProfileScreen = ({ navigation }: any) => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileImage, setProfileImage] = useState(user?.profileImage || null);
    const [newImage, setNewImage] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Sync local state when user data loads/changes from Redux
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
            setEmail(user.email || '');
            if (!newImage) {
                setProfileImage(user.profileImage || null);
            }
        }
    }, [user]);

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android') {
            try {
                // Android 13+ (API 33+) uses different permission
                const androidVersion = Platform.Version as number;
                const permission = androidVersion >= 33
                    ? 'android.permission.READ_MEDIA_IMAGES' as any
                    : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

                // Check if already granted
                const checkResult = await PermissionsAndroid.check(permission);
                if (checkResult) {
                    console.log('✅ Permission already granted');
                    return true;
                }

                console.log('📱 Requesting permission:', permission);

                // Request permission
                const granted = await PermissionsAndroid.request(
                    permission,
                    {
                        title: 'Storage Permission Required',
                        message: 'Local Toto needs access to your photos to update your profile picture',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );

                console.log('📍 Permission result:', granted);

                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    console.log('✅ Permission granted!');
                    return true;
                } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
                    console.log('❌ Permission denied permanently');
                    Alert.alert(
                        'Permission Required',
                        'Storage permission was permanently denied. Please enable it manually:\n\nSettings → Apps → Local Toto → Permissions → Photos',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            {
                                text: 'Open Settings',
                                onPress: () => Linking.openSettings()
                            }
                        ]
                    );
                    return false;
                } else {
                    console.log('❌ Permission denied');
                    return false;
                }
            } catch (err) {
                console.error('❌ Permission error:', err);
                return false;
            }
        }
        return true;
    };

    const handleImagePick = async () => {
        console.log('📸 Opening image picker...');

        const hasPermission = await requestStoragePermission();
        if (!hasPermission) {
            console.log('❌ No permission, aborting');
            return;
        }

        console.log('✅ Permission granted, launching library');

        const result = await launchImageLibrary({
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        });

        if (result.didCancel) {
            console.log('❌ User cancelled');
            return;
        }

        if (result.errorCode) {
            console.error('❌ Image picker error:', result.errorCode, result.errorMessage);
            Alert.alert('Error', 'Failed to pick image: ' + result.errorMessage);
            return;
        }

        if (result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            console.log('✅ Image selected:', asset.uri);
            setNewImage(asset);
            setProfileImage(asset.uri || null);
        }
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            console.log('Saving profile:', { name, email, newImage });

            let data: any;
            if (newImage) {
                const formData = new FormData();
                formData.append('name', name);
                formData.append('email', email);
                formData.append('photo', {
                    uri: newImage.uri,
                    type: newImage.type,
                    name: newImage.fileName || 'profile.jpg',
                });
                data = formData;
            } else {
                data = { name, email };
            }

            await authService.updateProfile(data);
            await dispatch(fetchUserProfile()).unwrap();
            Alert.alert('Success', 'Profile updated successfully');
            navigation.goBack();
        } catch (error: any) {
            console.error('Failed to update profile:', error);
            const message = error?.response?.data?.message || error?.message || 'Failed to update profile';
            Alert.alert('Error', message);
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
                            {profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
                            ) : (
                                <Text style={styles.avatarText}>
                                    {name ? name.charAt(0).toUpperCase() : 'U'}
                                </Text>
                            )}
                        </View>
                        <TouchableOpacity style={styles.cameraButton} onPress={handleImagePick}>
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
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
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
        backgroundColor: '#2D7C4F',
        borderWidth: 0,
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
        color: '#333',
    },
});

export default EditProfileScreen;