import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Package2, Plus, Download, Search, Eye, MoreVertical, TrendingUp, TrendingDown, RefreshCw, ArrowUpDown } from 'lucide-react';
import { inventoryService } from '../../services';

const StockManagement: React.FC = () => {
  const { t } = useTranslation();
  const [stockMovements, setStockMovements] = useState<any[]>([]);
  const [stockAdjustments, setStockAdjustments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [activeTab, setActiveTab] = useState('movements');

  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [movementsData, adjustmentsData] = await Promise.all([
        inventoryService.getIssues(),
        inventoryService.getStockAdjustments()
      ]);
      setStockMovements(Array.isArray(movementsData) ? movementsData : []);
      setStockAdjustments(Array.isArray(adjustmentsData) ? adjustmentsData : []);
    } catch (error) {
      console.error('Error loading stock data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load stock data');
      setStockMovements([]);
      setStockAdjustments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMovements = stockMovements.filter((movement: any) => {
    const matchesSearch = searchTerm === '' || 
      movement.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.reference?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || movement.type === typeFilter;
    const matchesStore = storeFilter === '' || movement.storeName === storeFilter;
    return matchesSearch && matchesType && matchesStore;
  });

  const filteredAdjustments = stockAdjustments.filter((adjustment: any) => {
    const matchesSearch = searchTerm === '' || 
      adjustment.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adjustment.itemCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adjustment.reason?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStore = storeFilter === '' || adjustment.storeName === storeFilter;
    return matchesSearch && matchesStore;
  });

  const stockStats = {
    totalMovements: stockMovements.length,
    inbound: stockMovements.filter((m: any) => m.type === 'Inbound').length,
    outbound: stockMovements.filter((m: any) => m.type === 'Outbound').length,
    adjustments: stockAdjustments.length,
  };

  const movementTypes = [...new Set(stockMovements.map((m: any) => m.type).filter(Boolean))];
  const stores = [...new Set([...stockMovements.map((m: any) => m.storeName), ...stockAdjustments.map((a: any) => a.storeName)].filter(Boolean))];

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'Inbound': return TrendingUp;
      case 'Outbound': return TrendingDown;
      case 'Transfer': return ArrowUpDown;
      case 'Adjustment': return RefreshCw;
      default: return Package2;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'Inbound': return 'success';
      case 'Outbound': return 'warning';
      case 'Transfer': return 'info';
      case 'Adjustment': return 'secondary';
      default: return 'primary';
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
          <Package2 className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadStockData}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('inventory.stockManagement')}</h1>
        <p className="page-subtitle">{t('inventory.manageStockMovementsAndAdjustments')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('inventory.recordMovement')}
          </button>
          <button className="btn btn-secondary">
            <RefreshCw size={18} className="btn-icon" />
            {t('inventory.stockAdjustment')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('inventory.exportStock')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('inventory.stockOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Package2 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stockStats.totalMovements}</div>
              <div className="stat-label">{t('inventory.totalMovements')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stockStats.inbound}</div>
              <div className="stat-label">{t('inventory.inboundMovements')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <TrendingDown size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stockStats.outbound}</div>
              <div className="stat-label">{t('inventory.outboundMovements')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <RefreshCw size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{stockStats.adjustments}</div>
              <div className="stat-label">{t('inventory.adjustments')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'movements' ? 'active' : ''}`}
              onClick={() => setActiveTab('movements')}
            >
              {t('inventory.stockMovements')}
            </button>
            <button 
              className={`tab-button ${activeTab === 'adjustments' ? 'active' : ''}`}
              onClick={() => setActiveTab('adjustments')}
            >
              {t('inventory.stockAdjustments')}
            </button>
          </div>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={activeTab === 'movements' ? t('inventory.searchMovements') : t('inventory.searchAdjustments')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={storeFilter}
              onChange={(e) => setStoreFilter(e.target.value)}
            >
              <option value="">{t('inventory.allStores')}</option>
              {stores.map((store) => (
                <option key={store} value={store}>{store}</option>
              ))}
            </select>
            {activeTab === 'movements' && (
              <select
                className="filter-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">{t('inventory.allTypes')}</option>
                {movementTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="section-content">
          {activeTab === 'movements' ? (
            filteredMovements.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('inventory.date')}</th>
                      <th>{t('inventory.item')}</th>
                      <th>{t('inventory.type')}</th>
                      <th>{t('inventory.quantity')}</th>
                      <th>{t('inventory.store')}</th>
                      <th>{t('inventory.reference')}</th>
                      <th>{t('inventory.user')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMovements.map((movement) => {
                      const MovementIcon = getMovementIcon(movement.type);
                      const movementColor = getMovementColor(movement.type);
                      
                      return (
                        <tr key={movement.id}>
                          <td>
                            {movement.date 
                              ? new Date(movement.date).toLocaleDateString()
                              : new Date().toLocaleDateString()
                            }
                          </td>
                          <td>
                            <div className="item-info">
                              <div className="item-name">{movement.itemName || 'Item Name'}</div>
                              <div className="item-code">{movement.itemCode || 'ITM001'}</div>
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${movementColor}`}>
                              <MovementIcon size={14} className="badge-icon" />
                              {movement.type || 'Inbound'}
                            </span>
                          </td>
                          <td>
                            <span className={`quantity ${movement.type === 'Outbound' ? 'negative' : 'positive'}`}>
                              {movement.type === 'Outbound' ? '-' : '+'}{movement.quantity || 0}
                            </span>
                          </td>
                          <td>{movement.storeName || 'Main Store'}</td>
                          <td>{movement.reference || 'REF001'}</td>
                          <td>{movement.userName || 'System'}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn btn-sm btn-primary">
                                <Eye size={14} />
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
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Package2 size={48} />
                </div>
                <div className="empty-title">{t('inventory.noMovementsFound')}</div>
                <div className="empty-description">
                  {searchTerm || typeFilter || storeFilter
                    ? t('inventory.noMovementsMatchFilter')
                    : t('inventory.noMovementsYet')
                  }
                </div>
                <button className="btn btn-primary empty-action">
                  <Plus size={18} />
                  {t('inventory.recordFirstMovement')}
                </button>
              </div>
            )
          ) : (
            filteredAdjustments.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('inventory.date')}</th>
                      <th>{t('inventory.item')}</th>
                      <th>{t('inventory.adjustmentType')}</th>
                      <th>{t('inventory.quantity')}</th>
                      <th>{t('inventory.store')}</th>
                      <th>{t('inventory.reason')}</th>
                      <th>{t('inventory.user')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdjustments.map((adjustment) => (
                      <tr key={adjustment.id}>
                        <td>
                          {adjustment.date 
                            ? new Date(adjustment.date).toLocaleDateString()
                            : new Date().toLocaleDateString()
                          }
                        </td>
                        <td>
                          <div className="item-info">
                            <div className="item-name">{adjustment.itemName || 'Item Name'}</div>
                            <div className="item-code">{adjustment.itemCode || 'ITM001'}</div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${
                            adjustment.adjustmentType === 'Increase' 
                              ? 'badge-success' 
                              : adjustment.adjustmentType === 'Decrease'
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}>
                            {adjustment.adjustmentType || 'Correction'}
                          </span>
                        </td>
                        <td>
                          <span className={`quantity ${adjustment.adjustmentType === 'Decrease' ? 'negative' : 'positive'}`}>
                            {adjustment.adjustmentType === 'Decrease' ? '-' : '+'}{adjustment.quantity || 0}
                          </span>
                        </td>
                        <td>{adjustment.storeName || 'Main Store'}</td>
                        <td>{adjustment.reason || 'Stock correction'}</td>
                        <td>{adjustment.userName || 'Admin'}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-sm btn-primary">
                              <Eye size={14} />
                            </button>
                            <button className="btn-icon" title={t('common.more')}>
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <RefreshCw size={48} />
                </div>
                <div className="empty-title">{t('inventory.noAdjustmentsFound')}</div>
                <div className="empty-description">
                  {searchTerm || storeFilter
                    ? t('inventory.noAdjustmentsMatchFilter')
                    : t('inventory.noAdjustmentsYet')
                  }
                </div>
                <button className="btn btn-primary empty-action">
                  <RefreshCw size={18} />
                  {t('inventory.createFirstAdjustment')}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default StockManagement;
