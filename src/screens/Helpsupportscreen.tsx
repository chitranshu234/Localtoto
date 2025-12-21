import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const HelpSupportScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState('');
  const [problemDescription, setProblemDescription] = useState('');
  const [contactInfo, setContactInfo] = useState('');

  const openIssueForm = (issueType) => {
    setSelectedIssue(issueType);
    setModalVisible(true);
    setProblemDescription('');
    setContactInfo('');
  };

  const submitIssue = () => {
    if (!problemDescription.trim()) {
      Alert.alert('Error', 'Please describe your problem');
      return;
    }

    Alert.alert(
      'Submit Successful',
      `Your ${selectedIssue} has been submitted successfully. We'll contact you soon.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setModalVisible(false);
            setProblemDescription('');
            setContactInfo('');
          },
        },
      ]
    );
  };

  const handleDirectContact = () => {
    Alert.alert(
      'Contact Support',
      'Email: support@localtoto.com\nPhone: +918210607476\nAvailable:24/7',
      [{ text: 'OK', style: 'cancel' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Help & Support</Text>
        <Text style={styles.subtitle}>We're here to help you 24/7</Text>
      </View>

      <ScrollView style={styles.contentContainer}>
        <Item
          icon="map-marker"
          text="Trip Issues"
          description="Report problems with your trip"
          onPress={() => openIssueForm('Trip Issue')}
        />

        <Item
          icon="credit-card"
          text="Payment Issues"
          description="Billing and payment problems"
          onPress={() => openIssueForm('Payment Issue')}
        />

        <Item
          icon="car"
          text="Driver Issues"
          description="Driver related concerns"
          onPress={() => openIssueForm('Driver Issue')}
        />

        <Item
          icon="phone"
          text="Contact Support Directly"
          description="Get immediate assistance"
          onPress={handleDirectContact}
        />

        <View style={styles.faqSection}>
          <Text style={styles.faqTitle}>Frequently Asked Questions</Text>

          <FAQItem
            question="How do I cancel a trip?"
            answer="You can cancel a trip from the active trip screen before the driver arrives."
          />

          <FAQItem
            question="How do I add payment method?"
            answer="Go to Profile > Payment Methods > Add New Card"
          />

          <FAQItem
            question="How do I report lost items?"
            answer="Contact support immediately with trip details."
          />
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Report {selectedIssue}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>Describe your problem</Text>
              <TextInput
                style={styles.textInput}
                multiline
                numberOfLines={5}
                placeholder="Please provide details about your issue..."
                value={problemDescription}
                onChangeText={setProblemDescription}
                textAlignVertical="top"
              />

              <Text style={[styles.label, { marginTop: 16 }]}>Contact Email/Phone</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Your email or phone number"
                value={contactInfo}
                onChangeText={setContactInfo}
                keyboardType="email-address"
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={submitIssue}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const Item = ({ icon, text, description, onPress }) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <View style={styles.itemIcon}>
      <MaterialCommunityIcons name={icon} size={24} color="#4CAF50" />
    </View>
    <View style={styles.itemContent}>
      <Text style={styles.itemText}>{text}</Text>
      <Text style={styles.itemDescription}>{description}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={22} color="#999" />
  </TouchableOpacity>
);

const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
    >
      <View style={styles.faqQuestion}>
        <Text style={styles.faqQuestionText}>{question}</Text>
        <MaterialCommunityIcons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={20}
          color="#666"
        />
      </View>
      {expanded && <Text style={styles.faqAnswer}>{answer}</Text>}
    </TouchableOpacity>
  );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#e8f5e9',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  faqSection: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  faqTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  faqItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: 15,
    color: '#34495e',
    fontWeight: '500',
  },
  faqAnswer: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dcdde1',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
  },
  modalButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ecf0f1',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
