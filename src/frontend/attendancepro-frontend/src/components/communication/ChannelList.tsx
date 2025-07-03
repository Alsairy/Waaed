import React from 'react';
import { Badge } from '../ui/badge';
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

interface ChannelListProps {
  chatRooms: ChatRoom[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
  className?: string;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  chatRooms,
  selectedRoomId,
  onRoomSelect,
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


  const groupedRooms = chatRooms.reduce((acc, room) => {
    const type = room.type;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(room);
    return acc;
  }, {} as Record<ChatType, ChatRoom[]>);

  const getTypeLabel = (type: ChatType) => {
    switch (type) {
      case ChatType.DirectMessage:
        return 'Direct Messages';
      case ChatType.GroupChat:
        return 'Group Chats';
      case ChatType.CourseChat:
        return 'Course Chats';
      case ChatType.AnnouncementChannel:
        return 'Announcements';
      default:
        return type;
    }
  };

  return (
    <div className={`h-full overflow-y-auto ${className}`}>
      {Object.entries(groupedRooms).map(([type, rooms]) => (
        <div key={type} className="mb-4">
          <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b">
            {getTypeLabel(type as ChatType)} ({rooms.length})
          </div>
          
          <div className="space-y-1">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
                className={`w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  selectedRoomId === room.id 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' 
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getChatTypeIcon(room.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm truncate">
                        {room.name}
                      </h3>
                      {room.isPrivate && <Lock className="h-3 w-3 text-gray-500 flex-shrink-0" />}
                      {!room.isActive && (
                        <Badge variant="secondary" className="text-xs px-1 py-0">
                          Inactive
                        </Badge>
                      )}
                    </div>
                    
                    {room.lastMessage && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-1">
                        {room.lastMessage}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{room.participantCount}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {room.lastMessageAt 
                            ? formatRelativeTime(room.lastMessageAt)
                            : formatRelativeTime(room.createdAt)
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
      
      {chatRooms.length === 0 && (
        <div className="p-8 text-center">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            No chat rooms found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Create or join a chat room to start messaging
          </p>
        </div>
      )}
    </div>
  );
};

export default ChannelList;
