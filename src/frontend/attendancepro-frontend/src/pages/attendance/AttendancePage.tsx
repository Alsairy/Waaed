import React, { useState, useEffect } from 'react'
import { Clock, MapPin, Camera, Smartphone, Navigation, AlertCircle, CheckCircle, Loader2, Calendar, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Progress } from '../../components/ui/progress'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table'
import attendanceService, { TodayAttendanceResponse, AttendanceRecord, AttendanceStats } from '../../services/attendanceService'
import FaceVerificationComponent from '../../components/face-recognition/FaceVerificationComponent'

interface CheckInModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const CheckInModal: React.FC<CheckInModalProps> = ({ open, onOpenChange, onSuccess }) => {
  const [checkInMethod, setCheckInMethod] = useState<'gps' | 'face' | 'beacon' | 'manual'>('gps')
  const [isLoading, setIsLoading] = useState(false)
  const [locationStatus, setLocationStatus] = useState<'checking' | 'valid' | 'invalid' | null>(null)
  const [showFaceVerification, setShowFaceVerification] = useState(false)

  const handleGPSCheckIn = async () => {
    setIsLoading(true)
    setLocationStatus('checking')
    
    try {
      const location = await attendanceService.getCurrentLocation()
      const validation = await attendanceService.validateGeofence(location)
      
      if (validation.isValid) {
        setLocationStatus('valid')
        await attendanceService.checkIn({
          location,
          checkInType: 'gps',
        })
        toast.success('GPS check-in successful!')
        onSuccess()
        onOpenChange(false)
      } else {
        setLocationStatus('invalid')
        toast.error(`Location validation failed: ${validation.message}`)
      }
    } catch (error: any) {
      toast.error(error.message || 'GPS check-in failed')
      setLocationStatus('invalid')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFaceCheckIn = () => {
    setShowFaceVerification(true)
  }

  const handleFaceVerificationSuccess = async (_userId: string, confidence: number) => {
    try {
      setIsLoading(true)
      await attendanceService.checkIn({
        biometricData: `face_verified_${confidence}`,
        checkInType: 'face',
      })
      toast.success('Face recognition check-in successful!')
      onSuccess()
      onOpenChange(false)
      setShowFaceVerification(false)
    } catch (error: any) {
      toast.error(error.message || 'Face check-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualCheckIn = async () => {
    try {
      setIsLoading(true)
      await attendanceService.checkIn({
        checkInType: 'manual',
        notes: 'Manual check-in from web interface',
      })
      toast.success('Manual check-in successful!')
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || 'Manual check-in failed')
    } finally {
      setIsLoading(false)
    }
  }

  const renderLocationStatus = () => {
    if (locationStatus === 'checking') {
      return (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>Validating your location...</AlertDescription>
        </Alert>
      )
    }
    if (locationStatus === 'valid') {
      return (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Location validated! You're within the allowed area.
          </AlertDescription>
        </Alert>
      )
    }
    if (locationStatus === 'invalid') {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're outside the allowed check-in area. Please move to an authorized location.
          </AlertDescription>
        </Alert>
      )
    }
    return null
  }

  if (showFaceVerification) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <FaceVerificationComponent
            onVerificationSuccess={handleFaceVerificationSuccess}
            onVerificationFailed={() => setShowFaceVerification(false)}
            onCancel={() => setShowFaceVerification(false)}
          />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Check In</DialogTitle>
          <DialogDescription>
            Choose your preferred check-in method
          </DialogDescription>
        </DialogHeader>

        <Tabs value={checkInMethod} onValueChange={(value) => setCheckInMethod(value as any)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="gps">
              <Navigation className="w-4 h-4 mr-2" />
              GPS
            </TabsTrigger>
            <TabsTrigger value="face">
              <Camera className="w-4 h-4 mr-2" />
              Face
            </TabsTrigger>
            <TabsTrigger value="beacon">
              <Smartphone className="w-4 h-4 mr-2" />
              Beacon
            </TabsTrigger>
            <TabsTrigger value="manual">
              <Clock className="w-4 h-4 mr-2" />
              Manual
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gps" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Navigation className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">GPS Location Check-In</h3>
                <p className="text-muted-foreground">
                  Verify your location and check in automatically
                </p>
              </div>
              {renderLocationStatus()}
              <Button 
                onClick={handleGPSCheckIn} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Validating Location...
                  </>
                ) : (
                  'Check In with GPS'
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="face" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Camera className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Face Recognition Check-In</h3>
                <p className="text-muted-foreground">
                  Use facial recognition for secure check-in
                </p>
              </div>
              <Button onClick={handleFaceCheckIn} className="w-full">
                Start Face Recognition
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="beacon" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Bluetooth Beacon Check-In</h3>
                <p className="text-muted-foreground">
                  Check in using nearby Bluetooth beacons
                </p>
              </div>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Beacon check-in is currently available on mobile devices only.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Manual Check-In</h3>
                <p className="text-muted-foreground">
                  Simple manual check-in without location verification
                </p>
              </div>
              <Button 
                onClick={handleManualCheckIn} 
                disabled={isLoading}
                variant="outline"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking In...
                  </>
                ) : (
                  'Manual Check In'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

const AttendancePage: React.FC = () => {
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendanceResponse | null>(null)
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null)
  const [recentRecords, setRecentRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAttendanceData()
  }, [])

  const loadAttendanceData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [todayData, statsData, recordsData] = await Promise.all([
        attendanceService.getTodayAttendance(),
        attendanceService.getAttendanceStats(),
        attendanceService.getAttendanceRecords(undefined, undefined, 1, 10)
      ])

      setTodayAttendance(todayData)
      setAttendanceStats(statsData)
      setRecentRecords(recordsData)
    } catch (error: any) {
      setError(error.message || 'Failed to load attendance data')
      toast.error('Failed to load attendance data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckOut = async () => {
    try {
      setIsLoading(true)
      await attendanceService.smartCheckOut({
        enableGPS: true,
        notes: 'Check-out from web interface',
      })
      toast.success('Check-out successful!')
      await loadAttendanceData()
    } catch (error: any) {
      toast.error(error.message || 'Check-out failed')
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading && !todayAttendance) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Loading attendance data...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
          <p className="text-muted-foreground">
            Track and manage your attendance with advanced features
          </p>
        </div>
        <div className="flex gap-2">
          {todayAttendance?.hasCheckedIn && !todayAttendance?.hasCheckedOut ? (
            <Button onClick={handleCheckOut} disabled={isLoading}>
              <Clock className="mr-2 h-4 w-4" />
              Check Out
            </Button>
          ) : !todayAttendance?.hasCheckedIn ? (
            <Button onClick={() => setShowCheckInModal(true)}>
              <Clock className="mr-2 h-4 w-4" />
              Check In
            </Button>
          ) : (
            <Badge variant="secondary" className="px-4 py-2">
              <CheckCircle className="mr-2 h-4 w-4" />
              Day Complete
            </Badge>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Today's Status</CardTitle>
            <CardDescription>Your current attendance status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                <Badge 
                  variant={todayAttendance?.hasCheckedIn ? 'default' : 'secondary'}
                  className={todayAttendance?.hasCheckedIn ? 'bg-green-100 text-green-800' : ''}
                >
                  {todayAttendance?.status || 'Not Checked In'}
                </Badge>
              </div>
              
              {todayAttendance?.checkInTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check-in:</span>
                  <span className="text-sm font-medium">
                    {formatTime(todayAttendance.checkInTime)}
                    {todayAttendance.isLate && (
                      <Badge variant="destructive" className="ml-2 text-xs">Late</Badge>
                    )}
                  </span>
                </div>
              )}
              
              {todayAttendance?.checkOutTime && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Check-out:</span>
                  <span className="text-sm font-medium">
                    {formatTime(todayAttendance.checkOutTime)}
                  </span>
                </div>
              )}
              
              {todayAttendance?.totalHours && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Hours:</span>
                  <span className="text-sm font-medium">
                    {todayAttendance.totalHours.toFixed(1)}h
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Stats</CardTitle>
            <CardDescription>Your attendance overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {attendanceStats && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Attendance Rate:</span>
                    <span className="text-sm font-medium">
                      {Math.round(attendanceStats.attendanceRate * 100)}%
                    </span>
                  </div>
                  <Progress value={attendanceStats.attendanceRate * 100} className="w-full" />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Present:</span>
                      <span className="ml-2 font-medium">{attendanceStats.presentDays}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Absent:</span>
                      <span className="ml-2 font-medium">{attendanceStats.absentDays}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Late:</span>
                      <span className="ml-2 font-medium">{attendanceStats.lateDays}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Avg Hours:</span>
                      <span className="ml-2 font-medium">{attendanceStats.averageHours.toFixed(1)}h</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Attendance management tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <TrendingUp className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="mr-2 h-4 w-4" />
                Location History
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Attendance Records</CardTitle>
          <CardDescription>Your latest attendance entries</CardDescription>
        </CardHeader>
        <CardContent>
          {recentRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatDate(record.checkInTime)}</TableCell>
                    <TableCell>
                      {formatTime(record.checkInTime)}
                      {record.isLate && (
                        <Badge variant="destructive" className="ml-2 text-xs">Late</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.checkOutTime ? formatTime(record.checkOutTime) : '-'}
                      {record.isEarlyLeave && (
                        <Badge variant="destructive" className="ml-2 text-xs">Early</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.totalHours ? `${record.totalHours.toFixed(1)}h` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={record.status === 'checked_out' ? 'default' : 'secondary'}
                        className={record.status === 'checked_out' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {record.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No attendance records</h3>
              <p className="mt-1 text-sm text-gray-500">Start by checking in to see your records here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <CheckInModal
        open={showCheckInModal}
        onOpenChange={setShowCheckInModal}
        onSuccess={loadAttendanceData}
      />
    </div>
  )
}

export default AttendancePage
