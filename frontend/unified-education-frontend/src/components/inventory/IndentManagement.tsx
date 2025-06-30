import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Download, Search, Eye, MoreVertical, User, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { inventoryService } from '../../services';

interface IndentItem {
  itemName: string;
  quantity: number;
  unit: string;
}

interface Indent {
  id: string;
  indentNumber: string;
  requestedBy: string;
  department: string;
  requestDate: string;
  requiredDate: string;
  status: string;
  priority: string;
  totalItems: number;
  approvedBy?: string;
  approvalDate?: string;
  title?: string;
  justification?: string;
  items?: IndentItem[];
}

const IndentManagement: React.FC = () => {
  const { t } = useTranslation();
  const [indents, setIndents] = useState<Indent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadIndents();
  }, []);

  const loadIndents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await inventoryService.getIndents();
      setIndents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading indents:', error);
      setError(error instanceof Error ? error.message : 'Failed to load indents');
      setIndents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredIndents = indents.filter((indent: Indent) => {
    const matchesSearch = searchTerm === '' || 
      indent.indentNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indent.requestedBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      indent.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || indent.status === statusFilter;
    const matchesDepartment = departmentFilter === '' || indent.department === departmentFilter;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && indent.status === 'Pending') ||
      (activeTab === 'approved' && indent.status === 'Approved') ||
      (activeTab === 'rejected' && indent.status === 'Rejected');
    return matchesSearch && matchesStatus && matchesDepartment && matchesTab;
  });

  const indentStats = {
    total: indents.length,
    pending: indents.filter((i: Indent) => i.status === 'Pending').length,
    approved: indents.filter((i: Indent) => i.status === 'Approved').length,
    rejected: indents.filter((i: Indent) => i.status === 'Rejected').length,
    fulfilled: indents.filter((i: Indent) => i.status === 'Fulfilled').length,
  };

  const departments = [...new Set(indents.map((i: Indent) => i.department).filter(Boolean))];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return CheckCircle;
      case 'Rejected': return XCircle;
      case 'Pending': return Clock;
      case 'Fulfilled': return CheckCircle;
      default: return AlertCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success';
      case 'Rejected': return 'danger';
      case 'Pending': return 'warning';
      case 'Fulfilled': return 'info';
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
          <FileText className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadIndents}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('inventory.indentManagement')}</h1>
        <p className="page-subtitle">{t('inventory.manageStaffRequisitions')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('inventory.createIndent')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('inventory.exportIndents')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('inventory.indentOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{indentStats.total}</div>
              <div className="stat-label">{t('inventory.totalIndents')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{indentStats.pending}</div>
              <div className="stat-label">{t('inventory.pendingApproval')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{indentStats.approved}</div>
              <div className="stat-label">{t('inventory.approved')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{indentStats.fulfilled}</div>
              <div className="stat-label">{t('inventory.fulfilled')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              {t('inventory.allIndents')}
            </button>
            <button 
              className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              {t('inventory.pendingApproval')} ({indentStats.pending})
            </button>
            <button 
              className={`tab-button ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              {t('inventory.approved')} ({indentStats.approved})
            </button>
            <button 
              className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveTab('rejected')}
            >
              {t('inventory.rejected')} ({indentStats.rejected})
            </button>
          </div>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('inventory.searchIndents')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">{t('inventory.allDepartments')}</option>
              {departments.map((department) => (
                <option key={department} value={department}>{department}</option>
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
              <option value="Rejected">{t('inventory.rejected')}</option>
              <option value="Fulfilled">{t('inventory.fulfilled')}</option>
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredIndents.length > 0 ? (
            <div className="card-grid grid-1">
              {filteredIndents.map((indent) => {
                const StatusIcon = getStatusIcon(indent.status);
                const statusColor = getStatusColor(indent.status);
                
                return (
                  <div key={indent.id} className="card card-hover indent-card">
                    <div className="card-header">
                      <div className="indent-info">
                        <FileText size={20} className="indent-icon" />
                        <div className="indent-details">
                          <div className="indent-number">{indent.indentNumber || 'IND001'}</div>
                          <div className="indent-title">{indent.title || 'Office Supplies Request'}</div>
                        </div>
                      </div>
                      <span className={`badge badge-${statusColor}`}>
                        <StatusIcon size={14} className="badge-icon" />
                        {indent.status || 'Pending'}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="indent-meta">
                        <div className="meta-row">
                          <User size={16} className="meta-icon" />
                          <span className="meta-label">{t('inventory.requestedBy')}</span>
                          <span className="meta-value">{indent.requestedBy || 'John Doe'}</span>
                        </div>
                        <div className="meta-row">
                          <Calendar size={16} className="meta-icon" />
                          <span className="meta-label">{t('inventory.requestDate')}</span>
                          <span className="meta-value">
                            {indent.requestDate 
                              ? new Date(indent.requestDate).toLocaleDateString()
                              : new Date().toLocaleDateString()
                            }
                          </span>
                        </div>
                        <div className="meta-row">
                          <User size={16} className="meta-icon" />
                          <span className="meta-label">{t('inventory.department')}</span>
                          <span className="meta-value">{indent.department || 'IT Department'}</span>
                        </div>
                        <div className="meta-row">
                          <Calendar size={16} className="meta-icon" />
                          <span className="meta-label">{t('inventory.requiredDate')}</span>
                          <span className="meta-value">
                            {indent.requiredDate 
                              ? new Date(indent.requiredDate).toLocaleDateString()
                              : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
                            }
                          </span>
                        </div>
                      </div>
                      <div className="indent-items">
                        <div className="items-header">{t('inventory.requestedItems')}</div>
                        <div className="items-list">
                          {indent.items && indent.items.length > 0 ? (
                            indent.items.slice(0, 3).map((item: IndentItem, index: number) => (
                              <div key={index} className="item-row">
                                <span className="item-name">{item.itemName || `Item ${index + 1}`}</span>
                                <span className="item-quantity">{item.quantity || 1} {item.unit || 'PCS'}</span>
                              </div>
                            ))
                          ) : (
                            <div className="item-row">
                              <span className="item-name">Office Supplies</span>
                              <span className="item-quantity">5 PCS</span>
                            </div>
                          )}
                          {indent.items && indent.items.length > 3 && (
                            <div className="items-more">+{indent.items.length - 3} more items</div>
                          )}
                        </div>
                      </div>
                      {indent.justification && (
                        <div className="indent-justification">
                          <div className="justification-label">{t('inventory.justification')}</div>
                          <div className="justification-text">{indent.justification}</div>
                        </div>
                      )}
                    </div>
                    <div className="card-footer">
                      <div className="action-buttons">
                        <button className="btn btn-sm btn-primary">
                          <Eye size={14} />
                          {t('common.view')}
                        </button>
                        {indent.status === 'Pending' && (
                          <>
                            <button className="btn btn-sm btn-success">
                              <CheckCircle size={14} />
                              {t('inventory.approve')}
                            </button>
                            <button className="btn btn-sm btn-danger">
                              <XCircle size={14} />
                              {t('inventory.reject')}
                            </button>
                          </>
                        )}
                        {indent.status === 'Approved' && (
                          <button className="btn btn-sm btn-info">
                            <CheckCircle size={14} />
                            {t('inventory.fulfill')}
                          </button>
                        )}
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
            <div className="empty-state">
              <div className="empty-icon">
                <FileText size={48} />
              </div>
              <div className="empty-title">{t('inventory.noIndentsFound')}</div>
              <div className="empty-description">
                {searchTerm || statusFilter || departmentFilter
                  ? t('inventory.noIndentsMatchFilter')
                  : t('inventory.noIndentsYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('inventory.createFirstIndent')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndentManagement;
