import { useState, useEffect, useCallback } from 'react'

interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface UseAsyncOptions<T> {
  immediate?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  dependencies: readonly unknown[] = [],
  options: UseAsyncOptions<T> = {}
) {
  const { immediate = true, onSuccess, onError } = options
  
  const [state, setState] = useState<UseAsyncState<T>>({
    data: null,
    loading: immediate,
    error: null
  })

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const data = await asyncFunction()
      setState({ data, loading: false, error: null })
      onSuccess?.(data)
      return data
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error')
      setState({ data: null, loading: false, error: errorObj })
      onError?.(errorObj)
      throw errorObj
    }
  }, dependencies)

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  const retry = useCallback(() => {
    return execute()
  }, [execute])

  return {
    ...state,
    execute,
    retry
  }
}

export function useAsyncCallback<T extends readonly unknown[], R>(
  asyncFunction: (...args: T) => Promise<R>,
  dependencies: readonly unknown[] = []
) {
  const [state, setState] = useState<UseAsyncState<R>>({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (...args: T) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const data = await asyncFunction(...args)
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error')
      setState({ data: null, loading: false, error: errorObj })
      throw errorObj
    }
  }, dependencies)

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset
  }
}

export default useAsync
