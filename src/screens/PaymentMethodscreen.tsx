import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

const PaymentMethodScreen = ({ navigation }: any) => {
  const [selectedMethod, setSelectedMethod] = useState('paypal');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2D7C4F" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Icon name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}> defaut Payment Method</Text>
      </View> 

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cash Option */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.cashCard}>
            <View style={styles.cashIcon}>
              <Text style={styles.currencySymbol}>₹</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.methodName}>Cash</Text>
              <Text style={styles.defaultLabel}>Default Payment Method</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Credit Cards Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CREDIT CARD</Text>

          {/* Visa Card 1 */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedMethod('visa1')}
          >
            <View style={styles.cardHeader}>
              <Image
                source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCA1MCAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iMzIiIHJ4PSI0IiBmaWxsPSIjMUExMkE2Ii8+PHRleHQgeD0iMjUiIHk9IjIwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VklTQTwvdGV4dD48L3N2Zz4=' }}
                style={styles.cardLogo}
              />
              <Text style={styles.cardNumber}>**** **** **** 5967</Text>
            </View>
          </TouchableOpacity>

          {/* PayPal */}
          <TouchableOpacity
            style={[
              styles.card,
              selectedMethod === 'paypal' && styles.selectedCard,
            ]}
            onPress={() => setSelectedMethod('paypal')}
          >
            <View style={styles.cardHeader}>
              <View style={styles.paypalLogo}>
                <Text style={styles.paypalText}>PP</Text>
              </View>
              <Text style={styles.email}>wilson.casper@bernice.info</Text>
              {selectedMethod === 'paypal' && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          {/* Mastercard */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => setSelectedMethod('mc')}
          >
            <View style={styles.cardHeader}>
              <Image
                source={{ uri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCA1MCAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTAiIGhlaWdodD0iMzIiIHJ4PSI0IiBmaWxsPSIjMkQyRDJEIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSIxNiIgcj0iOCIgZmlsbD0iI0ZGNTAwMCIvPjxjaXJjbGUgY3g9IjMwIiBjeT0iMTYiIHI9IjgiIGZpbGw9IiNGRkE1MDAiLz48L3N2Zz4=' }}
                style={styles.cardLogo}
              />
              <Text style={styles.cardNumber}>**** **** **** 3461</Text>
            </View>
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
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1,
    marginBottom: 12,
  },
  cashCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cashIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a7f4a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  cardContent: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  defaultLabel: {
    fontSize: 13,
    color: '#aaa',
    marginTop: 4,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCard: {
    borderColor: '#1a7f4a',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardLogo: {
    width: 40,
    height: 26,
    borderRadius: 4,
    marginRight: 12,
  },
  paypalLogo: {
    width: 40,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#003087',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paypalText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  email: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a7f4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default PaymentMethodScreen;