import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Vote, Clock, Users, CheckCircle, AlertCircle, Calendar, Eye } from 'lucide-react';
import { pollsService } from '../../services';

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

interface Poll {
  id: string;
  question: string;
  description: string;
  options: PollOption[];
  startDate: string;
  endDate: string;
  totalVotes: number;
  hasVoted: boolean;
  userVote?: string;
  showResultsAfterVoting: boolean;
  showResultsAfterClose: boolean;
  isAnonymous: boolean;
  status: 'active' | 'closed' | 'upcoming';
  targetAudience: string;
  createdBy: string;
  createdAt: string;
}

const PollVoting: React.FC = () => {
  const { t } = useTranslation();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingLoading, setVotingLoading] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<{ [pollId: string]: string }>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'voted' | 'closed'>('active');

  useEffect(() => {
    loadPolls();
  }, []);

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await pollsService.getPolls();
      setPolls(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading polls:', error);
      setError(error instanceof Error ? error.message : 'Failed to load polls');
      setPolls([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (pollId: string, optionId: string) => {
    try {
      setVotingLoading(pollId);
      setError(null);

      await pollsService.vote(pollId, { optionId });
      
      await loadPolls();
      
      setSelectedOptions(prev => ({
        ...prev,
        [pollId]: ''
      }));

    } catch (error) {
      console.error('Error voting:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit vote');
    } finally {
      setVotingLoading(null);
    }
  };

  const handleOptionSelect = (pollId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [pollId]: optionId
    }));
  };

  const filteredPolls = polls.filter(poll => {
    switch (filter) {
      case 'active':
        return poll.status === 'active' && !poll.hasVoted;
      case 'voted':
        return poll.hasVoted;
      case 'closed':
        return poll.status === 'closed';
      default:
        return true;
    }
  });

  const getPollStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'closed': return 'secondary';
      case 'upcoming': return 'warning';
      default: return 'secondary';
    }
  };

  const getPollStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'closed': return Clock;
      case 'upcoming': return Calendar;
      default: return AlertCircle;
    }
  };

  const canShowResults = (poll: Poll): boolean => {
    if (poll.status === 'closed' && poll.showResultsAfterClose) return true;
    if (poll.hasVoted && poll.showResultsAfterVoting) return true;
    return false;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
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
          <Vote className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadPolls}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('polls.voting')}</h1>
        <p className="page-subtitle">{t('polls.participateInActivePolls')}</p>
      </div>

      <div className="content-section">
        <div className="section-header">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              {t('polls.allPolls')}
            </button>
            <button 
              className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
              onClick={() => setFilter('active')}
            >
              {t('polls.activePolls')}
            </button>
            <button 
              className={`filter-tab ${filter === 'voted' ? 'active' : ''}`}
              onClick={() => setFilter('voted')}
            >
              {t('polls.votedPolls')}
            </button>
            <button 
              className={`filter-tab ${filter === 'closed' ? 'active' : ''}`}
              onClick={() => setFilter('closed')}
            >
              {t('polls.closedPolls')}
            </button>
          </div>
        </div>

        <div className="section-content">
          {filteredPolls.length > 0 ? (
            <div className="polls-list">
              {filteredPolls.map((poll) => {
                const StatusIcon = getPollStatusIcon(poll.status);
                const statusColor = getPollStatusColor(poll.status);
                const showResults = canShowResults(poll);
                const selectedOption = selectedOptions[poll.id];
                
                return (
                  <div key={poll.id} className="card poll-card">
                    <div className="card-header">
                      <div className="poll-info">
                        <div className="poll-question">{poll.question}</div>
                        {poll.description && (
                          <div className="poll-description">{poll.description}</div>
                        )}
                      </div>
                      <span className={`badge badge-${statusColor}`}>
                        <StatusIcon size={14} className="badge-icon" />
                        {poll.status === 'active' ? t('polls.active') :
                         poll.status === 'closed' ? t('polls.closed') :
                         t('polls.upcoming')}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="poll-meta">
                        <div className="meta-item">
                          <Calendar size={16} className="meta-icon" />
                          <span className="meta-text">
                            {t('polls.endsOn')} {formatDate(poll.endDate)}
                          </span>
                        </div>
                        <div className="meta-item">
                          <Users size={16} className="meta-icon" />
                          <span className="meta-text">
                            {poll.totalVotes} {t('polls.votes')}
                          </span>
                        </div>
                        {poll.hasVoted && (
                          <div className="meta-item voted">
                            <CheckCircle size={16} className="meta-icon" />
                            <span className="meta-text">{t('polls.youHaveVoted')}</span>
                          </div>
                        )}
                      </div>

                      <div className="poll-options">
                        {poll.options.map((option) => (
                          <div key={option.id} className="poll-option">
                            {!poll.hasVoted && poll.status === 'active' ? (
                              <label className="option-label">
                                <input
                                  type="radio"
                                  name={`poll-${poll.id}`}
                                  value={option.id}
                                  checked={selectedOption === option.id}
                                  onChange={() => handleOptionSelect(poll.id, option.id)}
                                  className="option-radio"
                                />
                                <span className="option-text">{option.text}</span>
                              </label>
                            ) : (
                              <div className="option-display">
                                <span className="option-text">{option.text}</span>
                                {showResults && (
                                  <div className="option-results">
                                    <div className="vote-count">{option.voteCount} votes</div>
                                    <div className="vote-percentage">{option.percentage}%</div>
                                    <div className="progress-bar">
                                      <div 
                                        className="progress-fill"
                                        style={{ width: `${option.percentage}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                )}
                                {poll.hasVoted && poll.userVote === option.id && (
                                  <div className="user-vote-indicator">
                                    <CheckCircle size={16} />
                                    <span>{t('polls.yourVote')}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="card-footer">
                      {!poll.hasVoted && poll.status === 'active' && (
                        <button
                          className="btn btn-primary"
                          onClick={() => handleVote(poll.id, selectedOption)}
                          disabled={!selectedOption || votingLoading === poll.id}
                        >
                          {votingLoading === poll.id ? (
                            <>
                              <div className="loading-spinner-sm"></div>
                              {t('polls.submittingVote')}
                            </>
                          ) : (
                            <>
                              <Vote size={16} />
                              {t('polls.submitVote')}
                            </>
                          )}
                        </button>
                      )}
                      {showResults && (
                        <button className="btn btn-secondary">
                          <Eye size={16} />
                          {t('polls.viewDetailedResults')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Vote size={48} />
              </div>
              <div className="empty-title">
                {filter === 'active' ? t('polls.noActivePolls') :
                 filter === 'voted' ? t('polls.noVotedPolls') :
                 filter === 'closed' ? t('polls.noClosedPolls') :
                 t('polls.noPolls')}
              </div>
              <div className="empty-description">
                {filter === 'active' ? t('polls.noActivePollsDescription') :
                 filter === 'voted' ? t('polls.noVotedPollsDescription') :
                 filter === 'closed' ? t('polls.noClosedPollsDescription') :
                 t('polls.noPollsDescription')}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollVoting;
