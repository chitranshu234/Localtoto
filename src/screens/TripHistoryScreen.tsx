import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TripHistoryScreen = ({ navigation }: any) => {
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);
  const [trips, setTrips] = useState<any[]>([]);

  // Load trips from storage on component mount
  useEffect(() => {
    loadTrips();
  }, []);

  // Listen for screen focus (to refresh trips)
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTrips();
    });
    return unsubscribe;
  }, [navigation]);

  // Load trips from AsyncStorage
  const loadTrips = async () => {
    try {
      const stored = await AsyncStorage.getItem('trip_history');
      if (stored) {
        const savedTrips = JSON.parse(stored);
        setTrips(savedTrips);
      }
    } catch (error) {
      console.error('Error loading trips:', error);
    }
  };

  // Save a new trip to history
  const saveTripToHistory = async (tripData: any) => {
    try {
      const newTrip = {
        id: Date.now(), // unique ID
        date: 'Today',
        time: new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        }),
        pickupLocation: tripData.pickupLocation || 'Unknown Pickup',
        dropoffLocation: tripData.dropoffLocation || 'Unknown Destination',
        distance: tripData.distance ? `${tripData.distance} km` : 'Unknown',
        duration: tripData.duration ? `${tripData.duration} mins` : 'Unknown',
        amount: tripData.amount || 'Unknown',
        driverName: tripData.driverName || 'Driver',
        driverRating: tripData.driverRating || 4.8,
        carType: tripData.carType || 'Sedan',
        status: 'Completed',
        completedAt: new Date().toISOString(),
      };

      const updatedTrips = [newTrip, ...trips];
      setTrips(updatedTrips);

      await AsyncStorage.setItem('trip_history', JSON.stringify(updatedTrips));

      console.log('✅ Trip saved to history:', newTrip);
      return newTrip;
    } catch (error) {
      console.error('Error saving trip:', error);
      return null;
    }
  };

  // Make save function globally available for other screens
  useEffect(() => {
    global.saveTripToHistory = saveTripToHistory;
  }, [trips]);

  const toggleTrip = (tripId: number) => {
    setExpandedTrip(expandedTrip === tripId ? null : tripId);
  };

  // Test function to add a sample trip
  // const saveTestTrip = async () => {
  //   // const testTrip = {
  //   //   pickupLocation: 'Patna Junction',
  //   //   dropoffLocation: 'Danapur Railway Station',
  //   //   distance: 12.5,
  //   //   duration: 25,
  //   //   amount: '₹350',
  //   //   driverName: 'Test Driver',
  //   //   driverRating: 4.7,
  //   //   carType: 'Auto Rickshaw',
  //   // };

  //   const saved = await saveTripToHistory(testTrip);
  //   if (saved) {
  //     Alert.alert('Success', 'Test trip added to history!');
  //   }
  // };

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
        <Text style={styles.headerTitle}>Trip History</Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {trips.length > 0 ? (
          trips.map((trip) => (
          <TouchableOpacity
            key={trip.id}
            onPress={() => toggleTrip(trip.id)}
            activeOpacity={0.7}
          >
            <View style={styles.tripCard}>
              {/* Trip Header */}
              <View style={styles.tripHeader}>
                <View>
                  <Text style={styles.tripDate}>{trip.date}</Text>
                  <Text style={styles.tripTime}>{trip.time}</Text>
                </View>
                <View style={styles.amountSection}>
                  <Text style={styles.tripAmount}>{trip.amount}</Text>
                  <Text style={styles.tripStatus}>{trip.status}</Text>
                </View>
              </View>

              {/* Location Info */}
              <View style={styles.locationContainer}>
                <View style={styles.timeline}>
                  <View style={styles.pickupDot} />
                  <View style={styles.line} />
                  <View style={styles.dropoffDot} />
                </View>
                <View style={styles.locationText}>
                  <Text style={styles.pickupText}>{trip.pickupLocation}</Text>
                  <Text style={styles.dropoffText}>{trip.dropoffLocation}</Text>
                </View>
              </View>

              {/* Trip Details */}
              <View style={styles.detailsRow}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>⏱</Text>
                  <Text style={styles.detailText}>{trip.duration}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>📍</Text>
                  <Text style={styles.detailText}>{trip.distance}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailIcon}>🚗</Text>
                  <Text style={styles.detailText}>{trip.carType}</Text>
                </View>
              </View>

              {/* Expanded Details */}
              {expandedTrip === trip.id && (
                <View style={styles.expandedSection}>
                  {/* Driver Info */}
                  <View style={styles.driverSection}>
                    <View style={styles.driverInfo}>
                      <View style={styles.driverAvatar}>
                        <Text style={styles.driverInitial}>
                          {trip.driverName.charAt(0)}
                        </Text>
                      </View>
                      <View style={styles.driverDetails}>
                        <Text style={styles.driverName}>{trip.driverName}</Text>
                        <View style={styles.ratingContainer}>
                          <Icon name="star" size={12} color="#FFD700" />
                          <Text style={styles.rating}>{trip.driverRating}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.callButton}>
                      <Icon name="phone" size={16} color="white" />
                    </TouchableOpacity>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.buttonsRow}>
                    <TouchableOpacity style={styles.bookAgainBtn}>
                      <Text style={styles.bookAgainText}>Book Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rateBtn}>
                      <Text style={styles.rateText}>Rate Trip</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))
        ) : (
          // Empty state
          <View style={styles.emptyContainer}>
            <Icon name="history" size={60} color="#ccc" />
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptySubtitle}>Your completed trips will appear here</Text>
          </View>
        )}

  
        {/* Load More Button */}
        <TouchableOpacity style={styles.loadMoreBtn}>
          <Text style={styles.loadMoreText}>Load More Trips</Text>
        </TouchableOpacity>
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
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tripDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    marginBottom: 2,
  },
  tripTime: {
    fontSize: 12,
    color: '#bbb',
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  tripAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a7f4a',
    marginBottom: 2,
  },
  tripStatus: {
    fontSize: 11,
    color: '#999',
  },
  locationContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  timeline: {
    alignItems: 'center',
    marginRight: 12,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a7f4a',
    marginBottom: 4,
  },
  line: {
    width: 2,
    height: 40,
    backgroundColor: '#ddd',
    marginVertical: 2,
  },
  dropoffDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999',
    marginTop: 4,
  },
  locationText: {
    flex: 1,
    justifyContent: 'space-around',
  },
  pickupText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 28,
  },
  dropoffText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
  },
  detailsRow: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    justifyContent: 'space-around',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  expandedSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  driverSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  driverInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1a7f4a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInitial: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  rating: {
    fontSize: 12,
    color: '#FF8F00',
    fontWeight: '600',
    marginLeft: 4,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a7f4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  bookAgainBtn: {
    flex: 1,
    backgroundColor: '#1a7f4a',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  bookAgainText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  rateBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#1a7f4a',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  rateText: {
    color: '#1a7f4a',
    fontWeight: '600',
    fontSize: 13,
  },
  loadMoreBtn: {
    paddingVertical: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#1a7f4a',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default TripHistoryScreen;
