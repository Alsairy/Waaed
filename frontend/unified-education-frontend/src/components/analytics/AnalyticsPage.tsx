import React from 'react';
import { useTranslation } from 'react-i18next';

const AnalyticsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="content-area" data-testid="analytics-page">
      <div className="page-header">
        <h1 className="page-title">{t('navigation.analytics')}</h1>
        <p className="page-subtitle">{t('analytics.description')}</p>
      </div>

      <div className="content-section">
        <div className="card">
          <div className="card-body">
            <h3>{t('analytics.overview')}</h3>
            <p>{t('analytics.placeholder')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
