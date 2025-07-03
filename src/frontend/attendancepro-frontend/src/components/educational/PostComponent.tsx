import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown, 
  Reply, 
  Edit, 
  Trash2, 
  Star,
  MoreHorizontal,
  Paperclip
} from 'lucide-react';
import { DiscussionPost } from '../../services/discussionService';
import { formatRelativeTime } from '../../utils/date-utils';

interface PostComponentProps {
  post: DiscussionPost;
  isReply?: boolean;
  canRate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canReply?: boolean;
  onReply?: (postId: string, content: string) => void;
  onEdit?: (postId: string, content: string) => void;
  onDelete?: (postId: string) => void;
  onRate?: (postId: string, rating: number) => void;
  onLoadReplies?: (postId: string) => void;
  replies?: DiscussionPost[];
  className?: string;
}

export const PostComponent: React.FC<PostComponentProps> = ({
  post,
  isReply = false,
  canRate = false,
  canEdit = false,
  canDelete = false,
  canReply = true,
  onReply,
  onEdit,
  onDelete,
  onRate,
  onLoadReplies,
  replies = [],
  className = ''
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(post.content);
  const [showReplies, setShowReplies] = useState(false);

  const handleReply = () => {
    if (replyContent.trim() && onReply) {
      onReply(post.id, replyContent);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim() && onEdit) {
      onEdit(post.id, editContent);
      setShowEditForm(false);
    }
  };

  const handleRate = (rating: number) => {
    if (onRate) {
      onRate(post.id, rating);
    }
  };

  const toggleReplies = () => {
    if (!showReplies && onLoadReplies) {
      onLoadReplies(post.id);
    }
    setShowReplies(!showReplies);
  };

  const getRatingColor = () => {
    if (post.rating > 0) return 'text-green-600';
    if (post.rating < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  return (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} ${className}`}>
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {post.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{post.authorName}</p>
                <p className="text-xs text-gray-500">{formatRelativeTime(post.createdAt)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canRate && (
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={getRatingColor()}>
                    <Star className="h-3 w-3 mr-1" />
                    {post.rating}
                  </Badge>
                  <span className="text-xs text-gray-500">({post.ratingCount})</span>
                </div>
              )}
              
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {showEditForm ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your post..."
                className="min-h-[100px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit}>
                  Save Changes
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowEditForm(false);
                    setEditContent(post.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {post.content}
              </p>
            </div>
          )}

          {post.attachmentUrls && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Paperclip className="h-4 w-4" />
              <span>Attachment</span>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-4">
              {canRate && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRate(1)}
                    className="text-green-600 hover:text-green-700"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRate(-1)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {canReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              )}

              {post.replyCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleReplies}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {post.replyCount} {post.replyCount === 1 ? 'Reply' : 'Replies'}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditForm(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}

              {canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(post.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {showReplyForm && (
            <div className="space-y-3 pt-3 border-t">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="min-h-[80px]"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleReply}>
                  Post Reply
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setShowReplyForm(false);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showReplies && replies.length > 0 && (
        <div className="space-y-2">
          {replies.map((reply) => (
            <PostComponent
              key={reply.id}
              post={reply}
              isReply={true}
              canRate={canRate}
              canEdit={reply.authorId === 'current-user-id'}
              canDelete={reply.authorId === 'current-user-id'}
              canReply={canReply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onRate={onRate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostComponent;
