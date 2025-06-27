import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, UserPlus, Download, Search, Eye, Edit, Trash2, CheckCircle, BookOpen, TrendingUp } from 'lucide-react';
import { sisService } from '../../services';
import { Student } from '../../types/api';

export const StudentManagement: React.FC = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sisService.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
      setError(error instanceof Error ? error.message : 'Failed to load students');
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchTerm === '' || 
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === '' || student.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const grades = [...new Set(students.map(student => student.grade))].sort();

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
          <button className="error-action" onClick={loadStudents}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('sis.studentManagement')}</h1>
        <p className="page-subtitle">{t('sis.manageStudentRecords')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <UserPlus size={18} className="btn-icon" />
            {t('sis.addStudent')}
          </button>
          <button className="btn btn-secondary">
            <Download size={18} className="btn-icon" />
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('sis.studentList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('sis.searchStudents')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
            >
              <option value="">{t('sis.allGrades')}</option>
              {grades.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredStudents.length > 0 ? (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('sis.studentName')}</th>
                    <th>{t('sis.email')}</th>
                    <th>{t('sis.grade')}</th>
                    <th>{t('sis.status')}</th>
                    <th>{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {(student.firstName || '').charAt(0)}{(student.lastName || '').charAt(0)}
                          </div>
                          <div className="user-details">
                            <div className="user-name">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="user-meta">ID: {student.id}</div>
                          </div>
                        </div>
                      </td>
                      <td>{student.email}</td>
                      <td>
                        <span className="badge badge-info">{student.grade}</span>
                      </td>
                      <td>
                        <span className={`badge ${
                          student.status === 'Active' 
                            ? 'badge-success' 
                            : 'badge-error'
                        }`}>
                          {student.status}
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
                          <button className="btn-icon btn-icon-delete" title={t('common.delete')}>
                            <Trash2 size={16} />
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
              <div className="empty-title">{t('sis.noStudentsFound')}</div>
              <div className="empty-description">
                {searchTerm || selectedGrade 
                  ? t('sis.noStudentsMatchFilter')
                  : t('sis.noStudentsYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <UserPlus size={18} />
                {t('sis.addFirstStudent')}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('sis.quickStats')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{students.length}</div>
              <div className="stat-label">{t('sis.totalStudents')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {students.filter(s => s.status === 'Active').length}
              </div>
              <div className="stat-label">{t('sis.activeStudents')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-info">
            <div className="stat-icon">
              <BookOpen size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{grades.length}</div>
              <div className="stat-label">{t('sis.totalGrades')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">
                {Math.round((students.filter(s => s.status === 'Active').length / students.length) * 100) || 0}%
              </div>
              <div className="stat-label">{t('sis.activeRate')}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
