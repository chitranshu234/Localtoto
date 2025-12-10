import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();

    const menuItems = [
        { id: '1', title: 'My Rides', icon: 'car', action: () => console.log('My Rides') },
        { id: '2', title: 'Saved Locations', icon: 'map-marker', action: () => console.log('Saved Locations') },
        { id: '3', title: 'Payment Methods', icon: 'credit-card', action: () => console.log('Payment Methods') },
        { id: '4', title: 'Help & Support', icon: 'question-circle', action: () => console.log('Help & Support') },
        { id: '5', title: 'Settings', icon: 'cog', action: () => console.log('Settings') },
    ];

    const handleLogout = async () => {
        console.log('Logging out...');
        await logout();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2D7C4F" />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => {
                        console.log('Back button pressed');
                        navigation.goBack();
                    }}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Icon name="arrow-left" size={20} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>My Profile</Text>
            </View>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.profileCard}>
                    <View style={styles.avatarCircle}>
                        {user?.profileImage ? (
                            <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
                        ) : (
                            <Text style={styles.avatarText}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </Text>
                        )}
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userPhone}>{user?.phone || ''}</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('EditProfile')}
                    >
                        <Icon name="edit" size={14} color="#2D7C4F" style={{ marginRight: 6 }} />
                        <Text style={styles.editButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.menuContainer}>
                    {menuItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.menuItem}
                            onPress={item.action}
                        >
                            <View style={styles.menuIconCircle}>
                                <Icon name={item.icon} size={20} color="#2D7C4F" />
                            </View>
                            <Text style={styles.menuTitle}>{item.title}</Text>
                            <Icon name="angle-right" size={24} color="#CCC" />
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Icon name="sign-out" size={20} color="#EB5757" style={{ marginRight: 10 }} />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
                <Text style={styles.versionText}>Version 1.0.0</Text>
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
    profileCard: {
        backgroundColor: '#FFFFFF',
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingVertical: 30,
        paddingHorizontal: 20,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: '#D1F2EB',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        overflow: 'hidden',
    },
    avatarImage: {
        width: '100%',
        height: '100%',
    },
    avatarText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#2D7C4F',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 5,
    },
    userPhone: {
        fontSize: 15,
        color: '#666',
        marginBottom: 20,
    },
    editButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#2D7C4F',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 25,
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2D7C4F',
    },
    menuContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    menuIconCircle: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#F0FFF4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    menuTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#EB5757',
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#EB5757',
    },
    versionText: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginBottom: 30,
    },
});

export default ProfileScreen;
