import { toast } from 'sonner'

export interface ApiError extends Error {
  status?: number
  code?: string
  details?: any
}

export class WaaedError extends Error implements ApiError {
  status?: number
  code?: string
  details?: any

  constructor(message: string, status?: number, code?: string, details?: any) {
    super(message)
    this.name = 'WaaedError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const createApiError = (error: any): WaaedError => {
  if (error instanceof WaaedError) {
    return error
  }

  if (error?.response) {
    const { status, data } = error.response
    const message = data?.message || data?.error || 'An API error occurred'
    return new WaaedError(message, status, data?.code, data)
  }

  if (error?.request) {
    return new WaaedError('Network error - please check your connection', 0, 'NETWORK_ERROR')
  }

  return new WaaedError(error?.message || 'An unexpected error occurred', undefined, 'UNKNOWN_ERROR')
}

export const getErrorMessage = (error: any): string => {
  if (error instanceof WaaedError) {
    return error.message
  }

  if (error?.response?.data?.message) {
    return error.response.data.message
  }

  if (error?.message) {
    return error.message
  }

  return 'An unexpected error occurred'
}

export const getErrorTitle = (error: any): string => {
  if (error instanceof WaaedError) {
    switch (error.status) {
      case 400:
        return 'Invalid Request'
      case 401:
        return 'Authentication Required'
      case 403:
        return 'Access Denied'
      case 404:
        return 'Not Found'
      case 500:
        return 'Server Error'
      default:
        return 'Error'
    }
  }

  return 'Error'
}

export const handleApiError = (error: any, options: {
  showToast?: boolean
  toastTitle?: string
  fallbackMessage?: string
} = {}) => {
  const { showToast = true, toastTitle, fallbackMessage } = options
  
  const apiError = createApiError(error)
  const message = apiError.message || fallbackMessage || 'An error occurred'
  
  if (showToast) {
    toast.error(toastTitle || getErrorTitle(apiError), {
      description: message
    })
  }

  console.error('API Error:', apiError)
  return apiError
}

export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: {
    showToast?: boolean
    toastTitle?: string
    fallbackMessage?: string
    onError?: (error: WaaedError) => void
  } = {}
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      const apiError = handleApiError(error, options)
      options.onError?.(apiError)
      throw apiError
    }
  }
}

export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: any

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (attempt === maxRetries) {
        break
      }

      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw createApiError(lastError)
}

export const isNetworkError = (error: any): boolean => {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('Network Error') ||
         error?.message?.includes('fetch')
}

export const isAuthError = (error: any): boolean => {
  return error?.status === 401 || error?.code === 'UNAUTHORIZED'
}

export const isValidationError = (error: any): boolean => {
  return error?.status === 400 || error?.code === 'VALIDATION_ERROR'
}

export default {
  createApiError,
  getErrorMessage,
  getErrorTitle,
  handleApiError,
  withErrorHandling,
  retryWithBackoff,
  isNetworkError,
  isAuthError,
  isValidationError,
  WaaedError
}
