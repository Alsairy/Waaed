import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { sisService } from '../../services';
import { Student } from '../../types/api';

export const StudentManagement: React.FC = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await sisService.getStudents();
      setStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
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

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('sis.studentManagement')}</h1>
        <p className="page-subtitle">{t('sis.manageStudentRecords')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <span className="btn-icon">➕</span>
            {t('sis.addStudent')}
          </button>
          <button className="btn btn-secondary">
            <span className="btn-icon">📤</span>
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('sis.studentList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder={t('sis.searchStudents')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
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
                            {student.firstName.charAt(0)}{student.lastName.charAt(0)}
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
                          <button className="btn-icon" title={t('common.view')}>
                            👁️
                          </button>
                          <button className="btn-icon" title={t('common.edit')}>
                            ✏️
                          </button>
                          <button className="btn-icon" title={t('common.delete')}>
                            🗑️
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
              <div className="empty-title">{t('sis.noStudentsFound')}</div>
              <div className="empty-description">
                {searchTerm || selectedGrade 
                  ? t('sis.noStudentsMatchFilter')
                  : t('sis.noStudentsYet')
                }
              </div>
              <button className="empty-action">
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
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">👥</div>
            <div className="stat-value">{students.length}</div>
            <div className="stat-label">{t('sis.totalStudents')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-success">✅</div>
            <div className="stat-value">
              {students.filter(s => s.status === 'Active').length}
            </div>
            <div className="stat-label">{t('sis.activeStudents')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-info">📚</div>
            <div className="stat-value">{grades.length}</div>
            <div className="stat-label">{t('sis.totalGrades')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">📊</div>
            <div className="stat-value">
              {Math.round((students.filter(s => s.status === 'Active').length / students.length) * 100) || 0}%
            </div>
            <div className="stat-label">{t('sis.activeRate')}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
