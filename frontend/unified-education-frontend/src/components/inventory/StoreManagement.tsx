import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Store as StoreIcon, Plus, Download, Search, Eye, Edit, MoreVertical, MapPin, User, Phone, Mail, Building } from 'lucide-react';
import { inventoryService } from '../../services';

interface Store {
  id: string;
  name: string;
  code: string;
  location: string;
  type: string;
  managerName: string;
  phone: string;
  email: string;
  status: string;
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
}

const StoreManagement: React.FC = () => {
  const { t } = useTranslation();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getStores();
      setStores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading stores:', error);
      setError(error instanceof Error ? error.message : 'Failed to load stores');
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter((store: Store) => {
    const matchesSearch = searchTerm === '' || 
      store.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || store.status === statusFilter;
    const matchesType = typeFilter === '' || store.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const storeStats = {
    total: stores.length,
    active: stores.filter((s: Store) => s.status === 'Active').length,
    inactive: stores.filter((s: Store) => s.status === 'Inactive').length,
    maintenance: stores.filter((s: Store) => s.status === 'Maintenance').length,
  };

  const storeTypes = [...new Set(stores.map((s: Store) => s.type).filter(Boolean))];

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
          <StoreIcon className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button 
            className="error-action" 
            onClick={loadStores}
            aria-label={t('common.tryAgain')}
          >
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('inventory.storeManagement')}</h1>
        <p className="page-subtitle">{t('inventory.manageStoresAndLocations')}</p>
        <div className="page-actions">
          <button 
            className="btn btn-primary"
            aria-label={t('inventory.addStore')}
          >
            <Plus size={18} className="btn-icon" aria-hidden="true" />
            {t('inventory.addStore')}
          </button>
          <button 
            className="btn btn-secondary"
            aria-label={t('inventory.exportStores')}
          >
            <Download size={18} className="btn-icon" aria-hidden="true" />
            {t('inventory.exportStores')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('inventory.storeOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <StoreIcon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{storeStats.total}</div>
              <div className="stat-label">{t('inventory.totalStores')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <Building size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{storeStats.active}</div>
              <div className="stat-label">{t('inventory.activeStores')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">
              <Building size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{storeStats.inactive}</div>
              <div className="stat-label">{t('inventory.inactiveStores')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Building size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{storeStats.maintenance}</div>
              <div className="stat-label">{t('inventory.maintenance')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('inventory.storeList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('inventory.searchStores')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={t('inventory.searchStores')}
                  id="store-search"
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label={t('inventory.filterByType')}
              id="type-filter"
            >
              <option value="">{t('inventory.allTypes')}</option>
              {storeTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('inventory.filterByStatus')}
              id="status-filter"
            >
              <option value="">{t('inventory.allStatuses')}</option>
              <option value="Active">{t('inventory.active')}</option>
              <option value="Inactive">{t('inventory.inactive')}</option>
              <option value="Maintenance">{t('inventory.maintenance')}</option>
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredStores.length > 0 ? (
            <div className="card-grid grid-2">
              {filteredStores.map((store) => (
                <div key={store.id} className="card card-hover store-card">
                  <div className="card-header">
                    <div className="store-info">
                      <StoreIcon size={20} className="store-icon" />
                      <div className="store-details">
                        <div className="store-name">{store.name || 'Main Store'}</div>
                        <div className="store-code">{store.code || 'ST001'}</div>
                      </div>
                    </div>
                    <span className={`badge ${
                      store.status === 'Active' 
                        ? 'badge-success' 
                        : store.status === 'Maintenance'
                        ? 'badge-warning'
                        : 'badge-secondary'
                    }`}>
                      {store.status || 'Active'}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="store-details">
                      <div className="detail-item">
                        <MapPin size={16} className="detail-icon" />
                        <span className="detail-text">{store.location || 'Building A, Floor 1'}</span>
                      </div>
                      <div className="detail-item">
                        <Building size={16} className="detail-icon" />
                        <span className="detail-text">{store.type || 'Main Warehouse'}</span>
                      </div>
                      <div className="detail-item">
                        <User size={16} className="detail-icon" />
                        <span className="detail-text">{store.managerName || 'John Manager'}</span>
                      </div>
                      <div className="detail-item">
                        <Phone size={16} className="detail-icon" />
                        <span className="detail-text">{store.phone || '+1 234 567 8900'}</span>
                      </div>
                      <div className="detail-item">
                        <Mail size={16} className="detail-icon" />
                        <span className="detail-text">{store.email || 'store@company.com'}</span>
                      </div>
                    </div>
                    <div className="store-stats">
                      <div className="stat-item">
                        <span className="stat-label">{t('inventory.totalItems')}</span>
                        <span className="stat-value">{store.totalItems || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">{t('inventory.lowStockItems')}</span>
                        <span className="stat-value text-warning">{store.lowStockItems || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">{t('inventory.totalValue')}</span>
                        <span className="stat-value">${store.totalValue || '0.00'}</span>
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
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <StoreIcon size={48} />
              </div>
              <div className="empty-title">{t('inventory.noStoresFound')}</div>
              <div className="empty-description">
                {searchTerm || statusFilter || typeFilter
                  ? t('inventory.noStoresMatchFilter')
                  : t('inventory.noStoresYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('inventory.addFirstStore')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreManagement;
