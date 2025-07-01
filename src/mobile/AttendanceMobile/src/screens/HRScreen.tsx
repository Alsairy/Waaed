import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, Button, Searchbar, FAB, Chip } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import { Colors } from '../utils/colors';
import { HRService } from '../services/HRService';
import LoadingScreen from '../components/LoadingScreen';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  position: string;
  department: string;
  status: string;
  hireDate: string;
}

interface LeaveRequest {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
  daysRequested: number;
}

interface PayrollEntry {
  id: string;
  employeeName: string;
  period: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: string;
}

const HRScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'employees' | 'leave' | 'payroll'>('employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: employees, isLoading: employeesLoading } = useQuery(
    ['employees', searchQuery],
    () => HRService.getEmployees({ search: searchQuery }),
    {
      enabled: activeTab === 'employees',
    }
  );

  const { data: leaveRequests, isLoading: leaveLoading } = useQuery(
    ['leave-requests'],
    () => HRService.getLeaveRequests(),
    {
      enabled: activeTab === 'leave',
    }
  );

  const { data: payrollEntries, isLoading: payrollLoading } = useQuery(
    ['payroll'],
    () => HRService.getPayrollEntries(),
    {
      enabled: activeTab === 'payroll',
    }
  );

  const approveLeaveRequest = useMutation(
    (requestId: string) => HRService.approveLeaveRequest(requestId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['leave-requests']);
        Alert.alert('Success', 'Leave request approved');
      },
      onError: () => {
        Alert.alert('Error', 'Failed to approve leave request');
      },
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const handleEmployeePress = (employee: Employee) => {
    Alert.alert(
      `${employee.firstName} ${employee.lastName}`,
      `Position: ${employee.position}\nDepartment: ${employee.department}\nEmail: ${employee.email}\nHire Date: ${new Date(employee.hireDate).toLocaleDateString()}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to employee details') },
        { text: 'Edit', onPress: () => console.log('Navigate to employee edit') },
      ]
    );
  };

  const handleLeaveRequestPress = (request: LeaveRequest) => {
    Alert.alert(
      'Leave Request',
      `Employee: ${request.employeeName}\nType: ${request.leaveType}\nDates: ${new Date(request.startDate).toLocaleDateString()} - ${new Date(request.endDate).toLocaleDateString()}\nDays: ${request.daysRequested}\nReason: ${request.reason}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reject', style: 'destructive', onPress: () => console.log('Reject leave request') },
        { text: 'Approve', onPress: () => approveLeaveRequest.mutate(request.id) },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'paid':
        return Colors.success;
      case 'pending':
      case 'processing':
        return Colors.warning;
      case 'inactive':
      case 'rejected':
      case 'failed':
        return Colors.error;
      default:
        return Colors.gray;
    }
  };

  const renderEmployee = ({ item }: { item: Employee }) => (
    <Card style={styles.card} onPress={() => handleEmployeePress(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.employeeName}>{item.firstName} {item.lastName}</Text>
          <Chip 
            mode="outlined" 
            textStyle={styles.chipText}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        <Text style={styles.employeePosition}>{item.position}</Text>
        <Text style={styles.employeeDepartment}>{item.department}</Text>
        <View style={styles.employeeMeta}>
          <View style={styles.metaItem}>
            <Icon name="email" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>{item.email}</Text>
          </View>
          <View style={styles.metaItem}>
            <Icon name="schedule" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>
              Hired: {new Date(item.hireDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderLeaveRequest = ({ item }: { item: LeaveRequest }) => (
    <Card style={styles.card} onPress={() => handleLeaveRequestPress(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.leaveEmployee}>{item.employeeName}</Text>
          <Chip 
            mode="outlined" 
            textStyle={styles.chipText}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        <Text style={styles.leaveType}>{item.leaveType}</Text>
        <View style={styles.leaveDates}>
          <Text style={styles.dateText}>
            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
          </Text>
          <Text style={styles.daysText}>{item.daysRequested} days</Text>
        </View>
        <Text style={styles.leaveReason} numberOfLines={2}>{item.reason}</Text>
      </Card.Content>
    </Card>
  );

  const renderPayrollEntry = ({ item }: { item: PayrollEntry }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.payrollEmployee}>{item.employeeName}</Text>
          <Chip 
            mode="outlined" 
            textStyle={styles.chipText}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        <Text style={styles.payrollPeriod}>{item.period}</Text>
        <View style={styles.payrollDetails}>
          <View style={styles.payrollItem}>
            <Text style={styles.payrollLabel}>Basic Salary</Text>
            <Text style={styles.payrollAmount}>${item.basicSalary.toLocaleString()}</Text>
          </View>
          <View style={styles.payrollItem}>
            <Text style={styles.payrollLabel}>Allowances</Text>
            <Text style={[styles.payrollAmount, { color: Colors.success }]}>
              +${item.allowances.toLocaleString()}
            </Text>
          </View>
          <View style={styles.payrollItem}>
            <Text style={styles.payrollLabel}>Deductions</Text>
            <Text style={[styles.payrollAmount, { color: Colors.error }]}>
              -${item.deductions.toLocaleString()}
            </Text>
          </View>
          <View style={[styles.payrollItem, styles.netSalaryItem]}>
            <Text style={styles.netSalaryLabel}>Net Salary</Text>
            <Text style={styles.netSalaryAmount}>${item.netSalary.toLocaleString()}</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  if (employeesLoading || leaveLoading || payrollLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Human Resources</Text>
        <Searchbar
          placeholder="Search employees, requests..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'employees' && styles.activeTab]}
          onPress={() => setActiveTab('employees')}
        >
          <Icon name="people" size={20} color={activeTab === 'employees' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'employees' && styles.activeTabText]}>
            Employees
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'leave' && styles.activeTab]}
          onPress={() => setActiveTab('leave')}
        >
          <Icon name="event-note" size={20} color={activeTab === 'leave' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'leave' && styles.activeTabText]}>
            Leave
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payroll' && styles.activeTab]}
          onPress={() => setActiveTab('payroll')}
        >
          <Icon name="payment" size={20} color={activeTab === 'payroll' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'payroll' && styles.activeTabText]}>
            Payroll
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          activeTab === 'employees' ? employees?.data || [] :
          activeTab === 'leave' ? leaveRequests?.data || [] :
          payrollEntries?.data || []
        }
        renderItem={
          activeTab === 'employees' ? renderEmployee :
          activeTab === 'leave' ? renderLeaveRequest :
          renderPayrollEntry
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => {
          if (activeTab === 'employees') {
            console.log('Navigate to add employee');
          } else if (activeTab === 'leave') {
            console.log('Navigate to create leave request');
          } else {
            console.log('Navigate to payroll processing');
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  searchbar: {
    backgroundColor: Colors.lightGray,
    elevation: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.white,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  employeePosition: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  employeeDepartment: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
  },
  employeeMeta: {
    gap: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 8,
  },
  leaveEmployee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  leaveType: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  leaveDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: Colors.text,
  },
  daysText: {
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '600',
  },
  leaveReason: {
    fontSize: 14,
    color: Colors.gray,
    fontStyle: 'italic',
  },
  payrollEmployee: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  payrollPeriod: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  payrollDetails: {
    gap: 8,
  },
  payrollItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  payrollLabel: {
    fontSize: 14,
    color: Colors.gray,
  },
  payrollAmount: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  netSalaryItem: {
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    paddingTop: 8,
    marginTop: 4,
  },
  netSalaryLabel: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: 'bold',
  },
  netSalaryAmount: {
    fontSize: 16,
    color: Colors.success,
    fontWeight: 'bold',
  },
  chipText: {
    fontSize: 10,
    color: Colors.white,
  },
  statusChip: {
    height: 24,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});

export default HRScreen;
