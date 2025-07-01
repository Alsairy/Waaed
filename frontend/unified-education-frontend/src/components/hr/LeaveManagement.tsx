import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Plus, Download, Search, Eye, MoreVertical, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { hrService } from '../../services';

interface LeaveRequest {
  id: string;
  employeeName: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  duration: number;
  reason: string;
  status: string;
}

const LeaveManagement: React.FC = () => {
  const { t } = useTranslation();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrService.getLeaveRequests();
      setLeaveRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading leave requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to load leave requests');
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaveRequests = leaveRequests.filter((request: LeaveRequest) => {
    const matchesSearch = searchTerm === '' || 
      request.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || request.status === statusFilter;
    const matchesType = typeFilter === '' || request.leaveType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const leaveStats = {
    total: leaveRequests.length,
    pending: leaveRequests.filter((r: LeaveRequest) => r.status === 'Pending').length,
    approved: leaveRequests.filter((r: LeaveRequest) => r.status === 'Approved').length,
    rejected: leaveRequests.filter((r: LeaveRequest) => r.status === 'Rejected').length,
  };

  const leaveTypes = [...new Set(leaveRequests.map((r: LeaveRequest) => r.leaveType).filter(Boolean))];

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
          <Calendar className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button 
            className="error-action" 
            onClick={loadLeaveRequests}
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
        <h1 className="page-title" id="main-heading">{t('hr.leaveManagement')}</h1>
        <p className="page-subtitle" aria-describedby="main-heading">{t('hr.manageEmployeeLeaveRequests')}</p>
        <div className="page-actions">
          <button 
            className="btn btn-primary"
            aria-label={t('hr.newLeaveRequest')}
          >
            <Plus size={18} className="btn-icon" aria-hidden="true" />
            {t('hr.newLeaveRequest')}
          </button>
          <button 
            className="btn btn-secondary"
            aria-label={t('hr.exportLeaveData')}
          >
            <Download size={18} className="btn-icon" aria-hidden="true" />
            {t('hr.exportLeaveData')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title" id="leave-overview-heading">{t('hr.leaveOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{leaveStats.total}</div>
              <div className="stat-label">{t('hr.totalRequests')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{leaveStats.pending}</div>
              <div className="stat-label">{t('hr.pendingApproval')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{leaveStats.approved}</div>
              <div className="stat-label">{t('hr.approved')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-danger">
            <div className="stat-icon">
              <XCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{leaveStats.rejected}</div>
              <div className="stat-label">{t('hr.rejected')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title" id="leave-requests-heading">{t('hr.leaveRequests')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('hr.searchLeaveRequests')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={t('hr.searchLeaveRequests')}
                  id="leave-search"
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label={t('hr.filterByLeaveType')}
              id="type-filter"
            >
              <option value="">{t('hr.allLeaveTypes')}</option>
              {leaveTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('hr.filterByStatus')}
              id="status-filter"
            >
              <option value="">{t('hr.allStatuses')}</option>
              <option value="Pending">{t('hr.pending')}</option>
              <option value="Approved">{t('hr.approved')}</option>
              <option value="Rejected">{t('hr.rejected')}</option>
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredLeaveRequests.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('hr.employee')}</th>
                    <th>{t('hr.leaveType')}</th>
                    <th>{t('hr.startDate')}</th>
                    <th>{t('hr.endDate')}</th>
                    <th>{t('hr.duration')}</th>
                    <th>{t('hr.reason')}</th>
                    <th>{t('hr.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaveRequests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div className="employee-info">
                          <User size={16} className="employee-icon" />
                          <div>
                            <div className="employee-name">{request.employeeName || 'John Doe'}</div>
                            <div className="employee-id">{request.employeeId || 'EMP001'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="leave-type-tag">
                          {request.leaveType || 'Annual Leave'}
                        </span>
                      </td>
                      <td>
                        {request.startDate 
                          ? new Date(request.startDate).toLocaleDateString()
                          : new Date().toLocaleDateString()
                        }
                      </td>
                      <td>
                        {request.endDate 
                          ? new Date(request.endDate).toLocaleDateString()
                          : new Date().toLocaleDateString()
                        }
                      </td>
                      <td>
                        <span className="duration-badge">
                          {request.duration || '5'} {t('hr.days')}
                        </span>
                      </td>
                      <td className="reason-cell">
                        {request.reason || 'Personal reasons'}
                      </td>
                      <td>
                        <span className={`badge ${
                          request.status === 'Approved' 
                            ? 'badge-success' 
                            : request.status === 'Rejected'
                            ? 'badge-danger'
                            : 'badge-warning'
                        }`}>
                          {request.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn btn-sm btn-primary">
                            <Eye size={14} />
                          </button>
                          {request.status === 'Pending' && (
                            <>
                              <button className="btn btn-sm btn-success">
                                <CheckCircle size={14} />
                              </button>
                              <button className="btn btn-sm btn-danger">
                                <XCircle size={14} />
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
                <Calendar size={48} />
              </div>
              <div className="empty-title">{t('hr.noLeaveRequestsFound')}</div>
              <div className="empty-description">
                {searchTerm || statusFilter || typeFilter
                  ? t('hr.noLeaveRequestsMatchFilter')
                  : t('hr.noLeaveRequestsYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('hr.createFirstLeaveRequest')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
