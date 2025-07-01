import React from 'react';
import { useTranslation } from 'react-i18next';

const UsersPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="content-area" data-testid="users-page">
      <div className="page-header">
        <h1 className="page-title">{t('navigation.users')}</h1>
        <p className="page-subtitle">{t('users.description')}</p>
      </div>

      <div className="content-section">
        <div className="card">
          <div className="card-body">
            <h3>{t('users.management')}</h3>
            <p>{t('users.placeholder')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;
