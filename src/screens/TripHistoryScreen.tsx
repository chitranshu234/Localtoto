import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

const TripHistoryScreen = () => {
  const [expandedTrip, setExpandedTrip] = useState(null);

  const trips = [
    {
      id: 1,
      date: 'Today',
      time: '2:30 PM',
      pickupLocation: '123 Main Street',
      dropoffLocation: 'Downtown Center',
      distance: '4.2 km',
      duration: '15 mins',
      amount: '₹245',
      driverName: 'John Smith',
      driverRating: 4.8,
      carType: 'Sedan',
      status: 'Completed',
    },
    {
      id: 2,
      date: 'Yesterday',
      time: '4:15 PM',
      pickupLocation: 'Airport Terminal 2',
      dropoffLocation: '456 Park Avenue',
      distance: '22.5 km',
      duration: '45 mins',
      amount: '₹890',
      driverName: 'Priya Sharma',
      driverRating: 4.9,
      carType: 'Premium',
      status: 'Completed',
    },
    {
      id: 3,
      date: '2 Days Ago',
      time: '6:45 PM',
      pickupLocation: 'Mall Road Junction',
      dropoffLocation: 'Central Station',
      distance: '8.7 km',
      duration: '28 mins',
      amount: '₹520',
      driverName: 'Rajesh Kumar',
      driverRating: 4.7,
      carType: 'Sedan',
      status: 'Completed',
    },
    {
      id: 4,
      date: '1 Week Ago',
      time: '9:20 AM',
      pickupLocation: 'Tech Park Building A',
      dropoffLocation: 'Hospital Road',
      distance: '15.3 km',
      duration: '35 mins',
      amount: '₹680',
      driverName: 'Amit Patel',
      driverRating: 4.6,
      carType: 'SUV',
      status: 'Completed',
    },
  ];

  const toggleTrip = (tripId) => {
    setExpandedTrip(expandedTrip === tripId ? null : tripId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backButton}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip History</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.mainTitle}>Trip History</Text>
        <Text style={styles.subtitle}>{trips.length} trips completed</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {trips.map((trip) => (
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
                          <Text style={styles.rating}>★ {trip.driverRating}</Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.callButton}>
                      <Text style={styles.callIcon}>☎</Text>
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
        ))}

        {/* Load More Button */}
        <TouchableOpacity style={styles.loadMoreBtn}>
          <Text style={styles.loadMoreText}>Load More Trips</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a7f4a',
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
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  titleSection: {
    backgroundColor: '#1a7f4a',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#c8e6c9',
  },
  content: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
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
  },
  rating: {
    fontSize: 12,
    color: '#ffc107',
    fontWeight: '500',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a7f4a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: 20,
    color: 'white',
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
});

export default TripHistoryScreen;