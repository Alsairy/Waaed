import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Save, X, Calendar, User, AlertCircle, Paperclip, Upload } from 'lucide-react';
import { tasksService } from '../../services';

interface TaskFormData {
  title: string;
  description: string;
  assigneeIds: string[];
  dueDate: string;
  priority: 'low' | 'normal' | 'high';
  status: 'not_started' | 'in_progress' | 'completed';
  attachments: File[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const TaskCreation: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    assigneeIds: [],
    dueDate: '',
    priority: 'normal',
    status: 'not_started',
    attachments: [],
  });
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data: User[] = [];
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    }
  };

  const handleInputChange = (field: keyof TaskFormData, value: string | string[] | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAssigneeChange = (userId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      assigneeIds: checked
        ? [...prev.assigneeIds, userId]
        : prev.assigneeIds.filter(id => id !== userId)
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Task title is required');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Task description is required');
      return false;
    }

    if (formData.assigneeIds.length === 0) {
      setError('Please assign the task to at least one user');
      return false;
    }

    if (!formData.dueDate) {
      setError('Due date is required');
      return false;
    }

    const dueDate = new Date(formData.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (dueDate < today) {
      setError('Due date cannot be in the past');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const taskData = {
        title: formData.title,
        description: formData.description,
        assigneeIds: formData.assigneeIds,
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status,
      };

      const createdTask = await tasksService.createTask(taskData);

      if (formData.attachments.length > 0) {
        setUploadingFiles(true);
        for (const file of formData.attachments) {
          await tasksService.uploadTaskAttachment(createdTask.id, file);
        }
        setUploadingFiles(false);
      }

      setSuccess(true);
      
      setTimeout(() => {
        resetForm();
        setSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error creating task:', error);
      setError(error instanceof Error ? error.message : 'Failed to create task');
    } finally {
      setLoading(false);
      setUploadingFiles(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      assigneeIds: [],
      dueDate: '',
      priority: 'normal',
      status: 'not_started',
      attachments: [],
    });
    setError(null);
    setSuccess(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'normal': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title" id="main-heading">{t('tasks.createTask')}</h1>
        <p className="page-subtitle">{t('tasks.createNewTaskDescription')}</p>
      </div>

      {success && (
        <div className="alert alert-success">
          <div className="alert-content">
            <div className="alert-title">{t('tasks.taskCreated')}</div>
            <div className="alert-description">{t('tasks.taskCreatedSuccessfully')}</div>
          </div>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <div className="alert-content">
            <div className="alert-title">{t('common.error')}</div>
            <div className="alert-description">{error}</div>
          </div>
        </div>
      )}

      <div className="task-creation-form">
        <form className="form">
          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">{t('tasks.taskDetails')}</h2>
            </div>
            
            <div className="form-group full-width">
              <label htmlFor="task-title" className="form-label required">{t('tasks.title')}</label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder={t('tasks.enterTaskTitle')}
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
                aria-describedby="task-title-help"
              />
              <div id="task-title-help" className="sr-only">
                {t('tasks.titleHelp')}
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="task-description" className="form-label required">{t('tasks.description')}</label>
              <textarea
                id="task-description"
                className="form-textarea"
                placeholder={t('tasks.enterTaskDescription')}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                required
                aria-describedby="task-description-help"
              />
              <div id="task-description-help" className="sr-only">
                {t('tasks.descriptionHelp')}
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="task-due-date" className="form-label required">{t('tasks.dueDate')}</label>
                <div className="input-with-icon">
                  <Calendar size={18} className="input-icon" aria-hidden="true" />
                  <input
                    id="task-due-date"
                    type="datetime-local"
                    className="form-input"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                    required
                    aria-describedby="due-date-help"
                  />
                  <div id="due-date-help" className="sr-only">
                    {t('tasks.dueDateHelp')}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">{t('tasks.priority')}</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  required
                >
                  <option value="low">{t('tasks.lowPriority')}</option>
                  <option value="normal">{t('tasks.normalPriority')}</option>
                  <option value="high">{t('tasks.highPriority')}</option>
                </select>
                <div className="priority-indicator">
                  <span className={`badge badge-${getPriorityColor(formData.priority)}`}>
                    <AlertCircle size={14} />
                    {formData.priority === 'high' ? t('tasks.highPriority') :
                     formData.priority === 'normal' ? t('tasks.normalPriority') :
                     t('tasks.lowPriority')}
                  </span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('tasks.initialStatus')}</label>
                <select
                  className="form-select"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="not_started">{t('tasks.notStarted')}</option>
                  <option value="in_progress">{t('tasks.inProgress')}</option>
                  <option value="completed">{t('tasks.completed')}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">{t('tasks.assignees')}</h2>
              <div className="section-subtitle">{t('tasks.selectAssignees')}</div>
            </div>
            
            <div className="assignees-list">
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="assignee-item">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.assigneeIds.includes(user.id)}
                        onChange={(e) => handleAssigneeChange(user.id, e.target.checked)}
                      />
                      <div className="assignee-info">
                        <div className="assignee-name">{user.name}</div>
                        <div className="assignee-details">
                          <span className="assignee-email">{user.email}</span>
                          <span className="assignee-role">{user.role}</span>
                        </div>
                      </div>
                    </label>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <User size={32} />
                  <div className="empty-title">{t('tasks.noUsersAvailable')}</div>
                </div>
              )}
            </div>

            {formData.assigneeIds.length > 0 && (
              <div className="selected-assignees">
                <div className="selected-count">
                  {formData.assigneeIds.length} {t('tasks.usersSelected')}
                </div>
                <div className="selected-list">
                  {formData.assigneeIds.map(userId => {
                    const user = users.find(u => u.id === userId);
                    return user ? (
                      <span key={userId} className="selected-assignee">
                        {user.name}
                        <button
                          type="button"
                          className="remove-assignee"
                          onClick={() => handleAssigneeChange(userId, false)}
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="form-section">
            <div className="section-header">
              <h2 className="section-title">{t('tasks.attachments')}</h2>
              <div className="section-subtitle">{t('tasks.attachFilesToTask')}</div>
            </div>
            
            <div className="file-upload-area">
              <input
                type="file"
                id="file-upload"
                className="file-input"
                multiple
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif"
              />
              <label htmlFor="file-upload" className="file-upload-label">
                <Upload size={24} />
                <div className="upload-text">
                  <div className="upload-title">{t('tasks.uploadFiles')}</div>
                  <div className="upload-subtitle">{t('tasks.dragDropOrClick')}</div>
                </div>
              </label>
            </div>

            {formData.attachments.length > 0 && (
              <div className="attachments-list">
                <div className="attachments-header">
                  <Paperclip size={16} />
                  <span>{formData.attachments.length} {t('tasks.filesAttached')}</span>
                </div>
                {formData.attachments.map((file, index) => (
                  <div key={index} className="attachment-item">
                    <div className="attachment-info">
                      <div className="attachment-name">{file.name}</div>
                      <div className="attachment-size">{formatFileSize(file.size)}</div>
                    </div>
                    <button
                      type="button"
                      className="remove-attachment"
                      onClick={() => removeAttachment(index)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={resetForm}
              disabled={loading || uploadingFiles}
            >
              {t('common.reset')}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || uploadingFiles}
            >
              {loading || uploadingFiles ? (
                <>
                  <div className="loading-spinner-sm"></div>
                  {uploadingFiles ? t('tasks.uploadingFiles') : t('tasks.creatingTask')}
                </>
              ) : (
                <>
                  <Save size={18} />
                  {t('tasks.createTask')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskCreation;
