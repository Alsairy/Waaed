import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Plus, Download, Search, Eye, Edit, MoreVertical, User, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { financeService } from '../../services';

interface FeeStructure {
  id: string;
  name: string;
  class: string;
  amount: number;
  academicYear: string;
  status: string;
}

interface FeeCollection {
  id: string;
  studentName: string;
  receiptNumber: string;
  feeType: string;
  amount: number;
  dueDate: string;
  status: string;
}

const FeeManagement: React.FC = () => {
  const { t } = useTranslation();
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [feeCollections, setFeeCollections] = useState<FeeCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('structures');

  useEffect(() => {
    loadFeeData();
  }, []);

  const loadFeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [structuresData, collectionsData] = await Promise.all([
        financeService.getFeeStructures(),
        financeService.getFeeCollections()
      ]);
      setFeeStructures(Array.isArray(structuresData) ? structuresData : []);
      setFeeCollections(Array.isArray(collectionsData) ? collectionsData : []);
    } catch (error) {
      console.error('Error loading fee data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load fee data');
      setFeeStructures([]);
      setFeeCollections([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeeStructures = feeStructures.filter((structure: FeeStructure) => {
    const matchesSearch = searchTerm === '' || 
      structure.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      structure.class?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || structure.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredFeeCollections = feeCollections.filter((collection: FeeCollection) => {
    const matchesSearch = searchTerm === '' || 
      collection.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.receiptNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || collection.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const collectionStats = {
    Paid: feeCollections.filter((c: FeeCollection) => c.status === 'Paid').length,
    Pending: feeCollections.filter((c: FeeCollection) => c.status === 'Pending').length,
    Overdue: feeCollections.filter((c: FeeCollection) => c.status === 'Overdue').length,
  };

  const totalCollected = feeCollections
    .filter((c: FeeCollection) => c.status === 'Paid')
    .reduce((sum: number, c: FeeCollection) => sum + (c.amount || 0), 0);

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
          <DollarSign className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button 
            className="error-action" 
            onClick={loadFeeData}
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
        <h1 className="page-title" id="main-heading">{t('finance.feeManagement')}</h1>
        <p className="page-subtitle" aria-describedby="main-heading">{t('finance.manageFeeStructuresAndCollections')}</p>
        <div className="page-actions">
          <button 
            className="btn btn-primary"
            aria-label={activeTab === 'structures' ? t('finance.createFeeStructure') : t('finance.collectFee')}
          >
            <Plus size={18} className="btn-icon" aria-hidden="true" />
            {activeTab === 'structures' ? t('finance.createFeeStructure') : t('finance.collectFee')}
          </button>
          <button 
            className="btn btn-secondary"
            aria-label={t('common.export')}
          >
            <Download size={18} className="btn-icon" aria-hidden="true" />
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title" id="fee-overview-heading">{t('finance.feeOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">${totalCollected.toLocaleString()}</div>
              <div className="stat-label">{t('finance.totalCollected')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{collectionStats.Paid}</div>
              <div className="stat-label">{t('finance.paidFees')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{collectionStats.Pending}</div>
              <div className="stat-label">{t('finance.pendingFees')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-danger">
            <div className="stat-icon">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{collectionStats.Overdue}</div>
              <div className="stat-label">{t('finance.overdueFees')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'structures' ? 'active' : ''}`}
              onClick={() => setActiveTab('structures')}
              role="tab"
              aria-selected={activeTab === 'structures'}
              aria-controls="structures-panel"
              id="structures-tab"
            >
              {t('finance.feeStructures')}
            </button>
            <button 
              className={`tab-button ${activeTab === 'collections' ? 'active' : ''}`}
              onClick={() => setActiveTab('collections')}
              role="tab"
              aria-selected={activeTab === 'collections'}
              aria-controls="collections-panel"
              id="collections-tab"
            >
              {t('finance.feeCollections')}
            </button>
          </div>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={activeTab === 'structures' ? t('finance.searchFeeStructures') : t('finance.searchFeeCollections')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={activeTab === 'structures' ? t('finance.searchFeeStructures') : t('finance.searchFeeCollections')}
                  id="fee-search-input"
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('finance.filterByStatus')}
              id="status-filter-select"
            >
              <option value="">{t('finance.allStatuses')}</option>
              {activeTab === 'structures' ? (
                <>
                  <option value="Active">{t('finance.active')}</option>
                  <option value="Inactive">{t('finance.inactive')}</option>
                </>
              ) : (
                <>
                  <option value="Paid">{t('finance.paid')}</option>
                  <option value="Pending">{t('finance.pending')}</option>
                  <option value="Overdue">{t('finance.overdue')}</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="section-content">
          {activeTab === 'structures' ? (
            filteredFeeStructures.length > 0 ? (
              <div className="card-grid grid-3">
                {filteredFeeStructures.map((structure) => (
                  <div key={structure.id} className="card card-hover">
                    <div className="card-header">
                      <div className="card-title">{structure.name || 'Fee Structure'}</div>
                      <span className={`badge ${
                        structure.status === 'Active' 
                          ? 'badge-success' 
                          : 'badge-secondary'
                      }`}>
                        {structure.status || 'Active'}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="fee-info">
                        <div className="info-item">
                          <User size={16} className="info-icon" />
                          <span className="info-text">{structure.class || 'All Classes'}</span>
                        </div>
                        <div className="info-item">
                          <DollarSign size={16} className="info-icon" />
                          <span className="info-text">${structure.amount?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="info-item">
                          <Calendar size={16} className="info-icon" />
                          <span className="info-text">
                            {structure.academicYear || new Date().getFullYear()}
                          </span>
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
                  <DollarSign size={48} />
                </div>
                <div className="empty-title">{t('finance.noFeeStructuresFound')}</div>
                <div className="empty-description">
                  {searchTerm || statusFilter 
                    ? t('finance.noFeeStructuresMatchFilter')
                    : t('finance.noFeeStructuresYet')
                  }
                </div>
                <button className="btn btn-primary empty-action">
                  <Plus size={18} />
                  {t('finance.createFirstFeeStructure')}
                </button>
              </div>
            )
          ) : (
            filteredFeeCollections.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('finance.receiptNumber')}</th>
                      <th>{t('finance.studentName')}</th>
                      <th>{t('finance.feeType')}</th>
                      <th>{t('finance.amount')}</th>
                      <th>{t('finance.dueDate')}</th>
                      <th>{t('finance.status')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFeeCollections.map((collection) => (
                      <tr key={collection.id}>
                        <td>{collection.receiptNumber || `RCP-${collection.id}`}</td>
                        <td>{collection.studentName || 'Student Name'}</td>
                        <td>{collection.feeType || 'Tuition Fee'}</td>
                        <td>${collection.amount?.toLocaleString() || '0'}</td>
                        <td>
                          {collection.dueDate 
                            ? new Date(collection.dueDate).toLocaleDateString()
                            : new Date().toLocaleDateString()
                          }
                        </td>
                        <td>
                          <span className={`badge ${
                            collection.status === 'Paid' 
                              ? 'badge-success' 
                              : collection.status === 'Overdue'
                              ? 'badge-danger'
                              : 'badge-warning'
                          }`}>
                            {collection.status || 'Pending'}
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
                  <DollarSign size={48} />
                </div>
                <div className="empty-title">{t('finance.noFeeCollectionsFound')}</div>
                <div className="empty-description">
                  {searchTerm || statusFilter 
                    ? t('finance.noFeeCollectionsMatchFilter')
                    : t('finance.noFeeCollectionsYet')
                  }
                </div>
                <button className="btn btn-primary empty-action">
                  <Plus size={18} />
                  {t('finance.collectFirstFee')}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeManagement;
