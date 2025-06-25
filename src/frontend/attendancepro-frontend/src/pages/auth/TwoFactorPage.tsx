import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2, Shield, Smartphone } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../../components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../components/ui/input-otp'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../../contexts/AuthContext'

const twoFactorSchema = z.object({
  code: z.string().length(6, 'Code must be 6 digits'),
})

type TwoFactorFormData = z.infer<typeof twoFactorSchema>

const TwoFactorPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [code, setCode] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const email = location.state?.email
  const from = location.state?.from || '/dashboard'

  const {
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
  })

  useEffect(() => {
    if (!email) {
      toast.error('Invalid session. Please sign in again.')
      navigate('/login')
    }
  }, [email, navigate])

  useEffect(() => {
    setValue('code', code)
  }, [code, setValue])

  const onSubmit = async (data: TwoFactorFormData) => {
    if (!email) return

    setIsLoading(true)
    try {
      const result = await login(email, '', data.code)
      
      if (result.success) {
        toast.success('Welcome back!')
        navigate(from, { replace: true })
      } else {
        toast.error(result.error || '2FA verification failed')
        setCode('')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
      setCode('')
    } finally {
      setIsLoading(false)
    }
  }

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">Hudur</span>
            </div>
          </div>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Two-Factor Authentication</CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code from your authenticator app
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="code" className="text-center block">
                Authentication Code
              </Label>
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={(value) => setCode(value)}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              {errors.code && (
                <p className="text-sm text-red-500 text-center">{errors.code.message}</p>
              )}
            </div>

            <div className="text-sm text-muted-foreground text-center space-y-2">
              <p>
                Open your authenticator app and enter the 6-digit code for{' '}
                <span className="font-medium">Hudur</span>
              </p>
              <p>
                The code changes every 30 seconds.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || code.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </form>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Having trouble? Contact your administrator for help.
              </p>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-primary hover:underline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TwoFactorPage
