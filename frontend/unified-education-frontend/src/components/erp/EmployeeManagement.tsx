import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, FileBarChart, Search, Eye, Edit, DollarSign, CheckCircle, Building } from 'lucide-react';
import { erpService } from '../../services';
import { Employee } from '../../types/api';

const EmployeeManagement: React.FC = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await erpService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
      setError(error instanceof Error ? error.message : 'Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = searchTerm === '' || 
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === '' || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(emp => emp.department))].sort();
  const departmentCounts = departments.reduce((acc, dept) => {
    acc[dept] = employees.filter(emp => emp.department === dept).length;
    return acc;
  }, {} as Record<string, number>);

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
          <button className="error-action" onClick={loadEmployees}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('erp.employeeManagement')}</h1>
        <p className="page-subtitle">{t('erp.manageStaffRecords')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <UserPlus size={18} className="btn-icon" />
            {t('erp.addEmployee')}
          </button>
          <button className="btn btn-secondary">
            <FileBarChart size={18} className="btn-icon" />
            {t('erp.payrollReport')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('erp.employeeOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{employees.length}</div>
              <div className="stat-label">{t('erp.totalEmployees')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {employees.filter(emp => emp.status === 'Active').length}
              </div>
              <div className="stat-label">{t('erp.activeEmployees')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <Building size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{departments.length}</div>
              <div className="stat-label">{t('erp.departments')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                ${(employees.length * 4500).toLocaleString()}
              </div>
              <div className="stat-label">{t('erp.monthlyPayroll')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('erp.employeeList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('erp.searchEmployees')}
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
              <option value="">{t('erp.allDepartments')}</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredEmployees.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('erp.employeeName')}</th>
                    <th>{t('erp.email')}</th>
                    <th>{t('erp.department')}</th>
                    <th>{t('erp.position')}</th>
                    <th>{t('erp.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {(employee.firstName || '').charAt(0)}{(employee.lastName || '').charAt(0)}
                          </div>
                          <div className="user-details">
                            <div className="user-name">
                              {employee.firstName} {employee.lastName}
                            </div>
                            <div className="user-meta">ID: {employee.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{employee.email}</td>
                      <td>
                        <span className="badge badge-info">{employee.department}</span>
                      </td>
                      <td>{employee.position || 'Staff'}</td>
                      <td>
                        <span className={`badge ${
                          employee.status === 'Active' 
                            ? 'badge-success' 
                            : 'badge-error'
                        }`}>
                          {employee.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon btn-icon-view" title={t('common.view')}>
                            <Eye size={16} />
                          </button>
                          <button className="btn-icon btn-icon-edit" title={t('common.edit')}>
                            <Edit size={16} />
                          </button>
                          <button className="btn-icon btn-icon-payroll" title={t('erp.payroll')}>
                            <DollarSign size={16} />
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
              <div className="empty-title">{t('erp.noEmployeesFound')}</div>
              <div className="empty-description">
                {searchTerm || departmentFilter 
                  ? t('erp.noEmployeesMatchFilter')
                  : t('erp.noEmployeesYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <UserPlus size={18} />
                {t('erp.addFirstEmployee')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('erp.departmentBreakdown')}</h2>
        </div>
        <div className="card-grid grid-3">
          {departments.slice(0, 6).map((dept) => (
            <div key={dept} className="card department-card">
              <div className="card-body">
                <div className="department-icon">
                  <Building size={32} />
                </div>
                <div className="department-info">
                  <h4 className="department-name">{dept}</h4>
                  <p className="department-count">{departmentCounts[dept]} {t('erp.employeesCount')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
