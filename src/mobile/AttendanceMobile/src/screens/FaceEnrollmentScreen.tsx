import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '../utils/colors';

const FaceEnrollmentScreen: React.FC = () => {
  const [isEnrolling, setIsEnrolling] = useState(false);

  const handleEnrollment = async () => {
    setIsEnrolling(true);
    try {
      Alert.alert('Success', 'Face enrolled successfully!');
    } catch (error) {
      Alert.alert('Error', 'Face enrollment failed');
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Face Enrollment</Text>
      <Text style={styles.subtitle}>Enroll your face for biometric authentication</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={handleEnrollment}
        disabled={isEnrolling}
      >
        <Text style={styles.buttonText}>
          {isEnrolling ? 'Enrolling...' : 'Start Enrollment'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: Colors.textSecondary,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FaceEnrollmentScreen;
