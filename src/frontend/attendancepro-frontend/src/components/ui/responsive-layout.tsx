import React, { ReactNode } from 'react'
import { useBreakpoint } from '../../hooks/use-mobile'
import { cn } from '../../lib/utils'

interface ResponsiveLayoutProps {
  children: ReactNode
  className?: string
  mobileLayout?: ReactNode
  tabletLayout?: ReactNode
  desktopLayout?: ReactNode
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  mobileLayout,
  tabletLayout,
  desktopLayout
}) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint()

  if (isMobile && mobileLayout) {
    return <div className={cn('waaed-mobile-layout', className)}>{mobileLayout}</div>
  }

  if (isTablet && tabletLayout) {
    return <div className={cn('waaed-tablet-layout', className)}>{tabletLayout}</div>
  }

  if (isDesktop && desktopLayout) {
    return <div className={cn('waaed-desktop-layout', className)}>{desktopLayout}</div>
  }

  return <div className={cn('waaed-responsive-layout', className)}>{children}</div>
}

interface ResponsiveGridProps {
  children: ReactNode
  className?: string
  cols?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' }
}) => {
  const { isMobile, isTablet } = useBreakpoint()

  const gridCols = isMobile 
    ? `repeat(${cols.mobile}, 1fr)`
    : isTablet 
    ? `repeat(${cols.tablet}, 1fr)`
    : `repeat(${cols.desktop}, 1fr)`

  const gridGap = isMobile 
    ? gap.mobile
    : isTablet 
    ? gap.tablet
    : gap.desktop

  return (
    <div 
      className={cn('waaed-responsive-grid', className)}
      style={{
        display: 'grid',
        gridTemplateColumns: gridCols,
        gap: gridGap
      }}
    >
      {children}
    </div>
  )
}

interface ResponsiveContainerProps {
  children: ReactNode
  className?: string
  maxWidth?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  padding?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  maxWidth = { mobile: '100%', tablet: '768px', desktop: '1024px' },
  padding = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' }
}) => {
  const { isMobile, isTablet } = useBreakpoint()

  const containerMaxWidth = isMobile 
    ? maxWidth.mobile
    : isTablet 
    ? maxWidth.tablet
    : maxWidth.desktop

  const containerPadding = isMobile 
    ? padding.mobile
    : isTablet 
    ? padding.tablet
    : padding.desktop

  return (
    <div 
      className={cn('waaed-responsive-container', className)}
      style={{
        maxWidth: containerMaxWidth,
        padding: `0 ${containerPadding}`,
        margin: '0 auto',
        width: '100%'
      }}
    >
      {children}
    </div>
  )
}

interface ResponsiveStackProps {
  children: ReactNode
  className?: string
  direction?: {
    mobile?: 'row' | 'column'
    tablet?: 'row' | 'column'
    desktop?: 'row' | 'column'
  }
  spacing?: {
    mobile?: string
    tablet?: string
    desktop?: string
  }
  align?: 'start' | 'center' | 'end' | 'stretch'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className,
  direction = { mobile: 'column', tablet: 'row', desktop: 'row' },
  spacing = { mobile: '1rem', tablet: '1.5rem', desktop: '2rem' },
  align = 'start',
  justify = 'start'
}) => {
  const { isMobile, isTablet } = useBreakpoint()

  const flexDirection = isMobile 
    ? direction.mobile
    : isTablet 
    ? direction.tablet
    : direction.desktop

  const gap = isMobile 
    ? spacing.mobile
    : isTablet 
    ? spacing.tablet
    : spacing.desktop

  const alignItems = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch'
  }[align]

  const justifyContent = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly'
  }[justify]

  return (
    <div 
      className={cn('waaed-responsive-stack', className)}
      style={{
        display: 'flex',
        flexDirection,
        gap,
        alignItems,
        justifyContent
      }}
    >
      {children}
    </div>
  )
}

interface HideOnProps {
  children: ReactNode
  mobile?: boolean
  tablet?: boolean
  desktop?: boolean
}

export const HideOn: React.FC<HideOnProps> = ({
  children,
  mobile = false,
  tablet = false,
  desktop = false
}) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint()

  if ((mobile && isMobile) || (tablet && isTablet) || (desktop && isDesktop)) {
    return null
  }

  return <>{children}</>
}

interface ShowOnProps {
  children: ReactNode
  mobile?: boolean
  tablet?: boolean
  desktop?: boolean
}

export const ShowOn: React.FC<ShowOnProps> = ({
  children,
  mobile = false,
  tablet = false,
  desktop = false
}) => {
  const { isMobile, isTablet, isDesktop } = useBreakpoint()

  if ((mobile && isMobile) || (tablet && isTablet) || (desktop && isDesktop)) {
    return <>{children}</>
  }

  return null
}
