import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Search, Filter, MessageSquare } from 'lucide-react';
import { DiscussionType, discussionService } from '../../services/discussionService';
import { DiscussionCard } from '../../components/educational/DiscussionCard';
import { useAsync } from '../../hooks/use-async'
import { ErrorDisplay, LoadingState } from '../../components/ui/error-display';
import { useNavigate, useParams } from 'react-router-dom';

interface DiscussionsPageProps {
  courseId?: string;
}

export const DiscussionsPage: React.FC<DiscussionsPageProps> = ({ courseId: propCourseId }) => {
  const navigate = useNavigate();
  const { courseId: paramCourseId } = useParams<{ courseId: string }>();
  const courseId = propCourseId || paramCourseId || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const {
    data: discussionsData,
    loading,
    error,
    execute: fetchDiscussions
  } = useAsync(
    () => discussionService.getDiscussions(courseId, currentPage, pageSize),
    [courseId, currentPage, pageSize]
  );

  const discussions = discussionsData?.data || [];
  const totalCount = discussionsData?.totalCount || 0;

  useEffect(() => {
    if (courseId) {
      fetchDiscussions();
    }
  }, [courseId, currentPage, fetchDiscussions]);

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         discussion.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || discussion.type === typeFilter;
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'graded' && discussion.isGraded) ||
                         (statusFilter === 'ungraded' && !discussion.isGraded) ||
                         (statusFilter === 'pinned' && discussion.isPinned) ||
                         (statusFilter === 'locked' && discussion.isLocked) ||
                         (statusFilter === 'announcement' && discussion.isAnnouncement);

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewDiscussion = (discussionId: string) => {
    navigate(`/courses/${courseId}/discussions/${discussionId}`);
  };

  const handleEditDiscussion = (discussionId: string) => {
    navigate(`/courses/${courseId}/discussions/${discussionId}/edit`);
  };

  const handleCreateDiscussion = () => {
    navigate(`/courses/${courseId}/discussions/new`);
  };

  const getDiscussionStats = () => {
    const totalPosts = discussions.reduce((sum, d) => sum + d.postCount, 0);
    const totalParticipants = discussions.reduce((sum, d) => sum + d.participantCount, 0);
    const gradedDiscussions = discussions.filter(d => d.isGraded).length;
    
    return { totalPosts, totalParticipants, gradedDiscussions };
  };

  const stats = getDiscussionStats();

  if (loading) {
    return <LoadingState isLoading={true}>Loading discussions...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Discussions"
        message={error.message || 'An error occurred'}
        onRetry={fetchDiscussions}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Discussions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Engage in course discussions and forums
          </p>
        </div>
        <Button onClick={handleCreateDiscussion}>
          <Plus className="h-4 w-4 mr-2" />
          New Discussion
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{discussions.length}</p>
                <p className="text-sm text-gray-600">Total Discussions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalPosts}</p>
                <p className="text-sm text-gray-600">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                <p className="text-sm text-gray-600">Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.gradedDiscussions}</p>
                <p className="text-sm text-gray-600">Graded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5 text-blue-600" />
            Filter and Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search discussions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Discussion Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={DiscussionType.Threaded}>Threaded</SelectItem>
                <SelectItem value={DiscussionType.SideComment}>Side Comment</SelectItem>
                <SelectItem value={DiscussionType.NotThreaded}>Not Threaded</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="graded">Graded</SelectItem>
                <SelectItem value="ungraded">Ungraded</SelectItem>
                <SelectItem value="pinned">Pinned</SelectItem>
                <SelectItem value="locked">Locked</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {filteredDiscussions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No discussions found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your filters to see more discussions.'
                  : 'Get started by creating your first discussion.'}
              </p>
              {(!searchTerm && typeFilter === 'all' && statusFilter === 'all') && (
                <Button onClick={handleCreateDiscussion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Discussion
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredDiscussions.map((discussion) => (
            <DiscussionCard
              key={discussion.id}
              discussion={discussion}
              onViewDiscussion={handleViewDiscussion}
              onEditDiscussion={handleEditDiscussion}
              isTeacher={true}
            />
          ))
        )}
      </div>

      {totalCount > pageSize && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {Math.ceil(totalCount / pageSize)}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={currentPage >= Math.ceil(totalCount / pageSize)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default DiscussionsPage;
