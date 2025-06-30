import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, Plus, Download, Search, Eye, Edit, MoreVertical, User, Mail, Phone, Calendar, MapPin, Briefcase } from 'lucide-react';
import { hrService } from '../../services';

interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  hireDate: string;
  status: string;
  employeeId: string;
}

const EmployeeManagement: React.FC = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await hrService.getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading employees:', error);
      setError(error instanceof Error ? error.message : 'Failed to load employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter((employee: Employee) => {
    const matchesSearch = searchTerm === '' || 
      employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === '' || employee.department === departmentFilter;
    const matchesStatus = statusFilter === '' || employee.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const employeeStats = {
    total: employees.length,
    active: employees.filter((e: Employee) => e.status === 'Active').length,
    inactive: employees.filter((e: Employee) => e.status === 'Inactive').length,
    onLeave: employees.filter((e: Employee) => e.status === 'On Leave').length,
  };

  const departments = [...new Set(employees.map((e: Employee) => e.department).filter(Boolean))];

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
        <h1 className="page-title">{t('hr.employeeManagement')}</h1>
        <p className="page-subtitle">{t('hr.manageEmployeeInformation')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <Plus size={18} className="btn-icon" />
            {t('hr.addEmployee')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('hr.exportEmployees')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('hr.employeeOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{employeeStats.total}</div>
              <div className="stat-label">{t('hr.totalEmployees')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <User size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{employeeStats.active}</div>
              <div className="stat-label">{t('hr.activeEmployees')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <Calendar size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{employeeStats.onLeave}</div>
              <div className="stat-label">{t('hr.onLeave')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">
              <User size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{employeeStats.inactive}</div>
              <div className="stat-label">{t('hr.inactiveEmployees')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('hr.employeeList')}</h2>
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
              <option value="Active">{t('hr.active')}</option>
              <option value="Inactive">{t('hr.inactive')}</option>
              <option value="On Leave">{t('hr.onLeave')}</option>
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredEmployees.length > 0 ? (
            <div className="card-grid grid-3">
              {filteredEmployees.map((employee) => (
                <div key={employee.id} className="card card-hover employee-card">
                  <div className="card-header">
                    <div className="employee-avatar">
                      <User size={24} />
                    </div>
                    <div className="employee-basic-info">
                      <div className="employee-name">
                        {employee.firstName || 'John'} {employee.lastName || 'Doe'}
                      </div>
                      <div className="employee-id">{employee.employeeId || 'EMP001'}</div>
                    </div>
                    <span className={`badge ${
                      employee.status === 'Active' 
                        ? 'badge-success' 
                        : employee.status === 'On Leave'
                        ? 'badge-warning'
                        : 'badge-secondary'
                    }`}>
                      {employee.status || 'Active'}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="employee-details">
                      <div className="detail-item">
                        <Briefcase size={16} className="detail-icon" />
                        <span className="detail-text">{employee.position || 'Software Engineer'}</span>
                      </div>
                      <div className="detail-item">
                        <MapPin size={16} className="detail-icon" />
                        <span className="detail-text">{employee.department || 'IT Department'}</span>
                      </div>
                      <div className="detail-item">
                        <Mail size={16} className="detail-icon" />
                        <span className="detail-text">{employee.email || 'john.doe@company.com'}</span>
                      </div>
                      <div className="detail-item">
                        <Phone size={16} className="detail-icon" />
                        <span className="detail-text">{employee.phone || '+1 234 567 8900'}</span>
                      </div>
                      <div className="detail-item">
                        <Calendar size={16} className="detail-icon" />
                        <span className="detail-text">
                          {employee.hireDate 
                            ? new Date(employee.hireDate).toLocaleDateString()
                            : new Date().toLocaleDateString()
                          }
                        </span>
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
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <Users size={48} />
              </div>
              <div className="empty-title">{t('hr.noEmployeesFound')}</div>
              <div className="empty-description">
                {searchTerm || departmentFilter || statusFilter
                  ? t('hr.noEmployeesMatchFilter')
                  : t('hr.noEmployeesYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('hr.addFirstEmployee')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;
