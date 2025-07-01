import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:5000/api/inventory';

class InventoryServiceClass {
  private async getAuthHeaders() {
    const token = await AsyncStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async getItems(params?: { search?: string; category?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/items`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
  }

  async getItem(id: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/items/${id}`, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching item:', error);
      throw error;
    }
  }

  async createItem(itemData: {
    name: string;
    description: string;
    category: string;
    unit: string;
    minimumStock: number;
    maximumStock: number;
    unitPrice: number;
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/items`, itemData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating item:', error);
      throw error;
    }
  }

  async updateItem(id: string, itemData: any) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.put(`${API_BASE_URL}/items/${id}`, itemData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  async adjustStock(itemId: string, quantity: number, reason: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/items/${itemId}/adjust-stock`, {
        quantity,
        reason,
      }, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error adjusting stock:', error);
      throw error;
    }
  }

  async getStockMovements(params?: { itemId?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/stock-movements`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      throw error;
    }
  }

  async getPurchaseOrders(params?: { status?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/purchase-orders`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
      throw error;
    }
  }

  async createPurchaseOrder(orderData: {
    supplierId: string;
    expectedDeliveryDate: string;
    items: Array<{
      itemId: string;
      quantity: number;
      unitPrice: number;
    }>;
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/purchase-orders`, orderData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating purchase order:', error);
      throw error;
    }
  }

  async approvePurchaseOrder(orderId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/purchase-orders/${orderId}/approve`, {}, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error approving purchase order:', error);
      throw error;
    }
  }

  async getSuppliers(params?: { search?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/suppliers`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }
  }

  async getStores(params?: { search?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/stores`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching stores:', error);
      throw error;
    }
  }

  async getIndents(params?: { status?: string; page?: number; pageSize?: number }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/indents`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching indents:', error);
      throw error;
    }
  }

  async createIndent(indentData: {
    requestedBy: string;
    department: string;
    items: Array<{
      itemId: string;
      quantity: number;
      purpose: string;
    }>;
  }) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/indents`, indentData, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error creating indent:', error);
      throw error;
    }
  }

  async approveIndent(indentId: string) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.post(`${API_BASE_URL}/indents/${indentId}/approve`, {}, {
        headers,
      });
      return response.data;
    } catch (error) {
      console.error('Error approving indent:', error);
      throw error;
    }
  }

  async getInventoryReports(reportType: string, params?: any) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await axios.get(`${API_BASE_URL}/reports/${reportType}`, {
        headers,
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching inventory reports:', error);
      throw error;
    }
  }
}

export const InventoryService = new InventoryServiceClass();
