import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Plus, Search, Filter, Eye, Edit, MoreVertical, Calendar, User, Tag, MessageCircle } from 'lucide-react';
import { blogsService } from '../../services';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorId: string;
  authorName: string;
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
}

interface Category {
  id: string;
  name: string;
  description: string;
  postsCount: number;
}

const BlogPostList: React.FC = () => {
  const { t } = useTranslation();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadBlogPosts();
    loadCategories();
  }, []);

  const loadBlogPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await blogsService.getBlogPosts();
      setBlogPosts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load blog posts');
      setBlogPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await blogsService.getBlogCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const filteredPosts = blogPosts.filter((post: BlogPost) => {
    const matchesSearch = searchTerm === '' || 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === '' || post.categoryId === categoryFilter;
    const matchesStatus = statusFilter === '' || post.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const blogStats = {
    total: blogPosts.length,
    published: blogPosts.filter((p: BlogPost) => p.status === 'published').length,
    drafts: blogPosts.filter((p: BlogPost) => p.status === 'draft').length,
    totalViews: blogPosts.reduce((sum: number, p: BlogPost) => sum + (p.viewsCount || 0), 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
          <button 
            className="error-action" 
            onClick={loadBlogPosts}
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
        <h1 className="page-title">{t('blogs.blogPosts')}</h1>
        <p className="page-subtitle">{t('blogs.manageAndViewBlogPosts')}</p>
        <div className="page-actions">
          <button 
            className="btn btn-primary"
            aria-label={t('blogs.newPost')}
          >
            <Plus size={18} className="btn-icon" aria-hidden="true" />
            {t('blogs.newPost')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('blogs.overview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{blogStats.total}</div>
              <div className="stat-label">{t('blogs.totalPosts')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <Eye size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{blogStats.published}</div>
              <div className="stat-label">{t('blogs.published')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Edit size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{blogStats.drafts}</div>
              <div className="stat-label">{t('blogs.drafts')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Eye size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{blogStats.totalViews}</div>
              <div className="stat-label">{t('blogs.totalViews')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('blogs.blogPostsList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('blogs.searchPosts')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={t('blogs.searchPosts')}
                  id="blog-search"
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label={t('blogs.filterByCategory')}
              id="category-filter"
            >
              <option value="">{t('blogs.allCategories')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.postsCount || 0})
                </option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('blogs.filterByStatus')}
              id="status-filter"
            >
              <option value="">{t('blogs.allStatuses')}</option>
              <option value="published">{t('blogs.published')}</option>
              <option value="draft">{t('blogs.draft')}</option>
            </select>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label={t('blogs.gridView')}
                aria-pressed={viewMode === 'grid'}
              >
                <Filter size={16} aria-hidden="true" />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label={t('blogs.listView')}
                aria-pressed={viewMode === 'list'}
              >
                <FileText size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="section-content">
          {filteredPosts.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="card-grid grid-2">
                {filteredPosts.map((post) => {
                  const statusColor = getStatusColor(post.status);
                  
                  return (
                    <div key={post.id} className="card card-hover blog-post-card">
                      <div className="card-header">
                        {post.featuredImage && (
                          <div className="post-image">
                            <img src={post.featuredImage} alt={`Featured image for blog post: ${post.title}`} />
                          </div>
                        )}
                        <div className="post-header">
                          <div className="post-title">{post.title}</div>
                          <span className={`badge badge-${statusColor}`}>
                            {post.status === 'published' ? t('blogs.published') : t('blogs.draft')}
                          </span>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="post-excerpt">
                          {post.excerpt || truncateText(post.content, 150)}
                        </div>
                        <div className="post-meta">
                          <div className="meta-row">
                            <User size={16} className="meta-icon" />
                            <span className="meta-text">{post.authorName || 'Unknown Author'}</span>
                          </div>
                          <div className="meta-row">
                            <Calendar size={16} className="meta-icon" />
                            <span className="meta-text">
                              {post.publishedAt 
                                ? formatDate(post.publishedAt)
                                : formatDate(post.createdAt)
                              }
                            </span>
                          </div>
                          <div className="meta-row">
                            <Tag size={16} className="meta-icon" />
                            <span className="meta-text">{post.categoryName || 'Uncategorized'}</span>
                          </div>
                        </div>
                        {post.tags && post.tags.length > 0 && (
                          <div className="post-tags">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="post-tag">{tag}</span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="post-tag-more">+{post.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                        <div className="post-stats">
                          <div className="stat-item">
                            <Eye size={16} className="stat-icon" />
                            <span className="stat-value">{post.viewsCount || 0}</span>
                          </div>
                          <div className="stat-item">
                            <MessageCircle size={16} className="stat-icon" />
                            <span className="stat-value">{post.commentsCount || 0}</span>
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
                  );
                })}
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('blogs.title')}</th>
                      <th>{t('blogs.author')}</th>
                      <th>{t('blogs.category')}</th>
                      <th>{t('blogs.status')}</th>
                      <th>{t('blogs.publishedDate')}</th>
                      <th>{t('blogs.views')}</th>
                      <th>{t('blogs.comments')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => {
                      const statusColor = getStatusColor(post.status);
                      
                      return (
                        <tr key={post.id}>
                          <td>
                            <div className="post-cell">
                              <div className="post-title">{post.title}</div>
                              {post.excerpt && (
                                <div className="post-excerpt">{truncateText(post.excerpt, 80)}</div>
                              )}
                            </div>
                          </td>
                          <td>{post.authorName || 'Unknown'}</td>
                          <td>{post.categoryName || 'Uncategorized'}</td>
                          <td>
                            <span className={`badge badge-${statusColor}`}>
                              {post.status === 'published' ? t('blogs.published') : t('blogs.draft')}
                            </span>
                          </td>
                          <td>
                            {post.publishedAt 
                              ? formatDate(post.publishedAt)
                              : formatDate(post.createdAt)
                            }
                          </td>
                          <td>{post.viewsCount || 0}</td>
                          <td>{post.commentsCount || 0}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn btn-sm btn-primary">
                                <Eye size={14} />
                              </button>
                              <button className="btn btn-sm btn-secondary">
                                <Edit size={14} />
                              </button>
                              <button className="btn-icon">
                                <MoreVertical size={14} />
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
                <FileText size={48} />
              </div>
              <div className="empty-title">{t('blogs.noBlogPostsFound')}</div>
              <div className="empty-description">
                {searchTerm || categoryFilter || statusFilter
                  ? t('blogs.noBlogPostsMatchFilter')
                  : t('blogs.noBlogPostsYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('blogs.createFirstPost')}
              </button>
            </div>
          )}
        </div>
      </div>

      {categories.length > 0 && (
        <div className="content-section">
          <div className="section-header">
            <h2 className="section-title">{t('blogs.categories')}</h2>
          </div>
          <div className="categories-grid">
            {categories.map((category) => (
              <div key={category.id} className="category-card">
                <div className="category-name">{category.name}</div>
                <div className="category-description">{category.description}</div>
                <div className="category-count">{category.postsCount || 0} posts</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostList;
