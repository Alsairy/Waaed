/**
 * Waaed Design System Utilities
 * 
 * This file contains the core design system utilities for the Waaed platform,
 * including color palette, typography scale, spacing, and component styling utilities.
 * 
 * Based on Waaed brand guidelines and technical implementation specifications.
 */

export const waaedColors = {
  primary: '#005F96',      // Waaed Blue - Primary brand color
  green: '#36BA91',        // Waaed Green - Success and positive actions
  lightGreen: '#4CFCB4',   // Light Green - Highlights and accents
  darkTeal: '#0C3C44',     // Dark Teal - Deep contrast and headers
  lightGray: '#D1D1D1',    // Light Gray - Borders and subtle backgrounds
  
  secondary: '#6B7280',    // Secondary text and icons
  accent: '#F59E0B',       // Warning and attention states
  error: '#EF4444',        // Error states and destructive actions
  warning: '#F59E0B',      // Warning states
  info: '#3B82F6',         // Information states
  success: '#10B981',      // Success states
  
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    tertiary: '#F3F4F6',
    dark: '#1F2937',
  },
  
  border: {
    light: '#F5F5F5',
    default: '#E5E7EB',
    dark: '#D1D5DB',
  }
}

export const waaedTypography = {
  h1: {
    fontSize: '3rem',        // 48px
    fontWeight: 'bold',
    lineHeight: '1.2',
    fontFamily: 'Effra, sans-serif',
    className: 'text-5xl font-bold leading-tight'
  },
  h2: {
    fontSize: '2.25rem',     // 36px
    fontWeight: 'bold',
    lineHeight: '1.25',
    fontFamily: 'Effra, sans-serif',
    className: 'text-4xl font-bold leading-tight'
  },
  h3: {
    fontSize: '1.75rem',     // 28px
    fontWeight: '500',       // medium
    lineHeight: '1.3',
    fontFamily: 'Effra, sans-serif',
    className: 'text-2xl font-medium leading-snug'
  },
  h4: {
    fontSize: '1.5rem',      // 24px
    fontWeight: '500',       // medium
    lineHeight: '1.35',
    fontFamily: 'Effra, sans-serif',
    className: 'text-xl font-medium leading-snug'
  },
  h5: {
    fontSize: '1.25rem',     // 20px
    fontWeight: '500',       // medium
    lineHeight: '1.4',
    fontFamily: 'Effra, sans-serif',
    className: 'text-lg font-medium leading-relaxed'
  },
  h6: {
    fontSize: '1.125rem',    // 18px
    fontWeight: '500',       // medium
    lineHeight: '1.4',
    fontFamily: 'Effra, sans-serif',
    className: 'text-lg font-medium leading-relaxed'
  },
  
  bodyLarge: {
    fontSize: '1.125rem',    // 18px
    fontWeight: 'normal',
    lineHeight: '1.6',
    fontFamily: 'Effra, sans-serif',
    className: 'text-lg font-normal leading-relaxed'
  },
  body: {
    fontSize: '1rem',        // 16px
    fontWeight: 'normal',
    lineHeight: '1.6',
    fontFamily: 'Effra, sans-serif',
    className: 'text-base font-normal leading-relaxed'
  },
  bodySmall: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 'normal',
    lineHeight: '1.5',
    fontFamily: 'Effra, sans-serif',
    className: 'text-sm font-normal leading-normal'
  },
  
  caption: {
    fontSize: '0.75rem',     // 12px
    fontWeight: '300',       // light
    lineHeight: '1.4',
    fontFamily: 'Effra, sans-serif',
    className: 'text-xs font-light leading-normal'
  },
  label: {
    fontSize: '0.875rem',    // 14px
    fontWeight: '500',       // medium
    lineHeight: '1.4',
    fontFamily: 'Effra, sans-serif',
    className: 'text-sm font-medium leading-normal'
  },
  button: {
    fontSize: '1rem',        // 16px
    fontWeight: '500',       // medium
    lineHeight: '1.2',
    fontFamily: 'Effra, sans-serif',
    className: 'text-base font-medium leading-tight'
  }
}

export const waaedSpacing = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
}

export const waaedBorderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px
  md: '0.5rem',     // 8px
  lg: '0.75rem',    // 12px
  xl: '1rem',       // 16px
  '2xl': '1.5rem',  // 24px
  full: '9999px',
}

