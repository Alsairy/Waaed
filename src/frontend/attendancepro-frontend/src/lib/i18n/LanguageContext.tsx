import React, { useState, useEffect, ReactNode } from 'react'
import { translations, SupportedLanguage, defaultLanguage } from './translations'
import { LanguageContext, useLanguage, type LanguageContextType } from './language-utils'

interface LanguageProviderProps {
  children: ReactNode
  defaultLang?: SupportedLanguage
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  defaultLang = defaultLanguage 
}) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('waaed-language') as SupportedLanguage
      if (savedLang && translations[savedLang]) {
        return savedLang
      }
      
      const browserLang = navigator.language.split('-')[0] as SupportedLanguage
      if (translations[browserLang]) {
        return browserLang
      }
    }
    
    return defaultLang
  })

  const isRTL = language === 'ar'
  const direction = isRTL ? 'rtl' : 'ltr'

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang)
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('waaed-language', lang)
    }
  }

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction
      document.documentElement.lang = language
      
      if (isRTL) {
        document.body.classList.add('rtl')
        document.body.classList.remove('ltr')
      } else {
        document.body.classList.add('ltr')
        document.body.classList.remove('rtl')
      }
    }
  }, [language, direction, isRTL])

  const contextValue: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language],
    isRTL,
    direction
  }

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}


interface LanguageSwitcherProps {
  className?: string
  showFlags?: boolean
  compact?: boolean
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  showFlags = true,
  compact = false
}) => {
  const { language, setLanguage, t } = useLanguage()

  const languages = [
    { code: 'en' as SupportedLanguage, name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'ar' as SupportedLanguage, name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' }
  ]

  return (
    <div className={`language-switcher ${className}`}>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        aria-label={t.common.language}
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {showFlags && !compact ? `${lang.flag} ` : ''}
            {compact ? lang.code.toUpperCase() : lang.nativeName}
          </option>
        ))}
      </select>
    </div>
  )
}

interface DirectionWrapperProps {
  children: ReactNode
  className?: string
}

export const DirectionWrapper: React.FC<DirectionWrapperProps> = ({
  children,
  className = ''
}) => {
  const { direction } = useLanguage()
  
  return (
    <div dir={direction} className={`direction-wrapper ${className}`}>
      {children}
    </div>
  )
}

export default LanguageProvider
