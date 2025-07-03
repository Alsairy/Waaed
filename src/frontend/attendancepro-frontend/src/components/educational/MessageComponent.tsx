import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  User, 
  Clock, 
  Edit, 
  Trash2, 
  Reply, 
  File,
  Image as ImageIcon,
  Mic,
  Smile
} from 'lucide-react';
import { ChatMessage, MessageType } from '../../services/chatService';
import { formatRelativeTime } from '../../utils/date-utils';

interface MessageComponentProps {
  message: ChatMessage;
  canEdit?: boolean;
  canDelete?: boolean;
  canReply?: boolean;
  canReact?: boolean;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, reactionId: string) => void;
  currentUserId?: string;
  className?: string;
}

export const MessageComponent: React.FC<MessageComponentProps> = ({
  message,
  canEdit = false,
  canDelete = false,
  canReply = false,
  canReact = false,
  onEdit,
  onDelete,
  onReply,
  onReact,
  onRemoveReaction,
  currentUserId,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const getMessageTypeIcon = (type: MessageType) => {
    switch (type) {
      case MessageType.File:
        return <File className="h-4 w-4" />;
      case MessageType.Image:
        return <ImageIcon className="h-4 w-4" />;
      case MessageType.Voice:
        return <Mic className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getReactionEmojis = () => {
    const reactionMap = new Map<string, { count: number; users: string[]; hasCurrentUser: boolean }>();
    
    message.reactions.forEach(reaction => {
      const existing = reactionMap.get(reaction.emoji) || { count: 0, users: [], hasCurrentUser: false };
      existing.count++;
      existing.users.push(reaction.userName);
      if (reaction.userId === currentUserId) {
        existing.hasCurrentUser = true;
      }
      reactionMap.set(reaction.emoji, existing);
    });

    return Array.from(reactionMap.entries()).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      users: data.users,
      hasCurrentUser: data.hasCurrentUser
    }));
  };

  const handleReactionClick = (emoji: string) => {
    const existingReaction = message.reactions.find(
      r => r.emoji === emoji && r.userId === currentUserId
    );
    
    if (existingReaction) {
      onRemoveReaction?.(message.id, existingReaction.id);
    } else {
      onReact?.(message.id, emoji);
    }
  };

  const commonReactions = ['👍', '❤️', '😊', '😂', '😮', '😢'];

  return (
    <Card className={`${className} ${message.isDeleted ? 'opacity-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {message.senderAvatar ? (
              <img
                src={message.senderAvatar}
                alt={message.senderName}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">{message.senderName}</span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatRelativeTime(message.createdAt)}</span>
                {message.isEdited && (
                  <Badge variant="secondary" className="text-xs">
                    Edited
                  </Badge>
                )}
              </div>
              {message.messageType !== MessageType.Text && (
                <div className="flex items-center gap-1">
                  {getMessageTypeIcon(message.messageType)}
                  <span className="text-xs text-gray-500">{message.messageType}</span>
                </div>
              )}
            </div>

            {message.replyToMessageId && (
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-2 mb-2 border-l-2 border-blue-500">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Replying to a message
                </p>
              </div>
            )}

            {message.isDeleted ? (
              <p className="text-sm text-gray-500 italic">This message was deleted</p>
            ) : (
              <div className="space-y-2">
                {isEditing ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.attachmentUrl && (
                      <div className="mt-2">
                        {message.messageType === MessageType.Image ? (
                          <img
                            src={message.attachmentUrl}
                            alt="Attachment"
                            className="max-w-xs rounded-lg"
                          />
                        ) : (
                          <a
                            href={message.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
                          >
                            <File className="h-4 w-4" />
                            View Attachment
                          </a>
                        )}
                      </div>
                    )}

                    {message.mentions.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>Mentions:</span>
                          {message.mentions.map((mention, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              @{mention}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {message.reactions.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {getReactionEmojis().map(({ emoji, count, users, hasCurrentUser }) => (
                      <Button
                        key={emoji}
                        variant={hasCurrentUser ? "default" : "outline"}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleReactionClick(emoji)}
                        title={`${users.join(', ')} reacted with ${emoji}`}
                      >
                        {emoji} {count}
                      </Button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  {canReact && (
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowReactions(!showReactions)}
                        className="h-6 px-2"
                      >
                        <Smile className="h-3 w-3" />
                      </Button>
                      
                      {showReactions && (
                        <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 flex gap-1 z-10">
                          {commonReactions.map(emoji => (
                            <Button
                              key={emoji}
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                handleReactionClick(emoji);
                                setShowReactions(false);
                              }}
                            >
                              {emoji}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {canReply && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onReply?.(message.id)}
                      className="h-6 px-2"
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  )}

                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="h-6 px-2"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  )}

                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete?.(message.id)}
                      className="h-6 px-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MessageComponent;
