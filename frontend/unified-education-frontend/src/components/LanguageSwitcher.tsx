import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { setLanguage } from '../store/slices/uiSlice';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const { language } = useSelector((state: RootState) => state.ui);

  const handleLanguageChange = (newLanguage: string) => {
    i18n.changeLanguage(newLanguage);
    dispatch(setLanguage(newLanguage));
    
    if (newLanguage === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    }
  };

  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
    }
  }, [language]);

  return (
    <div className="language-switcher">
      <button
        onClick={() => handleLanguageChange('en')}
        className={`language-btn ${language === 'en' ? 'active' : ''}`}
        aria-label="Switch to English"
      >
        English
      </button>
      <button
        onClick={() => handleLanguageChange('ar')}
        className={`language-btn ${language === 'ar' ? 'active' : ''}`}
        aria-label="التبديل إلى العربية"
      >
        العربية
      </button>
    </div>
  );
};

export { LanguageSwitcher };
