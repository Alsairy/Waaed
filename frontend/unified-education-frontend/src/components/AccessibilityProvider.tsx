import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  colorScheme: 'light' | 'dark' | 'auto';
}

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => void;
  resetSettings: () => void;
  announceToScreenReader: (message: string) => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  screenReaderMode: false,
  keyboardNavigation: true,
  focusIndicators: true,
  fontSize: 'medium',
  colorScheme: 'auto',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('accessibility-settings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
    announceToScreenReader(t('accessibility.settingsReset'));
  };

  const announceToScreenReader = (message: string) => {
    const ariaLiveRegion = document.getElementById('aria-live-region');
    if (ariaLiveRegion) {
      ariaLiveRegion.textContent = message;
      setTimeout(() => {
        ariaLiveRegion.textContent = '';
      }, 1000);
    }
  };

  useEffect(() => {
    const root = document.documentElement;

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    if (settings.screenReaderMode) {
      root.classList.add('screen-reader-mode');
    } else {
      root.classList.remove('screen-reader-mode');
    }

    if (settings.keyboardNavigation) {
      root.classList.add('keyboard-navigation');
    } else {
      root.classList.remove('keyboard-navigation');
    }

    if (settings.focusIndicators) {
      root.classList.add('focus-indicators');
    } else {
      root.classList.remove('focus-indicators');
    }

    root.setAttribute('data-font-size', settings.fontSize);

    if (settings.colorScheme === 'auto') {
      root.removeAttribute('data-color-scheme');
    } else {
      root.setAttribute('data-color-scheme', settings.colorScheme);
    }

    root.style.setProperty('--accessibility-font-scale', 
      settings.fontSize === 'small' ? '0.875' :
      settings.fontSize === 'large' ? '1.125' :
      settings.fontSize === 'extra-large' ? '1.25' : '1'
    );

  }, [settings]);

  useEffect(() => {
    const mediaQueries = {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)'),
      highContrast: window.matchMedia('(prefers-contrast: high)'),
      darkMode: window.matchMedia('(prefers-color-scheme: dark)'),
    };

    if (mediaQueries.reducedMotion.matches && !localStorage.getItem('accessibility-settings')) {
      updateSetting('reducedMotion', true);
    }

    if (mediaQueries.highContrast.matches && !localStorage.getItem('accessibility-settings')) {
      updateSetting('highContrast', true);
    }

    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      if (settings.colorScheme === 'auto') {
        updateSetting('reducedMotion', e.matches);
      }
    };

    const handleContrastChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('accessibility-settings')) {
        updateSetting('highContrast', e.matches);
      }
    };

    mediaQueries.reducedMotion.addEventListener('change', handleReducedMotionChange);
    mediaQueries.highContrast.addEventListener('change', handleContrastChange);

    return () => {
      mediaQueries.reducedMotion.removeEventListener('change', handleReducedMotionChange);
      mediaQueries.highContrast.removeEventListener('change', handleContrastChange);
    };
  }, [settings.colorScheme]);

  useEffect(() => {
    let ariaLiveRegion = document.getElementById('aria-live-region');
    if (!ariaLiveRegion) {
      ariaLiveRegion = document.createElement('div');
      ariaLiveRegion.id = 'aria-live-region';
      ariaLiveRegion.setAttribute('aria-live', 'polite');
      ariaLiveRegion.setAttribute('aria-atomic', 'true');
      ariaLiveRegion.className = 'sr-only';
      document.body.appendChild(ariaLiveRegion);
    }

    return () => {
      const region = document.getElementById('aria-live-region');
      if (region) {
        region.remove();
      }
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && event.key === 'm') {
        event.preventDefault();
        const mainContent = document.getElementById('main-content') || document.querySelector('main');
        if (mainContent) {
          (mainContent as HTMLElement).focus();
          announceToScreenReader(t('accessibility.skippedToMainContent'));
        }
      }

      if (event.altKey && event.key === 'a') {
        event.preventDefault();
        const accessibilityButton = document.querySelector('[data-accessibility-menu]');
        if (accessibilityButton) {
          (accessibilityButton as HTMLElement).click();
        }
      }

      if (event.altKey && event.key === 'h') {
        event.preventDefault();
        updateSetting('highContrast', !settings.highContrast);
        announceToScreenReader(
          settings.highContrast 
            ? t('accessibility.highContrastDisabled')
            : t('accessibility.highContrastEnabled')
        );
      }
    };

    if (settings.keyboardNavigation) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [settings.keyboardNavigation, settings.highContrast, t, announceToScreenReader, updateSetting]);

  const contextValue: AccessibilityContextType = {
    settings,
    updateSetting,
    resetSettings,
    announceToScreenReader,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export default AccessibilityProvider;
