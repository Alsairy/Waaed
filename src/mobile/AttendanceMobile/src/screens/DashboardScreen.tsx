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
    backgroundColor: Colors.surface,
  },
  header: {
    padding: 24,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
    fontFamily: 'Effra-Bold',
  },
  date: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'Effra-Regular',
  },
  statusCard: {
    margin: 20,
    padding: 24,
    backgroundColor: 'white',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    fontFamily: 'Effra-Medium',
  },
  statusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 120,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Effra-SemiBold',
  },
  actionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  actionButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
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
    fontWeight: '700',
    fontFamily: 'Effra-Bold',
  },
  quickStats: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    color: Colors.text,
    fontFamily: 'Effra-Bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
    fontFamily: 'Effra-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'Effra-Medium',
  },
});

export default DashboardScreen;
