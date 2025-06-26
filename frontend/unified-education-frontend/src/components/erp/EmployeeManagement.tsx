import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { erpService } from '../../services';
import { Employee } from '../../types/api';

const EmployeeManagement: React.FC = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await erpService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Error loading employees:', error);
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

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('erp.employeeManagement')}</h1>
        <p className="page-subtitle">{t('erp.manageStaffRecords')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <span className="btn-icon">➕</span>
            {t('erp.addEmployee')}
          </button>
          <button className="btn btn-secondary">
            <span className="btn-icon">📊</span>
            {t('erp.payrollReport')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('erp.employeeOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">👥</div>
            <div className="stat-value">{employees.length}</div>
            <div className="stat-label">{t('erp.totalEmployees')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-success">✅</div>
            <div className="stat-value">
              {employees.filter(emp => emp.status === 'Active').length}
            </div>
            <div className="stat-label">{t('erp.activeEmployees')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-info">🏢</div>
            <div className="stat-value">{departments.length}</div>
            <div className="stat-label">{t('erp.departments')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">💰</div>
            <div className="stat-value">
              ${(employees.length * 4500).toLocaleString()}
            </div>
            <div className="stat-label">{t('erp.monthlyPayroll')}</div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('erp.employeeList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder={t('erp.searchEmployees')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
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
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
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
                          <button className="btn-icon" title={t('common.view')}>
                            👁️
                          </button>
                          <button className="btn-icon" title={t('common.edit')}>
                            ✏️
                          </button>
                          <button className="btn-icon" title={t('erp.payroll')}>
                            💰
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
              <div className="empty-icon">👥</div>
              <div className="empty-title">{t('erp.noEmployeesFound')}</div>
              <div className="empty-description">
                {searchTerm || departmentFilter 
                  ? t('erp.noEmployeesMatchFilter')
                  : t('erp.noEmployeesYet')
                }
              </div>
              <button className="empty-action">
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
            <div key={dept} className="card">
              <div className="card-body text-center">
                <div className="text-2xl mb-3">🏢</div>
                <h4 className="font-semibold text-gray-900 mb-1">{dept}</h4>
                <p className="text-gray-600">{departmentCounts[dept]} {t('erp.employeesCount')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
