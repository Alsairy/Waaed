import React from 'react';
import { useTranslation } from 'react-i18next';

const AttendancePage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="content-area" data-testid="attendance-page">
      <div className="page-header">
        <h1 className="page-title">{t('navigation.attendance')}</h1>
        <p className="page-subtitle">{t('attendance.description')}</p>
      </div>

      <div className="content-section">
        <div className="card">
          <div className="card-body">
            <h3>{t('attendance.checkIn')}</h3>
            <button 
              className="btn btn-primary" 
              data-testid="check-in-button"
            >
              {t('attendance.checkIn')}
            </button>
            <button 
              className="btn btn-secondary ml-2" 
              data-testid="check-out-button"
            >
              {t('attendance.checkOut')}
            </button>
          </div>
        </div>

        <div className="card mt-4">
          <div className="card-body">
            <h3>{t('attendance.records')}</h3>
            <div data-testid="attendance-record" className="attendance-record">
              <p>Sample attendance record</p>
            </div>
            <div data-testid="check-in-success" className="success-message" style={{ display: 'none' }}>
              Check-in successful!
            </div>
            <div data-testid="check-out-success" className="success-message" style={{ display: 'none' }}>
              Check-out successful!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
