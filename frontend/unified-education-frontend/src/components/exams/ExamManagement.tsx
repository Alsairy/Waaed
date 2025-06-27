import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Download, Search, Eye, Edit, Clock, CheckCircle, AlertCircle, Archive } from 'lucide-react';
import { examsService } from '../../services';
import { Exam } from '../../types/api';

const ExamManagement: React.FC = () => {
  const { t } = useTranslation();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await examsService.getExams();
      setExams(data);
    } catch (error) {
      console.error('Error loading exams:', error);
      setError(error instanceof Error ? error.message : 'Failed to load exams');
      setExams([]);
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
          <FileText className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadExams}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const statusCounts = {
    Published: exams.filter(e => e.status === 'Published').length,
    Draft: exams.filter(e => e.status === 'Draft').length,
    Archived: exams.filter(e => e.status === 'Archived').length,
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('exams.examManagement')}</h1>
        <p className="page-subtitle">{t('exams.manageExamContent')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('exams.createExam')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('exams.examOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{exams.length}</div>
              <div className="stat-label">{t('exams.totalExams')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.Published}</div>
              <div className="stat-label">{t('exams.publishedExams')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.Draft}</div>
              <div className="stat-label">{t('exams.draftExams')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Archive size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.Archived}</div>
              <div className="stat-label">{t('exams.archivedExams')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('exams.examList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('exams.searchExams')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="section-content">
          {exams.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('exams.examTitle')}</th>
                    <th>{t('exams.subject')}</th>
                    <th>{t('exams.duration')}</th>
                    <th>{t('exams.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam.id}>
                      <td>
                        <div className="exam-info">
                          <div className="exam-title">{exam.title}</div>
                          <div className="exam-meta">ID: {exam.id}</div>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-info">{exam.subject}</span>
                      </td>
                      <td>
                        <div className="duration-info">
                          <Clock size={16} className="duration-icon" />
                          <span>{exam.duration} minutes</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          exam.status === 'Published' 
                            ? 'badge-success' 
                            : exam.status === 'Draft'
                            ? 'badge-warning'
                            : 'badge-secondary'
                        }`}>
                          {exam.status}
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
                <FileText size={48} />
              </div>
              <div className="empty-title">{t('exams.noExamsFound')}</div>
              <div className="empty-description">
                {t('exams.noExamsYet')}
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('exams.createFirstExam')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamManagement;
