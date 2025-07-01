import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Briefcase, Plus, Download, Search, Eye, Edit, MoreVertical, Users, Clock, CheckCircle, MapPin, Calendar } from 'lucide-react';
import { hrService } from '../../services';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  description: string;
  status: string;
  postedDate: string;
  applicationsCount: number;
}

interface Application {
  id: string;
  candidateName: string;
  email: string;
  position: string;
  appliedDate: string;
  experience: string;
  status: string;
}

const RecruitmentManagement: React.FC = () => {
  const { t } = useTranslation();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab] = useState('postings');

  useEffect(() => {
    loadRecruitmentData();
  }, []);

  const loadRecruitmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const recruitmentData = await hrService.getRecruitments();
      setJobPostings(Array.isArray(recruitmentData) ? recruitmentData : []);
      setApplications([]);
    } catch (error) {
      console.error('Error loading recruitment data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load recruitment data');
      setJobPostings([]);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobPostings = jobPostings.filter((posting: JobPosting) => {
    const matchesSearch = searchTerm === '' || 
      posting.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      posting.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || posting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredApplications = applications.filter((application: Application) => {
    const matchesSearch = searchTerm === '' || 
      application.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.position?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || application.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const recruitmentStats = {
    activePostings: jobPostings.filter((p: JobPosting) => p.status === 'Active').length,
    totalApplications: applications.length,
    pendingReview: applications.filter((a: Application) => a.status === 'Pending').length,
    interviewed: applications.filter((a: Application) => a.status === 'Interviewed').length,
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
          <Briefcase className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button 
            className="error-action" 
            onClick={loadRecruitmentData}
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
        <h1 className="page-title">{t('hr.recruitmentManagement')}</h1>
        <p className="page-subtitle">{t('hr.manageJobPostingsAndApplications')}</p>
        <div className="page-actions">
          <button 
            className="btn btn-primary"
            aria-label={t('hr.createJobPosting')}
          >
            <Plus size={18} className="btn-icon" aria-hidden="true" />
            {t('hr.createJobPosting')}
          </button>
          <button 
            className="btn btn-secondary"
            aria-label={t('hr.exportRecruitmentData')}
          >
            <Download size={18} className="btn-icon" aria-hidden="true" />
            {t('hr.exportRecruitmentData')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('hr.recruitmentOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Briefcase size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{recruitmentStats.activePostings}</div>
              <div className="stat-label">{t('hr.activePostings')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{recruitmentStats.totalApplications}</div>
              <div className="stat-label">{t('hr.totalApplications')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{recruitmentStats.pendingReview}</div>
              <div className="stat-label">{t('hr.pendingReview')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{recruitmentStats.interviewed}</div>
              <div className="stat-label">{t('hr.interviewed')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'postings' ? 'active' : ''}`}
              onClick={() => setActiveTab('postings')}
              role="tab"
              aria-selected={activeTab === 'postings'}
              aria-controls="postings-panel"
              id="postings-tab"
            >
              {t('hr.jobPostings')}
            </button>
            <button 
              className={`tab-button ${activeTab === 'applications' ? 'active' : ''}`}
              onClick={() => setActiveTab('applications')}
              role="tab"
              aria-selected={activeTab === 'applications'}
              aria-controls="applications-panel"
              id="applications-tab"
            >
              {t('hr.applications')}
            </button>
          </div>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={activeTab === 'postings' ? t('hr.searchJobPostings') : t('hr.searchApplications')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={activeTab === 'postings' ? t('hr.searchJobPostings') : t('hr.searchApplications')}
                  id="recruitment-search"
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('hr.filterByStatus')}
              id="status-filter"
            >
              <option value="">{t('hr.allStatuses')}</option>
              {activeTab === 'postings' ? (
                <>
                  <option value="Active">{t('hr.active')}</option>
                  <option value="Closed">{t('hr.closed')}</option>
                  <option value="Draft">{t('hr.draft')}</option>
                </>
              ) : (
                <>
                  <option value="Pending">{t('hr.pending')}</option>
                  <option value="Reviewed">{t('hr.reviewed')}</option>
                  <option value="Interviewed">{t('hr.interviewed')}</option>
                  <option value="Hired">{t('hr.hired')}</option>
                  <option value="Rejected">{t('hr.rejected')}</option>
                </>
              )}
            </select>
          </div>
        </div>

        <div className="section-content">
          {activeTab === 'postings' ? (
            filteredJobPostings.length > 0 ? (
              <div className="card-grid grid-2">
                {filteredJobPostings.map((posting) => (
                  <div key={posting.id} className="card card-hover job-posting-card">
                    <div className="card-header">
                      <div className="job-title">{posting.title || 'Software Engineer'}</div>
                      <span className={`badge ${
                        posting.status === 'Active' 
                          ? 'badge-success' 
                          : posting.status === 'Closed'
                          ? 'badge-secondary'
                          : 'badge-warning'
                      }`}>
                        {posting.status || 'Active'}
                      </span>
                    </div>
                    <div className="card-body">
                      <div className="job-info">
                        <div className="info-item">
                          <MapPin size={16} className="info-icon" />
                          <span className="info-text">{posting.department || 'IT Department'}</span>
                        </div>
                        <div className="info-item">
                          <Calendar size={16} className="info-icon" />
                          <span className="info-text">
                            {posting.postedDate 
                              ? new Date(posting.postedDate).toLocaleDateString()
                              : new Date().toLocaleDateString()
                            }
                          </span>
                        </div>
                        <div className="info-item">
                          <Users size={16} className="info-icon" />
                          <span className="info-text">{posting.applicationsCount || 0} {t('hr.applications')}</span>
                        </div>
                      </div>
                      <div className="job-description">
                        {posting.description || 'We are looking for a talented software engineer to join our team...'}
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
              <div className="empty-state">
                <div className="empty-icon">
                  <Briefcase size={48} />
                </div>
                <div className="empty-title">{t('hr.noJobPostingsFound')}</div>
                <div className="empty-description">
                  {searchTerm || statusFilter
                    ? t('hr.noJobPostingsMatchFilter')
                    : t('hr.noJobPostingsYet')
                  }
                </div>
                <button className="btn btn-primary empty-action">
                  <Plus size={18} />
                  {t('hr.createFirstJobPosting')}
                </button>
              </div>
            )
          ) : (
            filteredApplications.length > 0 ? (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('hr.candidate')}</th>
                      <th>{t('hr.position')}</th>
                      <th>{t('hr.appliedDate')}</th>
                      <th>{t('hr.experience')}</th>
                      <th>{t('hr.status')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((application) => (
                      <tr key={application.id}>
                        <td>
                          <div className="candidate-info">
                            <div className="candidate-name">{application.candidateName || 'John Smith'}</div>
                            <div className="candidate-email">{application.email || 'john.smith@email.com'}</div>
                          </div>
                        </td>
                        <td>{application.position || 'Software Engineer'}</td>
                        <td>
                          {application.appliedDate 
                            ? new Date(application.appliedDate).toLocaleDateString()
                            : new Date().toLocaleDateString()
                          }
                        </td>
                        <td>{application.experience || '3 years'}</td>
                        <td>
                          <span className={`badge ${
                            application.status === 'Hired' 
                              ? 'badge-success' 
                              : application.status === 'Rejected'
                              ? 'badge-danger'
                              : application.status === 'Interviewed'
                              ? 'badge-info'
                              : 'badge-warning'
                          }`}>
                            {application.status || 'Pending'}
                          </span>
                        </td>
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
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <Users size={48} />
                </div>
                <div className="empty-title">{t('hr.noApplicationsFound')}</div>
                <div className="empty-description">
                  {searchTerm || statusFilter
                    ? t('hr.noApplicationsMatchFilter')
                    : t('hr.noApplicationsYet')
                  }
                </div>
                <button className="btn btn-primary empty-action">
                  <Plus size={18} />
                  {t('hr.reviewApplications')}
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default RecruitmentManagement;
