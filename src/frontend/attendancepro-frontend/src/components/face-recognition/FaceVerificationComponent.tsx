import React, { useState, useRef, useEffect } from 'react'
import { Camera, CheckCircle, AlertCircle, Loader2, Shield, Eye } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Alert, AlertDescription } from '../ui/alert'
import { Badge } from '../ui/badge'
import faceRecognitionService from '../../services/faceRecognitionService'

interface FaceVerificationComponentProps {
  userId?: string
  onVerificationSuccess?: (userId: string, confidence: number) => void
  onVerificationFailed?: (reason: string) => void
  onCancel?: () => void
  showLivenessCheck?: boolean
}

const FaceVerificationComponent: React.FC<FaceVerificationComponentProps> = ({
  userId,
  onVerificationSuccess,
  onVerificationFailed,
  onCancel,
  showLivenessCheck = true,
}) => {
  const [verificationStep, setVerificationStep] = useState<'setup' | 'liveness' | 'verifying' | 'complete' | 'failed'>('setup')
  const [error, setError] = useState<string | null>(null)
  const [livenessInstructions, setLivenessInstructions] = useState<string>('Look directly at the camera')
  const [verificationResult, setVerificationResult] = useState<{
    isMatch: boolean
    confidence: number
    userId?: string
  } | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        if (showLivenessCheck) {
          setVerificationStep('liveness')
          startLivenessCheck()
        }
      }
    } catch {
      setError('Unable to access camera. Please ensure camera permissions are granted.')
      toast.error('Camera access denied')
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const captureImage = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null

    const canvas = canvasRef.current
    const video = videoRef.current
    const context = canvas.getContext('2d')

    if (!context) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)
  }

  const startLivenessCheck = () => {
    const instructions = [
      'Look directly at the camera',
      'Blink your eyes',
      'Turn your head slightly left',
      'Turn your head slightly right',
      'Smile naturally'
    ]

    let currentInstruction = 0
    setLivenessInstructions(instructions[currentInstruction])

    const instructionInterval = setInterval(() => {
      currentInstruction++
      if (currentInstruction < instructions.length) {
        setLivenessInstructions(instructions[currentInstruction])
      } else {
        clearInterval(instructionInterval)
        performVerification()
      }
    }, 2000)
  }

  const performVerification = async () => {
    setVerificationStep('verifying')

    try {
      const imageData = captureImage()
      if (!imageData) {
        throw new Error('Failed to capture image')
      }

      let verificationResult
      if (showLivenessCheck) {
        verificationResult = await faceRecognitionService.verifyWithLiveness(imageData, userId)
      } else {
        verificationResult = await faceRecognitionService.verifyFace({ imageData, userId })
      }

      setVerificationResult(verificationResult)

      if (verificationResult.isMatch && verificationResult.confidence > 0.8) {
        setVerificationStep('complete')
        toast.success('Face verification successful!')
        onVerificationSuccess?.(verificationResult.userId || userId || '', verificationResult.confidence)
      } else {
        setVerificationStep('failed')
        const reason = verificationResult.confidence < 0.8 
          ? 'Low confidence match' 
          : 'Face not recognized'
        toast.error('Face verification failed')
        onVerificationFailed?.(reason)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Verification failed'
      setError(errorMessage)
      setVerificationStep('failed')
      toast.error('Face verification failed')
      onVerificationFailed?.(errorMessage)
    } finally {
      stopCamera()
    }
  }

  const resetVerification = () => {
    setVerificationStep('setup')
    setError(null)
    setVerificationResult(null)
    stopCamera()
  }

  const renderSetupStep = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <Shield className="w-8 h-8 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Face Verification</h3>
        <p className="text-muted-foreground">
          Verify your identity using facial recognition
        </p>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg text-left">
        <h4 className="font-medium mb-2">Instructions:</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Ensure good lighting on your face</li>
          <li>• Look directly at the camera</li>
          <li>• Follow the on-screen instructions</li>
          <li>• Keep your face centered in the frame</li>
        </ul>
      </div>
      <Button onClick={startCamera} className="w-full">
        <Camera className="w-4 h-4 mr-2" />
        Start Verification
      </Button>
    </div>
  )

  const renderLivenessStep = () => (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg bg-gray-100"
        />
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="absolute inset-0 border-2 border-green-500 rounded-lg pointer-events-none">
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-green-500"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-green-500"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-green-500"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-green-500"></div>
        </div>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span className="text-sm font-medium">{livenessInstructions}</span>
          </div>
        </div>
      </div>

      <div className="text-center">
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Liveness Check in Progress
        </Badge>
      </div>

      <Button variant="outline" onClick={resetVerification} className="w-full">
        Cancel
      </Button>
    </div>
  )

  const renderVerifyingStep = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Verifying Identity</h3>
        <p className="text-muted-foreground">
          Comparing your face with stored template...
        </p>
      </div>
    </div>
  )

  const renderCompleteStep = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Verification Successful!</h3>
        <p className="text-muted-foreground">
          Your identity has been verified successfully.
        </p>
        {verificationResult && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              Confidence: {Math.round(verificationResult.confidence * 100)}%
            </p>
          </div>
        )}
      </div>
      <Button onClick={onCancel} className="w-full">
        Continue
      </Button>
    </div>
  )

  const renderFailedStep = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Verification Failed</h3>
        <p className="text-muted-foreground">
          Unable to verify your identity. Please try again.
        </p>
        {verificationResult && (
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-sm text-red-800">
              Confidence: {Math.round(verificationResult.confidence * 100)}%
            </p>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <Button onClick={resetVerification} className="flex-1">
          Try Again
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </div>
  )

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Face Verification
        </CardTitle>
        <CardDescription>
          Secure biometric authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {verificationStep === 'setup' && renderSetupStep()}
        {verificationStep === 'liveness' && renderLivenessStep()}
        {verificationStep === 'verifying' && renderVerifyingStep()}
        {verificationStep === 'complete' && renderCompleteStep()}
        {verificationStep === 'failed' && renderFailedStep()}
      </CardContent>
    </Card>
  )
}

export default FaceVerificationComponent
