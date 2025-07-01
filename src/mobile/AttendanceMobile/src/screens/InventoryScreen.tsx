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
import { InventoryService } from '../services/InventoryService';
import LoadingScreen from '../components/LoadingScreen';

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unitPrice: number;
  status: string;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  totalAmount: number;
  status: string;
  itemCount: number;
}

interface StockMovement {
  id: string;
  itemName: string;
  movementType: string;
  quantity: number;
  reason: string;
  date: string;
  performedBy: string;
}

const InventoryScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'items' | 'orders' | 'movements'>('items');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  const { data: items, isLoading: itemsLoading } = useQuery(
    ['inventory-items', searchQuery],
    () => InventoryService.getItems({ search: searchQuery }),
    {
      enabled: activeTab === 'items',
    }
  );

  const { data: orders, isLoading: ordersLoading } = useQuery(
    ['purchase-orders'],
    () => InventoryService.getPurchaseOrders(),
    {
      enabled: activeTab === 'orders',
    }
  );

  const { data: movements, isLoading: movementsLoading } = useQuery(
    ['stock-movements'],
    () => InventoryService.getStockMovements(),
    {
      enabled: activeTab === 'movements',
    }
  );

  const adjustStockMutation = useMutation(
    ({ itemId, quantity, reason }: { itemId: string; quantity: number; reason: string }) =>
      InventoryService.adjustStock(itemId, quantity, reason),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['inventory-items']);
        queryClient.invalidateQueries(['stock-movements']);
        Alert.alert('Success', 'Stock adjusted successfully');
      },
      onError: () => {
        Alert.alert('Error', 'Failed to adjust stock');
      },
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const handleItemPress = (item: Item) => {
    Alert.alert(
      item.name,
      `${item.description}\n\nCategory: ${item.category}\nUnit: ${item.unit}\nCurrent Stock: ${item.currentStock}\nMin Stock: ${item.minimumStock}\nMax Stock: ${item.maximumStock}\nUnit Price: $${item.unitPrice}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to item details') },
        { text: 'Adjust Stock', onPress: () => handleStockAdjustment(item) },
      ]
    );
  };

  const handleStockAdjustment = (item: Item) => {
    Alert.prompt(
      'Adjust Stock',
      `Current stock: ${item.currentStock}\nEnter adjustment quantity (+ or -):`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Adjust',
          onPress: (quantity) => {
            if (quantity) {
              const adjustmentQuantity = parseInt(quantity);
              if (!isNaN(adjustmentQuantity)) {
                Alert.prompt(
                  'Reason',
                  'Enter reason for stock adjustment:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Submit',
                      onPress: (reason) => {
                        if (reason) {
                          adjustStockMutation.mutate({
                            itemId: item.id,
                            quantity: adjustmentQuantity,
                            reason,
                          });
                        }
                      },
                    },
                  ],
                  'plain-text'
                );
              }
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleOrderPress = (order: PurchaseOrder) => {
    Alert.alert(
      `Order ${order.orderNumber}`,
      `Supplier: ${order.supplierName}\nOrder Date: ${new Date(order.orderDate).toLocaleDateString()}\nExpected Delivery: ${new Date(order.expectedDeliveryDate).toLocaleDateString()}\nTotal Amount: $${order.totalAmount.toLocaleString()}\nItems: ${order.itemCount}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'View Details', onPress: () => console.log('Navigate to order details') },
        ...(order.status === 'pending' ? [
          { text: 'Approve', onPress: () => console.log('Approve order') }
        ] : []),
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'approved':
      case 'delivered':
      case 'in':
        return Colors.success;
      case 'pending':
      case 'ordered':
      case 'adjustment':
        return Colors.warning;
      case 'inactive':
      case 'cancelled':
      case 'out':
        return Colors.error;
      case 'low stock':
        return Colors.error;
      default:
        return Colors.gray;
    }
  };

  const getStockStatus = (item: Item) => {
    if (item.currentStock <= item.minimumStock) {
      return 'Low Stock';
    } else if (item.currentStock >= item.maximumStock) {
      return 'Overstock';
    }
    return 'Normal';
  };

  const renderItem = ({ item }: { item: Item }) => {
    const stockStatus = getStockStatus(item);
    
    return (
      <Card style={styles.card} onPress={() => handleItemPress(item)}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Chip 
              mode="outlined" 
              textStyle={styles.chipText}
              style={[styles.statusChip, { backgroundColor: getStatusColor(stockStatus) }]}
            >
              {stockStatus.toUpperCase()}
            </Chip>
          </View>
          <Text style={styles.itemCategory}>{item.category}</Text>
          <Text style={styles.itemDescription} numberOfLines={2}>{item.description}</Text>
          <View style={styles.itemDetails}>
            <View style={styles.stockInfo}>
              <Text style={styles.stockLabel}>Current Stock</Text>
              <Text style={[
                styles.stockValue,
                { color: item.currentStock <= item.minimumStock ? Colors.error : Colors.text }
              ]}>
                {item.currentStock} {item.unit}
              </Text>
            </View>
            <View style={styles.stockInfo}>
              <Text style={styles.stockLabel}>Min/Max</Text>
              <Text style={styles.stockValue}>
                {item.minimumStock}/{item.maximumStock}
              </Text>
            </View>
            <View style={styles.stockInfo}>
              <Text style={styles.stockLabel}>Unit Price</Text>
              <Text style={styles.stockValue}>${item.unitPrice}</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderOrder = ({ item }: { item: PurchaseOrder }) => (
    <Card style={styles.card} onPress={() => handleOrderPress(item)}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Chip 
            mode="outlined" 
            textStyle={styles.chipText}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        <Text style={styles.supplierName}>{item.supplierName}</Text>
        <View style={styles.orderDetails}>
          <View style={styles.orderMeta}>
            <Icon name="schedule" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>
              Ordered: {new Date(item.orderDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.orderMeta}>
            <Icon name="local-shipping" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>
              Expected: {new Date(item.expectedDeliveryDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.orderMeta}>
            <Icon name="inventory" size={16} color={Colors.gray} />
            <Text style={styles.metaText}>{item.itemCount} items</Text>
          </View>
        </View>
        <Text style={styles.orderAmount}>${item.totalAmount.toLocaleString()}</Text>
      </Card.Content>
    </Card>
  );

  const renderMovement = ({ item }: { item: StockMovement }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.movementItem}>{item.itemName}</Text>
          <Chip 
            mode="outlined" 
            textStyle={styles.chipText}
            style={[styles.statusChip, { backgroundColor: getStatusColor(item.movementType) }]}
          >
            {item.movementType.toUpperCase()}
          </Chip>
        </View>
        <View style={styles.movementDetails}>
          <Text style={[
            styles.movementQuantity,
            { color: item.movementType === 'in' ? Colors.success : Colors.error }
          ]}>
            {item.movementType === 'in' ? '+' : '-'}{item.quantity}
          </Text>
          <Text style={styles.movementReason}>{item.reason}</Text>
        </View>
        <View style={styles.movementMeta}>
          <Text style={styles.movementDate}>
            {new Date(item.date).toLocaleDateString()}
          </Text>
          <Text style={styles.movementUser}>by {item.performedBy}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (itemsLoading || ordersLoading || movementsLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Inventory</Text>
        <Searchbar
          placeholder="Search items, orders..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'items' && styles.activeTab]}
          onPress={() => setActiveTab('items')}
        >
          <Icon name="inventory" size={20} color={activeTab === 'items' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'items' && styles.activeTabText]}>
            Items
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orders' && styles.activeTab]}
          onPress={() => setActiveTab('orders')}
        >
          <Icon name="shopping-cart" size={20} color={activeTab === 'orders' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'orders' && styles.activeTabText]}>
            Orders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'movements' && styles.activeTab]}
          onPress={() => setActiveTab('movements')}
        >
          <Icon name="swap-horiz" size={20} color={activeTab === 'movements' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'movements' && styles.activeTabText]}>
            Movements
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          activeTab === 'items' ? items?.data || [] :
          activeTab === 'orders' ? orders?.data || [] :
          movements?.data || []
        }
        renderItem={
          activeTab === 'items' ? renderItem :
          activeTab === 'orders' ? renderOrder :
          renderMovement
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
          if (activeTab === 'items') {
            console.log('Navigate to add item');
          } else if (activeTab === 'orders') {
            console.log('Navigate to create purchase order');
          } else {
            console.log('Navigate to stock adjustment');
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
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  itemCategory: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockInfo: {
    flex: 1,
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 12,
    color: Colors.gray,
    marginBottom: 4,
  },
  stockValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.text,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  supplierName: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  orderDetails: {
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 8,
  },
  orderAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.success,
    textAlign: 'right',
  },
  movementItem: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  movementDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  movementQuantity: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  movementReason: {
    fontSize: 14,
    color: Colors.gray,
    flex: 1,
    textAlign: 'right',
  },
  movementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  movementDate: {
    fontSize: 12,
    color: Colors.gray,
  },
  movementUser: {
    fontSize: 12,
    color: Colors.gray,
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

export default InventoryScreen;
