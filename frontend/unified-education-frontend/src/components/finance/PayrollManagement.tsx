import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Download, Search, Eye, Edit, MoreVertical, Calendar, DollarSign, User, CheckCircle, Clock } from 'lucide-react';
import { financeService } from '../../services';

const PayrollManagement: React.FC = () => {
  const { t } = useTranslation();
  const [payrollEntries, setPayrollEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadPayrollEntries();
  }, []);

  const loadPayrollEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await financeService.getPayrollEntries();
      setPayrollEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading payroll entries:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payroll entries');
      setPayrollEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayrollEntries = payrollEntries.filter((entry: any) => {
    const matchesSearch = searchTerm === '' || 
      entry.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = monthFilter === '' || 
      (entry.payPeriod && entry.payPeriod.startsWith(monthFilter));
    const matchesStatus = statusFilter === '' || entry.status === statusFilter;
    return matchesSearch && matchesMonth && matchesStatus;
  });

  const payrollStats = {
    totalPayroll: payrollEntries.reduce((sum: number, e: any) => sum + (e.netSalary || 0), 0),
    processed: payrollEntries.filter((e: any) => e.status === 'Processed').length,
    pending: payrollEntries.filter((e: any) => e.status === 'Pending').length,
    employees: new Set(payrollEntries.map((e: any) => e.employeeId)).size,
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
          <Users className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadPayrollEntries}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('finance.payrollManagement')}</h1>
        <p className="page-subtitle">{t('finance.manageEmployeePayroll')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('finance.processPayroll')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('finance.exportPayroll')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('finance.payrollOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">${payrollStats.totalPayroll.toLocaleString()}</div>
              <div className="stat-label">{t('finance.totalPayroll')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{payrollStats.employees}</div>
              <div className="stat-label">{t('finance.employees')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{payrollStats.processed}</div>
              <div className="stat-label">{t('finance.processed')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{payrollStats.pending}</div>
              <div className="stat-label">{t('finance.pending')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('finance.payrollEntries')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('finance.searchEmployees')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <input
              type="month"
              className="filter-select"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
            />
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t('finance.allStatuses')}</option>
              <option value="Processed">{t('finance.processed')}</option>
              <option value="Pending">{t('finance.pending')}</option>
              <option value="Draft">{t('finance.draft')}</option>
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredPayrollEntries.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('finance.employee')}</th>
                    <th>{t('finance.payPeriod')}</th>
                    <th>{t('finance.basicSalary')}</th>
                    <th>{t('finance.allowances')}</th>
                    <th>{t('finance.deductions')}</th>
                    <th>{t('finance.netSalary')}</th>
                    <th>{t('finance.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrollEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td>
                        <div className="employee-info">
                          <User size={16} className="employee-icon" />
                          <div>
                            <div className="employee-name">{entry.employeeName || 'Employee Name'}</div>
                            <div className="employee-id">{entry.employeeId || 'EMP001'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="pay-period">
                          <Calendar size={16} className="period-icon" />
                          {entry.payPeriod || new Date().toISOString().slice(0, 7)}
                        </div>
                      </td>
                      <td className="amount-cell">${entry.basicSalary?.toLocaleString() || '0'}</td>
                      <td className="amount-cell positive">${entry.allowances?.toLocaleString() || '0'}</td>
                      <td className="amount-cell negative">${entry.deductions?.toLocaleString() || '0'}</td>
                      <td className="amount-cell net-salary">${entry.netSalary?.toLocaleString() || '0'}</td>
                      <td>
                        <span className={`badge ${
                          entry.status === 'Processed' 
                            ? 'badge-success' 
                            : entry.status === 'Pending'
                            ? 'badge-warning'
                            : 'badge-secondary'
                        }`}>
                          {entry.status || 'Draft'}
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
              <div className="empty-title">{t('finance.noPayrollEntriesFound')}</div>
              <div className="empty-description">
                {searchTerm || monthFilter || statusFilter
                  ? t('finance.noPayrollEntriesMatchFilter')
                  : t('finance.noPayrollEntriesYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('finance.processFirstPayroll')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollManagement;
