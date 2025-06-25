import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuthStore } from '../store/authStore';
import { useAttendanceStore } from '../store/attendanceStore';
import { AttendanceService } from '../services/AttendanceService';
import { AttendanceMethod } from '../types/Attendance';
import { Colors } from '../utils/colors';

const DashboardScreen: React.FC = () => {
  const { user } = useAuthStore();
  const { currentStatus, setCurrentStatus } = useAttendanceStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadCurrentStatus();
  }, []);

  const loadCurrentStatus = async () => {
    try {
      const status = await AttendanceService.getCurrentStatus();
      setCurrentStatus(status.status);
    } catch (error) {
      console.error('Failed to load current status:', error);
    }
  };

  const handleCheckIn = async () => {
    setIsLoading(true);
    try {
      await AttendanceService.checkIn(AttendanceMethod.MANUAL);
      setCurrentStatus('checked_in');
      Alert.alert('Success', 'Checked in successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Check-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setIsLoading(true);
    try {
      await AttendanceService.checkOut(AttendanceMethod.MANUAL);
      setCurrentStatus('checked_out');
      Alert.alert('Success', 'Checked out successfully!');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Check-out failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'checked_in':
        return Colors.success;
      case 'on_break':
        return Colors.warning;
      default:
        return Colors.error;
    }
  };

  const getStatusText = () => {
    switch (currentStatus) {
      case 'checked_in':
        return 'Checked In';
      case 'on_break':
        return 'On Break';
      default:
        return 'Checked Out';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.firstName}!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString()}</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Status</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      </View>

      <View style={styles.actionsContainer}>
        {currentStatus === 'checked_out' ? (
          <TouchableOpacity
            style={[styles.actionButton, styles.checkInButton]}
            onPress={handleCheckIn}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>Check In</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.actionButton, styles.checkOutButton]}
            onPress={handleCheckOut}
            disabled={isLoading}
          >
            <Text style={styles.actionButtonText}>Check Out</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.quickStats}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>8h 30m</Text>
            <Text style={styles.statLabel}>Hours Worked</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>9:00 AM</Text>
            <Text style={styles.statLabel}>Check In Time</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    backgroundColor: Colors.primary,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statusCard: {
    margin: 20,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: Colors.success,
  },
  checkOutButton: {
    backgroundColor: Colors.error,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  quickStats: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: Colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default DashboardScreen;
