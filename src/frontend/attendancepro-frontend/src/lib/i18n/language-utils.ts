import { createContext, useContext } from 'react'
import { SupportedLanguage, TranslationKeys } from './translations'

interface LanguageContextType {
  language: SupportedLanguage
  setLanguage: (lang: SupportedLanguage) => void
  t: TranslationKeys
  isRTL: boolean
  direction: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

export const useTranslation = () => {
  const { t, language, isRTL, direction } = useLanguage()
  
  return {
    t,
    language,
    isRTL,
    direction,
    translate: (key: string, fallback?: string): string => {
      const keys = key.split('.')
      let result: unknown = t
      
      for (const k of keys) {
        if (result && typeof result === 'object' && k in result) {
          result = (result as Record<string, unknown>)[k]
        } else {
          return fallback || key
        }
      }
      
      return typeof result === 'string' ? result : fallback || key
    }
  }
}

export { LanguageContext, type LanguageContextType }
