import React, { useState, useEffect } from 'react'
import { MapPin, AlertCircle, CheckCircle, Settings, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'

interface LocationPermissionHandlerProps {
  onPermissionGranted?: (position: GeolocationPosition) => void
  onPermissionDenied?: () => void
  children?: React.ReactNode
  showPermissionUI?: boolean
}

type PermissionState = 'unknown' | 'requesting' | 'granted' | 'denied' | 'unavailable'

const LocationPermissionHandler: React.FC<LocationPermissionHandlerProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  children,
  showPermissionUI = true,
}) => {
  const [permissionState, setPermissionState] = useState<PermissionState>('unknown')
  const [currentPosition, setCurrentPosition] = useState<GeolocationPosition | null>(null)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const [watchId, setWatchId] = useState<number | null>(null)

  useEffect(() => {
    checkInitialPermission()
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  const checkInitialPermission = async () => {
    if (!navigator.geolocation) {
      setPermissionState('unavailable')
      return
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      
      switch (permission.state) {
        case 'granted':
          setPermissionState('granted')
          getCurrentPosition()
          break
        case 'denied':
          setPermissionState('denied')
          onPermissionDenied?.()
          break
        default:
          setPermissionState('unknown')
      }

      permission.addEventListener('change', () => {
        setPermissionState(permission.state as PermissionState)
        if (permission.state === 'granted') {
          getCurrentPosition()
        } else if (permission.state === 'denied') {
          onPermissionDenied?.()
        }
      })
    } catch {
      setPermissionState('unknown')
    }
  }

  const requestPermission = () => {
    if (!navigator.geolocation) {
      setPermissionState('unavailable')
      toast.error('Geolocation is not supported by this browser')
      return
    }

    setPermissionState('requesting')
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPermissionState('granted')
        setCurrentPosition(position)
        setAccuracy(position.coords.accuracy)
        onPermissionGranted?.(position)
        toast.success('Location permission granted')
      },
      (error) => {
        setPermissionState('denied')
        onPermissionDenied?.()
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Location access denied. Please enable location permissions in your browser settings.')
            break
          case error.POSITION_UNAVAILABLE:
            toast.error('Location information is unavailable.')
            break
          case error.TIMEOUT:
            toast.error('Location request timed out.')
            break
          default:
            toast.error('An unknown error occurred while retrieving location.')
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const getCurrentPosition = () => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition(position)
        setAccuracy(position.coords.accuracy)
        onPermissionGranted?.(position)
      },
      (error) => {
        console.error('Error getting current position:', error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const startWatchingPosition = () => {
    if (!navigator.geolocation || permissionState !== 'granted') return

    setIsWatching(true)
    
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setCurrentPosition(position)
        setAccuracy(position.coords.accuracy)
        onPermissionGranted?.(position)
      },
      (error) => {
        console.error('Error watching position:', error)
        setIsWatching(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000
      }
    )
    
    setWatchId(id)
  }

  const stopWatchingPosition = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setIsWatching(false)
  }

  const openLocationSettings = () => {
    toast.info('Please enable location permissions in your browser settings and refresh the page.')
  }

  const getAccuracyBadge = () => {
    if (!accuracy) return null

    let variant: 'default' | 'secondary' | 'destructive' = 'default'
    let label = 'Good'

    if (accuracy > 100) {
      variant = 'destructive'
      label = 'Poor'
    } else if (accuracy > 50) {
      variant = 'secondary'
      label = 'Fair'
    }

    return (
      <Badge variant={variant} className="text-xs">
        {label} ({Math.round(accuracy)}m)
      </Badge>
    )
  }

  if (!showPermissionUI && permissionState === 'granted') {
    return <>{children}</>
  }

  if (permissionState === 'unavailable') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Location Unavailable
          </CardTitle>
          <CardDescription>
            Geolocation is not supported by this browser
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your browser does not support location services. Please use a modern browser with geolocation support.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (permissionState === 'denied') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Location Access Denied
          </CardTitle>
          <CardDescription>
            Location permission is required for attendance tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Location access has been denied. Please enable location permissions to use attendance features.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <h4 className="font-medium">To enable location access:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Click the location icon in your browser's address bar</li>
              <li>Select "Allow" for location permissions</li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className="flex gap-2">
            <Button onClick={requestPermission} className="flex-1">
              Try Again
            </Button>
            <Button variant="outline" onClick={openLocationSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (permissionState === 'requesting') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Requesting Location Access
          </CardTitle>
          <CardDescription>
            Please allow location access when prompted
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-muted-foreground">
              Your browser should show a location permission prompt. Please click "Allow" to continue.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (permissionState === 'granted') {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Location Access Granted
            </CardTitle>
            <CardDescription>
              Your location is being tracked for attendance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentPosition && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Latitude:</span>
                    <span className="ml-2 font-mono">
                      {currentPosition.coords.latitude.toFixed(6)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Longitude:</span>
                    <span className="ml-2 font-mono">
                      {currentPosition.coords.longitude.toFixed(6)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="ml-2">{getAccuracyBadge()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="ml-2 text-xs">
                      {new Date(currentPosition.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentPosition}
                  className="flex-1"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Refresh Location
                </Button>
                
                {!isWatching ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startWatchingPosition}
                    className="flex-1"
                  >
                    Start Tracking
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopWatchingPosition}
                    className="flex-1"
                  >
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Stop Tracking
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {children}
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Permission Required
        </CardTitle>
        <CardDescription>
          Enable location access for attendance tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium">Location Access Needed</h3>
            <p className="text-sm text-muted-foreground">
              We need access to your location to verify you're at an authorized workplace for attendance tracking.
            </p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Why we need location:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Verify you're at an authorized workplace</li>
            <li>• Prevent attendance fraud</li>
            <li>• Ensure accurate time tracking</li>
            <li>• Comply with workplace policies</li>
          </ul>
        </div>

        <Button onClick={requestPermission} className="w-full">
          <MapPin className="w-4 h-4 mr-2" />
          Enable Location Access
        </Button>
      </CardContent>
    </Card>
  )
}

export default LocationPermissionHandler
