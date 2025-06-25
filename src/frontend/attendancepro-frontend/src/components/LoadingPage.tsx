import React from 'react'
import { Shield } from 'lucide-react'
import LoadingSpinner from './LoadingSpinner'

interface LoadingPageProps {
  text?: string
}

const LoadingPage: React.FC<LoadingPageProps> = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Hudur</span>
        </div>
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  )
}

export default LoadingPage
