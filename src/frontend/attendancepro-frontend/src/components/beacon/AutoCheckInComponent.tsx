import React, { useState, useEffect } from 'react'
import { CheckCircle, Clock, MapPin, Bluetooth, AlertCircle, Settings } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Switch } from '../ui/switch'
import attendanceService from '../../services/attendanceService'

interface BeaconData {
  id: string
  name?: string
  proximity: 'immediate' | 'near' | 'far' | 'unknown'
  distance: number
  rssi: number
  location?: string
}

interface AutoCheckInSettings {
  enabled: boolean
  proximityThreshold: 'immediate' | 'near'
  cooldownPeriod: number
  requireConfirmation: boolean
  allowedTimeWindow?: {
    start: string
    end: string
  }
}

interface AutoCheckInComponentProps {
  detectedBeacons: BeaconData[]
  authorizedBeacons: string[]
  onCheckInSuccess?: (beacon: BeaconData) => void
  onCheckInError?: (error: string) => void
  initialSettings?: Partial<AutoCheckInSettings>
}

const AutoCheckInComponent: React.FC<AutoCheckInComponentProps> = ({
  detectedBeacons,
  authorizedBeacons,
  onCheckInSuccess,
  onCheckInError,
  initialSettings = {},
}) => {
  const [settings, setSettings] = useState<AutoCheckInSettings>({
    enabled: false,
    proximityThreshold: 'immediate',
    cooldownPeriod: 300000, // 5 minutes
    requireConfirmation: true,
    ...initialSettings,
  })

  const [lastCheckInTime, setLastCheckInTime] = useState<number | null>(null)
  const [isProcessingCheckIn, setIsProcessingCheckIn] = useState(false)
  const [pendingCheckIn, setPendingCheckIn] = useState<BeaconData | null>(null)
  const [checkInHistory, setCheckInHistory] = useState<Array<{
    timestamp: number
    beacon: BeaconData
    success: boolean
  }>>([])

  useEffect(() => {
    if (settings.enabled) {
      checkForAutoCheckIn()
    }
  }, [detectedBeacons, settings])

  const checkForAutoCheckIn = () => {
    if (!settings.enabled || isProcessingCheckIn) return

    const eligibleBeacons = detectedBeacons.filter(beacon => 
      isAuthorizedBeacon(beacon) &&
      isWithinProximityThreshold(beacon) &&
      isWithinTimeWindow() &&
      !isInCooldownPeriod()
    )

    if (eligibleBeacons.length > 0) {
      const nearestBeacon = eligibleBeacons.reduce((prev, current) => 
        prev.distance < current.distance ? prev : current
      )

      if (settings.requireConfirmation) {
        setPendingCheckIn(nearestBeacon)
      } else {
        performAutoCheckIn(nearestBeacon)
      }
    }
  }

  const isAuthorizedBeacon = (beacon: BeaconData): boolean => {
    return authorizedBeacons.includes(beacon.id) || 
           (beacon.name && authorizedBeacons.includes(beacon.name)) ||
           authorizedBeacons.length === 0
  }

  const isWithinProximityThreshold = (beacon: BeaconData): boolean => {
    if (settings.proximityThreshold === 'immediate') {
      return beacon.proximity === 'immediate'
    }
    return ['immediate', 'near'].includes(beacon.proximity)
  }

  const isWithinTimeWindow = (): boolean => {
    if (!settings.allowedTimeWindow) return true

    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    return isTimeInRange(
      currentTime,
      settings.allowedTimeWindow.start,
      settings.allowedTimeWindow.end
    )
  }

  const isTimeInRange = (current: string, start: string, end: string): boolean => {
    const currentMinutes = timeToMinutes(current)
    const startMinutes = timeToMinutes(start)
    const endMinutes = timeToMinutes(end)

    if (startMinutes <= endMinutes) {
      return currentMinutes >= startMinutes && currentMinutes <= endMinutes
    } else {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes
    }
  }

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const isInCooldownPeriod = (): boolean => {
    if (!lastCheckInTime) return false
    return Date.now() - lastCheckInTime < settings.cooldownPeriod
  }

  const performAutoCheckIn = async (beacon: BeaconData) => {
    setIsProcessingCheckIn(true)
    setPendingCheckIn(null)

    try {
      const checkInData = {
        location: {
          latitude: 0, // Will be filled by geolocation if available
          longitude: 0,
          accuracy: beacon.distance,
        },
        checkInType: 'beacon' as const,
        beaconData: {
          uuid: beacon.id,
          major: 1,
          minor: 1,
          rssi: beacon.rssi,
          distance: beacon.distance,
        },
      }

      const result = await attendanceService.checkIn(checkInData)

      if (result.id) {
        setLastCheckInTime(Date.now())
        setCheckInHistory(prev => [...prev, {
          timestamp: Date.now(),
          beacon,
          success: true,
        }])
        
        toast.success(`Auto check-in successful via ${beacon.name || beacon.id}`)
        onCheckInSuccess?.(beacon)
      } else {
        throw new Error('Check-in failed')
      }
    } catch (error: unknown) {
      setCheckInHistory(prev => [...prev, {
        timestamp: Date.now(),
        beacon,
        success: false,
      }])
      
      const errorMessage = error instanceof Error ? error.message : 'Auto check-in failed'
      toast.error(errorMessage)
      onCheckInError?.(errorMessage)
    } finally {
      setIsProcessingCheckIn(false)
    }
  }

  const handleConfirmCheckIn = () => {
    if (pendingCheckIn) {
      performAutoCheckIn(pendingCheckIn)
    }
  }

  const handleCancelCheckIn = () => {
    setPendingCheckIn(null)
  }

  const updateSettings = (key: keyof AutoCheckInSettings, value: unknown) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const getCooldownTimeRemaining = (): number => {
    if (!lastCheckInTime) return 0
    const remaining = settings.cooldownPeriod - (Date.now() - lastCheckInTime)
    return Math.max(0, remaining)
  }

  const formatCooldownTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000)
    const seconds = Math.floor((milliseconds % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bluetooth className="w-5 h-5" />
          Auto Check-In
        </CardTitle>
        <CardDescription>
          Automatic attendance tracking based on beacon proximity
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.enabled}
              onCheckedChange={(checked) => updateSettings('enabled', checked)}
            />
            <span className="text-sm font-medium">
              Auto Check-In {settings.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <Badge variant={settings.enabled ? 'default' : 'secondary'}>
            {settings.enabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {settings.enabled && (
          <>
            {pendingCheckIn && (
              <Alert className="bg-blue-50 border-blue-200">
                <MapPin className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <div className="space-y-3">
                    <div>
                      <strong>Auto check-in detected!</strong>
                      <br />
                      Beacon: {pendingCheckIn.name || pendingCheckIn.id}
                      <br />
                      Distance: {pendingCheckIn.distance.toFixed(1)}m
                      <br />
                      Location: {pendingCheckIn.location || 'Unknown'}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleConfirmCheckIn}
                        disabled={isProcessingCheckIn}
                      >
                        {isProcessingCheckIn ? 'Processing...' : 'Confirm Check-In'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelCheckIn}
                        disabled={isProcessingCheckIn}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {isInCooldownPeriod() && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Cooldown period active. Next auto check-in available in{' '}
                  {formatCooldownTime(getCooldownTimeRemaining())}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <h4 className="font-medium text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Proximity Threshold:</span>
                  <div className="font-medium">{settings.proximityThreshold}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Cooldown Period:</span>
                  <div className="font-medium">
                    {Math.floor(settings.cooldownPeriod / 60000)} minutes
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Require Confirmation:</span>
                  <div className="font-medium">
                    {settings.requireConfirmation ? 'Yes' : 'No'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Authorized Beacons:</span>
                  <div className="font-medium">{authorizedBeacons.length}</div>
                </div>
              </div>
            </div>

            {checkInHistory.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Recent Auto Check-Ins:</h4>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {checkInHistory.slice(-3).reverse().map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded"
                    >
                      <div className="flex items-center gap-2">
                        {entry.success ? (
                          <CheckCircle className="w-3 h-3 text-green-600" />
                        ) : (
                          <AlertCircle className="w-3 h-3 text-red-600" />
                        )}
                        <span>{entry.beacon.name || entry.beacon.id}</span>
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!settings.enabled && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Auto check-in is disabled. Enable it to automatically track attendance 
              when you're near authorized beacons.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default AutoCheckInComponent
