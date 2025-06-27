import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Plus, Download, Search, Eye, Edit, MessageSquare, Brain, Zap, Target } from 'lucide-react';
import { aiService } from '../../services';
import { ChatSession } from '../../types/api';

const AIManagement: React.FC = () => {
  const { t } = useTranslation();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChatSessions();
  }, []);

  const loadChatSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aiService.getChatSessions();
      setChatSessions(data);
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load chat sessions');
      setChatSessions([]);
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
          <Bot className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadChatSessions}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('ai.aiManagement')}</h1>
        <p className="page-subtitle">{t('ai.manageAIServices')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('ai.createSession')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('ai.aiOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Bot size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{chatSessions.length}</div>
              <div className="stat-label">{t('ai.totalSessions')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <MessageSquare size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {chatSessions.reduce((total, s) => total + s.messages.length, 0)}
              </div>
              <div className="stat-label">{t('ai.totalMessages')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Brain size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">5</div>
              <div className="stat-label">{t('ai.aiModels')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Zap size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">98%</div>
              <div className="stat-label">{t('ai.accuracy')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('ai.chatSessions')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('ai.searchSessions')}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="section-content">
          {chatSessions.length > 0 ? (
            <div className="card-grid grid-3">
              {chatSessions.map((session) => (
                <div key={session.id} className="card session-card">
                  <div className="card-header">
                    <div className="card-title">{session.title}</div>
                    <div className="session-status">
                      <Target size={16} className="status-icon" />
                      <span className="status-text">Active</span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="session-meta">
                      <div className="meta-item">
                        <MessageSquare size={16} className="meta-icon" />
                        <span className="meta-text">{session.messages.length} messages</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">User:</span>
                        <span className="meta-value">{session.userId}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Updated:</span>
                        <span className="meta-value">
                          {new Date(session.updatedAt).toLocaleDateString()}
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
                <Bot size={48} />
              </div>
              <div className="empty-title">{t('ai.noSessionsFound')}</div>
              <div className="empty-description">
                {t('ai.noSessionsYet')}
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('ai.createFirstSession')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIManagement;
