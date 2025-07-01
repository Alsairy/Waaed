import React from 'react';
import { useTranslation } from 'react-i18next';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="content-area" data-testid="profile-page">
      <div className="page-header">
        <h1 className="page-title">{t('navigation.profile')}</h1>
        <p className="page-subtitle">{t('profile.description')}</p>
      </div>

      <div className="content-section">
        <div className="card">
          <div className="card-body">
            <h3>{t('profile.information')}</h3>
            <p>{t('profile.placeholder')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
