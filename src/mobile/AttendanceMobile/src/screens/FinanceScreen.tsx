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
import { Card, Button, Searchbar, FAB, Chip, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import { Colors } from '../utils/colors';
import { FinanceService } from '../services/FinanceService';
import LoadingScreen from '../components/LoadingScreen';

interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  category: string;
}

interface PaymentHistory {
  id: string;
  amount: number;
  paymentDate: string;
  method: string;
  status: string;
  description: string;
  receiptNumber: string;
}

interface FinancialSummary {
  totalDue: number;
  totalPaid: number;
  pendingAmount: number;
  overdueAmount: number;
  nextDueDate: string;
}

const FinanceScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fees' | 'payments' | 'summary'>('fees');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: fees, isLoading: feesLoading } = useQuery(
    ['fees', searchQuery],
    () => FinanceService.getFees({ search: searchQuery }),
    {
      enabled: activeTab === 'fees',
    }
  );

  const { data: payments, isLoading: paymentsLoading } = useQuery(
    ['payments'],
    () => FinanceService.getPaymentHistory(),
    {
      enabled: activeTab === 'payments',
    }
  );

  const { data: summary, isLoading: summaryLoading } = useQuery(
    ['financial-summary'],
    () => FinanceService.getFinancialSummary(),
    {
      enabled: activeTab === 'summary',
    }
  );

  const paymentMutation = useMutation(
    (feeId: string) => FinanceService.makePayment(feeId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['fees']);
        queryClient.invalidateQueries(['financial-summary']);
        Alert.alert('Success', 'Payment processed successfully');
      },
      onError: () => {
        Alert.alert('Error', 'Failed to process payment');
      },
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const handlePayment = (fee: FeeStructure) => {
    Alert.alert(
      'Confirm Payment',
      `Pay ${fee.amount.toLocaleString()} for ${fee.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pay Now', onPress: () => paymentMutation.mutate(fee.id) },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return Colors.success;
      case 'pending':
        return Colors.warning;
      case 'overdue':
        return Colors.error;
      default:
        return Colors.gray;
    }
  };

  const renderFee = ({ item }: { item: FeeStructure }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.feeTitle}>{item.name}</Text>
          <Chip 
            mode="outlined" 
            textStyle={styles.chipText}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        <Text style={styles.feeCategory}>{item.category}</Text>
        <View style={styles.feeDetails}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Amount</Text>
            <Text style={styles.amountValue}>${item.amount.toLocaleString()}</Text>
          </View>
          <View style={styles.dueDateContainer}>
            <Text style={styles.dueDateLabel}>Due Date</Text>
            <Text style={[
              styles.dueDateValue,
              { color: item.status === 'overdue' ? Colors.error : Colors.text }
            ]}>
              {new Date(item.dueDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
        {item.status !== 'paid' && (
          <Button
            mode="contained"
            onPress={() => handlePayment(item)}
            style={styles.payButton}
            loading={paymentMutation.isLoading}
          >
            Pay Now
          </Button>
        )}
      </Card.Content>
    </Card>
  );

  const renderPayment = ({ item }: { item: PaymentHistory }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.paymentDescription}>{item.description}</Text>
          <Text style={styles.paymentAmount}>${item.amount.toLocaleString()}</Text>
        </View>
        <View style={styles.paymentDetails}>
          <View style={styles.paymentMeta}>
            <Icon name="receipt" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>{item.receiptNumber}</Text>
          </View>
          <View style={styles.paymentMeta}>
            <Icon name="payment" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>{item.method}</Text>
          </View>
          <View style={styles.paymentMeta}>
            <Icon name="schedule" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>
              {new Date(item.paymentDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <Chip 
          mode="outlined" 
          textStyle={styles.chipText}
          style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
        >
          {item.status.toUpperCase()}
        </Chip>
      </Card.Content>
    </Card>
  );

  const renderSummary = () => {
    if (!summary) return null;

    const paymentProgress = summary.totalPaid / (summary.totalPaid + summary.totalDue);

    return (
      <ScrollView style={styles.summaryContainer}>
        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Financial Overview</Text>
            
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>Payment Progress</Text>
              <ProgressBar 
                progress={paymentProgress} 
                color={Colors.primary}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {Math.round(paymentProgress * 100)}% Complete
              </Text>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Icon name="account-balance-wallet" size={24} color={Colors.success} />
                <Text style={styles.summaryAmount}>${summary.totalPaid.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Total Paid</Text>
              </View>
              <View style={styles.summaryItem}>
                <Icon name="pending" size={24} color={Colors.warning} />
                <Text style={styles.summaryAmount}>${summary.pendingAmount.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </View>
              <View style={styles.summaryItem}>
                <Icon name="error" size={24} color={Colors.error} />
                <Text style={styles.summaryAmount}>${summary.overdueAmount.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Overdue</Text>
              </View>
              <View style={styles.summaryItem}>
                <Icon name="schedule" size={24} color={Colors.primary} />
                <Text style={styles.summaryAmount}>
                  {new Date(summary.nextDueDate).toLocaleDateString()}
                </Text>
                <Text style={styles.summaryLabel}>Next Due</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.summaryCard}>
          <Card.Content>
            <Text style={styles.summaryTitle}>Quick Actions</Text>
            <View style={styles.actionButtons}>
              <Button
                mode="contained"
                icon="payment"
                onPress={() => console.log('Navigate to payment portal')}
                style={styles.actionButton}
              >
                Make Payment
              </Button>
              <Button
                mode="outlined"
                icon="receipt"
                onPress={() => console.log('Navigate to receipts')}
                style={styles.actionButton}
              >
                View Receipts
              </Button>
              <Button
                mode="outlined"
                icon="file-download"
                onPress={() => console.log('Download statement')}
                style={styles.actionButton}
              >
                Download Statement
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
    );
  };

  if (feesLoading || paymentsLoading || summaryLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Finance</Text>
        {activeTab !== 'summary' && (
          <Searchbar
            placeholder="Search fees, payments..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
          />
        )}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'fees' && styles.activeTab]}
          onPress={() => setActiveTab('fees')}
        >
          <Icon name="receipt" size={20} color={activeTab === 'fees' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'fees' && styles.activeTabText]}>
            Fees
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
          onPress={() => setActiveTab('payments')}
        >
          <Icon name="payment" size={20} color={activeTab === 'payments' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>
            Payments
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'summary' && styles.activeTab]}
          onPress={() => setActiveTab('summary')}
        >
          <Icon name="dashboard" size={20} color={activeTab === 'summary' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'summary' && styles.activeTabText]}>
            Summary
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'summary' ? (
        renderSummary()
      ) : (
        <FlatList
          data={
            activeTab === 'fees' ? fees?.data || [] :
            payments?.data || []
          }
          renderItem={
            activeTab === 'fees' ? renderFee : renderPayment
          }
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => console.log('Navigate to payment portal')}
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
  feeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  feeCategory: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  feeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  dueDateContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dueDateLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  dueDateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  payButton: {
    marginTop: 8,
  },
  paymentDescription: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.success,
  },
  paymentDetails: {
    marginVertical: 8,
  },
  paymentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 8,
  },
  chipText: {
    fontSize: 10,
    color: Colors.white,
  },
  statusChip: {
    height: 24,
  },
  summaryContainer: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressLabel: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.lightGray,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.gray,
    textAlign: 'center',
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});

export default FinanceScreen;
