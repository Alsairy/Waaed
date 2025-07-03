import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { MessageSquare, Users, Calendar, Pin, Lock, Award, Clock } from 'lucide-react';
import { Discussion, DiscussionType } from '../../services/discussionService';
import { formatDate, formatRelativeTime } from '../../utils/date-utils';

interface DiscussionCardProps {
  discussion: Discussion;
  onViewDiscussion?: (discussionId: string) => void;
  onEditDiscussion?: (discussionId: string) => void;
  isTeacher?: boolean;
  className?: string;
}

export const DiscussionCard: React.FC<DiscussionCardProps> = ({
  discussion,
  onViewDiscussion,
  onEditDiscussion,
  isTeacher = false,
  className = ''
}) => {
  const getDiscussionTypeColor = (type: DiscussionType) => {
    switch (type) {
      case DiscussionType.Threaded:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case DiscussionType.SideComment:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case DiscussionType.NotThreaded:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const isAvailable = () => {
    const now = new Date();
    const availableFrom = discussion.availableFrom ? new Date(discussion.availableFrom) : null;
    const availableUntil = discussion.availableUntil ? new Date(discussion.availableUntil) : null;
    
    if (availableFrom && now < availableFrom) return false;
    if (availableUntil && now > availableUntil) return false;
    return true;
  };

  const getStatusBadges = () => {
    const badges: React.ReactElement[] = [];
    
    if (discussion.isPinned) {
      badges.push(
        <Badge key="pinned" variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Pin className="h-3 w-3 mr-1" />
          Pinned
        </Badge>
      );
    }
    
    if (discussion.isLocked) {
      badges.push(
        <Badge key="locked" variant="secondary" className="bg-red-100 text-red-800">
          <Lock className="h-3 w-3 mr-1" />
          Locked
        </Badge>
      );
    }
    
    if (discussion.isGraded) {
      badges.push(
        <Badge key="graded" variant="secondary" className="bg-green-100 text-green-800">
          <Award className="h-3 w-3 mr-1" />
          {discussion.points} pts
        </Badge>
      );
    }
    
    if (discussion.isAnnouncement) {
      badges.push(
        <Badge key="announcement" variant="secondary" className="bg-orange-100 text-orange-800">
          Announcement
        </Badge>
      );
    }
    
    return badges;
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">
              {discussion.title}
            </CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getDiscussionTypeColor(discussion.type)}>
                {discussion.type}
              </Badge>
              {getStatusBadges()}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {discussion.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
            {discussion.description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-gray-500" />
            <span>{discussion.postCount} Posts</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-500" />
            <span>{discussion.participantCount} Participants</span>
          </div>

          {discussion.dueDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Due {formatDate(discussion.dueDate)}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span>{formatRelativeTime(discussion.updatedAt)}</span>
          </div>
        </div>

        {(discussion.availableFrom || discussion.availableUntil) && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <div className="text-sm">
              <span className="font-medium">Availability: </span>
              {discussion.availableFrom && (
                <span>From {formatDate(discussion.availableFrom)} </span>
              )}
              {discussion.availableUntil && (
                <span>Until {formatDate(discussion.availableUntil)}</span>
              )}
            </div>
          </div>
        )}

        {discussion.requireInitialPost && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> You must post before viewing other responses
            </p>
          </div>
        )}

        {isTeacher && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Allow Rating: </span>
                <span>{discussion.allowRating ? 'Yes' : 'No'}</span>
              </div>
              <div>
                <span className="font-medium">Sort by Rating: </span>
                <span>{discussion.sortByRating ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onViewDiscussion?.(discussion.id)}
            className="flex-1"
            disabled={!isAvailable() && !isTeacher}
          >
            {discussion.isLocked && !isTeacher ? 'View (Locked)' : 'View Discussion'}
          </Button>
          
          {isTeacher && (
            <Button
              variant="outline"
              onClick={() => onEditDiscussion?.(discussion.id)}
            >
              Edit
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscussionCard;
