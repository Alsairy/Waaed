import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Download, 
  Search, 
  Eye, 
  Edit, 
  MoreVertical, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Users,
  Award
} from 'lucide-react';
import { lmsService } from '../../services';
import { Assignment } from '../../types/api';

const AssignmentManagement: React.FC = () => {
  const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    if (courseId) {
      loadAssignments();
    }
  }, [courseId]);

  const loadAssignments = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await lmsService.getAssignments(courseId);
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading assignments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter((assignment: Assignment) => {
    const matchesSearch = searchTerm === '' || 
      assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || assignment.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const statusCounts = {
    total: assignments.length,
    submitted: assignments.reduce((sum, a) => sum + a.submissionCount, 0),
    graded: assignments.reduce((sum, a) => sum + a.gradedCount, 0),
    pending: assignments.reduce((sum, a) => sum + (a.submissionCount - a.gradedCount), 0),
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
          <button className="error-action" onClick={loadAssignments}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('lms.assignmentManagement')}</h1>
        <p className="page-subtitle">{t('lms.manageAssignments')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('lms.createAssignment')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('lms.assignmentOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.total}</div>
              <div className="stat-label">{t('lms.totalAssignments')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.submitted}</div>
              <div className="stat-label">{t('lms.totalSubmissions')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.graded}</div>
              <div className="stat-label">{t('lms.gradedSubmissions')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.pending}</div>
              <div className="stat-label">{t('lms.pendingGrading')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('lms.assignmentList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('lms.searchAssignments')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">{t('lms.allTypes')}</option>
              <option value="Individual">{t('lms.individual')}</option>
              <option value="Group">{t('lms.group')}</option>
              <option value="Essay">{t('lms.essay')}</option>
              <option value="Project">{t('lms.project')}</option>
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredAssignments.length > 0 ? (
            <div className="card-grid grid-2">
              {filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="card card-hover">
                  <div className="card-header">
                    <div className="card-title">{assignment.title}</div>
                    <div className="card-badges">
                      <span className="badge badge-primary">{assignment.type}</span>
                      <span className="badge badge-secondary">{assignment.points} pts</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="card-description">{assignment.description}</p>
                    <div className="assignment-info">
                      <div className="info-item">
                        <Calendar size={16} className="info-icon" />
                        <span className="info-text">
                          Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                        </span>
                      </div>
                      <div className="info-item">
                        <Users size={16} className="info-icon" />
                        <span className="info-text">
                          {assignment.submissionCount} submissions
                        </span>
                      </div>
                      <div className="info-item">
                        <Award size={16} className="info-icon" />
                        <span className="info-text">
                          {assignment.gradedCount} graded
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
                <FileText size={48} />
              </div>
              <div className="empty-title">{t('lms.noAssignmentsFound')}</div>
              <div className="empty-description">
                {searchTerm || typeFilter 
                  ? t('lms.noAssignmentsMatchFilter')
                  : t('lms.noAssignmentsYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('lms.createFirstAssignment')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignmentManagement;
