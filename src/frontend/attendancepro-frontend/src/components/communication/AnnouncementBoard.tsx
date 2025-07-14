import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Megaphone, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  Trash2, 
  Send,
  Clock,
  Users,
  AlertTriangle
} from 'lucide-react';
import { Announcement, CreateAnnouncementRequest, announcementService } from '../../services/announcementService';
import { useToast } from '../../hooks/use-toast';

interface AnnouncementBoardProps {
  userRole: 'Admin' | 'Teacher' | 'Student' | 'Parent';
  canCreate?: boolean;
}

export function AnnouncementBoard({ canCreate = false }: AnnouncementBoardProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('');
  const [filterAudience, setFilterAudience] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  const [newAnnouncement, setNewAnnouncement] = useState<CreateAnnouncementRequest>({
    title: '',
    content: '',
    targetAudience: 'All',
    priority: 'Normal',
  });

  const { toast } = useToast();

  const loadAnnouncements = useCallback(async () => {
    try {
      setIsLoading(true);
      const { announcements: data, totalCount: count } = await announcementService.getAnnouncements(
        currentPage,
        20,
        filterAudience || undefined,
        filterPriority || undefined
      );
      setAnnouncements(data);
      setTotalCount(count);
      setError(null);
    } catch (err) {
      setError('Failed to load announcements');
      console.error('Error loading announcements:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterPriority, filterAudience]);

  useEffect(() => {
    loadAnnouncements();
  }, [loadAnnouncements]);

  const handleCreateAnnouncement = async () => {
    try {
      if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
        toast({
          title: "Validation Error",
          description: "Title and content are required",
          variant: "destructive",
        });
        return;
      }

      await announcementService.createAnnouncement(newAnnouncement);
      
      toast({
        title: "Success",
        description: "Announcement created successfully",
      });

      setShowCreateForm(false);
      setNewAnnouncement({
        title: '',
        content: '',
        targetAudience: 'All',
        priority: 'Normal',
      });
      
      loadAnnouncements();
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create announcement",
        variant: "destructive",
      });
      console.error('Error creating announcement:', err);
    }
  };

  const handlePublishAnnouncement = async (id: string) => {
    try {
      await announcementService.publishAnnouncement(id);
      toast({
        title: "Success",
        description: "Announcement published successfully",
      });
      loadAnnouncements();
    } catch (error) {
      console.error('Error publishing announcement:', error);
      toast({
        title: "Error",
        description: "Failed to publish announcement",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await announcementService.deleteAnnouncement(id);
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
      });
      loadAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      toast({
        title: "Error",
        description: "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await announcementService.markAsRead(id);
      loadAnnouncements();
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'destructive';
      case 'High': return 'default';
      case 'Normal': return 'secondary';
      case 'Low': return 'outline';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Urgent':
      case 'High':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Megaphone className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredAnnouncements = announcements.filter(announcement =>
    announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    announcement.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Megaphone className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold">Announcements</h2>
        </div>
        {canCreate && (
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Announcement
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search announcements..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priorities</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterAudience} onValueChange={setFilterAudience}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Audiences</SelectItem>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Students">Students</SelectItem>
                <SelectItem value="Teachers">Teachers</SelectItem>
                <SelectItem value="Parents">Parents</SelectItem>
                <SelectItem value="Staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Announcement title"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
            />
            <Textarea
              placeholder="Announcement content"
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
              rows={4}
            />
            <div className="flex gap-4">
              <Select
                value={newAnnouncement.targetAudience}
                onValueChange={(value: string) => setNewAnnouncement({ ...newAnnouncement, targetAudience: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Students">Students</SelectItem>
                  <SelectItem value="Teachers">Teachers</SelectItem>
                  <SelectItem value="Parents">Parents</SelectItem>
                  <SelectItem value="Staff">Staff</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={newAnnouncement.priority}
                onValueChange={(value: string) => setNewAnnouncement({ ...newAnnouncement, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAnnouncement}>
                Create Announcement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge variant={getPriorityColor(announcement.priority)}>
                      {getPriorityIcon(announcement.priority)}
                      <span className="ml-1">{announcement.priority}</span>
                    </Badge>
                    <Badge variant="outline">{announcement.targetAudience}</Badge>
                    {!announcement.isPublished && (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mb-2">{announcement.title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>By {announcement.authorName}</span>
                    <span>{formatDate(announcement.createdAt)}</span>
                    {announcement.expiresAt && (
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Expires {formatDate(announcement.expiresAt)}
                      </span>
                    )}
                  </div>
                </div>
                {canCreate && (
                  <div className="flex space-x-2">
                    {!announcement.isPublished && (
                      <Button
                        size="sm"
                        onClick={() => handlePublishAnnouncement(announcement.id)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Publish
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteAnnouncement(announcement.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{announcement.content}</p>
              
              {announcement.attachments && announcement.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Attachments:</h4>
                  <div className="flex flex-wrap gap-2">
                    {announcement.attachments.map((attachment, index) => (
                      <Badge key={index} variant="outline">
                        {attachment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {announcement.readCount} / {announcement.totalTargetCount} read
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {announcement.targetAudience}
                  </span>
                </div>
                {!canCreate && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleMarkAsRead(announcement.id)}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalCount > 20 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} of {Math.ceil(totalCount / 20)}
          </span>
          <Button
            variant="outline"
            disabled={currentPage >= Math.ceil(totalCount / 20)}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
