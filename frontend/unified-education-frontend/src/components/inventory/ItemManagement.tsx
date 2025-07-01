import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package, Plus, Download, Search, Eye, Edit, MoreVertical, Tag, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { inventoryService } from '../../services';

interface Item {
  id: string;
  name: string;
  code: string;
  category: string;
  description: string;
  unit: string;
  unitCost: number;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  status: string;
  imageUrl?: string;
}

const ItemManagement: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading items:', error);
      setError(error instanceof Error ? error.message : 'Failed to load items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter((item: Item) => {
    const matchesSearch = searchTerm === '' || 
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || item.category === categoryFilter;
    const matchesStatus = statusFilter === '' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const itemStats = {
    total: items.length,
    inStock: items.filter((i: Item) => i.stockQuantity > 0).length,
    lowStock: items.filter((i: Item) => i.stockQuantity <= i.minStockLevel).length,
    outOfStock: items.filter((i: Item) => i.stockQuantity === 0).length,
  };

  const categories = [...new Set(items.map((i: Item) => i.category).filter(Boolean))];

  const getStockStatus = (item: Item) => {
    if (item.stockQuantity === 0) return 'out-of-stock';
    if (item.stockQuantity <= item.minStockLevel) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out-of-stock': return 'danger';
      case 'low-stock': return 'warning';
      case 'in-stock': return 'success';
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
          <Package className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadItems}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title" id="main-heading">{t('inventory.itemManagement')}</h1>
        <p className="page-subtitle" aria-describedby="main-heading">{t('inventory.manageItemMasterData')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('inventory.addItem')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('inventory.exportItems')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title" id="overview-section">{t('inventory.itemOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{itemStats.total}</div>
              <div className="stat-label">{t('inventory.totalItems')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{itemStats.inStock}</div>
              <div className="stat-label">{t('inventory.inStock')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{itemStats.lowStock}</div>
              <div className="stat-label">{t('inventory.lowStock')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-danger">
            <div className="stat-icon">
              <Package size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{itemStats.outOfStock}</div>
              <div className="stat-label">{t('inventory.outOfStock')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title" id="catalog-section">{t('inventory.itemCatalog')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('inventory.searchItems')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">{t('inventory.allCategories')}</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t('inventory.allStatuses')}</option>
              <option value="Active">{t('inventory.active')}</option>
              <option value="Inactive">{t('inventory.inactive')}</option>
              <option value="Discontinued">{t('inventory.discontinued')}</option>
            </select>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Package size={16} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <Tag size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="section-content">
          {filteredItems.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="card-grid grid-3">
                {filteredItems.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const statusColor = getStockStatusColor(stockStatus);
                  
                  return (
                    <div key={item.id} className="card card-hover item-card">
                      <div className="card-header">
                        <div className="item-image">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={`${t('inventory.itemImage')} - ${item.name}`} className="item-img" />
                          ) : (
                            <div className="item-placeholder">
                              <Package size={32} />
                            </div>
                          )}
                        </div>
                        <span className={`badge badge-${statusColor}`}>
                          {stockStatus === 'out-of-stock' ? t('inventory.outOfStock') :
                           stockStatus === 'low-stock' ? t('inventory.lowStock') :
                           t('inventory.inStock')}
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="item-info">
                          <div className="item-name">{item.name || 'Item Name'}</div>
                          <div className="item-code">{item.code || 'ITM001'}</div>
                          <div className="item-description">{item.description || 'Item description'}</div>
                          <div className="item-details">
                            <div className="detail-row">
                              <Tag size={14} className="detail-icon" />
                              <span className="detail-label">{t('inventory.category')}</span>
                              <span className="detail-value">{item.category || 'General'}</span>
                            </div>
                            <div className="detail-row">
                              <Package size={14} className="detail-icon" />
                              <span className="detail-label">{t('inventory.unit')}</span>
                              <span className="detail-value">{item.unit || 'PCS'}</span>
                            </div>
                            <div className="detail-row">
                              <DollarSign size={14} className="detail-icon" />
                              <span className="detail-label">{t('inventory.unitCost')}</span>
                              <span className="detail-value">${item.unitCost || '0.00'}</span>
                            </div>
                          </div>
                          <div className="stock-info">
                            <div className="stock-row">
                              <span className="stock-label">{t('inventory.currentStock')}</span>
                              <span className={`stock-value ${stockStatus}`}>
                                {item.stockQuantity || 0}
                              </span>
                            </div>
                            <div className="stock-row">
                              <span className="stock-label">{t('inventory.minLevel')}</span>
                              <span className="stock-value">{item.minStockLevel || 0}</span>
                            </div>
                            <div className="stock-row">
                              <span className="stock-label">{t('inventory.maxLevel')}</span>
                              <span className="stock-value">{item.maxStockLevel || 0}</span>
                            </div>
                          </div>
                        </div>
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
                          <button className="btn-icon" title={t('common.more')}>
                            <MoreVertical size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('inventory.itemCode')}</th>
                      <th>{t('inventory.itemName')}</th>
                      <th>{t('inventory.category')}</th>
                      <th>{t('inventory.unit')}</th>
                      <th>{t('inventory.currentStock')}</th>
                      <th>{t('inventory.unitCost')}</th>
                      <th>{t('inventory.status')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      const stockStatus = getStockStatus(item);
                      const statusColor = getStockStatusColor(stockStatus);
                      
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="item-code-cell">
                              <Package size={16} className="item-icon" />
                              <span className="item-code">{item.code || 'ITM001'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="item-name-cell">
                              <span className="item-name">{item.name || 'Item Name'}</span>
                              <span className="item-description">{item.description || 'Description'}</span>
                            </div>
                          </td>
                          <td>
                            <span className="category-tag">{item.category || 'General'}</span>
                          </td>
                          <td>{item.unit || 'PCS'}</td>
                          <td>
                            <span className={`stock-quantity ${stockStatus}`}>
                              {item.stockQuantity || 0}
                            </span>
                          </td>
                          <td>${item.unitCost || '0.00'}</td>
                          <td>
                            <span className={`badge badge-${statusColor}`}>
                              {stockStatus === 'out-of-stock' ? t('inventory.outOfStock') :
                               stockStatus === 'low-stock' ? t('inventory.lowStock') :
                               t('inventory.inStock')}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn btn-sm btn-primary">
                                <Eye size={14} />
                              </button>
                              <button className="btn btn-sm btn-secondary">
                                <Edit size={14} />
                              </button>
                              <button className="btn-icon" title={t('common.more')}>
                                <MoreVertical size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Package size={48} />
              </div>
              <div className="empty-title">{t('inventory.noItemsFound')}</div>
              <div className="empty-description">
                {searchTerm || categoryFilter || statusFilter
                  ? t('inventory.noItemsMatchFilter')
                  : t('inventory.noItemsYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('inventory.addFirstItem')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemManagement;
