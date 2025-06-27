import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, User, AlertCircle, CheckSquare, Clock, Edit, Paperclip, Download, MessageCircle } from 'lucide-react';
import { tasksService } from '../../services';
import TaskComments from './TaskComments';

interface Task {
  id: string;
  title: string;
  description: string;
  assigneeIds: string[];
  assigneeNames: string[];
  assignees: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
  createdBy: string;
  createdByName: string;
  dueDate: string;
  priority: 'low' | 'normal' | 'high';
  status: 'not_started' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  commentsCount: number;
  attachments: Array<{
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedBy: string;
    uploadedAt: string;
    downloadUrl: string;
  }>;
}

interface TaskDetailsProps {
  taskId?: string;
  onBack?: () => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({ taskId = '1', onBack }) => {
  const { t } = useTranslation();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tasksService.getTask(taskId);
      setTask(data);
      setNewStatus(data.status);
    } catch (error) {
      console.error('Error loading task:', error);
      setError(error instanceof Error ? error.message : 'Failed to load task');
      setTask(null);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!task || newStatus === task.status) return;

    try {
      setUpdating(true);
      await tasksService.updateTask(taskId, { status: newStatus });
      await loadTask(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating task status:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task status');
    } finally {
      setUpdating(false);
    }
  };

  const handleDownloadAttachment = async (attachmentId: string, fileName: string) => {
    try {
      const blob = await tasksService.downloadTaskAttachment(taskId, attachmentId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      setError(error instanceof Error ? error.message : 'Failed to download attachment');
    }
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  if (error || !task) {
    return (
      <div className="content-area">
        <div className="error-state">
          <CheckSquare className="error-icon" size={48} />
          <div className="error-title">{t('common.errorLoadingData')}</div>
          <div className="error-description">{error || t('tasks.taskNotFound')}</div>
          <button className="error-action" onClick={loadTask}>
            {t('common.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  const overdue = isOverdue(task.dueDate, task.status);
  const daysUntilDue = getDaysUntilDue(task.dueDate);
  const statusColor = getStatusColor(task.status);
  const priorityColor = getPriorityColor(task.priority);

  return (
    <div className="content-area">
      <div className="task-details">
        <div className="task-header">
          {onBack && (
            <button className="btn btn-secondary back-btn" onClick={onBack}>
              <ArrowLeft size={18} />
              {t('common.back')}
            </button>
          )}
          
          <div className="task-title-section">
            <h1 className="task-title">{task.title}</h1>
            
            <div className="task-meta">
              <div className="meta-badges">
                <span className={`badge badge-${statusColor}`}>
                  {task.status === 'completed' ? (
                    <>
                      <CheckSquare size={14} />
                      {t('tasks.completed')}
                    </>
                  ) : task.status === 'in_progress' ? (
                    <>
                      <Clock size={14} />
                      {t('tasks.inProgress')}
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} />
                      {t('tasks.notStarted')}
                    </>
                  )}
                </span>
                
                <span className={`badge badge-${priorityColor}`}>
                  <AlertCircle size={14} />
                  {task.priority === 'high' ? t('tasks.highPriority') :
                   task.priority === 'normal' ? t('tasks.normalPriority') :
                   t('tasks.lowPriority')}
                </span>
                
                {overdue && (
                  <span className="badge badge-danger">
                    <AlertCircle size={14} />
                    {t('tasks.overdue')}
                  </span>
                )}
              </div>
              
              <div className="meta-info">
                <div className="meta-item">
                  <Calendar size={16} className="meta-icon" />
                  <span className={`meta-text ${overdue ? 'overdue-text' : ''}`}>
                    {t('tasks.dueDate')}: {formatDate(task.dueDate)}
                    {!overdue && daysUntilDue >= 0 && (
                      <span className="days-left">
                        ({daysUntilDue === 0 ? t('tasks.dueToday') :
                          daysUntilDue === 1 ? t('tasks.dueTomorrow') :
                          `${daysUntilDue} ${t('tasks.daysLeft')}`})
                      </span>
                    )}
                  </span>
                </div>
                
                <div className="meta-item">
                  <User size={16} className="meta-icon" />
                  <span className="meta-text">
                    {t('tasks.createdBy')} {task.createdByName} on {formatDate(task.createdAt)}
                  </span>
                </div>
                
                {task.completedAt && (
                  <div className="meta-item">
                    <CheckSquare size={16} className="meta-icon" />
                    <span className="meta-text">
                      {t('tasks.completedOn')} {formatDateTime(task.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="task-content">
          <div className="task-description">
            <h3 className="content-title">{t('tasks.description')}</h3>
            <div className="description-content">
              {task.description}
            </div>
          </div>

          <div className="task-assignees">
            <h3 className="content-title">{t('tasks.assignees')}</h3>
            <div className="assignees-list">
              {task.assignees && task.assignees.length > 0 ? (
                task.assignees.map((assignee) => (
                  <div key={assignee.id} className="assignee-card">
                    {assignee.avatar ? (
                      <img src={assignee.avatar} alt={assignee.name} className="assignee-avatar" />
                    ) : (
                      <div className="assignee-avatar-placeholder">
                        <User size={20} />
                      </div>
                    )}
                    <div className="assignee-info">
                      <div className="assignee-name">{assignee.name}</div>
                      <div className="assignee-email">{assignee.email}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <User size={32} />
                  <div className="empty-title">{t('tasks.noAssignees')}</div>
                </div>
              )}
            </div>
          </div>

          {task.attachments && task.attachments.length > 0 && (
            <div className="task-attachments">
              <h3 className="content-title">
                <Paperclip size={18} />
                {t('tasks.attachments')} ({task.attachments.length})
              </h3>
              <div className="attachments-list">
                {task.attachments.map((attachment) => (
                  <div key={attachment.id} className="attachment-item">
                    <div className="attachment-info">
                      <div className="attachment-name">{attachment.fileName}</div>
                      <div className="attachment-meta">
                        <span className="attachment-size">{formatFileSize(attachment.fileSize)}</span>
                        <span className="attachment-date">{formatDateTime(attachment.uploadedAt)}</span>
                        <span className="attachment-uploader">{attachment.uploadedBy}</span>
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-secondary"
                      onClick={() => handleDownloadAttachment(attachment.id, attachment.fileName)}
                    >
                      <Download size={14} />
                      {t('common.download')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="task-status-update">
          <div className="status-update-header">
            <h3 className="content-title">{t('tasks.updateStatus')}</h3>
          </div>
          <div className="status-update-form">
            <div className="form-group">
              <label className="form-label">{t('tasks.newStatus')}</label>
              <select
                className="form-select"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="not_started">{t('tasks.notStarted')}</option>
                <option value="in_progress">{t('tasks.inProgress')}</option>
                <option value="completed">{t('tasks.completed')}</option>
              </select>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleStatusUpdate}
              disabled={updating || newStatus === task.status}
            >
              {updating ? (
                <>
                  <div className="loading-spinner-sm"></div>
                  {t('tasks.updating')}
                </>
              ) : (
                <>
                  <Edit size={16} />
                  {t('tasks.updateStatus')}
                </>
              )}
            </button>
          </div>
        </div>

        <TaskComments taskId={taskId} />
      </div>
    </div>
  );
};

export default TaskDetails;
