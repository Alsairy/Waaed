import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, Save, X } from 'lucide-react';
import { pollsService } from '../../services';

interface PollOption {
  id?: string;
  text: string;
  order: number;
}

interface PollFormData {
  question: string;
  description: string;
  options: PollOption[];
  targetAudience: string;
  startDate: string;
  endDate: string;
  showResultsAfterVoting: boolean;
  showResultsAfterClose: boolean;
  allowMultipleVotes: boolean;
  isAnonymous: boolean;
}

const PollCreation: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<PollFormData>({
    question: '',
    description: '',
    options: [
      { text: '', order: 1 },
      { text: '', order: 2 }
    ],
    targetAudience: 'all',
    startDate: new Date().toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    showResultsAfterVoting: false,
    showResultsAfterClose: true,
    allowMultipleVotes: false,
    isAnonymous: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (field: keyof PollFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], text: value };
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData(prev => ({
        ...prev,
        options: [
          ...prev.options,
          { text: '', order: prev.options.length + 1 }
        ]
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      const reorderedOptions = newOptions.map((option, i) => ({
        ...option,
        order: i + 1
      }));
      setFormData(prev => ({
        ...prev,
        options: reorderedOptions
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.question.trim()) {
      setError('Poll question is required');
      return false;
    }

    const validOptions = formData.options.filter(option => option.text.trim());
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return false;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const pollData = {
        ...formData,
        options: formData.options.filter(option => option.text.trim())
      };

      await pollsService.createPoll(pollData);
      setSuccess(true);
      
      setTimeout(() => {
        setFormData({
          question: '',
          description: '',
          options: [
            { text: '', order: 1 },
            { text: '', order: 2 }
          ],
          targetAudience: 'all',
          startDate: new Date().toISOString().slice(0, 16),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          showResultsAfterVoting: false,
          showResultsAfterClose: true,
          allowMultipleVotes: false,
          isAnonymous: true,
        });
        setSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error creating poll:', error);
      setError(error instanceof Error ? error.message : 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      question: '',
      description: '',
      options: [
        { text: '', order: 1 },
        { text: '', order: 2 }
      ],
      targetAudience: 'all',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
      showResultsAfterVoting: false,
      showResultsAfterClose: true,
      allowMultipleVotes: false,
      isAnonymous: true,
    });
    setError(null);
    setSuccess(false);
  };

  return (
    <div className="content-area">
      <div className="page-header">
        <h1 className="page-title">{t('polls.createPoll')}</h1>
        <p className="page-subtitle">{t('polls.createNewPollForVoting')}</p>
      </div>

      {success && (
        <div className="alert alert-success">
          <div className="alert-content">
            <div className="alert-title">{t('polls.pollCreatedSuccessfully')}</div>
            <div className="alert-description">{t('polls.pollHasBeenCreatedAndIsNowActive')}</div>
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

      <form onSubmit={handleSubmit} className="poll-creation-form">
        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">{t('polls.pollDetails')}</h2>
          </div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label required">{t('polls.pollQuestion')}</label>
              <input
                type="text"
                className="form-input"
                placeholder={t('polls.enterPollQuestion')}
                value={formData.question}
                onChange={(e) => handleInputChange('question', e.target.value)}
                required
              />
            </div>
            <div className="form-group full-width">
              <label className="form-label">{t('polls.description')}</label>
              <textarea
                className="form-textarea"
                placeholder={t('polls.enterPollDescription')}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">{t('polls.answerOptions')}</h2>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={addOption}
              disabled={formData.options.length >= 10}
            >
              <Plus size={16} />
              {t('polls.addOption')}
            </button>
          </div>
          <div className="options-list">
            {formData.options.map((option, index) => (
              <div key={index} className="option-item">
                <div className="option-number">{index + 1}</div>
                <input
                  type="text"
                  className="form-input option-input"
                  placeholder={t('polls.enterOptionText')}
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    className="btn-icon btn-danger"
                    onClick={() => removeOption(index)}
                    title={t('polls.removeOption')}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">{t('polls.pollSettings')}</h2>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">{t('polls.targetAudience')}</label>
              <select
                className="form-select"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              >
                <option value="all">{t('polls.allUsers')}</option>
                <option value="students">{t('polls.studentsOnly')}</option>
                <option value="teachers">{t('polls.teachersOnly')}</option>
                <option value="staff">{t('polls.staffOnly')}</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">{t('polls.startDate')}</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t('polls.endDate')}</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h2 className="section-title">{t('polls.resultSettings')}</h2>
          </div>
          <div className="form-options">
            <div className="form-option">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.showResultsAfterVoting}
                  onChange={(e) => handleInputChange('showResultsAfterVoting', e.target.checked)}
                />
                <span className="checkbox-text">{t('polls.showResultsAfterVoting')}</span>
              </label>
            </div>
            <div className="form-option">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.showResultsAfterClose}
                  onChange={(e) => handleInputChange('showResultsAfterClose', e.target.checked)}
                />
                <span className="checkbox-text">{t('polls.showResultsAfterClose')}</span>
              </label>
            </div>
            <div className="form-option">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.allowMultipleVotes}
                  onChange={(e) => handleInputChange('allowMultipleVotes', e.target.checked)}
                />
                <span className="checkbox-text">{t('polls.allowMultipleVotes')}</span>
              </label>
            </div>
            <div className="form-option">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                />
                <span className="checkbox-text">{t('polls.anonymousVoting')}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={resetForm}
            disabled={loading}
          >
            {t('common.reset')}
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner-sm"></div>
                {t('polls.creatingPoll')}
              </>
            ) : (
              <>
                <Save size={18} />
                {t('polls.createPoll')}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PollCreation;
