import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Book, Plus, Download, Search, Eye, Edit, MoreVertical, BookOpen, User, Calendar, Star, Filter } from 'lucide-react';
import { libraryService } from '../../services';

interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  status: string;
  publishedYear: number;
  publicationYear?: number;
  publisher: string;
  availableCopies: number;
  totalCopies: number;
  location: string;
  description?: string;
  coverImage?: string;
  rating?: number;
  reviewCount?: number;
}

const BookCatalog: React.FC = () => {
  const { t } = useTranslation();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await libraryService.getBooks();
      setBooks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading books:', error);
      setError(error instanceof Error ? error.message : 'Failed to load books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter((book: Book) => {
    const matchesSearch = searchTerm === '' || 
      book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.isbn?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === '' || book.category === categoryFilter;
    const matchesStatus = statusFilter === '' || book.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const bookStats = {
    total: books.length,
    available: books.filter((b: Book) => b.status === 'Available').length,
    borrowed: books.filter((b: Book) => b.status === 'Borrowed').length,
    reserved: books.filter((b: Book) => b.status === 'Reserved').length,
  };

  const categories = [...new Set(books.map((b: Book) => b.category).filter(Boolean))];

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
          <Book className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadBooks}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('library.bookCatalog')}</h1>
        <p className="page-subtitle">{t('library.manageLibraryCollection')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('library.addBook')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('library.exportCatalog')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('library.catalogOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Book size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{bookStats.total}</div>
              <div className="stat-label">{t('library.totalBooks')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{bookStats.available}</div>
              <div className="stat-label">{t('library.available')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <User size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{bookStats.borrowed}</div>
              <div className="stat-label">{t('library.borrowed')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{bookStats.reserved}</div>
              <div className="stat-label">{t('library.reserved')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('library.bookCollection')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('library.searchBooks')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">{t('library.allCategories')}</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t('library.allStatuses')}</option>
              <option value="Available">{t('library.available')}</option>
              <option value="Borrowed">{t('library.borrowed')}</option>
              <option value="Reserved">{t('library.reserved')}</option>
              <option value="Maintenance">{t('library.maintenance')}</option>
            </select>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <Filter size={16} />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <BookOpen size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="section-content">
          {filteredBooks.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="card-grid grid-3">
                {filteredBooks.map((book) => (
                  <div key={book.id} className="card card-hover book-card">
                    <div className="card-header">
                      <div className="book-cover">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="cover-image" />
                        ) : (
                          <div className="cover-placeholder">
                            <Book size={32} />
                          </div>
                        )}
                      </div>
                      <span className={`badge ${
                        book.status === 'Available' 
                          ? 'badge-success' 
                          : book.status === 'Borrowed'
                          ? 'badge-warning'
                          : book.status === 'Reserved'
                          ? 'badge-info'
                          : 'badge-secondary'
                      }`}>
                        {book.status || 'Available'}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="book-info">
                        <div className="book-title">{book.title || 'Book Title'}</div>
                        <div className="book-author">{book.author || 'Author Name'}</div>
                        <div className="book-details">
                          <div className="detail-item">
                            <span className="detail-label">{t('library.isbn')}</span>
                            <span className="detail-value">{book.isbn || 'N/A'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">{t('library.category')}</span>
                            <span className="detail-value">{book.category || 'General'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">{t('library.publisher')}</span>
                            <span className="detail-value">{book.publisher || 'Unknown'}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">{t('library.year')}</span>
                            <span className="detail-value">{book.publicationYear || 'N/A'}</span>
                          </div>
                        </div>
                        {book.rating && (
                          <div className="book-rating">
                            <Star size={14} className="rating-star" />
                            <span className="rating-value">{book.rating.toFixed(1)}</span>
                            <span className="rating-count">({book.reviewCount || 0} reviews)</span>
                          </div>
                        )}
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
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('library.title')}</th>
                      <th>{t('library.author')}</th>
                      <th>{t('library.isbn')}</th>
                      <th>{t('library.category')}</th>
                      <th>{t('library.status')}</th>
                      <th>{t('library.location')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBooks.map((book) => (
                      <tr key={book.id}>
                        <td>
                          <div className="book-title-cell">
                            <Book size={16} className="book-icon" />
                            <span className="book-title">{book.title || 'Book Title'}</span>
                          </div>
                        </td>
                        <td>{book.author || 'Author Name'}</td>
                        <td>{book.isbn || 'N/A'}</td>
                        <td>
                          <span className="category-tag">{book.category || 'General'}</span>
                        </td>
                        <td>
                          <span className={`badge ${
                            book.status === 'Available' 
                              ? 'badge-success' 
                              : book.status === 'Borrowed'
                              ? 'badge-warning'
                              : book.status === 'Reserved'
                              ? 'badge-info'
                              : 'badge-secondary'
                          }`}>
                            {book.status || 'Available'}
                          </span>
                        </td>
                        <td>{book.location || 'A-001'}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-sm btn-primary">
                              <Eye size={14} />
                            </button>
                            <button className="btn btn-sm btn-secondary">
                              <Edit size={14} />
                            </button>
                            <button className="btn-icon" title={t('common.more')}>
                              <MoreVertical size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Book size={48} />
              </div>
              <div className="empty-title">{t('library.noBooksFound')}</div>
              <div className="empty-description">
                {searchTerm || categoryFilter || statusFilter
                  ? t('library.noBooksMatchFilter')
                  : t('library.noBooksYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('library.addFirstBook')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCatalog;
