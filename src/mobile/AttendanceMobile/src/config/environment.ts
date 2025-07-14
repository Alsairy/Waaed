export interface EnvironmentConfig {
  apiUrl: string;
  authUrl: string;
  faceRecognitionUrl: string;
  attendanceUrl: string;
  environment: 'development' | 'staging' | 'production';
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    apiUrl: 'http://localhost:5000/api',
    authUrl: 'http://localhost:5001/api/auth',
    faceRecognitionUrl: 'http://localhost:5003/api/face-recognition',
    attendanceUrl: 'http://localhost:5002/api/attendance',
    environment: 'development'
  },
  staging: {
    apiUrl: 'http://staging-api.waaed.sa/api',
    authUrl: 'http://staging-api.waaed.sa/api/auth',
    faceRecognitionUrl: 'http://staging-api.waaed.sa/api/face-recognition',
    attendanceUrl: 'http://staging-api.waaed.sa/api/attendance',
    environment: 'staging'
  },
  production: {
    apiUrl: 'https://app.waaed.platform.com/api',
    authUrl: 'https://app.waaed.platform.com/api/auth',
    faceRecognitionUrl: 'https://app.waaed.platform.com/api/face-recognition',
    attendanceUrl: 'https://app.waaed.platform.com/api/attendance',
    environment: 'production'
  }
};

const getEnvironment = (): EnvironmentConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development' || 
                       process.env.NODE_ENV === undefined ||
                       process.env.NODE_ENV === 'test';

  if (isDevelopment) {
    return environments.development;
  }

  const envName = process.env.NODE_ENV === 'production' ? 'staging' : 'development';
  
  return environments[envName] || environments.staging;
};

export const ENV = getEnvironment();

export default ENV;
