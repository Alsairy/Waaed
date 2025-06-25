import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Switch } from '../ui/switch'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Separator } from '../ui/separator'
import { toast } from 'sonner'
import { 
  Settings, 
  Bell, 
  Mail, 
  MessageSquare, 
  Clock, 
  TestTube,
  Save
} from 'lucide-react'
import notificationService, { NotificationPreferencesDto } from '../../services/notificationService'

const NotificationPreferencesComponent: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferencesDto>({
    userId: '',
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    notificationTypes: {
      attendance: true,
      leave: true,
      approval: true,
      system: true,
      security: true,
      marketing: false
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'UTC'
    },
    frequency: 'immediate',
    language: 'en'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      setIsLoading(true)
      const data = await notificationService.getNotificationPreferences()
      setPreferences(data)
    } catch (error) {
      console.error('Error loading notification preferences:', error)
      toast.error('Failed to load notification preferences')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    try {
      setIsSaving(true)
      await notificationService.updateNotificationPreferences(preferences)
      toast.success('Notification preferences saved successfully')
    } catch (error) {
      console.error('Error saving notification preferences:', error)
      toast.error('Failed to save notification preferences')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendTestNotification = async () => {
    try {
      setIsSendingTest(true)
      await notificationService.sendNotification({
        title: 'Test Notification',
        message: 'This is a test notification to verify your settings.',
        type: 'info',
        priority: 'normal',
        category: 'system'
      })
      toast.success('Test notification sent successfully')
    } catch (error) {
      console.error('Error sending test notification:', error)
      toast.error('Failed to send test notification')
    } finally {
      setIsSendingTest(false)
    }
  }

  const updatePreference = (key: keyof NotificationPreferencesDto, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const updateCategoryPreference = (category: keyof NotificationPreferencesDto['notificationTypes'], value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notificationTypes: {
        ...prev.notificationTypes,
        [category]: value
      }
    }))
  }

  const updateQuietHours = (key: keyof NotificationPreferencesDto['quietHours'], value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [key]: value
      }
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Settings className="h-6 w-6" />
          <h1 className="text-3xl font-bold text-gray-900">Notification Preferences</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleSendTestNotification}
            disabled={isSendingTest}
          >
            <TestTube className="mr-2 h-4 w-4" />
            {isSendingTest ? 'Sending...' : 'Send Test'}
          </Button>
          <Button
            onClick={handleSavePreferences}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Channels</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-500" />
                <div>
                  <Label className="text-base font-medium">Push Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications in your browser</p>
                </div>
              </div>
              <Switch
                checked={preferences.pushNotifications}
                onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-green-500" />
                <div>
                  <Label className="text-base font-medium">Email Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <div>
                  <Label className="text-base font-medium">SMS Notifications</Label>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
              </div>
              <Switch
                checked={preferences.smsNotifications}
                onCheckedChange={(checked) => updatePreference('smsNotifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base">Attendance Updates</Label>
              <Switch
                checked={preferences.notificationTypes.attendance}
                onCheckedChange={(checked) => updateCategoryPreference('attendance', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-base">Leave Management</Label>
              <Switch
                checked={preferences.notificationTypes.leave}
                onCheckedChange={(checked) => updateCategoryPreference('leave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-base">Approval Requests</Label>
              <Switch
                checked={preferences.notificationTypes.approval}
                onCheckedChange={(checked) => updateCategoryPreference('approval', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-base">System Notifications</Label>
              <Switch
                checked={preferences.notificationTypes.system}
                onCheckedChange={(checked) => updateCategoryPreference('system', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-base">Security Alerts</Label>
              <Switch
                checked={preferences.notificationTypes.security}
                onCheckedChange={(checked) => updateCategoryPreference('security', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-base">Marketing Updates</Label>
              <Switch
                checked={preferences.notificationTypes.marketing}
                onCheckedChange={(checked) => updateCategoryPreference('marketing', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Quiet Hours</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Enable Quiet Hours</Label>
                <p className="text-sm text-gray-500">Disable notifications during specified hours</p>
              </div>
              <Switch
                checked={preferences.quietHours.enabled}
                onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
              />
            </div>

            {preferences.quietHours.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={preferences.quietHours.startTime}
                    onChange={(e) => updateQuietHours('startTime', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={preferences.quietHours.endTime}
                    onChange={(e) => updateQuietHours('endTime', e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Sample Notification</h4>
                <p className="text-sm text-blue-700 mt-1">
                  This is how your notifications will appear based on your current settings.
                </p>
                <p className="text-xs text-blue-600 mt-2">2 minutes ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default NotificationPreferencesComponent
