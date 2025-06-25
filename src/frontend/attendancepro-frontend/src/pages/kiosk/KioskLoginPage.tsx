import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Loader2, Monitor, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface KioskAuthData {
  kioskId: string
  accessCode: string
}

const KioskLoginPage: React.FC = () => {
  const [authData, setAuthData] = useState<KioskAuthData>({
    kioskId: '',
    accessCode: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleInputChange = (field: keyof KioskAuthData, value: string) => {
    setAuthData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!authData.kioskId || !authData.accessCode) {
      setError('Please enter both Kiosk ID and Access Code')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/kiosk/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authData)
      })

      const result = await response.json()

      if (response.ok && result.isSuccess) {
        localStorage.setItem('kiosk_token', result.token)
        localStorage.setItem('kiosk_id', result.kioskId)
        localStorage.setItem('kiosk_expires_at', result.expiresAt)
        
        toast.success('Kiosk authenticated successfully')
        navigate('/kiosk/attendance')
      } else {
        setError(result.message || 'Authentication failed')
      }
    } catch (err) {
      setError('Network error. Please check your connection.')
      console.error('Kiosk authentication error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e as any)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Monitor className="w-8 h-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Kiosk Login
              </CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Enter your kiosk credentials to access the attendance system
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="kioskId" className="text-sm font-medium text-gray-700">
                  Kiosk ID
                </Label>
                <Input
                  id="kioskId"
                  type="text"
                  placeholder="Enter Kiosk ID"
                  value={authData.kioskId}
                  onChange={(e) => handleInputChange('kioskId', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 text-lg"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessCode" className="text-sm font-medium text-gray-700">
                  Access Code
                </Label>
                <Input
                  id="accessCode"
                  type="password"
                  placeholder="Enter Access Code"
                  value={authData.accessCode}
                  onChange={(e) => handleInputChange('accessCode', e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="h-12 text-lg"
                  autoComplete="off"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={isLoading || !authData.kioskId || !authData.accessCode}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  'Login to Kiosk'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Need help? Contact your system administrator
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Hudur Kiosk Mode v1.0.0
          </p>
        </div>
      </div>
    </div>
  )
}

export default KioskLoginPage
