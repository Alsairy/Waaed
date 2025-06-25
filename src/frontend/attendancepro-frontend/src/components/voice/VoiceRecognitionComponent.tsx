import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

interface VoiceRecognitionComponentProps {
  onVoiceCommand?: (command: string, confidence: number) => void;
  onVoiceAuthentication?: (result: VoiceAuthResult) => void;
  mode: 'command' | 'authentication' | 'enrollment';
  userId?: string;
  tenantId?: string;
}

interface VoiceAuthResult {
  isAuthenticated: boolean;
  userId: string;
  confidence: number;
  token?: string;
}

interface VoiceQuality {
  qualityScore: number;
  noiseLevel: number;
  signalStrength: number;
  isAcceptable: boolean;
  recommendations: string[];
}

export const VoiceRecognitionComponent: React.FC<VoiceRecognitionComponentProps> = ({
  onVoiceCommand,
  onVoiceAuthentication,
  mode,
  userId,
  tenantId
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceQuality, setVoiceQuality] = useState<VoiceQuality | null>(null);
  const [lastCommand, setLastCommand] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(0);
  const [supportedCommands, setSupportedCommands] = useState<Array<{
    category: string;
    command: string;
    description: string;
    examples?: string[];
  }>>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000
        } 
      });

      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      analyserRef.current.fftSize = 256;

      monitorAudioLevel();

      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
      toast.info('Processing audio...');
    }
  }, [isRecording]);

  const monitorAudioLevel = useCallback(() => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    setAudioLevel(Math.min(100, (average / 255) * 100));

    animationFrameRef.current = requestAnimationFrame(monitorAudioLevel);
  }, []);

  const processAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audioFile', audioBlob, 'recording.webm');
      
      if (userId) {
        formData.append('userId', userId);
      }
      if (tenantId) {
        formData.append('tenantId', tenantId);
      }

      const qualityResponse = await fetch('/api/voice-recognition/quality', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (qualityResponse.ok) {
        const qualityData = await qualityResponse.json();
        setVoiceQuality(qualityData.data);

        if (!qualityData.data.isAcceptable) {
          toast.warning('Audio quality is poor. Please try recording again in a quieter environment.');
          setIsProcessing(false);
          return;
        }
      }

      let endpoint = '';
      switch (mode) {
        case 'command':
          endpoint = '/api/voice-recognition/command';
          break;
        case 'authentication':
          endpoint = '/api/voice-recognition/authenticate';
          break;
        case 'enrollment':
          endpoint = '/api/voice-recognition/enroll';
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        
        switch (mode) {
          case 'command':
            setLastCommand(result.data.command);
            setConfidence(result.data.confidence);
            onVoiceCommand?.(result.data.command, result.data.confidence);
            
            if (result.data.isExecuted) {
              toast.success(`Command "${result.data.action}" executed successfully`);
            } else {
              toast.warning(`Command recognized but not executed: ${result.data.result}`);
            }
            break;
            
          case 'authentication':
            onVoiceAuthentication?.(result.data);
            
            if (result.data.isAuthenticated) {
              toast.success('Voice authentication successful');
            } else {
              toast.error('Voice authentication failed');
            }
            break;
            
          case 'enrollment':
            toast.success('Voice enrollment completed successfully');
            break;
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Voice processing failed');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const loadSupportedCommands = async () => {
    try {
      const response = await fetch('/api/voice-recognition/commands/supported', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSupportedCommands(result.data || []);
      }
    } catch (error) {
      console.error('Error loading supported commands:', error);
    }
  };

  React.useEffect(() => {
    if (mode === 'command') {
      loadSupportedCommands();
    }
  }, [mode]);

  const getQualityColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold">
            {mode === 'command' && 'Voice Commands'}
            {mode === 'authentication' && 'Voice Authentication'}
            {mode === 'enrollment' && 'Voice Enrollment'}
          </h3>
        </div>
        
        <p className="text-gray-600 mb-6">
          {mode === 'command' && 'Use voice commands to control attendance operations'}
          {mode === 'authentication' && 'Authenticate using your voice'}
          {mode === 'enrollment' && 'Enroll your voice for future recognition'}
        </p>

        <div className="space-y-4">
          {/* Recording Controls */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`px-6 py-3 rounded-lg font-medium min-w-[120px] ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
            </button>
          </div>

          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Audio Level</span>
                <span>{Math.round(audioLevel)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Voice Quality Analysis */}
          {voiceQuality && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">Voice Quality Analysis</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Quality Score:</span>
                  <span className={`font-medium ${getQualityColor(voiceQuality.qualityScore)}`}>
                    {Math.round(voiceQuality.qualityScore * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Signal Strength:</span>
                  <span className={getQualityColor(voiceQuality.signalStrength)}>
                    {Math.round(voiceQuality.signalStrength * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Noise Level:</span>
                  <span className={voiceQuality.noiseLevel > 0.3 ? 'text-red-600' : 'text-green-600'}>
                    {Math.round(voiceQuality.noiseLevel * 100)}%
                  </span>
                </div>
                {voiceQuality.recommendations.length > 0 && (
                  <div className="mt-3">
                    <p className="font-medium text-sm mb-1">Recommendations:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      {voiceQuality.recommendations.map((rec, index) => (
                        <li key={index}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Last Command Result */}
          {mode === 'command' && lastCommand && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium mb-3">Last Command</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span>Command:</span>
                  <span className="font-medium">{lastCommand}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Confidence:</span>
                  <span className={getConfidenceColor(confidence)}>
                    {Math.round(confidence * 100)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Supported Commands */}
          {mode === 'command' && supportedCommands.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Supported Commands:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {supportedCommands.map((cmd, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded">{cmd.category}</span>
                        <span className="font-medium text-sm">{cmd.command}</span>
                      </div>
                      <p className="text-xs text-gray-600">{cmd.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {cmd.examples?.map((example: string, exIndex: number) => (
                          <span key={exIndex} className="text-xs bg-white border px-2 py-1 rounded">
                            "{example}"
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-sm text-gray-600 space-y-1 bg-gray-50 p-4 rounded-lg">
            {mode === 'command' && (
              <>
                <p>• Click "Start Recording" and speak a command clearly</p>
                <p>• Speak in a quiet environment for best results</p>
                <p>• Commands will be executed automatically if confidence is high enough</p>
              </>
            )}
            {mode === 'authentication' && (
              <>
                <p>• Click "Start Recording" and speak your passphrase</p>
                <p>• Use the same voice and tone as during enrollment</p>
                <p>• Ensure you're in a quiet environment</p>
              </>
            )}
            {mode === 'enrollment' && (
              <>
                <p>• Click "Start Recording" and speak clearly for 3-5 seconds</p>
                <p>• Use your natural speaking voice</p>
                <p>• Record in a quiet environment for best quality</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecognitionComponent;
