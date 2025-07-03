import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { 
  ArrowLeft, 
  MessageSquare, 
  Users, 
  Calendar, 
  Pin, 
  Lock, 
  Award,
  Plus,
  Send
} from 'lucide-react';
import { 
  Discussion, 
  discussionService,
  CreateDiscussionPostDto 
} from '../../services/discussionService';
import { PostComponent } from '../../components/educational/PostComponent';
import { useAsync } from '../../hooks/use-async';
import { ErrorDisplay, LoadingState } from '../../components/ui/error-display';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDate, formatRelativeTime } from '../../utils/date-utils';
import { handleApiError } from '../../utils/error-handler';

export const DiscussionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseId, discussionId } = useParams<{ courseId: string; discussionId: string }>();
  
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  const {
    data: discussion,
    loading: discussionLoading,
    error: discussionError,
    execute: fetchDiscussion
  } = useAsync(
    () => discussionService.getDiscussion(courseId!, discussionId!),
    [courseId, discussionId]
  );

  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
    execute: fetchPosts
  } = useAsync(
    () => discussionService.getDiscussionPosts(courseId!, discussionId!, currentPage, pageSize),
    [courseId, discussionId, currentPage, pageSize]
  );

  const posts = postsData?.data || [];
  const totalPostCount = postsData?.totalCount || 0;

  useEffect(() => {
    if (courseId && discussionId) {
      fetchDiscussion();
      fetchPosts();
    }
  }, [courseId, discussionId, currentPage, fetchDiscussion, fetchPosts]);

  const handleSubmitPost = async () => {
    if (!newPostContent.trim() || !courseId || !discussionId) return;

    setIsSubmittingPost(true);
    try {
      const postData: CreateDiscussionPostDto = {
        content: newPostContent.trim()
      };

      await discussionService.createDiscussionPost(courseId, discussionId, postData);
      setNewPostContent('');
      fetchPosts(); // Refresh posts
      fetchDiscussion(); // Refresh discussion stats
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Failed to Submit Post',
        fallbackMessage: 'Could not submit your post. Please try again.'
      });
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const handleReplyToPost = async (postId: string, content: string) => {
    if (!courseId || !discussionId) return;

    try {
      const replyData: CreateDiscussionPostDto = {
        content: content.trim(),
        parentPostId: postId
      };

      await discussionService.createDiscussionPost(courseId, discussionId, replyData);
      fetchPosts(); // Refresh posts
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Failed to Submit Reply',
        fallbackMessage: 'Could not submit your reply. Please try again.'
      });
    }
  };

  const handleEditPost = async (postId: string, content: string) => {
    if (!courseId || !discussionId) return;

    try {
      await discussionService.updateDiscussionPost(courseId, discussionId, postId, {
        content: content.trim()
      });
      fetchPosts(); // Refresh posts
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Failed to Edit Post',
        fallbackMessage: 'Could not edit the post. Please try again.'
      });
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!courseId || !discussionId) return;

    try {
      await discussionService.deleteDiscussionPost(courseId, discussionId, postId);
      fetchPosts(); // Refresh posts
      fetchDiscussion(); // Refresh discussion stats
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Failed to Delete Post',
        fallbackMessage: 'Could not delete the post. Please try again.'
      });
    }
  };

  const handleRatePost = async (postId: string, rating: number) => {
    if (!courseId || !discussionId) return;

    try {
      await discussionService.ratePost(courseId, discussionId, postId, rating);
      fetchPosts(); // Refresh posts to show updated ratings
    } catch (error) {
      handleApiError(error, { 
        showToast: true, 
        toastTitle: 'Failed to Rate Post',
        fallbackMessage: 'Could not rate the post. Please try again.'
      });
    }
  };

  const getStatusBadges = (discussion: Discussion) => {
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

  const isAvailable = (discussion: Discussion) => {
    const now = new Date();
    const availableFrom = discussion.availableFrom ? new Date(discussion.availableFrom) : null;
    const availableUntil = discussion.availableUntil ? new Date(discussion.availableUntil) : null;
    
    if (availableFrom && now < availableFrom) return false;
    if (availableUntil && now > availableUntil) return false;
    return true;
  };

  if (discussionLoading) {
    return <LoadingState isLoading={true}>Loading discussion...</LoadingState>;
  }

  if (discussionError || !discussion) {
    return (
      <ErrorDisplay
        title="Failed to Load Discussion"
        message={typeof discussionError === 'string' ? discussionError : discussionError?.message || 'Discussion not found'}
        onRetry={fetchDiscussion}
        onGoHome={() => navigate(`/courses/${courseId}/discussions`)}
      />
    );
  }

  const canPost = isAvailable(discussion) && !discussion.isLocked;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/courses/${courseId}/discussions`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Discussions
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-3">{discussion.title}</CardTitle>
              <div className="flex items-center gap-2 flex-wrap mb-4">
                <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {discussion.type}
                </Badge>
                {getStatusBadges(discussion)}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {discussion.description && (
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 dark:text-gray-300">
                {discussion.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>Updated {formatRelativeTime(discussion.updatedAt)}</span>
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
        </CardContent>
      </Card>

      {canPost && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="h-5 w-5 mr-2" />
              Add New Post
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[120px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitPost}
                disabled={!newPostContent.trim() || isSubmittingPost}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmittingPost ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            Discussion Posts ({totalPostCount})
          </h2>
        </div>

        {postsLoading ? (
          <LoadingState isLoading={true}>Loading posts...</LoadingState>
        ) : postsError ? (
          <ErrorDisplay
            title="Failed to Load Posts"
            message={typeof postsError === 'string' ? postsError : postsError?.message || 'Failed to load posts'}
            onRetry={fetchPosts}
          />
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Be the first to start the discussion!
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <PostComponent
              key={post.id}
              post={post}
              canRate={discussion.allowRating}
              canEdit={post.authorId === 'current-user-id'}
              canDelete={post.authorId === 'current-user-id'}
              canReply={canPost}
              onReply={handleReplyToPost}
              onEdit={handleEditPost}
              onDelete={handleDeletePost}
              onRate={handleRatePost}
            />
          ))
        )}
      </div>

      {totalPostCount > pageSize && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {Math.ceil(totalPostCount / pageSize)}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= Math.ceil(totalPostCount / pageSize)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiscussionDetailPage;
