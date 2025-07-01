import { apiClient } from './api';

interface Store {
  id: string;
  name: string;
  location: string;
  type: string;
  status: string;
}

interface Item {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  storeId: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
}

interface Indent {
  id: string;
  department: string;
  requestedBy: string;
  status: string;
  items: string[];
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  status: string;
  totalAmount: number;
  orderDate: string;
}

interface GoodsReceipt {
  id: string;
  purchaseOrderId: string;
  receivedDate: string;
  status: string;
}

interface Issue {
  id: string;
  department: string;
  issuedBy: string;
  status: string;
  items: string[];
}

interface StockAdjustment {
  id: string;
  itemId: string;
  type: string;
  quantity: number;
  reason: string;
}

export const inventoryService = {
  getStores: async (params?: { page?: number; pageSize?: number; status?: string; type?: string }) => {
    const response = await apiClient.get('/api/inventory/stores', { params });
    return response.data.data || response.data;
  },

  getStore: async (id: string) => {
    const response = await apiClient.get(`/api/inventory/stores/${id}`);
    return response.data.data || response.data;
  },

  createStore: async (storeData: Partial<Store>) => {
    const response = await apiClient.post('/api/inventory/stores', storeData);
    return response.data.data || response.data;
  },

  updateStore: async (id: string, storeData: Partial<Store>) => {
    const response = await apiClient.put(`/api/inventory/stores/${id}`, storeData);
    return response.data.data || response.data;
  },

  deleteStore: async (id: string) => {
    const response = await apiClient.delete(`/api/inventory/stores/${id}`);
    return response.data.data || response.data;
  },

  getItems: async (params?: { page?: number; pageSize?: number; category?: string; storeId?: string; status?: string }) => {
    const response = await apiClient.get('/api/inventory/items', { params });
    return response.data.data || response.data;
  },

  getItem: async (id: string) => {
    const response = await apiClient.get(`/api/inventory/items/${id}`);
    return response.data.data || response.data;
  },

  createItem: async (itemData: Partial<Item>) => {
    const response = await apiClient.post('/api/inventory/items', itemData);
    return response.data.data || response.data;
  },

  updateItem: async (id: string, itemData: Partial<Item>) => {
    const response = await apiClient.put(`/api/inventory/items/${id}`, itemData);
    return response.data.data || response.data;
  },

  deleteItem: async (id: string) => {
    const response = await apiClient.delete(`/api/inventory/items/${id}`);
    return response.data.data || response.data;
  },

  searchItems: async (query: string, params?: { page?: number; pageSize?: number }) => {
    const response = await apiClient.get('/api/inventory/items/search', { 
      params: { query, ...params }
    });
    return response.data.data || response.data;
  },

  getSuppliers: async (params?: { page?: number; pageSize?: number; status?: string; category?: string }) => {
    const response = await apiClient.get('/api/inventory/suppliers', { params });
    return response.data.data || response.data;
  },

  getSupplier: async (id: string) => {
    const response = await apiClient.get(`/api/inventory/suppliers/${id}`);
    return response.data.data || response.data;
  },

  createSupplier: async (supplierData: Partial<Supplier>) => {
    const response = await apiClient.post('/api/inventory/suppliers', supplierData);
    return response.data.data || response.data;
  },

  updateSupplier: async (id: string, supplierData: Partial<Supplier>) => {
    const response = await apiClient.put(`/api/inventory/suppliers/${id}`, supplierData);
    return response.data.data || response.data;
  },

  deleteSupplier: async (id: string) => {
    const response = await apiClient.delete(`/api/inventory/suppliers/${id}`);
    return response.data.data || response.data;
  },

  getIndents: async (params?: { page?: number; pageSize?: number; status?: string; department?: string }) => {
    const response = await apiClient.get('/api/inventory/indents', { params });
    return response.data.data || response.data;
  },

  getIndent: async (id: string) => {
    const response = await apiClient.get(`/api/inventory/indents/${id}`);
    return response.data.data || response.data;
  },

  createIndent: async (indentData: Partial<Indent>) => {
    const response = await apiClient.post('/api/inventory/indents', indentData);
    return response.data.data || response.data;
  },

  updateIndent: async (id: string, indentData: Partial<Indent>) => {
    const response = await apiClient.put(`/api/inventory/indents/${id}`, indentData);
    return response.data.data || response.data;
  },

  approveIndent: async (id: string, approvalData: Record<string, unknown>) => {
    const response = await apiClient.put(`/api/inventory/indents/${id}/approve`, approvalData);
    return response.data.data || response.data;
  },

  rejectIndent: async (id: string, rejectionData: Record<string, unknown>) => {
    const response = await apiClient.put(`/api/inventory/indents/${id}/reject`, rejectionData);
    return response.data.data || response.data;
  },

  deleteIndent: async (id: string) => {
    const response = await apiClient.delete(`/api/inventory/indents/${id}`);
    return response.data.data || response.data;
  },

  getPurchaseOrders: async (params?: { page?: number; pageSize?: number; status?: string; supplierId?: string }) => {
    const response = await apiClient.get('/api/inventory/purchase-orders', { params });
    return response.data.data || response.data;
  },

  getPurchaseOrder: async (id: string) => {
    const response = await apiClient.get(`/api/inventory/purchase-orders/${id}`);
    return response.data.data || response.data;
  },

  createPurchaseOrder: async (purchaseOrderData: Partial<PurchaseOrder>) => {
    const response = await apiClient.post('/api/inventory/purchase-orders', purchaseOrderData);
    return response.data.data || response.data;
  },

  updatePurchaseOrder: async (id: string, purchaseOrderData: Partial<PurchaseOrder>) => {
    const response = await apiClient.put(`/api/inventory/purchase-orders/${id}`, purchaseOrderData);
    return response.data.data || response.data;
  },

  approvePurchaseOrder: async (id: string, approvalData: Record<string, unknown>) => {
    const response = await apiClient.put(`/api/inventory/purchase-orders/${id}/approve`, approvalData);
    return response.data.data || response.data;
  },

  deletePurchaseOrder: async (id: string) => {
    const response = await apiClient.delete(`/api/inventory/purchase-orders/${id}`);
    return response.data.data || response.data;
  },

  getGoodsReceipts: async (params?: { page?: number; pageSize?: number; purchaseOrderId?: string; status?: string }) => {
    const response = await apiClient.get('/api/inventory/goods-receipts', { params });
    return response.data.data || response.data;
  },

  getGoodsReceipt: async (id: string) => {
    const response = await apiClient.get(`/api/inventory/goods-receipts/${id}`);
    return response.data.data || response.data;
  },

  createGoodsReceipt: async (goodsReceiptData: Partial<GoodsReceipt>) => {
    const response = await apiClient.post('/api/inventory/goods-receipts', goodsReceiptData);
    return response.data.data || response.data;
  },

  updateGoodsReceipt: async (id: string, goodsReceiptData: Partial<GoodsReceipt>) => {
    const response = await apiClient.put(`/api/inventory/goods-receipts/${id}`, goodsReceiptData);
    return response.data.data || response.data;
  },

  deleteGoodsReceipt: async (id: string) => {
    const response = await apiClient.delete(`/api/inventory/goods-receipts/${id}`);
    return response.data.data || response.data;
  },

  getIssues: async (params?: { page?: number; pageSize?: number; department?: string; status?: string }) => {
    const response = await apiClient.get('/api/inventory/issues', { params });
    return response.data.data || response.data;
  },

  getIssue: async (id: string) => {
    const response = await apiClient.get(`/api/inventory/issues/${id}`);
    return response.data.data || response.data;
  },

  createIssue: async (issueData: Partial<Issue>) => {
    const response = await apiClient.post('/api/inventory/issues', issueData);
    return response.data.data || response.data;
  },

  updateIssue: async (id: string, issueData: Partial<Issue>) => {
    const response = await apiClient.put(`/api/inventory/issues/${id}`, issueData);
    return response.data.data || response.data;
  },

  deleteIssue: async (id: string) => {
    const response = await apiClient.delete(`/api/inventory/issues/${id}`);
    return response.data.data || response.data;
  },

  getStockAdjustments: async (params?: { page?: number; pageSize?: number; itemId?: string; type?: string }) => {
    const response = await apiClient.get('/api/inventory/stock-adjustments', { params });
    return response.data.data || response.data;
  },

  getStockAdjustment: async (id: string) => {
    const response = await apiClient.get(`/api/inventory/stock-adjustments/${id}`);
    return response.data.data || response.data;
  },

  createStockAdjustment: async (adjustmentData: Partial<StockAdjustment>) => {
    const response = await apiClient.post('/api/inventory/stock-adjustments', adjustmentData);
    return response.data.data || response.data;
  },

  updateStockAdjustment: async (id: string, adjustmentData: Partial<StockAdjustment>) => {
    const response = await apiClient.put(`/api/inventory/stock-adjustments/${id}`, adjustmentData);
    return response.data.data || response.data;
  },

  deleteStockAdjustment: async (id: string) => {
    const response = await apiClient.delete(`/api/inventory/stock-adjustments/${id}`);
    return response.data.data || response.data;
  },

  getStockReport: async (params?: { storeId?: string; category?: string; lowStock?: boolean }) => {
    const response = await apiClient.get('/api/inventory/reports/stock', { params });
    return response.data.data || response.data;
  },

  getValuationReport: async (params?: { storeId?: string; date?: string }) => {
    const response = await apiClient.get('/api/inventory/reports/valuation', { params });
    return response.data.data || response.data;
  },

  getMovementReport: async (params?: { itemId?: string; dateFrom?: string; dateTo?: string }) => {
    const response = await apiClient.get('/api/inventory/reports/movement', { params });
    return response.data.data || response.data;
  },
};
