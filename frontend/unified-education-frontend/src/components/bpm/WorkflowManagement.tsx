import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Repeat, Plus, Download, Search, Eye, Edit, Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { bpmService } from '../../services';
import { Workflow } from '../../types/api';

const WorkflowManagement: React.FC = () => {
  const { t } = useTranslation();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bpmService.getWorkflows();
      setWorkflows(data);
    } catch (error) {
      console.error('Error loading workflows:', error);
      setError(error instanceof Error ? error.message : 'Failed to load workflows');
      setWorkflows([]);
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
          <Repeat className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadWorkflows}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const statusCounts = {
    Active: workflows.filter(w => w.status === 'Active').length,
    Inactive: workflows.filter(w => w.status === 'Inactive').length,
    Draft: workflows.filter(w => w.status === 'Draft').length,
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('bpm.workflowManagement')}</h1>
        <p className="page-subtitle">{t('bpm.manageBusinessProcesses')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('bpm.createWorkflow')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('bpm.workflowOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Repeat size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{workflows.length}</div>
              <div className="stat-label">{t('bpm.totalWorkflows')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.Active}</div>
              <div className="stat-label">{t('bpm.activeWorkflows')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.Draft}</div>
              <div className="stat-label">{t('bpm.draftWorkflows')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.Inactive}</div>
              <div className="stat-label">{t('bpm.inactiveWorkflows')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('bpm.workflowList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('bpm.searchWorkflows')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="section-content">
          {workflows.length > 0 ? (
            <div className="card-grid grid-3">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="card workflow-card">
                  <div className="card-header">
                    <div className="card-title">{workflow.name}</div>
                    <span className={`badge ${
                      workflow.status === 'Active' 
                        ? 'badge-success' 
                        : workflow.status === 'Draft'
                        ? 'badge-warning'
                        : 'badge-secondary'
                    }`}>
                      {workflow.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <p className="workflow-description">{workflow.description}</p>
                    <div className="workflow-meta">
                      <div className="meta-item">
                        <span className="meta-label">Steps:</span>
                        <span className="meta-value">{workflow.steps.length}</span>
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
                      <button className="btn-icon" title={t('bpm.runWorkflow')}>
                        <Play size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Repeat size={48} />
              </div>
              <div className="empty-title">{t('bpm.noWorkflowsFound')}</div>
              <div className="empty-description">
                {t('bpm.noWorkflowsYet')}
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('bpm.createFirstWorkflow')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkflowManagement;
