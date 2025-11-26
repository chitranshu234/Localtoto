import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';

const PaymentMethodScreen = () => {
  const [selectedMethod, setSelectedMethod] = useState('paypal');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.doneButton}>Done</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Payment Method</Text>

      <ScrollView style={styles.content}>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a7f4a',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  doneButton: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    backgroundColor: '#1a7f4a',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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