import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DollarSign, Plus, Download, Search, Eye, Edit, MoreVertical, User, Calculator, TrendingUp, TrendingDown } from 'lucide-react';
import { hrService } from '../../services';

interface PayrollData {
  id: string;
  employeeName: string;
  employeeId: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  payPeriod: string;
  status: string;
}

const PayrollManagement: React.FC = () => {
  const { t } = useTranslation();
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadPayrollData();
  }, []);

  const loadPayrollData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrService.getEmployees();
      setPayrollData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading payroll data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load payroll data');
      setPayrollData([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayrollData = payrollData.filter((payroll: PayrollData) => {
    const matchesSearch = searchTerm === '' || 
      payroll.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payroll.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === '' || payroll.department === departmentFilter;
    const matchesStatus = statusFilter === '' || payroll.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const payrollStats = {
    totalPayroll: payrollData.reduce((sum: number, p: PayrollData) => sum + (p.netSalary || 0), 0),
    totalEmployees: payrollData.length,
    processed: payrollData.filter((p: PayrollData) => p.status === 'Processed').length,
    pending: payrollData.filter((p: PayrollData) => p.status === 'Pending').length,
  };

  const departments = [...new Set(payrollData.map((p: PayrollData) => p.department).filter(Boolean))];

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
          <DollarSign className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button className="error-action" onClick={loadPayrollData}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('hr.payrollManagement')}</h1>
        <p className="page-subtitle">{t('hr.manageEmployeeSalariesAndBenefits')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('hr.processPayroll')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('hr.exportPayrollData')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('hr.payrollOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">${payrollStats.totalPayroll.toLocaleString()}</div>
              <div className="stat-label">{t('hr.totalPayroll')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <User size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{payrollStats.totalEmployees}</div>
              <div className="stat-label">{t('hr.totalEmployees')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <Calculator size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{payrollStats.processed}</div>
              <div className="stat-label">{t('hr.processed')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Calculator size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{payrollStats.pending}</div>
              <div className="stat-label">{t('hr.pending')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('hr.employeePayroll')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('hr.searchEmployees')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">{t('hr.allDepartments')}</option>
              {departments.map((department) => (
                <option key={department} value={department}>{department}</option>
              ))}
            </select>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t('hr.allStatuses')}</option>
              <option value="Processed">{t('hr.processed')}</option>
              <option value="Pending">{t('hr.pending')}</option>
              <option value="Draft">{t('hr.draft')}</option>
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredPayrollData.length > 0 ? (
            <div className="card-grid grid-2">
              {filteredPayrollData.map((payroll) => (
                <div key={payroll.id} className="card card-hover payroll-card">
                  <div className="card-header">
                    <div className="employee-info">
                      <User size={20} className="employee-icon" />
                      <div className="employee-details">
                        <div className="employee-name">{payroll.employeeName || 'John Doe'}</div>
                        <div className="employee-id">{payroll.employeeId || 'EMP001'}</div>
                        <div className="employee-department">{payroll.department || 'IT Department'}</div>
                      </div>
                    </div>
                    <span className={`badge ${
                      payroll.status === 'Processed' 
                        ? 'badge-success' 
                        : payroll.status === 'Pending'
                        ? 'badge-warning'
                        : 'badge-secondary'
                    }`}>
                      {payroll.status || 'Draft'}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="payroll-breakdown">
                      <div className="salary-row">
                        <span className="salary-label">{t('hr.basicSalary')}</span>
                        <span className="salary-value">${payroll.basicSalary?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="salary-row allowances">
                        <span className="salary-label">
                          <TrendingUp size={14} className="trend-icon" />
                          {t('hr.allowances')}
                        </span>
                        <span className="salary-value positive">+${payroll.allowances?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="salary-row deductions">
                        <span className="salary-label">
                          <TrendingDown size={14} className="trend-icon" />
                          {t('hr.deductions')}
                        </span>
                        <span className="salary-value negative">-${payroll.deductions?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="salary-row net-salary">
                        <span className="salary-label">{t('hr.netSalary')}</span>
                        <span className="salary-value net">${payroll.netSalary?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                    <div className="payroll-period">
                      <span className="period-label">{t('hr.payPeriod')}</span>
                      <span className="period-value">
                        {payroll.payPeriod || new Date().toISOString().slice(0, 7)}
                      </span>
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
                <DollarSign size={48} />
              </div>
              <div className="empty-title">{t('hr.noPayrollDataFound')}</div>
              <div className="empty-description">
                {searchTerm || departmentFilter || statusFilter
                  ? t('hr.noPayrollDataMatchFilter')
                  : t('hr.noPayrollDataYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('hr.setupFirstPayroll')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollManagement;
