import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Send, Reply, Edit, Trash2, MoreVertical, User, Calendar, Heart } from 'lucide-react';
import { blogsService } from '../../services';

interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  createdAt: string;
  updatedAt: string;
  parentCommentId?: string;
  likesCount: number;
  isLiked: boolean;
  replies?: Comment[];
  isEditing?: boolean;
}

interface CommentSectionProps {
  postId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogsService.getBlogComments(postId);
      setComments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading comments:', error);
      setError(error instanceof Error ? error.message : 'Failed to load comments');
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      const commentData = {
        content: newComment,
        blogPostId: postId,
      };

      await blogsService.createBlogComment(postId, commentData);
      setNewComment('');
      await loadComments(); // Reload comments to show the new one
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentCommentId: string) => {
    if (!replyContent.trim()) return;

    try {
      setSubmitting(true);
      const replyData = {
        content: replyContent,
        blogPostId: postId,
        parentCommentId,
      };

      await blogsService.createBlogComment(postId, replyData);
      setReplyContent('');
      setReplyingTo(null);
      await loadComments(); // Reload comments to show the new reply
    } catch (error) {
      console.error('Error submitting reply:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      await blogsService.updateBlogComment(postId, commentId, { content: editContent });
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
    if (!confirm(t('blogs.confirmDeleteComment'))) return;

    try {
      await blogsService.deleteBlogComment(postId, commentId);
      await loadComments(); // Reload comments to remove the deleted one
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      console.log('Comment like functionality not yet implemented in backend');
      
      await loadComments(); // Reload to update like status
    } catch (error) {
      console.error('Error toggling comment like:', error);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditContent('');
  };

  const startReplying = (commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
  };

  const cancelReplying = () => {
    setReplyingTo(null);
    setReplyContent('');
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

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`comment ${isReply ? 'comment-reply' : ''}`}>
      <div className="comment-header">
        <div className="comment-author">
          {comment.authorAvatar ? (
            <img src={comment.authorAvatar} alt={`${comment.authorName}'s profile picture`} className="author-avatar" />
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
                <span className="edited-indicator">{t('blogs.edited')}</span>
              )}
            </div>
          </div>
        </div>
        <div className="comment-actions">
          <button 
            className="btn-icon" 
            title={t('common.more')}
            aria-label={t('common.more')}
            aria-haspopup="true"
          >
            <MoreVertical size={16} aria-hidden="true" />
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
              placeholder={t('blogs.editComment')}
              aria-label={t('blogs.editComment')}
              id={`edit-comment-${comment.id}`}
            />
            <div className="edit-actions">
              <button
                className="btn btn-sm btn-secondary"
                onClick={cancelEditing}
                disabled={submitting}
                aria-label={t('common.cancel')}
              >
                {t('common.cancel')}
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleEditComment(comment.id)}
                disabled={submitting || !editContent.trim()}
                aria-label={t('blogs.updateComment')}
              >
                {submitting ? (
                  <>
                    <div className="loading-spinner-sm"></div>
                    {t('blogs.updating')}
                  </>
                ) : (
                  <>
                    <Edit size={14} />
                    {t('blogs.updateComment')}
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
            className={`interaction-btn ${comment.isLiked ? 'active' : ''}`}
            onClick={() => handleLikeComment(comment.id)}
            aria-label={comment.isLiked ? t('blogs.unlikeComment') : t('blogs.likeComment')}
            aria-pressed={comment.isLiked}
          >
            <Heart size={14} fill={comment.isLiked ? 'currentColor' : 'none'} aria-hidden="true" />
            <span>{comment.likesCount}</span>
          </button>
          
          {!isReply && (
            <button
              className="interaction-btn"
              onClick={() => startReplying(comment.id)}
              aria-label={t('blogs.replyToComment', { author: comment.authorName })}
            >
              <Reply size={14} aria-hidden="true" />
              {t('blogs.reply')}
            </button>
          )}
          
          <button
            className="interaction-btn"
            onClick={() => startEditing(comment)}
            aria-label={t('blogs.editComment')}
          >
            <Edit size={14} aria-hidden="true" />
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

      {replyingTo === comment.id && (
        <div className="reply-form">
          <textarea
            className="form-textarea"
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={3}
            placeholder={t('blogs.writeReply')}
          />
          <div className="reply-actions">
            <button
              className="btn btn-sm btn-secondary"
              onClick={cancelReplying}
              disabled={submitting}
            >
              {t('common.cancel')}
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleSubmitReply(comment.id)}
              disabled={submitting || !replyContent.trim()}
            >
              {submitting ? (
                <>
                  <div className="loading-spinner-sm"></div>
                  {t('blogs.submitting')}
                </>
              ) : (
                <>
                  <Send size={14} />
                  {t('blogs.submitReply')}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="comments-section">
        <div className="section-header">
          <h2 className="section-title">{t('blogs.comments')}</h2>
        </div>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div className="loading-text">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="comments-section">
      <div className="section-header">
        <h2 className="section-title">
          <MessageCircle size={20} aria-hidden="true" />
          {t('blogs.comments')} ({comments.length})
        </h2>
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
          <h3 className="form-title">{t('blogs.addComment')}</h3>
        </div>
        <textarea
          className="form-textarea"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          rows={4}
          placeholder={t('blogs.writeComment')}
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
                {t('blogs.submitting')}
              </>
            ) : (
              <>
                <Send size={16} />
                {t('blogs.submitComment')}
              </>
            )}
          </button>
        </div>
      </div>

      <div className="comments-list">
        {comments.length > 0 ? (
          comments.map(comment => renderComment(comment))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <MessageCircle size={48} />
            </div>
            <div className="empty-title">{t('blogs.noComments')}</div>
            <div className="empty-description">{t('blogs.beFirstToComment')}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
