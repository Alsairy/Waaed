import React, { useState, useEffect, useRef } from 'react'
import { Bluetooth, Wifi, WifiOff, CheckCircle, AlertCircle, Loader2, MapPin } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'
import { Progress } from '../ui/progress'

interface BeaconData {
  id: string
  uuid: string
  major: number
  minor: number
  rssi: number
  distance: number
  proximity: 'immediate' | 'near' | 'far' | 'unknown'
  name?: string
  location?: string
}

interface BeaconScannerComponentProps {
  onBeaconDetected?: (beacon: BeaconData) => void
  onCheckInTriggered?: (beacon: BeaconData) => void
  authorizedBeacons?: string[]
  autoCheckIn?: boolean
  scanDuration?: number
}

const BeaconScannerComponent: React.FC<BeaconScannerComponentProps> = ({
  onBeaconDetected,
  onCheckInTriggered,
  authorizedBeacons = [],
  autoCheckIn = false,
  scanDuration = 10000,
}) => {
  const [isScanning, setIsScanning] = useState(false)
  const [detectedBeacons, setDetectedBeacons] = useState<BeaconData[]>([])
  const [bluetoothSupported, setBluetoothSupported] = useState(false)
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [nearestBeacon, setNearestBeacon] = useState<BeaconData | null>(null)

  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    checkBluetoothSupport()
    return () => {
      stopScanning()
    }
  }, [])

  useEffect(() => {
    if (detectedBeacons.length > 0) {
      const nearest = detectedBeacons.reduce((prev, current) => 
        prev.distance < current.distance ? prev : current
      )
      setNearestBeacon(nearest)
      
      if (autoCheckIn && isAuthorizedBeacon(nearest) && nearest.proximity === 'immediate') {
        handleAutoCheckIn(nearest)
      }
    }
  }, [detectedBeacons, autoCheckIn])

  const checkBluetoothSupport = async () => {
    if ('bluetooth' in navigator) {
      setBluetoothSupported(true)
      try {
        const availability = await (navigator as unknown as { bluetooth: { getAvailability(): Promise<boolean> } }).bluetooth.getAvailability()
        setBluetoothEnabled(availability)
      } catch (error) {
        console.warn('Could not check Bluetooth availability:', error)
      }
    } else {
      setBluetoothSupported(false)
      setError('Bluetooth is not supported on this device')
    }
  }

  const requestBluetoothPermission = async () => {
    if (!bluetoothSupported) {
      setError('Bluetooth is not supported on this device')
      return false
    }

    try {
      setError(null)
      await (navigator as unknown as { bluetooth: { requestDevice(options: { acceptAllDevices: boolean; optionalServices: string[] }): Promise<unknown> } }).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service']
      })
      
      setBluetoothEnabled(true)
      toast.success('Bluetooth access granted')
      return true
    } catch {
      setError('Bluetooth access denied. Please enable Bluetooth and grant permission.')
      toast.error('Bluetooth access denied')
      return false
    }
  }

  const startScanning = async () => {
    if (!bluetoothSupported) {
      await requestBluetoothPermission()
      return
    }

    if (!bluetoothEnabled) {
      const granted = await requestBluetoothPermission()
      if (!granted) return
    }

    setIsScanning(true)
    setDetectedBeacons([])
    setScanProgress(0)
    setError(null)

    try {
      scanIntervalRef.current = setInterval(async () => {
        await scanForBeacons()
      }, 1000)

      progressIntervalRef.current = setInterval(() => {
        setScanProgress(prev => {
          const newProgress = prev + (100 / (scanDuration / 100))
          if (newProgress >= 100) {
            stopScanning()
            return 100
          }
          return newProgress
        })
      }, 100)

      setTimeout(() => {
        if (isScanning) {
          stopScanning()
        }
      }, scanDuration)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start beacon scanning'
      setError(errorMessage)
      setIsScanning(false)
      toast.error('Beacon scanning failed')
    }
  }

  const scanForBeacons = async () => {
    try {
      await (navigator as unknown as { bluetooth: { getDevices(): Promise<unknown[]> } }).bluetooth.getDevices()
      
      const mockBeacons: BeaconData[] = [
        {
          id: 'beacon_001',
          uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
          major: 1,
          minor: 1,
          rssi: -45,
          distance: 2.5,
          proximity: 'near',
          name: 'Office Entrance',
          location: 'Main Building - Floor 1'
        },
        {
          id: 'beacon_002',
          uuid: 'E2C56DB5-DFFB-48D2-B060-D0F5A71096E0',
          major: 1,
          minor: 2,
          rssi: -65,
          distance: 8.2,
          proximity: 'far',
          name: 'Conference Room A',
          location: 'Main Building - Floor 2'
        }
      ]

      const filteredBeacons = mockBeacons.filter(() => 
        Math.random() > 0.3
      )

      setDetectedBeacons(filteredBeacons)
      
      filteredBeacons.forEach(beacon => {
        onBeaconDetected?.(beacon)
      })

    } catch (error) {
      console.warn('Beacon scanning error:', error)
    }
  }

  const stopScanning = () => {
    setIsScanning(false)
    setScanProgress(0)
    
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
      scanIntervalRef.current = null
    }
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }
  }

  const isAuthorizedBeacon = (beacon: BeaconData): boolean => {
    return authorizedBeacons.includes(beacon.uuid) || 
           authorizedBeacons.includes(beacon.id) ||
           authorizedBeacons.length === 0
  }

  const handleAutoCheckIn = (beacon: BeaconData) => {
    if (isAuthorizedBeacon(beacon)) {
      onCheckInTriggered?.(beacon)
      toast.success(`Auto check-in triggered by ${beacon.name || beacon.id}`)
    }
  }

  const handleManualCheckIn = (beacon: BeaconData) => {
    if (isAuthorizedBeacon(beacon)) {
      onCheckInTriggered?.(beacon)
      toast.success(`Manual check-in with ${beacon.name || beacon.id}`)
    } else {
      toast.error('This beacon is not authorized for check-in')
    }
  }

  const getProximityColor = (proximity: string) => {
    switch (proximity) {
      case 'immediate': return 'bg-green-100 text-green-800'
      case 'near': return 'bg-blue-100 text-blue-800'
      case 'far': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getProximityIcon = (proximity: string) => {
    switch (proximity) {
      case 'immediate': return <CheckCircle className="w-3 h-3" />
      case 'near': return <MapPin className="w-3 h-3" />
      case 'far': return <Wifi className="w-3 h-3" />
      default: return <WifiOff className="w-3 h-3" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bluetooth className="w-5 h-5" />
          BLE Beacon Scanner
        </CardTitle>
        <CardDescription>
          Scan for nearby Bluetooth beacons for proximity-based attendance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant={bluetoothSupported ? 'default' : 'destructive'}>
              {bluetoothSupported ? 'Bluetooth Supported' : 'Not Supported'}
            </Badge>
            {bluetoothSupported && (
              <Badge variant={bluetoothEnabled ? 'default' : 'secondary'}>
                {bluetoothEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            )}
          </div>
          
          <div className="text-sm text-muted-foreground">
            {detectedBeacons.length} beacon(s) detected
          </div>
        </div>

        {isScanning && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Scanning for beacons...</span>
            </div>
            <Progress value={scanProgress} className="w-full" />
          </div>
        )}

        {nearestBeacon && (
          <Alert>
            <MapPin className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>
                  Nearest: {nearestBeacon.name || nearestBeacon.id} 
                  ({nearestBeacon.distance.toFixed(1)}m)
                </span>
                <Badge className={getProximityColor(nearestBeacon.proximity)}>
                  {getProximityIcon(nearestBeacon.proximity)}
                  {nearestBeacon.proximity}
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            onClick={isScanning ? stopScanning : startScanning}
            disabled={!bluetoothSupported}
            className="flex-1"
          >
            {isScanning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Stop Scanning
              </>
            ) : (
              <>
                <Bluetooth className="w-4 h-4 mr-2" />
                Start Scanning
              </>
            )}
          </Button>
          
          {!bluetoothEnabled && bluetoothSupported && (
            <Button
              variant="outline"
              onClick={requestBluetoothPermission}
            >
              Enable Bluetooth
            </Button>
          )}
        </div>

        {detectedBeacons.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Detected Beacons:</h4>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {detectedBeacons.map((beacon) => (
                <div
                  key={beacon.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {beacon.name || beacon.id}
                      </span>
                      <Badge className={getProximityColor(beacon.proximity)}>
                        {getProximityIcon(beacon.proximity)}
                        {beacon.proximity}
                      </Badge>
                      {isAuthorizedBeacon(beacon) && (
                        <Badge variant="default">Authorized</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {beacon.location && <div>{beacon.location}</div>}
                      <div>
                        Distance: {beacon.distance.toFixed(1)}m | 
                        RSSI: {beacon.rssi}dBm | 
                        UUID: {beacon.uuid.slice(0, 8)}...
                      </div>
                    </div>
                  </div>
                  
                  {beacon.proximity === 'immediate' && isAuthorizedBeacon(beacon) && (
                    <Button
                      size="sm"
                      onClick={() => handleManualCheckIn(beacon)}
                      className="ml-2"
                    >
                      Check In
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {!bluetoothSupported && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Bluetooth Low Energy is not supported on this device. 
              Please use a compatible device or browser for beacon-based attendance.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

export default BeaconScannerComponent
