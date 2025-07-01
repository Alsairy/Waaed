import React from 'react';
import { useTranslation } from 'react-i18next';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="content-area" data-testid="settings-page">
      <div className="page-header">
        <h1 className="page-title">{t('navigation.settings')}</h1>
        <p className="page-subtitle">{t('settings.description')}</p>
      </div>

      <div className="content-section">
        <div className="card">
          <div className="card-body">
            <h3>{t('settings.preferences')}</h3>
            <p>{t('settings.placeholder')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
