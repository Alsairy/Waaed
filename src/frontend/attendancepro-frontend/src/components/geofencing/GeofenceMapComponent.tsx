import React, { useState, useEffect } from 'react'
import { MapPin, Navigation, AlertCircle, CheckCircle, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'

interface GeofenceArea {
  id: string
  name: string
  center: {
    latitude: number
    longitude: number
  }
  radius: number
  isActive: boolean
  allowedHours?: {
    start: string
    end: string
  }
}

interface GeofenceMapComponentProps {
  currentPosition?: GeolocationPosition
  geofences?: GeofenceArea[]
  onLocationValidated?: (isValid: boolean, geofence?: GeofenceArea) => void
  showValidationStatus?: boolean
  enableInteraction?: boolean
}

const GeofenceMapComponent: React.FC<GeofenceMapComponentProps> = ({
  currentPosition,
  geofences = [],
  onLocationValidated,
  showValidationStatus = true,
  enableInteraction = true,
}) => {
  const [validationStatus, setValidationStatus] = useState<{
    isValid: boolean
    geofence?: GeofenceArea
    distance?: number
  } | null>(null)
  const [mapCenter, setMapCenter] = useState({
    latitude: 24.7136, // Default to Riyadh
    longitude: 46.6753
  })

  useEffect(() => {
    if (currentPosition) {
      setMapCenter({
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude
      })
      validateCurrentLocation()
    }
  }, [currentPosition, geofences])

  const validateCurrentLocation = () => {
    if (!currentPosition || geofences.length === 0) {
      setValidationStatus(null)
      return
    }

    const userLat = currentPosition.coords.latitude
    const userLng = currentPosition.coords.longitude

    for (const geofence of geofences) {
      if (!geofence.isActive) continue

      const distance = calculateDistance(
        userLat,
        userLng,
        geofence.center.latitude,
        geofence.center.longitude
      )

      if (distance <= geofence.radius) {
        const isWithinHours = checkAllowedHours(geofence.allowedHours)
        
        if (isWithinHours) {
          setValidationStatus({
            isValid: true,
            geofence,
            distance
          })
          onLocationValidated?.(true, geofence)
          return
        }
      }
    }

    const nearestGeofence = findNearestGeofence(userLat, userLng)
    setValidationStatus({
      isValid: false,
      geofence: nearestGeofence?.geofence,
      distance: nearestGeofence?.distance
    })
    onLocationValidated?.(false)
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lng2 - lng1) * Math.PI / 180

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
  }

  const findNearestGeofence = (lat: number, lng: number): { geofence: GeofenceArea; distance: number } | null => {
    let nearest: { geofence: GeofenceArea; distance: number } | null = null
    let minDistance = Infinity

    for (const geofence of geofences) {
      const distance = calculateDistance(lat, lng, geofence.center.latitude, geofence.center.longitude)
      if (distance < minDistance) {
        minDistance = distance
        nearest = { geofence, distance }
      }
    }

    return nearest
  }

  const checkAllowedHours = (allowedHours?: { start: string; end: string }): boolean => {
    if (!allowedHours) return true

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = allowedHours.start.split(':').map(Number)
    const [endHour, endMin] = allowedHours.end.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    return currentTime >= startTime && currentTime <= endTime
  }

  const renderMapPlaceholder = () => {
    return (
      <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto" />
            <p className="text-sm text-gray-500">Interactive Map</p>
            <p className="text-xs text-gray-400">
              {currentPosition ? 'Showing your location and geofences' : 'Waiting for location...'}
            </p>
          </div>
        </div>

        {currentPosition && (
          <div className="absolute inset-0">
            <svg viewBox="0 0 400 256" className="w-full h-full">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
                </pattern>
              </defs>
              
              <rect width="400" height="256" fill="url(#grid)" />
              
              {geofences.map((geofence) => {
                const x = 200 + (geofence.center.longitude - mapCenter.longitude) * 1000
                const y = 128 - (geofence.center.latitude - mapCenter.latitude) * 1000
                const r = Math.max(20, geofence.radius / 10)
                
                return (
                  <g key={geofence.id}>
                    <circle
                      cx={x}
                      cy={y}
                      r={r}
                      fill={geofence.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(156, 163, 175, 0.2)'}
                      stroke={geofence.isActive ? '#22c55e' : '#9ca3af'}
                      strokeWidth="2"
                      strokeDasharray={geofence.isActive ? 'none' : '5,5'}
                    />
                    <text
                      x={x}
                      y={y + r + 15}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {geofence.name}
                    </text>
                  </g>
                )
              })}
              
              <circle
                cx="200"
                cy="128"
                r="6"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2"
              />
              <circle
                cx="200"
                cy="128"
                r="12"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  values="12;20;12"
                  dur="2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0;0.5"
                  dur="2s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        )}

        {enableInteraction && (
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Zoom in functionality */}}
              className="w-8 h-8 p-0"
            >
              <ZoomIn className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* Zoom out functionality */}}
              className="w-8 h-8 p-0"
            >
              <ZoomOut className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (currentPosition) {
                  setMapCenter({
                    latitude: currentPosition.coords.latitude,
                    longitude: currentPosition.coords.longitude
                  })
                }
              }}
              className="w-8 h-8 p-0"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  const renderValidationStatus = () => {
    if (!showValidationStatus || !validationStatus) return null

    return (
      <Alert className={validationStatus.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        {validationStatus.isValid ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-600" />
        )}
        <AlertDescription className={validationStatus.isValid ? 'text-green-800' : 'text-red-800'}>
          {validationStatus.isValid ? (
            <>
              ✅ You are within the authorized area "{validationStatus.geofence?.name}"
              {validationStatus.distance && (
                <span className="block text-sm mt-1">
                  Distance from center: {Math.round(validationStatus.distance)}m
                </span>
              )}
            </>
          ) : (
            <>
              ❌ You are outside authorized areas
              {validationStatus.geofence && validationStatus.distance && (
                <span className="block text-sm mt-1">
                  Nearest area: "{validationStatus.geofence.name}" ({Math.round(validationStatus.distance)}m away)
                </span>
              )}
            </>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          Location &amp; Geofences
        </CardTitle>
        <CardDescription>
          Your current location and authorized work areas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderMapPlaceholder()}
        
        {renderValidationStatus()}

        {geofences.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Authorized Areas:</h4>
            <div className="grid gap-2">
              {geofences.map((geofence) => (
                <div
                  key={geofence.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        geofence.isActive ? 'bg-green-500' : 'bg-gray-400'
                      }`}
                    />
                    <span className="text-sm font-medium">{geofence.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {geofence.radius}m radius
                    </Badge>
                    {geofence.allowedHours && (
                      <Badge variant="secondary" className="text-xs">
                        {geofence.allowedHours.start}-{geofence.allowedHours.end}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentPosition && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div>
              Current Location: {currentPosition.coords.latitude.toFixed(6)}, {currentPosition.coords.longitude.toFixed(6)}
            </div>
            <div>
              Accuracy: ±{Math.round(currentPosition.coords.accuracy)}m
            </div>
            <div>
              Last Updated: {new Date(currentPosition.timestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default GeofenceMapComponent
