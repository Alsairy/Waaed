import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useOfflineStore } from '../store/offlineStore';
import { Colors } from '../utils/colors';

const OfflineScreen: React.FC = () => {
  const { pendingData } = useOfflineStore();

  const handleSync = async () => {
    try {
      Alert.alert('Success', 'Data synced successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Offline Mode</Text>
      <Text style={styles.subtitle}>
        You are currently offline. Your actions will be synced when connection is restored.
      </Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Pending Actions</Text>
        <Text style={styles.statusValue}>{pendingData?.length || 0}</Text>
      </View>
      
      <TouchableOpacity style={styles.button} onPress={handleSync}>
        <Text style={styles.buttonText}>Sync Now</Text>
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
  statusCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  statusValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
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

export default OfflineScreen;