export const waaedShadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 2px 8px rgba(0, 0, 0, 0.08)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
}

export const waaedComponents = {
  card: {
    background: waaedColors.white,
    borderRadius: waaedBorderRadius.lg,  // 12px
    shadow: waaedShadows.default,        // 0 2px 8px rgba(0,0,0,0.08)
    padding: waaedSpacing['2xl'],        // 24px
    border: `1px solid ${waaedColors.border.light}`, // #F5F5F5
    className: 'bg-white rounded-xl shadow-sm border border-gray-100 p-6'
  },
  
  button: {
    primary: {
      backgroundColor: waaedColors.primary,
      color: waaedColors.white,
      borderColor: waaedColors.primary,
      className: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700'
    },
    secondary: {
      backgroundColor: waaedColors.green,
      color: waaedColors.white,
      borderColor: waaedColors.green,
      className: 'bg-green-500 text-white border-green-500 hover:bg-green-600 hover:border-green-600'
    },
    outline: {
      backgroundColor: 'transparent',
      color: waaedColors.primary,
      borderColor: waaedColors.primary,
      className: 'bg-transparent text-blue-600 border-blue-600 hover:bg-blue-50'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: waaedColors.gray[700],
      borderColor: 'transparent',
      className: 'bg-transparent text-gray-700 border-transparent hover:bg-gray-100'
    }
  },
  
  input: {
    base: {
      borderColor: waaedColors.border.default,
      borderRadius: waaedBorderRadius.md,
      padding: `${waaedSpacing.sm} ${waaedSpacing.md}`,
      className: 'border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
    },
    error: {
      borderColor: waaedColors.error,
      className: 'border-red-500 focus:ring-red-500 focus:border-red-500'
    }
  },
  
  badge: {
    primary: {
      backgroundColor: waaedColors.primary,
      color: waaedColors.white,
      className: 'bg-blue-600 text-white'
    },
    success: {
      backgroundColor: waaedColors.green,
      color: waaedColors.white,
      className: 'bg-green-500 text-white'
    },
    warning: {
      backgroundColor: waaedColors.warning,
      color: waaedColors.white,
      className: 'bg-yellow-500 text-white'
    },
    error: {
      backgroundColor: waaedColors.error,
      color: waaedColors.white,
      className: 'bg-red-500 text-white'
    },
    outline: {
      backgroundColor: 'transparent',
      color: waaedColors.gray[700],
      borderColor: waaedColors.border.default,
      className: 'bg-transparent text-gray-700 border border-gray-300'
    }
  }
}

export const getWaaedColor = (colorPath: string): string => {
  const keys = colorPath.split('.')
  let result: any = waaedColors
  
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key]
    } else {
      return waaedColors.primary // fallback
    }
  }
  
  return typeof result === 'string' ? result : waaedColors.primary
}

export const getWaaedTypography = (variant: keyof typeof waaedTypography) => {
  return waaedTypography[variant] || waaedTypography.body
}

export const getWaaedSpacing = (size: keyof typeof waaedSpacing): string => {
  return waaedSpacing[size] || waaedSpacing.md
}

export const waaedCSSVariables = {
  '--waaed-primary': waaedColors.primary,
  '--waaed-green': waaedColors.green,
  '--waaed-light-green': waaedColors.lightGreen,
  '--waaed-dark-teal': waaedColors.darkTeal,
  '--waaed-light-gray': waaedColors.lightGray,
  '--waaed-background': waaedColors.background.primary,
  '--waaed-text': waaedColors.gray[900],
  '--waaed-border': waaedColors.border.default,
  '--waaed-shadow': waaedShadows.default,
  '--waaed-radius': waaedBorderRadius.lg,
}

export const waaedBreakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

export const waaedAnimations = {
  transition: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  }
}

export const waaedDesignSystem = {
  colors: waaedColors,
  typography: waaedTypography,
  spacing: waaedSpacing,
  borderRadius: waaedBorderRadius,
  shadows: waaedShadows,
  components: waaedComponents,
  breakpoints: waaedBreakpoints,
  animations: waaedAnimations,
  cssVariables: waaedCSSVariables,
}

export default waaedDesignSystem
