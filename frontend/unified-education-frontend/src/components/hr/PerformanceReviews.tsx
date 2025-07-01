import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Plus, Download, Search, Eye, Edit, MoreVertical, User, Calendar, Target, TrendingUp } from 'lucide-react';
import { hrService } from '../../services';

interface PerformanceReview {
  id: string;
  employeeName: string;
  employeeId: string;
  position: string;
  status: string;
  reviewPeriod: string;
  reviewerName: string;
  overallScore?: number;
  completionPercentage: number;
  goals?: Array<{ title: string }>;
}

const PerformanceReviews: React.FC = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');

  useEffect(() => {
    loadPerformanceReviews();
  }, []);

  const loadPerformanceReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrService.getPerformanceReviews();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading performance reviews:', error);
      setError(error instanceof Error ? error.message : 'Failed to load performance reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter((review: PerformanceReview) => {
    const matchesSearch = searchTerm === '' || 
      review.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || review.status === statusFilter;
    const matchesPeriod = periodFilter === '' || review.reviewPeriod === periodFilter;
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const reviewStats = {
    total: reviews.length,
    completed: reviews.filter((r: PerformanceReview) => r.status === 'Completed').length,
    inProgress: reviews.filter((r: PerformanceReview) => r.status === 'In Progress').length,
    pending: reviews.filter((r: PerformanceReview) => r.status === 'Pending').length,
  };

  const periods = [...new Set(reviews.map((r: PerformanceReview) => r.reviewPeriod).filter(Boolean))];

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'excellent';
    if (score >= 4.0) return 'good';
    if (score >= 3.0) return 'average';
    return 'needs-improvement';
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
          <Star className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button 
            className="error-action" 
            onClick={loadPerformanceReviews}
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
        <h1 className="page-title">{t('hr.performanceReviews')}</h1>
        <p className="page-subtitle">{t('hr.manageEmployeePerformanceEvaluations')}</p>
        <div className="page-actions">
          <button 
            className="btn btn-primary"
            aria-label={t('hr.createReview')}
          >
            <Plus size={18} className="btn-icon" aria-hidden="true" />
            {t('hr.createReview')}
          </button>
          <button 
            className="btn btn-secondary"
            aria-label={t('hr.exportReviews')}
          >
            <Download size={18} className="btn-icon" aria-hidden="true" />
            {t('hr.exportReviews')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('hr.reviewOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Star size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{reviewStats.total}</div>
              <div className="stat-label">{t('hr.totalReviews')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <Target size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{reviewStats.completed}</div>
              <div className="stat-label">{t('hr.completed')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{reviewStats.inProgress}</div>
              <div className="stat-label">{t('hr.inProgress')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{reviewStats.pending}</div>
              <div className="stat-label">{t('hr.pending')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('hr.reviewList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('hr.searchReviews')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={t('hr.searchReviews')}
                  id="review-search"
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              aria-label={t('hr.filterByPeriod')}
            >
              <option value="">{t('hr.allPeriods')}</option>
              {periods.map((period) => (
                <option key={period} value={period}>{period}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('hr.filterByStatus')}
            >
              <option value="">{t('hr.allStatuses')}</option>
              <option value="Pending">{t('hr.pending')}</option>
              <option value="In Progress">{t('hr.inProgress')}</option>
              <option value="Completed">{t('hr.completed')}</option>
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredReviews.length > 0 ? (
            <div className="card-grid grid-2">
              {filteredReviews.map((review) => (
                <div key={review.id} className="card card-hover review-card">
                  <div className="card-header">
                    <div className="employee-info">
                      <User size={20} className="employee-icon" />
                      <div className="employee-details">
                        <div className="employee-name">{review.employeeName || 'John Doe'}</div>
                        <div className="employee-id">{review.employeeId || 'EMP001'}</div>
                        <div className="employee-position">{review.position || 'Software Engineer'}</div>
                      </div>
                    </div>
                    <span className={`badge ${
                      review.status === 'Completed' 
                        ? 'badge-success' 
                        : review.status === 'In Progress'
                        ? 'badge-info'
                        : 'badge-warning'
                    }`}>
                      {review.status || 'Pending'}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="review-details">
                      <div className="detail-row">
                        <Calendar size={16} className="detail-icon" />
                        <span className="detail-label">{t('hr.reviewPeriod')}</span>
                        <span className="detail-value">{review.reviewPeriod || '2024 Q1'}</span>
                      </div>
                      <div className="detail-row">
                        <Target size={16} className="detail-icon" />
                        <span className="detail-label">{t('hr.reviewer')}</span>
                        <span className="detail-value">{review.reviewerName || 'Manager Name'}</span>
                      </div>
                      {review.overallScore && (
                        <div className="detail-row">
                          <Star size={16} className="detail-icon" />
                          <span className="detail-label">{t('hr.overallScore')}</span>
                          <span className={`score-badge ${getScoreColor(review.overallScore)}`}>
                            {review.overallScore.toFixed(1)}/5.0
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="review-progress">
                      <div className="progress-label">{t('hr.reviewProgress')}</div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${review.completionPercentage || 0}%`
                          }}
                        ></div>
                      </div>
                      <span className="progress-text">{review.completionPercentage || 0}% {t('hr.complete')}</span>
                    </div>
                    {review.goals && review.goals.length > 0 && (
                      <div className="review-goals">
                        <div className="goals-label">{t('hr.keyGoals')}</div>
                        <div className="goals-list">
                          {review.goals.slice(0, 2).map((goal: { title: string }, index: number) => (
                            <div key={index} className="goal-item">
                              <Target size={12} className="goal-icon" />
                              <span className="goal-text">{goal.title || `Goal ${index + 1}`}</span>
                            </div>
                          ))}
                          {review.goals.length > 2 && (
                            <div className="goals-more">+{review.goals.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <div className="action-buttons">
                      <button 
                        className="btn btn-sm btn-primary"
                        aria-label={t('common.viewReview', { employee: review.employeeName })}
                      >
                        <Eye size={14} aria-hidden="true" />
                        {t('common.view')}
                      </button>
                      <button 
                        className="btn btn-sm btn-secondary"
                        aria-label={t('common.editReview', { employee: review.employeeName })}
                      >
                        <Edit size={14} aria-hidden="true" />
                        {t('common.edit')}
                      </button>
                      <button 
                        className="btn-icon" 
                        title={t('common.more')}
                        aria-label={t('common.moreActions', { employee: review.employeeName })}
                        aria-haspopup="true"
                      >
                        <MoreVertical size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Star size={48} />
              </div>
              <div className="empty-title">{t('hr.noReviewsFound')}</div>
              <div className="empty-description">
                {searchTerm || statusFilter || periodFilter
                  ? t('hr.noReviewsMatchFilter')
                  : t('hr.noReviewsYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('hr.createFirstReview')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceReviews;
