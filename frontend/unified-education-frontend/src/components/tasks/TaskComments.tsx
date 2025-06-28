import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Send, Edit, Trash2, User, Calendar, MoreVertical } from 'lucide-react';
import { tasksService } from '../../services';

interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  isEditing?: boolean;
}

interface TaskCommentsProps {
  taskId: string;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksService.getTaskComments(taskId);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading comments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const commentData = {
        content: newComment,
        taskId: taskId,
      };

      await tasksService.createTaskComment(taskId, commentData);
      setNewComment('');
      await loadComments(); // Reload comments to show the new one
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      await tasksService.updateTaskComment(taskId, commentId, { content: editContent });
      setEditContent('');
      setEditingComment(null);
      await loadComments(); // Reload comments to show the updated content
    } catch (error) {
      console.error('Error updating comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t('tasks.confirmDeleteComment'))) return;

    try {
      await tasksService.deleteTaskComment(taskId, commentId);
      await loadComments(); // Reload comments to remove the deleted one
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete comment');
    }
  };

  const startEditing = (comment: TaskComment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="task-comments">
        <div className="section-header">
          <h3 className="section-title">{t('tasks.comments')}</h3>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div className="loading-text">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="task-comments">
      <div className="section-header">
        <h3 className="section-title">
          <MessageCircle size={20} />
          {t('tasks.comments')} ({comments.length})
        </h3>
      </div>

      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <div className="alert-title">{t('common.error')}</div>
            <div className="alert-description">{error}</div>
          </div>
        </div>
      )}

      <div className="new-comment-form">
        <div className="form-header">
          <h4 className="form-title">{t('tasks.addComment')}</h4>
        </div>
        <textarea
          className="form-textarea"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
          placeholder={t('tasks.writeComment')}
        />
        <div className="form-actions">
          <button
            className="btn btn-primary"
            onClick={handleSubmitComment}
            disabled={submitting || !newComment.trim()}
          >
            {submitting ? (
              <>
                <div className="loading-spinner-sm"></div>
                {t('tasks.submitting')}
              </>
            ) : (
              <>
                <Send size={16} />
                {t('tasks.submitComment')}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <div className="comment-author">
                  {comment.authorAvatar ? (
                    <img src={comment.authorAvatar} alt={comment.authorName} className="author-avatar" />
                  ) : (
                    <div className="author-avatar-placeholder">
                      <User size={20} />
                    </div>
                  )}
                  <div className="author-info">
                    <div className="author-name">{comment.authorName}</div>
                    <div className="comment-date">
                      <Calendar size={12} />
                      {formatDate(comment.createdAt)}
                      {comment.updatedAt !== comment.createdAt && (
                        <span className="edited-indicator">{t('tasks.edited')}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="comment-actions">
                  <button className="btn-icon" title={t('common.more')}>
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="comment-content">
                {editingComment === comment.id ? (
                  <div className="edit-form">
                    <textarea
                      className="form-textarea"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      placeholder={t('tasks.editComment')}
                    />
                    <div className="edit-actions">
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={cancelEditing}
                        disabled={submitting}
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEditComment(comment.id)}
                        disabled={submitting || !editContent.trim()}
                      >
                        {submitting ? (
                          <>
                            <div className="loading-spinner-sm"></div>
                            {t('tasks.updating')}
                          </>
                        ) : (
                          <>
                            <Edit size={14} />
                            {t('tasks.updateComment')}
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="comment-text">{comment.content}</div>
                )}
              </div>

              <div className="comment-footer">
                <div className="comment-interactions">
                  <button
                    className="interaction-btn"
                    onClick={() => startEditing(comment)}
                  >
                    <Edit size={14} />
                    {t('common.edit')}
                  </button>
                  
                  <button
                    className="interaction-btn danger"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 size={14} />
                    {t('common.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <MessageCircle size={48} />
            </div>
            <div className="empty-title">{t('tasks.noComments')}</div>
            <div className="empty-description">{t('tasks.beFirstToComment')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskComments;
