import { toast } from 'sonner'

interface AxiosError {
  response?: {
    status: number
    data?: {
      message?: string
      error?: string
      code?: string
    }
  }
  request?: unknown
  message?: string
}

interface FetchError {
  message?: string
  status?: number
  code?: string
}

type ErrorInput = Error | AxiosError | FetchError | { message?: string; code?: string; status?: number } | string | unknown

export interface ApiError extends Error {
  status?: number
  code?: string
  details?: unknown
}

export class WaaedError extends Error implements ApiError {
  status?: number
  code?: string
  details?: unknown

  constructor(message: string, status?: number, code?: string, details?: unknown) {
    super(message)
    this.name = 'WaaedError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export const createApiError = (error: ErrorInput): WaaedError => {
  if (error instanceof WaaedError) {
    return error
  }

  if (typeof error === 'string') {
    return new WaaedError(error, undefined, 'STRING_ERROR')
  }

  const errorObj = error as AxiosError | FetchError | { message?: string; code?: string; status?: number }

  if ('response' in errorObj && errorObj.response) {
    const { status, data } = errorObj.response
    const message = data?.message || data?.error || 'An API error occurred'
    return new WaaedError(message, status, data?.code, data)
  }

  if ('request' in errorObj && errorObj.request) {
    return new WaaedError('Network error - please check your connection', 0, 'NETWORK_ERROR')
  }

  const message = errorObj?.message || 'An unexpected error occurred'
  const status = 'status' in errorObj ? errorObj.status : undefined
  const code = 'code' in errorObj ? errorObj.code || 'UNKNOWN_ERROR' : 'UNKNOWN_ERROR'
  
  return new WaaedError(message, status, code)
}

export const getErrorMessage = (error: ErrorInput): string => {
  if (error instanceof WaaedError) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  const errorObj = error as AxiosError | FetchError | { message?: string }

  if ('response' in errorObj && errorObj.response?.data?.message) {
    return errorObj.response.data.message
  }

  if (errorObj?.message) {
    return errorObj.message
  }

  return 'An unexpected error occurred'
}

export const getErrorTitle = (error: ErrorInput): string => {
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

export const handleApiError = (error: ErrorInput, options: {
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

export const withErrorHandling = <T extends readonly unknown[], R>(
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
  let lastError: ErrorInput

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

export const isNetworkError = (error: ErrorInput): boolean => {
  const errorObj = error as { code?: string; message?: string }
  return (errorObj?.code === 'NETWORK_ERROR') || 
         (errorObj?.message?.includes('Network Error') ?? false) ||
         (errorObj?.message?.includes('fetch') ?? false)
}

export const isAuthError = (error: ErrorInput): boolean => {
  const errorObj = error as { status?: number; code?: string }
  return (errorObj?.status === 401) || (errorObj?.code === 'UNAUTHORIZED')
}

export const isValidationError = (error: ErrorInput): boolean => {
  const errorObj = error as { status?: number; code?: string }
  return (errorObj?.status === 400) || (errorObj?.code === 'VALIDATION_ERROR')
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
