import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { cn } from '../../lib/utils'

interface ErrorDisplayProps {
  title?: string
  message?: string
  error?: Error
  onRetry?: () => void
  onGoHome?: () => void
  className?: string
  variant?: 'default' | 'minimal' | 'inline'
  showDetails?: boolean
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again or contact support if the problem persists.',
  error,
  onRetry,
  onGoHome,
  className,
  variant = 'default',
  showDetails = false
}) => {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-3">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md', className)}>
        <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-red-800">{message}</p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} size="sm" variant="outline">
            <RefreshCw className="h-3 w-3" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className={cn('flex items-center justify-center p-4', className)}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {showDetails && error && (
            <div className="bg-muted p-3 rounded-md">
              <p className="text-sm font-medium text-red-600 mb-2">Error Details:</p>
              <p className="text-xs text-muted-foreground font-mono">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs cursor-pointer">Stack Trace</summary>
                  <pre className="text-xs mt-2 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <div className="flex space-x-2">
            {onRetry && (
              <Button onClick={onRetry} className="flex-1">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            {onGoHome && (
              <Button onClick={onGoHome} variant="outline" className="flex-1">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface LoadingStateProps {
  isLoading: boolean
  error?: Error | string | null
  onRetry?: () => void
  loadingText?: string
  errorTitle?: string
  errorMessage?: string
  children: React.ReactNode
  className?: string
  loadingVariant?: 'spinner' | 'skeleton' | 'page'
  errorVariant?: 'default' | 'minimal' | 'inline'
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  onRetry,
  loadingText = 'Loading...',
  errorTitle,
  errorMessage,
  children,
  className,
  loadingVariant = 'spinner',
  errorVariant = 'default'
}) => {
  if (isLoading) {
    if (loadingVariant === 'page') {
      return (
        <div className={cn('min-h-screen flex items-center justify-center', className)}>
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">{loadingText}</p>
          </div>
        </div>
      )
    }

    if (loadingVariant === 'skeleton') {
      return (
        <div className={cn('space-y-4', className)}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      )
    }

    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    )
  }

  if (error) {
    const errorObj = error instanceof Error ? error : new Error(typeof error === 'string' ? error : 'Unknown error')
    return (
      <ErrorDisplay
        title={errorTitle}
        message={errorMessage}
        error={errorObj}
        onRetry={onRetry}
        className={className}
        variant={errorVariant}
        showDetails={import.meta.env.DEV}
      />
    )
  }

  return <>{children}</>
}

export default ErrorDisplay
