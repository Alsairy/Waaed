import React, { useState, useEffect } from 'react'
import { Wifi, WifiOff, Download, Upload, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'

interface CachedLocationData {
  id: string
  timestamp: number
  position: {
    latitude: number
    longitude: number
    accuracy: number
  }
  action: 'check_in' | 'check_out' | 'location_update'
  synced: boolean
  retryCount: number
}

interface OfflineLocationCacheProps {
  onDataSync?: (data: CachedLocationData[]) => Promise<void>
  maxCacheSize?: number
  syncInterval?: number
}

const OfflineLocationCache: React.FC<OfflineLocationCacheProps> = ({
  onDataSync,
  maxCacheSize = 100,
  syncInterval = 30000, // 30 seconds
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [cachedData, setCachedData] = useState<CachedLocationData[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)

  useEffect(() => {
    loadCachedData()
    setupNetworkListeners()
    setupAutoSync()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (isOnline && cachedData.some(item => !item.synced)) {
      syncCachedData()
    }
  }, [isOnline, cachedData])

  const setupNetworkListeners = () => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
  }

  const handleOnline = () => {
    setIsOnline(true)
    toast.success('Connection restored - syncing cached data...')
  }

  const handleOffline = () => {
    setIsOnline(false)
    toast.info('Working offline - data will be cached locally')
  }

  const setupAutoSync = () => {
    const interval = setInterval(() => {
      if (isOnline && cachedData.some(item => !item.synced)) {
        syncCachedData()
      }
    }, syncInterval)

    return () => clearInterval(interval)
  }

  const loadCachedData = () => {
    try {
      const stored = localStorage.getItem('attendance_location_cache')
      if (stored) {
        const data = JSON.parse(stored) as CachedLocationData[]
        setCachedData(data)
      }
    } catch (error) {
      console.error('Error loading cached data:', error)
    }
  }

  const saveCachedData = (data: CachedLocationData[]) => {
    try {
      localStorage.setItem('attendance_location_cache', JSON.stringify(data))
      setCachedData(data)
    } catch (error) {
      console.error('Error saving cached data:', error)
      toast.error('Failed to cache data locally')
    }
  }



  const syncCachedData = async () => {
    if (isSyncing || !isOnline) return

    const unsyncedData = cachedData.filter(item => !item.synced)
    if (unsyncedData.length === 0) return

    setIsSyncing(true)
    setSyncProgress(0)

    try {
      if (onDataSync) {
        await onDataSync(unsyncedData)
      }

      const syncedData = cachedData.map(item => 
        unsyncedData.find(unsynced => unsynced.id === item.id)
          ? { ...item, synced: true }
          : item
      )

      saveCachedData(syncedData)
      setLastSyncTime(new Date())
      setSyncProgress(100)
      
      toast.success(`Synced ${unsyncedData.length} cached items`)
    } catch (error) {
      console.error('Sync failed:', error)
      
      const updatedData = cachedData.map(item => {
        const unsyncedItem = unsyncedData.find(unsynced => unsynced.id === item.id)
        return unsyncedItem
          ? { ...item, retryCount: item.retryCount + 1 }
          : item
      })
      
      saveCachedData(updatedData)
      toast.error('Failed to sync some cached data - will retry later')
    } finally {
      setIsSyncing(false)
      setTimeout(() => setSyncProgress(0), 2000)
    }
  }

  const clearSyncedData = () => {
    const unsyncedData = cachedData.filter(item => !item.synced)
    saveCachedData(unsyncedData)
    toast.success('Cleared synced cache data')
  }

  const forceClearCache = () => {
    saveCachedData([])
    toast.success('Cache cleared completely')
  }

  const getStatusIcon = () => {
    if (isSyncing) {
      return <Download className="w-4 h-4 animate-pulse" />
    }
    return isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />
  }

  const getStatusColor = () => {
    if (isSyncing) return 'text-blue-600'
    return isOnline ? 'text-green-600' : 'text-orange-600'
  }

  const unsyncedCount = cachedData.filter(item => !item.synced).length
  const totalCacheSize = cachedData.length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          Offline Cache
        </CardTitle>
        <CardDescription>
          Location data caching for offline functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={isOnline ? 'default' : 'secondary'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
            {unsyncedCount > 0 && (
              <Badge variant="destructive">
                {unsyncedCount} unsynced
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {totalCacheSize}/{maxCacheSize} cached
          </div>
        </div>

        {isSyncing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 animate-pulse" />
              <span className="text-sm">Syncing cached data...</span>
            </div>
            <Progress value={syncProgress} className="w-full" />
          </div>
        )}

        {!isOnline && unsyncedCount > 0 && (
          <Alert>
            <WifiOff className="h-4 w-4" />
            <AlertDescription>
              You're offline. {unsyncedCount} location updates are cached and will sync when connection is restored.
            </AlertDescription>
          </Alert>
        )}

        {isOnline && unsyncedCount > 0 && (
          <Alert>
            <Upload className="h-4 w-4" />
            <AlertDescription>
              {unsyncedCount} cached items waiting to sync. 
              <Button
                variant="link"
                size="sm"
                onClick={syncCachedData}
                disabled={isSyncing}
                className="ml-2 p-0 h-auto"
              >
                Sync now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {lastSyncTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Last synced: {lastSyncTime.toLocaleTimeString()}</span>
          </div>
        )}

        {totalCacheSize > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Cache Management:</h4>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearSyncedData}
                disabled={cachedData.filter(item => item.synced).length === 0}
              >
                Clear Synced
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={forceClearCache}
                disabled={totalCacheSize === 0}
              >
                Clear All
              </Button>
              {isOnline && unsyncedCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={syncCachedData}
                  disabled={isSyncing}
                >
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </Button>
              )}
            </div>
          </div>
        )}

        {cachedData.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent Cache Items:</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {cachedData.slice(-5).reverse().map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center gap-2">
                    {item.synced ? (
                      <CheckCircle className="w-3 h-3 text-green-600" />
                    ) : (
                      <Clock className="w-3 h-3 text-orange-600" />
                    )}
                    <span className="capitalize">{item.action.replace('_', ' ')}</span>
                  </div>
                  <div className="text-muted-foreground">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { OfflineLocationCache, type CachedLocationData }
export default OfflineLocationCache
