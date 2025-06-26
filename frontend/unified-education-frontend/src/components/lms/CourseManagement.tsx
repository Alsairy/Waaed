import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { lmsService } from '../../services';
import { Course } from '../../types/api';

const CourseManagement: React.FC = () => {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await lmsService.getCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading courses:', error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = searchTerm === '' || 
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    Published: courses.filter(c => c.status === 'Published').length,
    Draft: courses.filter(c => c.status === 'Draft').length,
    Archived: courses.filter(c => c.status === 'Archived').length,
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

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('lms.courseManagement')}</h1>
        <p className="page-subtitle">{t('lms.manageCourseContent')}</p>
        <div className="page-actions">
          <button className="btn btn-primary">
            <span className="btn-icon">➕</span>
            {t('lms.createCourse')}
          </button>
          <button className="btn btn-secondary">
            <span className="btn-icon">📤</span>
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('lms.courseOverview')}</h2>
        </div>
        <div className="card-grid grid-4">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">📚</div>
            <div className="stat-value">{courses.length}</div>
            <div className="stat-label">{t('lms.totalCourses')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-success">✅</div>
            <div className="stat-value">{statusCounts.Published}</div>
            <div className="stat-label">{t('lms.publishedCourses')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">📝</div>
            <div className="stat-value">{statusCounts.Draft}</div>
            <div className="stat-label">{t('lms.draftCourses')}</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-info">📦</div>
            <div className="stat-value">{statusCounts.Archived}</div>
            <div className="stat-label">{t('lms.archivedCourses')}</div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('lms.courseList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder={t('lms.searchCourses')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">{t('lms.allStatuses')}</option>
              <option value="Published">{t('lms.published')}</option>
              <option value="Draft">{t('lms.draft')}</option>
              <option value="Archived">{t('lms.archived')}</option>
            </select>
          </div>
        </div>

        <div className="section-content">
          {filteredCourses.length > 0 ? (
            <div className="card-grid grid-3">
              {filteredCourses.map((course) => (
                <div key={course.id} className="card card-hover">
                  <div className="card-header">
                    <div className="card-title">{course.title}</div>
                    <span className={`badge ${
                      course.status === 'Published' 
                        ? 'badge-success' 
                        : course.status === 'Draft'
                        ? 'badge-warning'
                        : 'badge-secondary'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                  <div className="card-body">
                    <div className="course-info">
                      <div className="info-item">
                        <span className="info-icon">👨‍🏫</span>
                        <span className="info-text">{course.instructor}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">📅</span>
                        <span className="info-text">
                          {new Date(course.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-icon">⏱️</span>
                        <span className="info-text">8 weeks</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-primary">
                        {t('common.view')}
                      </button>
                      <button className="btn btn-sm btn-secondary">
                        {t('common.edit')}
                      </button>
                      <button className="btn-icon" title={t('common.more')}>
                        ⋮
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <div className="empty-title">{t('lms.noCoursesFound')}</div>
              <div className="empty-description">
                {searchTerm || statusFilter 
                  ? t('lms.noCoursesMatchFilter')
                  : t('lms.noCoursesYet')
                }
              </div>
              <button className="empty-action">
                {t('lms.createFirstCourse')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
