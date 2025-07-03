import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Send, 
  Paperclip, 
  Users, 
  Settings, 
  Search,
  Phone,
  Video,
  ArrowLeft,
  Hash,
  Lock
} from 'lucide-react';
import { MessageType, chatService } from '../../services/chatService';
import { MessageComponent } from '../educational/MessageComponent';
import { useAsync } from '../../hooks/use-async';
import { ErrorDisplay, LoadingState } from '../ui/error-display';
import { handleApiError } from '../../utils/error-handler';

interface ChatWindowProps {
  roomId: string;
  onBackToChannels?: () => void;
  showBackButton?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  roomId,
  onBackToChannels,
  showBackButton = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [newMessage, setNewMessage] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);

  const {
    data: chatRoom,
    loading: roomLoading,
    error: roomError,
    execute: fetchChatRoom
  } = useAsync(
    () => chatService.getChatRoom(roomId),
    [roomId]
  );

  const {
    data: messagesData,
    loading: messagesLoading,
    error: messagesError,
    execute: fetchMessages
  } = useAsync(
    () => chatService.getMessages(roomId, 1, 50),
    [roomId]
  );

  const {
    data: participants,
    loading: participantsLoading,
    error: participantsError,
    execute: fetchParticipants
  } = useAsync(
    () => chatService.getChatParticipants(roomId),
    [roomId]
  );

  const messages = messagesData?.data || [];

  useEffect(() => {
    fetchChatRoom();
    fetchMessages();
    fetchParticipants();
  }, [roomId, fetchChatRoom, fetchMessages, fetchParticipants]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      await chatService.sendMessage(roomId, {
        content: newMessage.trim(),
        messageType: MessageType.Text,
        replyToMessageId: replyToMessage || undefined
      });
      
      setNewMessage('');
      setReplyToMessage(null);
      fetchMessages();
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Failed to Send Message',
        fallbackMessage: 'Could not send your message. Please try again.'
      });
    }
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    try {
      await chatService.editMessage(roomId, messageId, content);
      fetchMessages();
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Failed to Edit Message',
        fallbackMessage: 'Could not edit the message. Please try again.'
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatService.deleteMessage(roomId, messageId);
      fetchMessages();
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Failed to Delete Message',
        fallbackMessage: 'Could not delete the message. Please try again.'
      });
    }
  };

  const handleReplyToMessage = (messageId: string) => {
    setReplyToMessage(messageId);
  };

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      await chatService.addReaction(roomId, messageId, emoji);
      fetchMessages();
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Failed to Add Reaction',
        fallbackMessage: 'Could not add reaction. Please try again.'
      });
    }
  };

  const handleRemoveReaction = async (messageId: string, reactionId: string) => {
    try {
      await chatService.removeReaction(roomId, messageId, reactionId);
      fetchMessages();
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Failed to Remove Reaction',
        fallbackMessage: 'Could not remove reaction. Please try again.'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (roomLoading) {
    return <LoadingState isLoading={true}>Loading chat room...</LoadingState>;
  }

  if (roomError || !chatRoom) {
    return (
      <ErrorDisplay
        title="Failed to Load Chat Room"
        message={typeof roomError === 'string' ? roomError : roomError?.message || 'Chat room not found'}
        onRetry={fetchChatRoom}
      />
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <Card className="rounded-none border-b">
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {showBackButton && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBackToChannels}
                    className="md:hidden"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                )}
                
                <div className="flex items-center gap-2">
                  {chatRoom.isPrivate ? <Lock className="h-4 w-4" /> : <Hash className="h-4 w-4" />}
                  <CardTitle className="text-lg">{chatRoom.name}</CardTitle>
                </div>
                
                {chatRoom.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 hidden md:block">
                    {chatRoom.description}
                  </p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-48"
                  />
                </div>
                
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Phone className="h-4 w-4" />
                </Button>
                
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Video className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowParticipants(!showParticipants)}
                >
                  <Users className="h-4 w-4" />
                  <span className="hidden md:inline ml-1">{chatRoom.participantCount}</span>
                </Button>
                
                <Button variant="outline" size="sm" className="hidden md:flex">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messagesLoading ? (
            <LoadingState isLoading={true}>Loading messages...</LoadingState>
          ) : messagesError ? (
            <ErrorDisplay
              title="Failed to Load Messages"
              message={typeof messagesError === 'string' ? messagesError : messagesError?.message || 'Failed to load messages'}
              onRetry={fetchMessages}
              variant="inline"
            />
          ) : messages.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Hash className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Be the first to start the conversation!
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <MessageComponent
                key={message.id}
                message={message}
                canEdit={true}
                canDelete={true}
                canReply={true}
                canReact={true}
                onEdit={handleEditMessage}
                onDelete={handleDeleteMessage}
                onReply={handleReplyToMessage}
                onReact={handleReactToMessage}
                onRemoveReaction={handleRemoveReaction}
                currentUserId="current-user-id"
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <Card className="rounded-none border-t">
          <CardContent className="p-4">
            {replyToMessage && (
              <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-2 border-blue-500">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Replying to message
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyToMessage(null)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <div className="flex-1">
                <Textarea
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[40px] max-h-32 resize-none"
                />
              </div>
              
              <Button 
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participants Sidebar */}
      {showParticipants && (
        <Card className="w-80 rounded-none border-l">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Participants ({chatRoom.participantCount})</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowParticipants(false)}
              >
                ×
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {participantsLoading ? (
              <LoadingState isLoading={true}>Loading participants...</LoadingState>
            ) : participantsError ? (
              <ErrorDisplay
                title="Failed to Load Participants"
                message="Could not load participant list"
                variant="minimal"
              />
            ) : (
              participants?.map((participant) => (
                <div key={participant.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                  <div className="relative">
                    {participant.userAvatar ? (
                      <img
                        src={participant.userAvatar}
                        alt={participant.userName}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                    {participant.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{participant.userName}</p>
                    <p className="text-xs text-gray-500">{participant.role}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ChatWindow;
