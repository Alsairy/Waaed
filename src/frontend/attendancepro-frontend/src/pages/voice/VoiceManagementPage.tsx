import React, { useState, useEffect } from 'react';
import { VoiceRecognitionComponent } from '../../components/voice/VoiceRecognitionComponent';
import { toast } from 'sonner';

interface VoiceTemplate {
  userId: string;
  isEnrolled: boolean;
  enrollmentDate?: string;
  templateSize: number;
  lastUpdated?: string;
}

interface VoiceMetrics {
  userId: string;
  totalVerifications: number;
  successfulVerifications: number;
  averageConfidence: number;
  lastVerification: string;
  successRate: number;
}

interface VoiceSecurity {
  userId: string;
  isVoiceSecurityEnabled: boolean;
  hasPassphrase: boolean;
  lastSecurityUpdate?: string;
  securityLevel: number;
}

export const VoiceManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('enrollment');
  const [voiceTemplate, setVoiceTemplate] = useState<VoiceTemplate | null>(null);
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetrics | null>(null);
  const [voiceSecurity, setVoiceSecurity] = useState<VoiceSecurity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    loadVoiceData();
  }, []);

  const loadVoiceData = async () => {
    try {
      setIsLoading(true);
      
      const templateResponse = await fetch(`/api/voice-recognition/template/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (templateResponse.ok) {
        const templateResult = await templateResponse.json();
        setVoiceTemplate(templateResult.data);
      }

      const metricsResponse = await fetch(`/api/voice-recognition/metrics/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (metricsResponse.ok) {
        const metricsResult = await metricsResponse.json();
        setVoiceMetrics(metricsResult.data);
      }

      const securityResponse = await fetch(`/api/voice-recognition/security/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (securityResponse.ok) {
        const securityResult = await securityResponse.json();
        setVoiceSecurity(securityResult.data);
      }
    } catch (error) {
      console.error('Error loading voice data:', error);
      toast.error('Failed to load voice data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVoiceTemplate = async () => {
    try {
      const response = await fetch(`/api/voice-recognition/template/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        toast.success('Voice template deleted successfully');
        await loadVoiceData();
      } else {
        toast.error('Failed to delete voice template');
      }
    } catch (error) {
      console.error('Error deleting voice template:', error);
      toast.error('Failed to delete voice template');
    }
  };

  const getSecurityLevelBadge = (level: number) => {
    if (level >= 4) return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">High Security</span>;
    if (level >= 2) return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Medium Security</span>;
    return <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Low Security</span>;
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.9) return 'text-green-600';
    if (rate >= 0.7) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voice Management</h1>
          <p className="text-gray-600">Manage your voice recognition settings and security</p>
        </div>
        <div className="flex items-center space-x-2">
          {voiceTemplate?.isEnrolled ? (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Voice Enrolled
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              Not Enrolled
            </span>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('enrollment')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'enrollment'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Enrollment
            </button>
            <button
              onClick={() => setActiveTab('commands')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'commands'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Commands
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        {activeTab === 'enrollment' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <VoiceRecognitionComponent
                mode="enrollment"
                userId={userId}
                onVoiceCommand={() => {}}
                onVoiceAuthentication={() => {}}
              />
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Voice Template Status</h3>
                <p className="text-gray-600 mb-4">Current voice enrollment information</p>
                <div className="space-y-4">
                  {voiceTemplate ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Status:</span>
                        {voiceTemplate.isEnrolled ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Enrolled</span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Not Enrolled</span>
                        )}
                      </div>
                      {voiceTemplate.enrollmentDate && (
                        <div className="flex items-center justify-between">
                          <span>Enrolled:</span>
                          <span className="text-sm text-gray-600">
                            {new Date(voiceTemplate.enrollmentDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span>Template Size:</span>
                        <span className="text-sm text-gray-600">{voiceTemplate.templateSize} bytes</span>
                      </div>
                      {voiceTemplate.lastUpdated && (
                        <div className="flex items-center justify-between">
                          <span>Last Updated:</span>
                          <span className="text-sm text-gray-600">
                            {new Date(voiceTemplate.lastUpdated).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      {voiceTemplate.isEnrolled && (
                        <button 
                          onClick={handleDeleteVoiceTemplate}
                          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg"
                        >
                          Delete Voice Template
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        No voice template found. Please enroll your voice to enable voice recognition features.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'commands' && (
          <VoiceRecognitionComponent
            mode="command"
            userId={userId}
            onVoiceCommand={(command: string, confidence: number) => {
              toast.success(`Command "${command}" executed with ${Math.round(confidence * 100)}% confidence`);
            }}
            onVoiceAuthentication={() => {}}
          />
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <VoiceRecognitionComponent
                mode="authentication"
                userId={userId}
                onVoiceCommand={() => {}}
                onVoiceAuthentication={(result: any) => {
                  if (result.isAuthenticated) {
                    toast.success('Voice authentication successful');
                  } else {
                    toast.error('Voice authentication failed');
                  }
                }}
              />
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Security Status</h3>
                <p className="text-gray-600 mb-4">Voice security configuration and status</p>
                <div className="space-y-4">
                  {voiceSecurity ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span>Security Level:</span>
                        {getSecurityLevelBadge(voiceSecurity.securityLevel)}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Voice Security:</span>
                        {voiceSecurity.isVoiceSecurityEnabled ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Enabled</span>
                        ) : (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">Disabled</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Passphrase:</span>
                        {voiceSecurity.hasPassphrase ? (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Configured</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">Not Set</span>
                        )}
                      </div>
                      {voiceSecurity.lastSecurityUpdate && (
                        <div className="flex items-center justify-between">
                          <span>Last Update:</span>
                          <span className="text-sm text-gray-600">
                            {new Date(voiceSecurity.lastSecurityUpdate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-yellow-800">
                        Voice security information not available. Please enroll your voice first.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {voiceMetrics ? (
              <>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Verification Statistics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Total Verifications:</span>
                      <span className="bg-gray-100 px-2 py-1 rounded text-sm">{voiceMetrics.totalVerifications}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Successful:</span>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                        {voiceMetrics.successfulVerifications}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Success Rate:</span>
                      <span className={getSuccessRateColor(voiceMetrics.successRate)}>
                        {Math.round(voiceMetrics.successRate * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Average Confidence:</span>
                      <span className={getSuccessRateColor(voiceMetrics.averageConfidence)}>
                        {Math.round(voiceMetrics.averageConfidence * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Verification:</span>
                      <span className="text-sm text-gray-600">
                        {voiceMetrics.lastVerification !== '0001-01-01T00:00:00' 
                          ? new Date(voiceMetrics.lastVerification).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                  <div className="space-y-2">
                    {voiceMetrics.successRate < 0.8 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 text-sm">
                          Consider re-enrolling your voice for better accuracy.
                        </p>
                      </div>
                    )}
                    {voiceMetrics.averageConfidence < 0.7 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 text-sm">
                          Try speaking more clearly and in quieter environments.
                        </p>
                      </div>
                    )}
                    {voiceMetrics.successRate >= 0.9 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-800 text-sm">
                          Excellent voice recognition performance!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-full bg-white rounded-lg shadow p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    No voice analytics data available. Start using voice recognition to see your metrics.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceManagementPage;
