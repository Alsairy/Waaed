import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector, useDispatch } from 'react-redux';
import { Globe, Check } from 'lucide-react';
import { RootState } from '../store/store';
import { setLanguage } from '../store/slices/uiSlice';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const dispatch = useDispatch();
  const { language } = useSelector((state: RootState) => state.ui);

  const handleLanguageChange = useCallback((newLanguage: string) => {
    i18n.changeLanguage(newLanguage);
    dispatch(setLanguage(newLanguage));
    
    if (newLanguage === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }

    const announcement = newLanguage === 'ar' ? 'تم تغيير اللغة إلى العربية' : 'Language changed to English';
    const ariaLiveRegion = document.getElementById('aria-live-region');
    if (ariaLiveRegion) {
      ariaLiveRegion.textContent = announcement;
    }
  }, [i18n, dispatch]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent, newLanguage: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleLanguageChange(newLanguage);
    }
  }, [handleLanguageChange]);

  useEffect(() => {
    if (language === 'ar') {
      document.documentElement.setAttribute('dir', 'rtl');
      document.documentElement.setAttribute('lang', 'ar');
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.documentElement.setAttribute('dir', 'ltr');
      document.documentElement.setAttribute('lang', 'en');
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
  }, [language]);

  return (
    <div className="language-switcher" role="group" aria-labelledby="language-switcher-label">
      <span id="language-switcher-label" className="sr-only">
        {t('common.selectLanguage')}
      </span>
      <div className="language-switcher-icon">
        <Globe size={16} aria-hidden="true" />
      </div>
      <button
        onClick={() => handleLanguageChange('en')}
        onKeyDown={(e) => handleKeyDown(e, 'en')}
        className={`language-btn ${language === 'en' ? 'active' : ''}`}
        aria-label={t('common.switchToEnglish')}
        aria-pressed={language === 'en'}
        type="button"
        tabIndex={0}
      >
        <span className="language-text">English</span>
        {language === 'en' && (
          <Check size={14} className="language-check" aria-hidden="true" />
        )}
      </button>
      <button
        onClick={() => handleLanguageChange('ar')}
        onKeyDown={(e) => handleKeyDown(e, 'ar')}
        className={`language-btn ${language === 'ar' ? 'active' : ''}`}
        aria-label="التبديل إلى العربية"
        aria-pressed={language === 'ar'}
        type="button"
        tabIndex={0}
      >
        <span className="language-text">العربية</span>
        {language === 'ar' && (
          <Check size={14} className="language-check" aria-hidden="true" />
        )}
      </button>
    </div>
  );
};

export { LanguageSwitcher };
