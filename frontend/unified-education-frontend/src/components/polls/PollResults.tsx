import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, PieChart, Download, Search, Calendar, Users, TrendingUp, Eye, Filter } from 'lucide-react';
import { pollsService } from '../../services';

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

interface PollResult {
  id: string;
  question: string;
  description: string;
  options: PollOption[];
  totalVotes: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'closed' | 'upcoming';
  targetAudience: string;
  createdBy: string;
  createdAt: string;
  isAnonymous: boolean;
  showResultsAfterVoting: boolean;
  showResultsAfterClose: boolean;
}

const PollResults: React.FC = () => {
  const { t } = useTranslation();
  const [pollResults, setPollResults] = useState<PollResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [audienceFilter, setAudienceFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadPollResults();
  }, []);

  const loadPollResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const polls = await pollsService.getPolls();
      const pollsArray = Array.isArray(polls) ? polls : [];
      
      setPollResults(pollsArray);
    } catch (error) {
      console.error('Error loading poll results:', error);
      setError(error instanceof Error ? error.message : 'Failed to load poll results');
      setPollResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = pollResults.filter((poll: PollResult) => {
    const matchesSearch = searchTerm === '' || 
      poll.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || poll.status === statusFilter;
    const matchesAudience = audienceFilter === '' || poll.targetAudience === audienceFilter;
    return matchesSearch && matchesStatus && matchesAudience;
  });

  const resultStats = {
    totalPolls: pollResults.length,
    activePolls: pollResults.filter((p: PollResult) => p.status === 'active').length,
    closedPolls: pollResults.filter((p: PollResult) => p.status === 'closed').length,
    totalVotes: pollResults.reduce((sum: number, p: PollResult) => sum + p.totalVotes, 0),
  };

  const audiences = [...new Set(pollResults.map((p: PollResult) => p.targetAudience).filter(Boolean))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'closed': return 'secondary';
      case 'upcoming': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const exportResults = async (pollId: string) => {
    try {
      await pollsService.exportPollResults(pollId, 'csv');
    } catch (error) {
      console.error('Error exporting results:', error);
    }
  };

  const getWinningOption = (options: PollOption[]): PollOption | null => {
    if (options.length === 0) return null;
    return options.reduce((max, option) => option.voteCount > max.voteCount ? option : max);
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
          <button 
            className="error-action" 
            onClick={loadPollResults}
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
        <h1 className="page-title">{t('polls.pollResults')}</h1>
        <p className="page-subtitle">{t('polls.viewAndAnalyzePollResults')}</p>
        <div className="page-actions">
          <button 
            className="btn btn-secondary"
            aria-label={t('polls.exportAllResults')}
          >
            <Download size={18} className="btn-icon" aria-hidden="true" />
            {t('polls.exportAllResults')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('polls.resultsOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <BarChart3 size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{resultStats.totalPolls}</div>
              <div className="stat-label">{t('polls.totalPolls')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{resultStats.activePolls}</div>
              <div className="stat-label">{t('polls.activePolls')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">
              <PieChart size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{resultStats.closedPolls}</div>
              <div className="stat-label">{t('polls.closedPolls')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{resultStats.totalVotes}</div>
              <div className="stat-label">{t('polls.totalVotes')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('polls.pollResultsList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('polls.searchPolls')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={t('polls.searchPolls')}
                  id="poll-search"
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={audienceFilter}
              onChange={(e) => setAudienceFilter(e.target.value)}
              aria-label={t('polls.filterByAudience')}
            >
              <option value="">{t('polls.allAudiences')}</option>
              {audiences.map((audience) => (
                <option key={audience} value={audience}>{audience}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('polls.filterByStatus')}
            >
              <option value="">{t('polls.allStatuses')}</option>
              <option value="active">{t('polls.active')}</option>
              <option value="closed">{t('polls.closed')}</option>
              <option value="upcoming">{t('polls.upcoming')}</option>
            </select>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label={t('polls.gridView')}
                aria-pressed={viewMode === 'grid'}
              >
                <BarChart3 size={16} aria-hidden="true" />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label={t('polls.listView')}
                aria-pressed={viewMode === 'list'}
              >
                <Filter size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="section-content">
          {filteredResults.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="card-grid grid-2">
                {filteredResults.map((poll) => {
                  const winningOption = getWinningOption(poll.options);
                  const statusColor = getStatusColor(poll.status);
                  
                  return (
                    <div key={poll.id} className="card card-hover poll-result-card">
                      <div className="card-header">
                        <div className="poll-info">
                          <div className="poll-question">{poll.question}</div>
                          {poll.description && (
                            <div className="poll-description">{poll.description}</div>
                          )}
                        </div>
                        <span className={`badge badge-${statusColor}`}>
                          {poll.status === 'active' ? t('polls.active') :
                           poll.status === 'closed' ? t('polls.closed') :
                           t('polls.upcoming')}
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="poll-meta">
                          <div className="meta-row">
                            <Calendar size={16} className="meta-icon" />
                            <span className="meta-label">{t('polls.period')}</span>
                            <span className="meta-value">
                              {formatDate(poll.startDate)} - {formatDate(poll.endDate)}
                            </span>
                          </div>
                          <div className="meta-row">
                            <Users size={16} className="meta-icon" />
                            <span className="meta-label">{t('polls.totalVotes')}</span>
                            <span className="meta-value">{poll.totalVotes}</span>
                          </div>
                          <div className="meta-row">
                            <TrendingUp size={16} className="meta-icon" />
                            <span className="meta-label">{t('polls.audience')}</span>
                            <span className="meta-value">{poll.targetAudience}</span>
                          </div>
                        </div>
                        
                        {winningOption && (
                          <div className="winning-option">
                            <div className="winning-label">{t('polls.leadingOption')}</div>
                            <div className="winning-text">{winningOption.text}</div>
                            <div className="winning-stats">
                              {winningOption.voteCount} votes ({winningOption.percentage}%)
                            </div>
                          </div>
                        )}

                        <div className="options-summary">
                          {poll.options.map((option) => (
                            <div key={option.id} className="option-summary">
                              <div className="option-header">
                                <span className="option-text">{option.text}</span>
                                <span className="option-percentage">{option.percentage}%</span>
                              </div>
                              <div className="progress-bar">
                                <div 
                                  className="progress-fill"
                                  style={{ width: `${option.percentage}%` }}
                                ></div>
                              </div>
                              <div className="option-votes">{option.voteCount} votes</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="card-footer">
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-primary">
                            <Eye size={14} />
                            {t('polls.viewDetails')}
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => exportResults(poll.id)}
                          >
                            <Download size={14} />
                            {t('polls.export')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('polls.question')}</th>
                      <th>{t('polls.status')}</th>
                      <th>{t('polls.totalVotes')}</th>
                      <th>{t('polls.audience')}</th>
                      <th>{t('polls.endDate')}</th>
                      <th>{t('polls.leadingOption')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((poll) => {
                      const winningOption = getWinningOption(poll.options);
                      const statusColor = getStatusColor(poll.status);
                      
                      return (
                        <tr key={poll.id}>
                          <td>
                            <div className="poll-cell">
                              <div className="poll-question">{poll.question}</div>
                              {poll.description && (
                                <div className="poll-description">{poll.description}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <span className={`badge badge-${statusColor}`}>
                              {poll.status === 'active' ? t('polls.active') :
                               poll.status === 'closed' ? t('polls.closed') :
                               t('polls.upcoming')}
                            </span>
                          </td>
                          <td>{poll.totalVotes}</td>
                          <td>{poll.targetAudience}</td>
                          <td>{formatDate(poll.endDate)}</td>
                          <td>
                            {winningOption ? (
                              <div className="leading-option">
                                <div className="option-text">{winningOption.text}</div>
                                <div className="option-stats">
                                  {winningOption.percentage}% ({winningOption.voteCount} votes)
                                </div>
                              </div>
                            ) : (
                              <span className="no-votes">{t('polls.noVotes')}</span>
                            )}
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn btn-sm btn-primary">
                                <Eye size={14} />
                              </button>
                              <button 
                                className="btn btn-sm btn-secondary"
                                onClick={() => exportResults(poll.id)}
                              >
                                <Download size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <BarChart3 size={48} />
              </div>
              <div className="empty-title">{t('polls.noPollResultsFound')}</div>
              <div className="empty-description">
                {searchTerm || statusFilter || audienceFilter
                  ? t('polls.noPollResultsMatchFilter')
                  : t('polls.noPollResultsYet')
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollResults;
