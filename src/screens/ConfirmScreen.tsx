import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Dimensions,
    StatusBar,
    TextInput,
    SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Button from '../components/Button';
const { width } = Dimensions.get('window');
const VEHICLES = [
    {
        id: '1',
        name: 'Bike',
        price: '₹25',
        eta: '2 min',
        capacity: '1 seat',
        image: require('../assets/bike-removebg-preview.png'),
    },
    {
        id: '2',
        name: 'E-Rickshaw',
        price: '₹45',
        eta: '4 min',
        capacity: '2 seats',
        image: require('../assets/e_rickshaw-removebg-preview.png'),
    },
    {
        id: '3',
        name: 'Toto',
        price: '₹65',
        eta: '6 min',
        capacity: '4 seats',
        image: require('../assets/auto_rickshaw-removebg-preview.png'),
    },
];
const ConfirmScreen = ({ navigation }: any) => {
    const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[0].id);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [promoCode, setPromoCode] = useState('');
    const handleConfirm = () => {
        console.log('Ride Confirmed');
        console.log('Selected Vehicle:', selectedVehicle);
        console.log('Payment Method:', paymentMethod);
        console.log('Promo Code:', promoCode);
    };
    const paymentMethods = [
        { key: 'cash', label: 'Cash', icon: 'money' },
        { key: 'upi', label: 'UPI', icon: 'mobile' },
        { key: 'card', label: 'Card', icon: 'credit-card' },
    ];
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <View style={styles.mapPlaceholder}>
                <View style={styles.mapOverlay}>
                    <Text style={styles.mapText}>Map View Area</Text>
                    <Text style={styles.mapSubtext}>Your route will be displayed here</Text>
                </View>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                    <Icon name="arrow-left" size={20} color="#333" />
                </TouchableOpacity>
                <View style={styles.tripInfoCard}>
                    <TouchableOpacity
                        style={styles.locationRow}
                        onPress={() => navigation.navigate('Search', { type: 'pickup' })}
                    >
                        <View style={styles.greenDot} />
                        <View style={styles.locationTextContainer}>
                            <Text style={styles.locationLabel}>Pickup</Text>
                            <Text style={styles.locationText}>Current Location</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.dividerLine} />
                    <TouchableOpacity
                        style={styles.locationRow}
                        onPress={() => navigation.navigate('Search', { type: 'drop' })}
                    >
                        <View style={styles.redDot} />
                        <View style={styles.locationTextContainer}>
                            <Text style={styles.locationLabel}>Drop</Text>
                            <Text style={styles.locationText}>Central Mall</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.bottomSheet}>
                <View style={styles.handle} />
                <Text style={styles.sectionTitle}>Choose a ride</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.vehicleList}
                >
                    {VEHICLES.map((vehicle) => (
                        <TouchableOpacity
                            key={vehicle.id}
                            style={[
                                styles.vehicleCard,
                                selectedVehicle === vehicle.id && styles.selectedCard,
                            ]}
                            onPress={() => setSelectedVehicle(vehicle.id)}
                        >
                            <View style={styles.vehicleImageContainer}>
                                <Image
                                    source={vehicle.image}
                                    style={[
                                        styles.vehicleImage,
                                        vehicle.name === 'E-Rickshaw' && styles.vehicleImageSmaller
                                    ]}
                                    resizeMode="contain"
                                />
                            </View>
                            <View style={styles.vehicleinfo}>
                                <Text style={[
                                    styles.vehicleName,
                                    selectedVehicle === vehicle.id && styles.selectedText
                                ]}>{vehicle.name}</Text>
                                <Text style={styles.vehicleEta}>{vehicle.eta} • {vehicle.capacity}</Text>
                            </View>
                            <Text style={[
                                styles.vehiclePrice,
                                selectedVehicle === vehicle.id && styles.selectedPriceText
                            ]}>{vehicle.price}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
                <View style={styles.paymentContainer}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentOptions}>
                        {paymentMethods.map((method) => (
                            <TouchableOpacity
                                key={method.key}
                                style={[
                                    styles.paymentOption,
                                    paymentMethod === method.key && styles.selectedPayment,
                                ]}
                                onPress={() => setPaymentMethod(method.key)}
                            >
                                <Icon 
                                    name={method.icon} 
                                    size={16} 
                                    color={paymentMethod === method.key ? '#FFFFFF' : '#2D7C4F'} 
                                    style={{ marginRight: 6 }}
                                />
                                <Text style={[
                                    styles.paymentText,
                                    paymentMethod === method.key && styles.selectedPaymentText,
                                ]}>
                                    {method.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
                <View style={styles.promoContainer}>
                    <Text style={styles.promoLabel}>Have a promo code?</Text>
                    <View style={styles.promoInputContainer}>
                        <TextInput
                            style={styles.promoInput}
                            placeholder="Enter code"
                            placeholderTextColor="#999"
                            value={promoCode}
                            onChangeText={setPromoCode}
                        />
                        <TouchableOpacity style={styles.applyButton}>
                            <Text style={styles.applyButtonText}>Apply</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.footer}>
                    <Button
                        title="Confirm Ride"
                        onPress={handleConfirm}
                        variant="primary"
                        style={styles.confirmButton}
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    mapPlaceholder: {
        flex: 1,
        backgroundColor: '#E8F5E9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    mapOverlay: {
        alignItems: 'center',
    },
    mapText: {
        color: '#666',
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    mapSubtext: {
        color: '#999',
        fontSize: 14,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    tripInfoCard: {
        position: 'absolute',
        top: 110,
        left: 20,
        right: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    greenDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#219653',
        marginRight: 12,
    },
    redDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EB5757',
        marginRight: 12,
    },
    locationText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '600',
    },
    locationTextContainer: {
        flex: 1,
    },
    locationLabel: {
        fontSize: 11,
        color: '#888',
        marginBottom: 2,
        textTransform: 'uppercase',
        fontWeight: '500',
    },
    dividerLine: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 8,
    },
    bottomSheet: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingVertical: 20,
        paddingHorizontal: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    vehicleList: {
        paddingBottom: 20,
    },
    vehicleCard: {
        width: width * 0.32,
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        marginRight: 12,
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    selectedCard: {
        borderColor: '#219653',
        backgroundColor: '#F0FFF4',
    },
    vehicleImageContainer: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: 15,
    },
    vehicleImage: {
        width: 100,
        height: 70,
    },
    vehicleImageSmaller: {
        width: 55,
        height: 80,
    },
    vehicleinfo: {
        alignItems: 'center',
        marginBottom: 8,
    },
    vehicleName: {
        fontSize: 15,
        fontWeight: '700',
        color: '#333',
        marginBottom: 2,
    },
    selectedText: {
        color: '#219653',
    },
    vehicleEta: {
        fontSize: 11,
        color: '#888',
    },
    vehiclePrice: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
    },
    selectedPriceText: {
        color: '#219653',
    },
    paymentContainer: {
        marginBottom: 20,
    },
    paymentOptions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    paymentOption: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 8,
        backgroundColor: '#FFFFFF',
    },
    selectedPayment: {
        backgroundColor: '#219653',
        borderColor: '#219653',
    },
    paymentText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    selectedPaymentText: {
        color: '#FFFFFF',
    },
    promoContainer: {
        marginBottom: 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    promoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        fontWeight: '500',
    },
    promoInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    promoInput: {
        flex: 1,
        height: 45,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 10,
        paddingHorizontal: 15,
        fontSize: 14,
        color: '#333',
        backgroundColor: '#F9F9F9',
        marginRight: 10,
    },
    applyButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: '#219653',
        borderRadius: 10,
    },
    applyButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
    },
    footer: {
        marginTop: 10,
    },
    confirmButton: {
        backgroundColor: '#219653',
        borderWidth: 0,
    },
});
export default ConfirmScreen;