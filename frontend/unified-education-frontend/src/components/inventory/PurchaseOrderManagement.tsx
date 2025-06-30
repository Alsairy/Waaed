import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Plus, Download, Search, Eye, Edit, MoreVertical, User, Calendar, DollarSign, Package, Truck } from 'lucide-react';
import { inventoryService } from '../../services';

interface PurchaseOrderItem {
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  status: string;
  totalAmount: number;
  currency: string;
  itemCount: number;
  requestedBy: string;
  approvedBy?: string;
  description?: string;
  notes?: string;
  items?: PurchaseOrderItem[];
}

const PurchaseOrderManagement: React.FC = () => {
  const { t } = useTranslation();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getPurchaseOrders();
      setPurchaseOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
      setError(error instanceof Error ? error.message : 'Failed to load purchase orders');
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPurchaseOrders = purchaseOrders.filter((po: PurchaseOrder) => {
    const matchesSearch = searchTerm === '' || 
      po.poNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || po.status === statusFilter;
    const matchesSupplier = supplierFilter === '' || po.supplierName === supplierFilter;
    return matchesSearch && matchesStatus && matchesSupplier;
  });

  const poStats = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter((po: PurchaseOrder) => po.status === 'Pending').length,
    approved: purchaseOrders.filter((po: PurchaseOrder) => po.status === 'Approved').length,
    received: purchaseOrders.filter((po: PurchaseOrder) => po.status === 'Received').length,
    cancelled: purchaseOrders.filter((po: PurchaseOrder) => po.status === 'Cancelled').length,
  };

  const suppliers = [...new Set(purchaseOrders.map((po: PurchaseOrder) => po.supplierName).filter(Boolean))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Received': return 'info';
      case 'Cancelled': return 'danger';
      case 'Pending': return 'warning';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="content-area">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div className="loading-text">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content-area">
        <div className="error-state">
          <ShoppingCart className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadPurchaseOrders}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('inventory.purchaseOrderManagement')}</h1>
        <p className="page-subtitle">{t('inventory.managePurchaseOrdersAndProcurement')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('inventory.createPurchaseOrder')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('inventory.exportPurchaseOrders')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('inventory.purchaseOrderOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <ShoppingCart size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{poStats.total}</div>
              <div className="stat-label">{t('inventory.totalPurchaseOrders')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{poStats.pending}</div>
              <div className="stat-label">{t('inventory.pendingApproval')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <Truck size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{poStats.approved}</div>
              <div className="stat-label">{t('inventory.approved')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{poStats.received}</div>
              <div className="stat-label">{t('inventory.received')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('inventory.purchaseOrderList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('inventory.searchPurchaseOrders')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="">{t('inventory.allSuppliers')}</option>
              {suppliers.map((supplier) => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t('inventory.allStatuses')}</option>
              <option value="Pending">{t('inventory.pending')}</option>
              <option value="Approved">{t('inventory.approved')}</option>
              <option value="Received">{t('inventory.received')}</option>
              <option value="Cancelled">{t('inventory.cancelled')}</option>
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredPurchaseOrders.length > 0 ? (
            <div className="card-grid grid-1">
              {filteredPurchaseOrders.map((po) => (
                <div key={po.id} className="card card-hover purchase-order-card">
                  <div className="card-header">
                    <div className="po-info">
                      <ShoppingCart size={20} className="po-icon" />
                      <div className="po-details">
                        <div className="po-number">{po.poNumber || 'PO001'}</div>
                        <div className="po-supplier">{po.supplierName || 'ABC Suppliers Ltd.'}</div>
                      </div>
                    </div>
                    <span className={`badge badge-${getStatusColor(po.status)}`}>
                      {po.status || 'Pending'}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="po-meta">
                      <div className="meta-row">
                        <Calendar size={16} className="meta-icon" />
                        <span className="meta-label">{t('inventory.orderDate')}</span>
                        <span className="meta-value">
                          {po.orderDate 
                            ? new Date(po.orderDate).toLocaleDateString()
                            : new Date().toLocaleDateString()
                          }
                        </span>
                      </div>
                      <div className="meta-row">
                        <Calendar size={16} className="meta-icon" />
                        <span className="meta-label">{t('inventory.expectedDate')}</span>
                        <span className="meta-value">
                          {po.expectedDate 
                            ? new Date(po.expectedDate).toLocaleDateString()
                            : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
                          }
                        </span>
                      </div>
                      <div className="meta-row">
                        <User size={16} className="meta-icon" />
                        <span className="meta-label">{t('inventory.requestedBy')}</span>
                        <span className="meta-value">{po.requestedBy || 'John Doe'}</span>
                      </div>
                      <div className="meta-row">
                        <DollarSign size={16} className="meta-icon" />
                        <span className="meta-label">{t('inventory.totalAmount')}</span>
                        <span className="meta-value">${po.totalAmount || '0.00'}</span>
                      </div>
                    </div>
                    <div className="po-items">
                      <div className="items-header">{t('inventory.orderedItems')}</div>
                      <div className="items-list">
                        {po.items && po.items.length > 0 ? (
                          po.items.slice(0, 3).map((item: PurchaseOrderItem, index: number) => (
                            <div key={index} className="item-row">
                              <span className="item-name">{item.itemName || `Item ${index + 1}`}</span>
                              <span className="item-quantity">{item.quantity || 1} {item.unit || 'PCS'}</span>
                              <span className="item-price">${item.unitPrice || '0.00'}</span>
                            </div>
                          ))
                        ) : (
                          <div className="item-row">
                            <span className="item-name">Office Supplies</span>
                            <span className="item-quantity">10 PCS</span>
                            <span className="item-price">$25.00</span>
                          </div>
                        )}
                        {po.items && po.items.length > 3 && (
                          <div className="items-more">+{po.items.length - 3} more items</div>
                        )}
                      </div>
                    </div>
                    {po.notes && (
                      <div className="po-notes">
                        <div className="notes-label">{t('inventory.notes')}</div>
                        <div className="notes-text">{po.notes}</div>
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-primary">
                        <Eye size={14} />
                        {t('common.view')}
                      </button>
                      <button className="btn btn-sm btn-secondary">
                        <Edit size={14} />
                        {t('common.edit')}
                      </button>
                      {po.status === 'Approved' && (
                        <button className="btn btn-sm btn-info">
                          <Truck size={14} />
                          {t('inventory.receiveGoods')}
                        </button>
                      )}
                      <button className="btn-icon" title={t('common.more')}>
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <ShoppingCart size={48} />
              </div>
              <div className="empty-title">{t('inventory.noPurchaseOrdersFound')}</div>
              <div className="empty-description">
                {searchTerm || statusFilter || supplierFilter
                  ? t('inventory.noPurchaseOrdersMatchFilter')
                  : t('inventory.noPurchaseOrdersYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('inventory.createFirstPurchaseOrder')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderManagement;
