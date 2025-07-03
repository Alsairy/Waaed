import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  MessageCircle, 
  Users, 
  Clock, 
  Lock, 
  Hash,
  User,
  BookOpen,
  Megaphone
} from 'lucide-react';
import { ChatRoom, ChatType } from '../../services/chatService';
import { formatRelativeTime } from '../../utils/date-utils';

interface ChatRoomCardProps {
  chatRoom: ChatRoom;
  onJoinRoom?: (roomId: string) => void;
  onViewRoom?: (roomId: string) => void;
  onEditRoom?: (roomId: string) => void;
  isParticipant?: boolean;
  canManage?: boolean;
  className?: string;
}

export const ChatRoomCard: React.FC<ChatRoomCardProps> = ({
  chatRoom,
  onJoinRoom,
  onViewRoom,
  onEditRoom,
  isParticipant = false,
  canManage = false,
  className = ''
}) => {
  const getChatTypeIcon = (type: ChatType) => {
    switch (type) {
      case ChatType.DirectMessage:
        return <User className="h-4 w-4" />;
      case ChatType.GroupChat:
        return <Users className="h-4 w-4" />;
      case ChatType.CourseChat:
        return <BookOpen className="h-4 w-4" />;
      case ChatType.AnnouncementChannel:
        return <Megaphone className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const getChatTypeColor = (type: ChatType) => {
    switch (type) {
      case ChatType.DirectMessage:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case ChatType.GroupChat:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case ChatType.CourseChat:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case ChatType.AnnouncementChannel:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getChatTypeName = (type: ChatType) => {
    switch (type) {
      case ChatType.DirectMessage:
        return 'Direct Message';
      case ChatType.GroupChat:
        return 'Group Chat';
      case ChatType.CourseChat:
        return 'Course Chat';
      case ChatType.AnnouncementChannel:
        return 'Announcements';
      default:
        return type;
    }
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-1 mb-2 flex items-center gap-2">
              {getChatTypeIcon(chatRoom.type)}
              {chatRoom.name}
              {chatRoom.isPrivate && <Lock className="h-4 w-4 text-gray-500" />}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getChatTypeColor(chatRoom.type)}>
                {getChatTypeName(chatRoom.type)}
              </Badge>
              {!chatRoom.isActive && (
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  Inactive
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {chatRoom.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {chatRoom.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{chatRoom.participantCount} Members</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>
              {chatRoom.lastMessageAt 
                ? `Active ${formatRelativeTime(chatRoom.lastMessageAt)}`
                : `Created ${formatRelativeTime(chatRoom.createdAt)}`
              }
            </span>
          </div>
        </div>

        {chatRoom.lastMessage && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle className="h-3 w-3 text-gray-500" />
              <span className="text-xs text-gray-500">Last message</span>
            </div>
            <p className="text-sm line-clamp-2">{chatRoom.lastMessage}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {isParticipant ? (
            <Button
              onClick={() => onViewRoom?.(chatRoom.id)}
              className="flex-1"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Open Chat
            </Button>
          ) : (
            <Button
              onClick={() => onJoinRoom?.(chatRoom.id)}
              className="flex-1"
              disabled={!chatRoom.isActive}
            >
              <Users className="h-4 w-4 mr-2" />
              Join Room
            </Button>
          )}
          
          {canManage && (
            <Button
              variant="outline"
              onClick={() => onEditRoom?.(chatRoom.id)}
            >
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatRoomCard;
