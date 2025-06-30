import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Tag, Eye, MessageCircle, Share2, Heart, Bookmark } from 'lucide-react';
import { blogsService } from '../../services';
import CommentSection from './CommentSection';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  status: 'draft' | 'published';
  visibility: 'public' | 'private' | 'restricted';
  allowComments: boolean;
  featuredImage?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  viewsCount: number;
  likesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
}

interface BlogPostViewProps {
  postId?: string;
  onBack?: () => void;
}

const BlogPostView: React.FC<BlogPostViewProps> = ({ postId = '1', onBack }) => {
  const { t } = useTranslation();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadBlogPost = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogsService.getBlogPost(postId);
      setBlogPost(data);
    } catch (error) {
      console.error('Error loading blog post:', error);
      setError(error instanceof Error ? error.message : 'Failed to load blog post');
      setBlogPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadBlogPost();
  }, [loadBlogPost]);

  const handleLike = async () => {
    if (!blogPost) return;
    
    try {
      setActionLoading('like');
      if (blogPost.isLiked) {
        await blogsService.unlikeBlogPost(postId);
        setBlogPost(prev => prev ? {
          ...prev,
          isLiked: false,
          likesCount: prev.likesCount - 1
        } : null);
      } else {
        await blogsService.likeBlogPost(postId);
        setBlogPost(prev => prev ? {
          ...prev,
          isLiked: true,
          likesCount: prev.likesCount + 1
        } : null);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBookmark = async () => {
    if (!blogPost) return;
    
    try {
      setActionLoading('bookmark');
      console.log('Bookmark functionality not yet implemented in backend');
      setBlogPost(prev => prev ? {
        ...prev,
        isBookmarked: !prev.isBookmarked
      } : null);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleShare = async () => {
    if (!blogPost) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: blogPost.title,
          text: blogPost.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatContent = (content: string): string => {
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
      .replace(/\n- (.*)/g, '<li>$1</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
      .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="content-image" />')
      .replace(/\n/g, '<br>');
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

  if (error || !blogPost) {
    return (
      <div className="content-area">
        <div className="error-state">
          <MessageCircle className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error || t('blogs.postNotFound')}</div>
          <button className="error-action" onClick={loadBlogPost}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="blog-post-view">
        <div className="post-header">
          {onBack && (
            <button className="btn btn-secondary back-btn" onClick={onBack}>
              <ArrowLeft size={18} />
              {t('common.back')}
            </button>
          )}
          
          <div className="post-title-section">
            <h1 className="post-title">{blogPost.title}</h1>
            
            <div className="post-meta">
              <div className="meta-left">
                <div className="author-info">
                  {blogPost.authorAvatar && (
                    <img src={blogPost.authorAvatar} alt={blogPost.authorName} className="author-avatar" />
                  )}
                  <div className="author-details">
                    <div className="author-name">{blogPost.authorName}</div>
                    <div className="publish-date">
                      <Calendar size={14} />
                      {formatDate(blogPost.publishedAt || blogPost.createdAt)}
                    </div>
                  </div>
                </div>
                
                <div className="post-category">
                  <Tag size={14} />
                  {blogPost.categoryName}
                </div>
              </div>
              
              <div className="meta-right">
                <div className="post-stats">
                  <div className="stat-item">
                    <Eye size={16} />
                    <span>{blogPost.viewsCount}</span>
                  </div>
                  <div className="stat-item">
                    <MessageCircle size={16} />
                    <span>{blogPost.commentsCount}</span>
                  </div>
                  <div className="stat-item">
                    <Heart size={16} />
                    <span>{blogPost.likesCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {blogPost.featuredImage && (
          <div className="post-featured-image">
            <img src={blogPost.featuredImage} alt={blogPost.title} />
          </div>
        )}

        <div className="post-content-wrapper">
          <div className="post-content">
            {blogPost.excerpt && (
              <div className="post-excerpt">{blogPost.excerpt}</div>
            )}
            
            <div 
              className="post-body"
              dangerouslySetInnerHTML={{ __html: formatContent(blogPost.content) }}
            />
            
            {blogPost.tags && blogPost.tags.length > 0 && (
              <div className="post-tags">
                <div className="tags-label">{t('blogs.tags')}:</div>
                <div className="tags-list">
                  {blogPost.tags.map((tag, index) => (
                    <span key={index} className="post-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="post-actions">
            <div className="action-buttons">
              <button 
                className={`action-btn ${blogPost.isLiked ? 'active' : ''}`}
                onClick={handleLike}
                disabled={actionLoading === 'like'}
              >
                <Heart size={20} fill={blogPost.isLiked ? 'currentColor' : 'none'} />
                <span>{blogPost.likesCount}</span>
                {actionLoading === 'like' && <div className="loading-spinner-sm"></div>}
              </button>
              
              <button 
                className={`action-btn ${blogPost.isBookmarked ? 'active' : ''}`}
                onClick={handleBookmark}
                disabled={actionLoading === 'bookmark'}
              >
                <Bookmark size={20} fill={blogPost.isBookmarked ? 'currentColor' : 'none'} />
                <span>{t('blogs.bookmark')}</span>
                {actionLoading === 'bookmark' && <div className="loading-spinner-sm"></div>}
              </button>
              
              <button className="action-btn" onClick={handleShare}>
                <Share2 size={20} />
                <span>{t('blogs.share')}</span>
              </button>
            </div>
          </div>
        </div>

        {blogPost.allowComments && (
          <CommentSection postId={postId} />
        )}
      </div>
    </div>
  );
};

export default BlogPostView;
