import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Plus, Download, Search, Eye, Edit, TrendingUp, PieChart, Activity, Target } from 'lucide-react';
import { analyticsService } from '../../services';
import { Dashboard } from '../../types/api';

const AnalyticsManagement: React.FC = () => {
  const { t } = useTranslation();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboards();
      setDashboards(data);
    } catch (error) {
      console.error('Error loading dashboards:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboards');
      setDashboards([]);
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
          <BarChart3 className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadDashboards}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('analytics.analyticsManagement')}</h1>
        <p className="page-subtitle">{t('analytics.manageAnalyticsData')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('analytics.createDashboard')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('analytics.analyticsOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboards.length}</div>
              <div className="stat-label">{t('analytics.totalDashboards')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {dashboards.reduce((total, d) => total + d.widgets.length, 0)}
              </div>
              <div className="stat-label">{t('analytics.totalWidgets')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <PieChart size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">12</div>
              <div className="stat-label">{t('analytics.activeReports')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">8</div>
              <div className="stat-label">{t('analytics.kpiMetrics')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('analytics.dashboardList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('analytics.searchDashboards')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="section-content">
          {dashboards.length > 0 ? (
            <div className="card-grid grid-3">
              {dashboards.map((dashboard) => (
                <div key={dashboard.id} className="card dashboard-card">
                  <div className="card-header">
                    <div className="card-title">{dashboard.name}</div>
                    <div className="dashboard-status">
                      <Activity size={16} className="status-icon" />
                      <span className="status-text">Active</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="dashboard-description">{dashboard.description}</p>
                    <div className="dashboard-meta">
                      <div className="meta-item">
                        <span className="meta-label">Widgets:</span>
                        <span className="meta-value">{dashboard.widgets.length}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Created:</span>
                        <span className="meta-value">
                          {new Date(dashboard.createdAt).toLocaleDateString()}
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <BarChart3 size={48} />
              </div>
              <div className="empty-title">{t('analytics.noDashboardsFound')}</div>
              <div className="empty-description">
                {t('analytics.noDashboardsYet')}
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('analytics.createFirstDashboard')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManagement;
