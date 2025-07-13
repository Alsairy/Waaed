import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Users, 
  Settings,
  Share,
  MessageSquare,
  MoreVertical
} from 'lucide-react';
import { VideoConference, ConferenceParticipant, videoConferencingService } from '../../services/videoConferencingService';
import { useToast } from '../../hooks/use-toast';

interface VideoConferenceRoomProps {
  conferenceId: string;
  onLeave: () => void;
}

export function VideoConferenceRoom({ conferenceId, onLeave }: VideoConferenceRoomProps) {
  const [conference, setConference] = useState<VideoConference | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideosRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadConference();
    initializeWebRTC();
    
    return () => {
      cleanup();
    };
  }, [conferenceId]);

  const loadConference = async () => {
    try {
      setIsLoading(true);
      const conferenceData = await videoConferencingService.getConference(conferenceId);
      setConference(conferenceData);
      setError(null);
    } catch (err) {
      setError('Failed to load conference details');
      console.error('Error loading conference:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWebRTC = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Successfully connected to the conference",
      });
    } catch (err) {
      setError('Failed to access camera/microphone');
      console.error('WebRTC initialization error:', err);
    }
  };

  const toggleVideo = async () => {
    try {
      const stream = localVideoRef.current?.srcObject as MediaStream;
      if (stream) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !isVideoEnabled;
          setIsVideoEnabled(!isVideoEnabled);
        }
      }
    } catch (err) {
      console.error('Error toggling video:', err);
    }
  };

  const toggleAudio = async () => {
    try {
      const stream = localVideoRef.current?.srcObject as MediaStream;
      if (stream) {
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !isAudioEnabled;
          setIsAudioEnabled(!isAudioEnabled);
        }
      }
    } catch (err) {
      console.error('Error toggling audio:', err);
    }
  };

  const handleLeaveConference = async () => {
    try {
      await videoConferencingService.leaveConference(conferenceId);
      cleanup();
      onLeave();
      toast({
        title: "Left Conference",
        description: "You have left the conference",
      });
    } catch (err) {
      console.error('Error leaving conference:', err);
      toast({
        title: "Error",
        description: "Failed to leave conference",
        variant: "destructive",
      });
    }
  };

  const cleanup = () => {
    const stream = localVideoRef.current?.srcObject as MediaStream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsConnected(false);
  };

  const formatDuration = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Joining conference...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert className="max-w-md">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold">{conference?.title}</h1>
          <Badge variant={conference?.status === 'InProgress' ? 'default' : 'secondary'}>
            {conference?.status}
          </Badge>
          {conference?.actualStartTime && (
            <span className="text-sm text-gray-300">
              {formatDuration(conference.actualStartTime)}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowParticipants(!showParticipants)}
          >
            <Users className="h-4 w-4 mr-2" />
            {conference?.participants?.length || 0}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowChat(!showChat)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Remote Videos Grid */}
          <div 
            ref={remoteVideosRef}
            className="grid grid-cols-2 gap-2 h-full p-4"
          >
            {conference?.participants?.map((participant) => (
              <Card key={participant.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-2">
                  <div className="aspect-video bg-gray-700 rounded flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-xl font-semibold">
                          {participant.user?.name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <p className="text-sm">{participant.user?.name || 'Unknown'}</p>
                      <div className="flex items-center justify-center space-x-1 mt-1">
                        {participant.isMuted && <MicOff className="h-3 w-3 text-red-500" />}
                        {!participant.isVideoEnabled && <VideoOff className="h-3 w-3 text-red-500" />}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Local Video */}
          <div className="absolute bottom-4 right-4 w-48 h-36">
            <Card className="bg-gray-800 border-gray-700 h-full">
              <CardContent className="p-2 h-full">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute bottom-2 left-2 flex space-x-1">
                  {!isAudioEnabled && <MicOff className="h-3 w-3 text-red-500" />}
                  {!isVideoEnabled && <VideoOff className="h-3 w-3 text-red-500" />}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <div className="w-80 bg-gray-800 border-l border-gray-700">
            {showParticipants && (
              <Card className="bg-transparent border-0">
                <CardHeader>
                  <CardTitle className="text-white">Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {conference?.participants?.map((participant) => (
                      <div key={participant.id} className="flex items-center justify-between p-2 rounded bg-gray-700">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold">
                              {participant.user?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{participant.user?.name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">{participant.role}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          {participant.isMuted && <MicOff className="h-3 w-3 text-red-500" />}
                          {!participant.isVideoEnabled && <VideoOff className="h-3 w-3 text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4 flex items-center justify-center space-x-4">
        <Button
          variant={isAudioEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleAudio}
          className="rounded-full w-12 h-12"
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
        
        <Button
          variant={isVideoEnabled ? "default" : "destructive"}
          size="lg"
          onClick={toggleVideo}
          className="rounded-full w-12 h-12"
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="destructive"
          size="lg"
          onClick={handleLeaveConference}
          className="rounded-full w-12 h-12"
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12"
        >
          <Share className="h-5 w-5" />
        </Button>
        
        <Button
          variant="outline"
          size="lg"
          className="rounded-full w-12 h-12"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
