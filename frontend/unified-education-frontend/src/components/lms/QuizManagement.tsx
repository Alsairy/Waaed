import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { 
  HelpCircle, 
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
  Award,
  Timer
} from 'lucide-react';
import { lmsService } from '../../services';
import { Quiz } from '../../types/api';

const QuizManagement: React.FC = () => {
  const { t } = useTranslation();
  const { courseId } = useParams<{ courseId: string }>();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    if (courseId) {
      loadQuizzes();
    }
  }, [courseId]);

  const loadQuizzes = async () => {
    if (!courseId) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await lmsService.getQuizzes(courseId);
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading quizzes:', error);
      setError(error instanceof Error ? error.message : 'Failed to load quizzes');
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter((quiz: Quiz) => {
    const matchesSearch = searchTerm === '' || 
      quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quiz.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === '' || quiz.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const statusCounts = {
    total: quizzes.length,
    questions: quizzes.reduce((sum, q) => sum + q.questionCount, 0),
    attempts: quizzes.reduce((sum, q) => sum + q.attemptCount, 0),
    avgPoints: quizzes.length > 0 ? Math.round(quizzes.reduce((sum, q) => sum + q.points, 0) / quizzes.length) : 0,
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
          <HelpCircle className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadQuizzes}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('lms.quizManagement')}</h1>
        <p className="page-subtitle">{t('lms.manageQuizzes')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('lms.createQuiz')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('lms.quizOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <HelpCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.total}</div>
              <div className="stat-label">{t('lms.totalQuizzes')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.questions}</div>
              <div className="stat-label">{t('lms.totalQuestions')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.attempts}</div>
              <div className="stat-label">{t('lms.totalAttempts')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Award size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{statusCounts.avgPoints}</div>
              <div className="stat-label">{t('lms.avgPoints')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('lms.quizList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('lms.searchQuizzes')}
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
              <option value="Practice">{t('lms.practice')}</option>
              <option value="Graded">{t('lms.graded')}</option>
              <option value="Survey">{t('lms.survey')}</option>
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredQuizzes.length > 0 ? (
            <div className="card-grid grid-2">
              {filteredQuizzes.map((quiz) => (
                <div key={quiz.id} className="card card-hover">
                  <div className="card-header">
                    <div className="card-title">{quiz.title}</div>
                    <div className="card-badges">
                      <span className="badge badge-primary">{quiz.type}</span>
                      <span className="badge badge-secondary">{quiz.points} pts</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <p className="card-description">{quiz.description}</p>
                    <div className="quiz-info">
                      <div className="info-item">
                        <CheckCircle size={16} className="info-icon" />
                        <span className="info-text">
                          {quiz.questionCount} questions
                        </span>
                      </div>
                      <div className="info-item">
                        <Timer size={16} className="info-icon" />
                        <span className="info-text">
                          {quiz.timeLimit ? `${quiz.timeLimit} min` : 'No time limit'}
                        </span>
                      </div>
                      <div className="info-item">
                        <Users size={16} className="info-icon" />
                        <span className="info-text">
                          {quiz.attemptCount} attempts
                        </span>
                      </div>
                      <div className="info-item">
                        <Calendar size={16} className="info-icon" />
                        <span className="info-text">
                          Due: {quiz.dueDate ? new Date(quiz.dueDate).toLocaleDateString() : 'No due date'}
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
                <HelpCircle size={48} />
              </div>
              <div className="empty-title">{t('lms.noQuizzesFound')}</div>
              <div className="empty-description">
                {searchTerm || typeFilter 
                  ? t('lms.noQuizzesMatchFilter')
                  : t('lms.noQuizzesYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('lms.createFirstQuiz')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizManagement;
