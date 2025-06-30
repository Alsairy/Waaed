import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, Plus, Download, Search, Eye, MoreVertical, User, Book, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { libraryService } from '../../services';

interface BookIssue {
  id: string;
  bookTitle: string;
  bookIsbn?: string;
  memberName: string;
  memberId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: string;
  fineAmount?: number;
  renewalCount: number;
}

interface BookReservation {
  id: string;
  bookTitle: string;
  bookIsbn?: string;
  memberName: string;
  memberId?: string;
  reservationDate: string;
  status: string;
  priority: number;
  expiryDate: string;
}

const CirculationManagement: React.FC = () => {
  const { t } = useTranslation();
  const [bookIssues, setBookIssues] = useState<BookIssue[]>([]);
  const [reservations, setReservations] = useState<BookReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('issues');

  useEffect(() => {
    loadCirculationData();
  }, []);

  const loadCirculationData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [issuesData, reservationsData] = await Promise.all([
        libraryService.getBookIssues(),
        libraryService.getBookReservations()
      ]);
      setBookIssues(Array.isArray(issuesData) ? issuesData : []);
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
    } catch (error) {
      console.error('Error loading circulation data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load circulation data');
      setBookIssues([]);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredIssues = bookIssues.filter((issue: BookIssue) => {
    const matchesSearch = searchTerm === '' || 
      issue.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.memberId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredReservations = reservations.filter((reservation: BookReservation) => {
    const matchesSearch = searchTerm === '' || 
      reservation.memberName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.bookTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.memberId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || reservation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const circulationStats = {
    totalIssued: bookIssues.length,
    activeIssues: bookIssues.filter((i: BookIssue) => i.status === 'Issued').length,
    overdue: bookIssues.filter((i: BookIssue) => i.status === 'Overdue').length,
    returned: bookIssues.filter((i: BookIssue) => i.status === 'Returned').length,
    reservations: reservations.length,
    activeReservations: reservations.filter((r: BookReservation) => r.status === 'Active').length,
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
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
          <RotateCcw className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadCirculationData}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('library.circulationManagement')}</h1>
        <p className="page-subtitle">{t('library.manageBorrowingAndReturns')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('library.issueBook')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('library.exportCirculation')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('library.circulationOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Book size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{circulationStats.totalIssued}</div>
              <div className="stat-label">{t('library.totalIssued')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{circulationStats.activeIssues}</div>
              <div className="stat-label">{t('library.activeIssues')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-danger">
            <div className="stat-icon">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{circulationStats.overdue}</div>
              <div className="stat-label">{t('library.overdue')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{circulationStats.activeReservations}</div>
              <div className="stat-label">{t('library.reservations')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'issues' ? 'active' : ''}`}
              onClick={() => setActiveTab('issues')}
            >
              {t('library.bookIssues')}
            </button>
            <button 
              className={`tab-button ${activeTab === 'reservations' ? 'active' : ''}`}
              onClick={() => setActiveTab('reservations')}
            >
              {t('library.reservations')}
            </button>
          </div>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={activeTab === 'issues' ? t('library.searchIssues') : t('library.searchReservations')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t('library.allStatuses')}</option>
              {activeTab === 'issues' ? (
                <>
                  <option value="Issued">{t('library.issued')}</option>
                  <option value="Returned">{t('library.returned')}</option>
                  <option value="Overdue">{t('library.overdue')}</option>
                  <option value="Renewed">{t('library.renewed')}</option>
                </>
              ) : (
                <>
                  <option value="Active">{t('library.active')}</option>
                  <option value="Fulfilled">{t('library.fulfilled')}</option>
                  <option value="Cancelled">{t('library.cancelled')}</option>
                  <option value="Expired">{t('library.expired')}</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="section-content">
          {activeTab === 'issues' ? (
            filteredIssues.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('library.member')}</th>
                      <th>{t('library.book')}</th>
                      <th>{t('library.issueDate')}</th>
                      <th>{t('library.dueDate')}</th>
                      <th>{t('library.returnDate')}</th>
                      <th>{t('library.status')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.map((issue) => (
                      <tr key={issue.id}>
                        <td>
                          <div className="member-info">
                            <User size={16} className="member-icon" />
                            <div>
                              <div className="member-name">{issue.memberName || 'John Doe'}</div>
                              <div className="member-id">{issue.memberId || 'MEM001'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="book-info">
                            <Book size={16} className="book-icon" />
                            <div>
                              <div className="book-title">{issue.bookTitle || 'Book Title'}</div>
                              <div className="book-isbn">{issue.bookIsbn || 'ISBN'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {issue.issueDate 
                            ? new Date(issue.issueDate).toLocaleDateString()
                            : new Date().toLocaleDateString()
                          }
                        </td>
                        <td>
                          <span className={isOverdue(issue.dueDate) && issue.status === 'Issued' ? 'overdue-date' : ''}>
                            {issue.dueDate 
                              ? new Date(issue.dueDate).toLocaleDateString()
                              : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString()
                            }
                          </span>
                        </td>
                        <td>
                          {issue.returnDate 
                            ? new Date(issue.returnDate).toLocaleDateString()
                            : '-'
                          }
                        </td>
                        <td>
                          <span className={`badge ${
                            issue.status === 'Returned' 
                              ? 'badge-success' 
                              : issue.status === 'Overdue'
                              ? 'badge-danger'
                              : issue.status === 'Renewed'
                              ? 'badge-info'
                              : 'badge-warning'
                          }`}>
                            {issue.status || 'Issued'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-sm btn-primary">
                              <Eye size={14} />
                            </button>
                            {issue.status === 'Issued' && (
                              <>
                                <button className="btn btn-sm btn-success">
                                  <RotateCcw size={14} />
                                </button>
                                <button className="btn btn-sm btn-info">
                                  <Clock size={14} />
                                </button>
                              </>
                            )}
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
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Book size={48} />
                </div>
                <div className="empty-title">{t('library.noIssuesFound')}</div>
                <div className="empty-description">
                  {searchTerm || statusFilter
                    ? t('library.noIssuesMatchFilter')
                    : t('library.noIssuesYet')
                  }
                </div>
                <button className="btn btn-primary empty-action">
                  <Plus size={18} />
                  {t('library.issueFirstBook')}
                </button>
              </div>
            )
          ) : (
            filteredReservations.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('library.member')}</th>
                      <th>{t('library.book')}</th>
                      <th>{t('library.reservationDate')}</th>
                      <th>{t('library.expiryDate')}</th>
                      <th>{t('library.status')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td>
                          <div className="member-info">
                            <User size={16} className="member-icon" />
                            <div>
                              <div className="member-name">{reservation.memberName || 'John Doe'}</div>
                              <div className="member-id">{reservation.memberId || 'MEM001'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="book-info">
                            <Book size={16} className="book-icon" />
                            <div>
                              <div className="book-title">{reservation.bookTitle || 'Book Title'}</div>
                              <div className="book-isbn">{reservation.bookIsbn || 'ISBN'}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          {reservation.reservationDate 
                            ? new Date(reservation.reservationDate).toLocaleDateString()
                            : new Date().toLocaleDateString()
                          }
                        </td>
                        <td>
                          {reservation.expiryDate 
                            ? new Date(reservation.expiryDate).toLocaleDateString()
                            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
                          }
                        </td>
                        <td>
                          <span className={`badge ${
                            reservation.status === 'Fulfilled' 
                              ? 'badge-success' 
                              : reservation.status === 'Cancelled'
                              ? 'badge-danger'
                              : reservation.status === 'Expired'
                              ? 'badge-secondary'
                              : 'badge-info'
                          }`}>
                            {reservation.status || 'Active'}
                          </span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn btn-sm btn-primary">
                              <Eye size={14} />
                            </button>
                            {reservation.status === 'Active' && (
                              <button className="btn btn-sm btn-success">
                                <CheckCircle size={14} />
                              </button>
                            )}
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
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Calendar size={48} />
                </div>
                <div className="empty-title">{t('library.noReservationsFound')}</div>
                <div className="empty-description">
                  {searchTerm || statusFilter
                    ? t('library.noReservationsMatchFilter')
                    : t('library.noReservationsYet')
                  }
                </div>
                <button className="btn btn-primary empty-action">
                  <Plus size={18} />
                  {t('library.createFirstReservation')}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default CirculationManagement;
