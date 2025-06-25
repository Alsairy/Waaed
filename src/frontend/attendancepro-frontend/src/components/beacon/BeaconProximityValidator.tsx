import React, { useState, useEffect } from 'react'
import { MapPin, CheckCircle, AlertTriangle, Clock, Bluetooth } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Alert, AlertDescription } from '../ui/alert'


interface BeaconValidationRule {
  beaconId: string
  beaconName: string
  requiredProximity: 'immediate' | 'near'
  allowedHours?: {
    start: string
    end: string
  }
  location: string
  department?: string
}

interface BeaconProximityValidatorProps {
  detectedBeacons: Array<{
    id: string
    name?: string
    proximity: 'immediate' | 'near' | 'far' | 'unknown'
    distance: number
    rssi: number
  }>
  validationRules: BeaconValidationRule[]
  onValidationChange?: (isValid: boolean, validBeacons: BeaconValidationRule[]) => void
  showValidationDetails?: boolean
}

const BeaconProximityValidator: React.FC<BeaconProximityValidatorProps> = ({
  detectedBeacons,
  validationRules,
  onValidationChange,
  showValidationDetails = true,
}) => {
  const [validBeacons, setValidBeacons] = useState<BeaconValidationRule[]>([])
  const [invalidBeacons, setInvalidBeacons] = useState<BeaconValidationRule[]>([])


  useEffect(() => {
    validateBeacons()
  }, [detectedBeacons, validationRules])

  const validateBeacons = () => {
    const currentTime = new Date()
    const currentHour = currentTime.getHours()
    const currentMinute = currentTime.getMinutes()
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`

    const valid: BeaconValidationRule[] = []
    const invalid: BeaconValidationRule[] = []

    validationRules.forEach(rule => {
      const detectedBeacon = detectedBeacons.find(beacon => 
        beacon.id === rule.beaconId || beacon.name === rule.beaconName
      )

      if (!detectedBeacon) {
        invalid.push(rule)
        return
      }

      const isProximityValid = 
        rule.requiredProximity === 'immediate' 
          ? detectedBeacon.proximity === 'immediate'
          : ['immediate', 'near'].includes(detectedBeacon.proximity)

      const isTimeValid = rule.allowedHours 
        ? isWithinTimeRange(currentTimeString, rule.allowedHours.start, rule.allowedHours.end)
        : true

      if (isProximityValid && isTimeValid) {
        valid.push(rule)
      } else {
        invalid.push(rule)
      }
    })

    setValidBeacons(valid)
    setInvalidBeacons(invalid)


    onValidationChange?.(valid.length > 0, valid)
  }

  const isWithinTimeRange = (currentTime: string, startTime: string, endTime: string): boolean => {
    const current = timeToMinutes(currentTime)
    const start = timeToMinutes(startTime)
    const end = timeToMinutes(endTime)

    if (start <= end) {
      return current >= start && current <= end
    } else {
      return current >= start || current <= end
    }
  }

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  const getValidationStatus = () => {
    if (validBeacons.length > 0) {
      return {
        status: 'valid',
        message: `Valid proximity to ${validBeacons.length} authorized beacon(s)`,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        icon: <CheckCircle className="w-4 h-4 text-green-600" />
      }
    } else if (invalidBeacons.length > 0) {
      return {
        status: 'invalid',
        message: 'Not within required proximity of authorized beacons',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        icon: <AlertTriangle className="w-4 h-4 text-red-600" />
      }
    } else {
      return {
        status: 'scanning',
        message: 'Scanning for authorized beacons...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        icon: <Bluetooth className="w-4 h-4 text-blue-600 animate-pulse" />
      }
    }
  }

  const validationStatus = getValidationStatus()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Beacon Proximity Validation
        </CardTitle>
        <CardDescription>
          Verify proximity to authorized workplace beacons
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={validationStatus.bgColor}>
          {validationStatus.icon}
          <AlertDescription className={validationStatus.color}>
            {validationStatus.message}
          </AlertDescription>
        </Alert>

        {showValidationDetails && (
          <>
            {validBeacons.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-green-700">✓ Valid Beacons:</h4>
                <div className="space-y-2">
                  {validBeacons.map((rule) => {
                    const detectedBeacon = detectedBeacons.find(beacon => 
                      beacon.id === rule.beaconId || beacon.name === rule.beaconName
                    )
                    return (
                      <div
                        key={rule.beaconId}
                        className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-green-800">
                              {rule.beaconName}
                            </span>
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              {detectedBeacon?.proximity}
                            </Badge>
                          </div>
                          <div className="text-xs text-green-600">
                            <div>{rule.location}</div>
                            {rule.department && <div>Department: {rule.department}</div>}
                            {detectedBeacon && (
                              <div>Distance: {detectedBeacon.distance.toFixed(1)}m</div>
                            )}
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {invalidBeacons.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-red-700">✗ Invalid/Missing Beacons:</h4>
                <div className="space-y-2">
                  {invalidBeacons.map((rule) => {
                    const detectedBeacon = detectedBeacons.find(beacon => 
                      beacon.id === rule.beaconId || beacon.name === rule.beaconName
                    )
                    
                    const reason = !detectedBeacon 
                      ? 'Not detected'
                      : detectedBeacon.proximity === 'far' || detectedBeacon.proximity === 'unknown'
                      ? 'Too far away'
                      : 'Outside allowed hours'

                    return (
                      <div
                        key={rule.beaconId}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-red-800">
                              {rule.beaconName}
                            </span>
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                              {reason}
                            </Badge>
                          </div>
                          <div className="text-xs text-red-600">
                            <div>{rule.location}</div>
                            {rule.department && <div>Department: {rule.department}</div>}
                            {rule.allowedHours && (
                              <div>
                                Allowed hours: {rule.allowedHours.start} - {rule.allowedHours.end}
                              </div>
                            )}
                            {detectedBeacon && (
                              <div>
                                Current: {detectedBeacon.proximity} ({detectedBeacon.distance.toFixed(1)}m)
                              </div>
                            )}
                          </div>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {validationRules.length === 0 && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  No beacon validation rules configured. All detected beacons will be considered valid.
                </AlertDescription>
              </Alert>
            )}

            <div className="pt-2 border-t">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>Validation Rules: {validationRules.length}</span>
                <span>Detected Beacons: {detectedBeacons.length}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default BeaconProximityValidator
