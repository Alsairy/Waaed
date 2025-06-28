import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, Eye, X, Bold, Italic, Underline, List, Link, Image, Tag } from 'lucide-react';
import { blogsService } from '../../services';

interface BlogPostFormData {
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  tags: string[];
  status: 'draft' | 'published';
  visibility: 'public' | 'private' | 'restricted';
  allowComments: boolean;
  featuredImage?: string;
}

interface Category {
  id: string;
  name: string;
  description: string;
}

const BlogPostEditor: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<BlogPostFormData>({
    title: '',
    content: '',
    excerpt: '',
    categoryId: '',
    tags: [],
    status: 'draft',
    visibility: 'public',
    allowComments: true,
    featuredImage: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await blogsService.getBlogCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleInputChange = (field: keyof BlogPostFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const insertFormatting = (format: string) => {
    const textarea = document.getElementById('content-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let replacement = '';
    switch (format) {
      case 'bold':
        replacement = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        replacement = `*${selectedText || 'italic text'}*`;
        break;
      case 'underline':
        replacement = `<u>${selectedText || 'underlined text'}</u>`;
        break;
      case 'list':
        replacement = `\n- ${selectedText || 'list item'}\n`;
        break;
      case 'link':
        replacement = `[${selectedText || 'link text'}](url)`;
        break;
      case 'image':
        replacement = `![${selectedText || 'alt text'}](image-url)`;
        break;
    }

    const newContent = 
      textarea.value.substring(0, start) + 
      replacement + 
      textarea.value.substring(end);
    
    setFormData(prev => ({ ...prev, content: newContent }));
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Blog post title is required');
      return false;
    }

    if (!formData.content.trim()) {
      setError('Blog post content is required');
      return false;
    }

    if (!formData.categoryId) {
      setError('Please select a category');
      return false;
    }

    return true;
  };

  const handleSave = async (status: 'draft' | 'published') => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const postData = {
        ...formData,
        status,
        excerpt: formData.excerpt || formData.content.substring(0, 200) + '...'
      };

      await blogsService.createBlogPost(postData);
      setSuccess(true);
      
      setTimeout(() => {
        setFormData({
          title: '',
          content: '',
          excerpt: '',
          categoryId: '',
          tags: [],
          status: 'draft',
          visibility: 'public',
          allowComments: true,
          featuredImage: '',
        });
        setSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error saving blog post:', error);
      setError(error instanceof Error ? error.message : 'Failed to save blog post');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      categoryId: '',
      tags: [],
      status: 'draft',
      visibility: 'public',
      allowComments: true,
      featuredImage: '',
    });
    setError(null);
    setSuccess(false);
    setPreviewMode(false);
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('blogs.createBlogPost')}</h1>
        <p className="page-subtitle">{t('blogs.writeAndPublishBlogPost')}</p>
        <div className="page-actions">
          <button 
            className={`btn ${previewMode ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setPreviewMode(!previewMode)}
          >
            <Eye size={18} className="btn-icon" />
            {previewMode ? t('blogs.editMode') : t('blogs.preview')}
          </button>
        </div>
      </div>

      {success && (
        <div className="alert alert-success">
          <div className="alert-content">
            <div className="alert-title">{t('blogs.blogPostSaved')}</div>
            <div className="alert-description">{t('blogs.blogPostSavedSuccessfully')}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <div className="alert-title">{t('common.error')}</div>
            <div className="alert-description">{error}</div>
          </div>
        </div>
      )}

      <div className="blog-editor">
        {!previewMode ? (
          <form className="editor-form">
            <div className="form-section">
              <div className="form-group full-width">
                <label className="form-label required">{t('blogs.title')}</label>
                <input
                  type="text"
                  className="form-input title-input"
                  placeholder={t('blogs.enterBlogTitle')}
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">{t('blogs.excerpt')}</label>
                <textarea
                  className="form-textarea"
                  placeholder={t('blogs.enterBlogExcerpt')}
                  value={formData.excerpt}
                  onChange={(e) => handleInputChange('excerpt', e.target.value)}
                  rows={3}
                />
                <div className="form-help">{t('blogs.excerptHelp')}</div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">{t('blogs.content')}</h3>
                <div className="formatting-toolbar">
                  <button type="button" className="format-btn" onClick={() => insertFormatting('bold')} title={t('blogs.bold')}>
                    <Bold size={16} />
                  </button>
                  <button type="button" className="format-btn" onClick={() => insertFormatting('italic')} title={t('blogs.italic')}>
                    <Italic size={16} />
                  </button>
                  <button type="button" className="format-btn" onClick={() => insertFormatting('underline')} title={t('blogs.underline')}>
                    <Underline size={16} />
                  </button>
                  <button type="button" className="format-btn" onClick={() => insertFormatting('list')} title={t('blogs.list')}>
                    <List size={16} />
                  </button>
                  <button type="button" className="format-btn" onClick={() => insertFormatting('link')} title={t('blogs.link')}>
                    <Link size={16} />
                  </button>
                  <button type="button" className="format-btn" onClick={() => insertFormatting('image')} title={t('blogs.image')}>
                    <Image size={16} />
                  </button>
                </div>
              </div>
              <textarea
                id="content-editor"
                className="form-textarea content-editor"
                placeholder={t('blogs.enterBlogContent')}
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={15}
                required
              />
            </div>

            <div className="form-section">
              <div className="section-header">
                <h3 className="section-title">{t('blogs.settings')}</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">{t('blogs.category')}</label>
                  <select
                    className="form-select"
                    value={formData.categoryId}
                    onChange={(e) => handleInputChange('categoryId', e.target.value)}
                    required
                  >
                    <option value="">{t('blogs.selectCategory')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('blogs.visibility')}</label>
                  <select
                    className="form-select"
                    value={formData.visibility}
                    onChange={(e) => handleInputChange('visibility', e.target.value)}
                  >
                    <option value="public">{t('blogs.public')}</option>
                    <option value="private">{t('blogs.private')}</option>
                    <option value="restricted">{t('blogs.restricted')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('blogs.featuredImage')}</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder={t('blogs.imageUrl')}
                    value={formData.featuredImage}
                    onChange={(e) => handleInputChange('featuredImage', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">{t('blogs.tags')}</label>
                <div className="tags-input">
                  <div className="tags-list">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                        <button
                          type="button"
                          className="tag-remove"
                          onClick={() => handleRemoveTag(tag)}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="tag-input-wrapper">
                    <input
                      type="text"
                      className="form-input tag-input"
                      placeholder={t('blogs.addTag')}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      onClick={handleAddTag}
                    >
                      <Tag size={14} />
                      {t('blogs.add')}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-options">
                <div className="form-option">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.allowComments}
                      onChange={(e) => handleInputChange('allowComments', e.target.checked)}
                    />
                    <span className="checkbox-text">{t('blogs.allowComments')}</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
                disabled={loading}
              >
                {t('common.reset')}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => handleSave('draft')}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-sm"></div>
                    {t('blogs.saving')}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('blogs.saveDraft')}
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSave('published')}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loading-spinner-sm"></div>
                    {t('blogs.publishing')}
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    {t('blogs.publish')}
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="blog-preview">
            <div className="preview-header">
              <h1 className="preview-title">{formData.title || t('blogs.untitled')}</h1>
              {formData.excerpt && (
                <div className="preview-excerpt">{formData.excerpt}</div>
              )}
              <div className="preview-meta">
                <span className="preview-category">
                  {categories.find(c => c.id === formData.categoryId)?.name || t('blogs.uncategorized')}
                </span>
                {formData.tags.length > 0 && (
                  <div className="preview-tags">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="preview-tag">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {formData.featuredImage && (
              <div className="preview-image">
                <img src={formData.featuredImage} alt={formData.title} />
              </div>
            )}
            <div className="preview-content">
              {formData.content ? (
                <div dangerouslySetInnerHTML={{ 
                  __html: formData.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/\n- (.*)/g, '<li>$1</li>')
                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                    .replace(/\n/g, '<br>')
                }} />
              ) : (
                <div className="preview-placeholder">{t('blogs.noContentToPreview')}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostEditor;
