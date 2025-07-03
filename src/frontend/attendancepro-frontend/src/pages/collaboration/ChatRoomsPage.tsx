import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Search, Filter, MessageCircle, Users } from 'lucide-react';
import { ChatType, chatService } from '../../services/chatService';
import { ChatRoomCard } from '../../components/educational/ChatRoomCard';
import { useAsync } from '../../hooks/use-async';
import { ErrorDisplay, LoadingState } from '../../components/ui/error-display';
import { useNavigate } from 'react-router-dom';

interface ChatRoomsPageProps {
  courseId?: string;
}

export const ChatRoomsPage: React.FC<ChatRoomsPageProps> = ({}) => {
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  const {
    data: chatRoomsData,
    loading,
    error,
    execute: fetchChatRooms
  } = useAsync(
    () => chatService.getChatRooms(currentPage, pageSize, typeFilter !== 'all' ? typeFilter as ChatType : undefined),
    [currentPage, pageSize, typeFilter]
  );

  const chatRooms = chatRoomsData?.data || [];
  const totalCount = chatRoomsData?.totalCount || 0;

  useEffect(() => {
    fetchChatRooms();
  }, [currentPage, typeFilter, fetchChatRooms]);

  const filteredChatRooms = chatRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const handleJoinRoom = async (roomId: string) => {
    try {
      await chatService.addParticipant(roomId, 'current-user-id'); // This should come from auth context
      navigate(`/chat/rooms/${roomId}`);
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleViewRoom = (roomId: string) => {
    navigate(`/chat/rooms/${roomId}`);
  };

  const handleEditRoom = (roomId: string) => {
    navigate(`/chat/rooms/${roomId}/edit`);
  };

  const handleCreateRoom = () => {
    navigate('/chat/rooms/new');
  };

  const getChatRoomStats = () => {
    const totalParticipants = chatRooms.reduce((sum, room) => sum + room.participantCount, 0);
    const activeRooms = chatRooms.filter(room => room.isActive).length;
    const courseRooms = chatRooms.filter(room => room.type === ChatType.CourseChat).length;
    
    return { totalParticipants, activeRooms, courseRooms };
  };

  const stats = getChatRoomStats();

  if (loading) {
    return <LoadingState isLoading={true}>Loading chat rooms...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Chat Rooms"
        message={error.message || 'An error occurred'}
        onRetry={fetchChatRooms}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chat Rooms</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect and collaborate with your peers
          </p>
        </div>
        <Button onClick={handleCreateRoom}>
          <Plus className="h-4 w-4 mr-2" />
          New Chat Room
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{chatRooms.length}</p>
                <p className="text-sm text-gray-600">Total Rooms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalParticipants}</p>
                <p className="text-sm text-gray-600">Total Participants</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.activeRooms}</p>
                <p className="text-sm text-gray-600">Active Rooms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.courseRooms}</p>
                <p className="text-sm text-gray-600">Course Chats</p>
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
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search chat rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Room Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value={ChatType.DirectMessage}>Direct Messages</SelectItem>
                <SelectItem value={ChatType.GroupChat}>Group Chats</SelectItem>
                <SelectItem value={ChatType.CourseChat}>Course Chats</SelectItem>
                <SelectItem value={ChatType.AnnouncementChannel}>Announcements</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredChatRooms.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No chat rooms found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {searchTerm || typeFilter !== 'all'
                    ? 'Try adjusting your filters to see more chat rooms.'
                    : 'Get started by creating your first chat room.'}
                </p>
                {(!searchTerm && typeFilter === 'all') && (
                  <Button onClick={handleCreateRoom}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Chat Room
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredChatRooms.map((chatRoom) => (
            <ChatRoomCard
              key={chatRoom.id}
              chatRoom={chatRoom}
              onJoinRoom={handleJoinRoom}
              onViewRoom={handleViewRoom}
              onEditRoom={handleEditRoom}
              isParticipant={true} // This should come from actual participation data
              canManage={true} // This should come from user permissions
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

export default ChatRoomsPage;
