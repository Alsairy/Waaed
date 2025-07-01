import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckSquare, Plus, Search, Filter, Calendar, User, AlertCircle, Eye, Edit, MoreVertical, Clock } from 'lucide-react';
import { tasksService } from '../../services';

interface Task {
  id: string;
  title: string;
  description: string;
  assigneeIds: string[];
  assigneeNames: string[];
  createdBy: string;
  createdByName: string;
  dueDate: string;
  priority: 'low' | 'normal' | 'high';
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  attachmentsCount: number;
  completedAt?: string;
}

const TaskList: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [assigneeFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksService.getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task: Task) => {
    const matchesSearch = searchTerm === '' || 
      task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigneeNames?.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      task.createdByName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || task.status === statusFilter;
    const matchesPriority = priorityFilter === '' || task.priority === priorityFilter;
    const matchesAssignee = assigneeFilter === '' || task.assigneeIds?.includes(assigneeFilter);
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
  });

  const taskStats = {
    total: tasks.length,
    notStarted: tasks.filter((t: Task) => t.status === 'not_started').length,
    inProgress: tasks.filter((t: Task) => t.status === 'in_progress').length,
    completed: tasks.filter((t: Task) => t.status === 'completed').length,
    overdue: tasks.filter((t: Task) => {
      const dueDate = new Date(t.dueDate);
      const now = new Date();
      return dueDate < now && t.status !== 'completed';
    }).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in_progress': return 'warning';
      case 'not_started': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'normal': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };


  const isOverdue = (dueDate: string, status: string): boolean => {
    const due = new Date(dueDate);
    const now = new Date();
    return due < now && status !== 'completed';
  };

  const getDaysUntilDue = (dueDate: string): number => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
          <CheckSquare className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error}</div>
          <button 
            className="error-action" 
            onClick={loadTasks}
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
        <h1 className="page-title">{t('tasks.taskManagement')}</h1>
        <p className="page-subtitle">{t('tasks.manageAndTrackTasks')}</p>
        <div className="page-actions">
          <button 
            className="btn btn-primary"
            aria-label={t('tasks.newTask')}
          >
            <Plus size={18} className="btn-icon" aria-hidden="true" />
            {t('tasks.newTask')}
          </button>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('tasks.overview')}</h2>
        </div>
        <div className="card-grid grid-5">
          <div className="stat-card stat-card-primary">
            <div className="stat-icon">
              <CheckSquare size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{taskStats.total}</div>
              <div className="stat-label">{t('tasks.totalTasks')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-secondary">
            <div className="stat-icon">
              <Clock size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{taskStats.notStarted}</div>
              <div className="stat-label">{t('tasks.notStarted')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-warning">
            <div className="stat-icon">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{taskStats.inProgress}</div>
              <div className="stat-label">{t('tasks.inProgress')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-success">
            <div className="stat-icon">
              <CheckSquare size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{taskStats.completed}</div>
              <div className="stat-label">{t('tasks.completed')}</div>
            </div>
          </div>
          <div className="stat-card stat-card-danger">
            <div className="stat-icon">
              <AlertCircle size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-value">{taskStats.overdue}</div>
              <div className="stat-label">{t('tasks.overdue')}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('tasks.tasksList')}</h2>
          <div className="section-actions">
            <div className="search-box">
              <div className="search-input-wrapper">
                <Search size={18} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t('tasks.searchTasks')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={t('tasks.searchTasks')}
                  id="task-search"
                />
              </div>
            </div>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label={t('tasks.filterByStatus')}
            >
              <option value="">{t('tasks.allStatuses')}</option>
              <option value="not_started">{t('tasks.notStarted')}</option>
              <option value="in_progress">{t('tasks.inProgress')}</option>
              <option value="completed">{t('tasks.completed')}</option>
            </select>
            <select
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label={t('tasks.filterByPriority')}
            >
              <option value="">{t('tasks.allPriorities')}</option>
              <option value="high">{t('tasks.highPriority')}</option>
              <option value="normal">{t('tasks.normalPriority')}</option>
              <option value="low">{t('tasks.lowPriority')}</option>
            </select>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label={t('tasks.gridView')}
                aria-pressed={viewMode === 'grid'}
              >
                <Filter size={16} aria-hidden="true" />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label={t('tasks.listView')}
                aria-pressed={viewMode === 'list'}
              >
                <CheckSquare size={16} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>

        <div className="section-content">
          {filteredTasks.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="card-grid grid-2">
                {filteredTasks.map((task) => {
                  const statusColor = getStatusColor(task.status);
                  const priorityColor = getPriorityColor(task.priority);
                  const overdue = isOverdue(task.dueDate, task.status);
                  const daysUntilDue = getDaysUntilDue(task.dueDate);
                  
                  return (
                    <div key={task.id} className={`card card-hover task-card ${overdue ? 'overdue' : ''}`}>
                      <div className="card-header">
                        <div className="task-header">
                          <div className="task-title">{task.title}</div>
                          <div className="task-badges">
                            <span className={`badge badge-${statusColor}`}>
                              {task.status === 'completed' ? t('tasks.completed') :
                               task.status === 'in_progress' ? t('tasks.inProgress') :
                               t('tasks.notStarted')}
                            </span>
                            <span className={`badge badge-${priorityColor}`}>
                              <AlertCircle size={12} />
                              {task.priority === 'high' ? t('tasks.highPriority') :
                               task.priority === 'normal' ? t('tasks.normalPriority') :
                               t('tasks.lowPriority')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="task-description">
                          {task.description.length > 150 
                            ? task.description.substring(0, 150) + '...'
                            : task.description
                          }
                        </div>
                        <div className="task-meta">
                          <div className="meta-row">
                            <User size={16} className="meta-icon" />
                            <span className="meta-text">
                              {task.assigneeNames?.length > 0 
                                ? task.assigneeNames.slice(0, 2).join(', ') + 
                                  (task.assigneeNames.length > 2 ? ` +${task.assigneeNames.length - 2}` : '')
                                : 'Unassigned'
                              }
                            </span>
                          </div>
                          <div className="meta-row">
                            <Calendar size={16} className="meta-icon" />
                            <span className={`meta-text ${overdue ? 'overdue-text' : ''}`}>
                              {overdue ? t('tasks.overdue') : 
                               daysUntilDue === 0 ? t('tasks.dueToday') :
                               daysUntilDue === 1 ? t('tasks.dueTomorrow') :
                               `${daysUntilDue} ${t('tasks.daysLeft')}`
                              }
                            </span>
                          </div>
                          <div className="meta-row">
                            <span className="meta-text">{t('tasks.createdBy')} {task.createdByName}</span>
                          </div>
                        </div>
                        <div className="task-stats">
                          <div className="stat-item">
                            <span className="stat-label">{t('tasks.comments')}</span>
                            <span className="stat-value">{task.commentsCount || 0}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">{t('tasks.attachments')}</span>
                            <span className="stat-value">{task.attachmentsCount || 0}</span>
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
                  );
                })}
              </div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t('tasks.title')}</th>
                      <th>{t('tasks.assignees')}</th>
                      <th>{t('tasks.priority')}</th>
                      <th>{t('tasks.status')}</th>
                      <th>{t('tasks.dueDate')}</th>
                      <th>{t('tasks.createdBy')}</th>
                      <th>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map((task) => {
                      const statusColor = getStatusColor(task.status);
                      const priorityColor = getPriorityColor(task.priority);
                      const overdue = isOverdue(task.dueDate, task.status);
                      
                      return (
                        <tr key={task.id} className={overdue ? 'overdue-row' : ''}>
                          <td>
                            <div className="task-cell">
                              <div className="task-title">{task.title}</div>
                              <div className="task-description">
                                {task.description.length > 80 
                                  ? task.description.substring(0, 80) + '...'
                                  : task.description
                                }
                              </div>
                            </div>
                          </td>
                          <td>
                            {task.assigneeNames?.length > 0 
                              ? task.assigneeNames.slice(0, 2).join(', ') + 
                                (task.assigneeNames.length > 2 ? ` +${task.assigneeNames.length - 2}` : '')
                              : 'Unassigned'
                            }
                          </td>
                          <td>
                            <span className={`badge badge-${priorityColor}`}>
                              <AlertCircle size={12} />
                              {task.priority === 'high' ? t('tasks.high') :
                               task.priority === 'normal' ? t('tasks.normal') :
                               t('tasks.low')}
                            </span>
                          </td>
                          <td>
                            <span className={`badge badge-${statusColor}`}>
                              {task.status === 'completed' ? t('tasks.completed') :
                               task.status === 'in_progress' ? t('tasks.inProgress') :
                               t('tasks.notStarted')}
                            </span>
                          </td>
                          <td className={overdue ? 'overdue-text' : ''}>
                            {formatDate(task.dueDate)}
                            {overdue && <span className="overdue-indicator">{t('tasks.overdue')}</span>}
                          </td>
                          <td>{task.createdByName}</td>
                          <td>
                            <div className="action-buttons">
                              <button className="btn btn-sm btn-primary">
                                <Eye size={14} />
                              </button>
                              <button className="btn btn-sm btn-secondary">
                                <Edit size={14} />
                              </button>
                              <button className="btn-icon">
                                <MoreVertical size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <CheckSquare size={48} />
              </div>
              <div className="empty-title">{t('tasks.noTasksFound')}</div>
              <div className="empty-description">
                {searchTerm || statusFilter || priorityFilter || assigneeFilter
                  ? t('tasks.noTasksMatchFilter')
                  : t('tasks.noTasksYet')
                }
              </div>
              <button className="btn btn-primary empty-action">
                <Plus size={18} />
                {t('tasks.createFirstTask')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
