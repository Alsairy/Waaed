import React, { useState, useRef, useEffect } from 'react'
import { Camera, CheckCircle, AlertCircle, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Progress } from '../ui/progress'
import { Alert, AlertDescription } from '../ui/alert'
import faceRecognitionService from '../../services/faceRecognitionService'

interface FaceEnrollmentComponentProps {
  userId?: string
  onEnrollmentComplete?: (templateId: string) => void
  onCancel?: () => void
}

const FaceEnrollmentComponent: React.FC<FaceEnrollmentComponentProps> = ({
  userId,
  onEnrollmentComplete,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [enrollmentStep, setEnrollmentStep] = useState<'setup' | 'capturing' | 'processing' | 'complete'>('setup')
  const [progress, setProgress] = useState(0)
  const [capturedImages, setCapturedImages] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const requiredImages = 5
  const captureInterval = 1000

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
        setCameraActive(true)
        setEnrollmentStep('capturing')
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
    setCameraActive(false)
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

  const startEnrollment = async () => {
    if (!cameraActive) {
      await startCamera()
      return
    }

    setIsLoading(true)
    setEnrollmentStep('capturing')
    setCapturedImages([])
    setProgress(0)

    try {
      const images: string[] = []
      
      for (let i = 0; i < requiredImages; i++) {
        await new Promise(resolve => setTimeout(resolve, captureInterval))
        
        const imageData = captureImage()
        if (imageData) {
          images.push(imageData)
          setCapturedImages([...images])
          setProgress(((i + 1) / requiredImages) * 100)
        }
      }

      setEnrollmentStep('processing')
      
      const enrollmentResult = await faceRecognitionService.enrollWithLiveness(
        images[Math.floor(images.length / 2)],
        userId
      )

      if (enrollmentResult.success) {
        setEnrollmentStep('complete')
        toast.success('Face enrollment completed successfully!')
        onEnrollmentComplete?.(enrollmentResult.templateId || '')
      } else {
        throw new Error(enrollmentResult.message)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Enrollment failed'
      setError(errorMessage)
      toast.error('Face enrollment failed')
      setEnrollmentStep('setup')
    }finally {
      setIsLoading(false)
      stopCamera()
    }
  }

  const resetEnrollment = () => {
    setEnrollmentStep('setup')
    setCapturedImages([])
    setProgress(0)
    setError(null)
    stopCamera()
  }

  const renderSetupStep = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <User className="w-8 h-8 text-blue-600" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Face Enrollment Setup</h3>
        <p className="text-muted-foreground">
          We'll capture multiple images of your face to create a secure biometric template.
        </p>
      </div>
      <div className="bg-blue-50 p-4 rounded-lg text-left">
        <h4 className="font-medium mb-2">Instructions:</h4>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Ensure good lighting on your face</li>
          <li>• Look directly at the camera</li>
          <li>• Keep your face centered in the frame</li>
          <li>• Avoid wearing sunglasses or hats</li>
          <li>• Stay still during capture</li>
        </ul>
      </div>
      <Button onClick={startCamera} className="w-full">
        <Camera className="w-4 h-4 mr-2" />
        Start Camera
      </Button>
    </div>
  )

  const renderCapturingStep = () => (
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
        
        <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none">
          <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-blue-500"></div>
          <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-blue-500"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-blue-500"></div>
          <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-blue-500"></div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Capturing images...</span>
          <span>{capturedImages.length}/{requiredImages}</span>
        </div>
        <Progress value={progress} className="w-full" />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={startEnrollment}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Capturing...
            </>
          ) : (
            'Start Capture'
          )}
        </Button>
        <Button variant="outline" onClick={resetEnrollment}>
          Cancel
        </Button>
      </div>
    </div>
  )

  const renderProcessingStep = () => (
    <div className="text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Processing Images</h3>
        <p className="text-muted-foreground">
          Creating your biometric template...
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
        <h3 className="text-lg font-semibold">Enrollment Complete!</h3>
        <p className="text-muted-foreground">
          Your face has been successfully enrolled for biometric authentication.
        </p>
      </div>
      <Button onClick={onCancel} className="w-full">
        Done
      </Button>
    </div>
  )

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          Face Enrollment
        </CardTitle>
        <CardDescription>
          Set up biometric authentication for secure access
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {enrollmentStep === 'setup' && renderSetupStep()}
        {enrollmentStep === 'capturing' && renderCapturingStep()}
        {enrollmentStep === 'processing' && renderProcessingStep()}
        {enrollmentStep === 'complete' && renderCompleteStep()}
      </CardContent>
    </Card>
  )
}

export default FaceEnrollmentComponent
