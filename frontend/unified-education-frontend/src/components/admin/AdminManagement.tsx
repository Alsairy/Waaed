import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Plus, Download, Search, Eye, Edit, Building, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { adminService } from '../../services';
import { Tenant } from '../../types/api';

const AdminManagement: React.FC = () => {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getTenants();
      setTenants(data);
    } catch (error) {
      console.error('Error loading tenants:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tenants');
      setTenants([]);
    } finally {
      setLoading(false);
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
          <Building className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadTenants}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const statusCounts = {
    Active: tenants.filter(t => t.status === 'Active').length,
    Inactive: tenants.filter(t => t.status === 'Inactive').length,
    Suspended: tenants.filter(t => t.status === 'Suspended').length,
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('admin.adminManagement')}</h1>
        <p className="page-subtitle">{t('admin.manageTenants')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('admin.addTenant')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('admin.adminOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Building size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{tenants.length}</div>
              <div className="stat-label">{t('admin.totalTenants')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.Active}</div>
              <div className="stat-label">{t('admin.activeTenants')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.Suspended}</div>
              <div className="stat-label">{t('admin.suspendedTenants')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">1,247</div>
              <div className="stat-label">{t('admin.totalUsers')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('admin.tenantList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('admin.searchTenants')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="section-content">
          {tenants.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('admin.tenantName')}</th>
                    <th>{t('admin.domain')}</th>
                    <th>{t('admin.plan')}</th>
                    <th>{t('admin.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td>
                        <div className="tenant-info">
                          <div className="tenant-name">{tenant.name}</div>
                          <div className="tenant-meta">ID: {tenant.id}</div>
                        </div>
                      </td>
                      <td>
                        <span className="domain-text">{tenant.domain}</span>
                      </td>
                      <td>
                        <span className="badge badge-info">{tenant.plan}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          tenant.status === 'Active' 
                            ? 'badge-success' 
                            : tenant.status === 'Suspended'
                            ? 'badge-warning'
                            : 'badge-error'
                        }`}>
                          {tenant.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon btn-icon-view" title={t('common.view')}>
                            <Eye size={16} />
                          </button>
                          <button className="btn-icon btn-icon-edit" title={t('common.edit')}>
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon btn-icon-settings" title={t('admin.settings')}>
                            <Settings size={16} />
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
                <Building size={48} />
              </div>
              <div className="empty-title">{t('admin.noTenantsFound')}</div>
              <div className="empty-description">
                {t('admin.noTenantsYet')}
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('admin.addFirstTenant')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminManagement;
