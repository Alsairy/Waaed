import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Plus, Search, MessageCircle, Hash } from 'lucide-react';
import { ChatType, chatService } from '../../services/chatService';
import { ChatWindow } from '../../components/communication/ChatWindow';
import { ChannelList } from '../../components/communication/ChannelList';
import { useAsync } from '../../hooks/use-async';
import { ErrorDisplay, LoadingState } from '../../components/ui/error-display';

export const ChatPage: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showChannelList, setShowChannelList] = useState(true);

  const {
    data: chatRoomsData,
    loading,
    error,
    execute: fetchChatRooms
  } = useAsync(
    () => chatService.getChatRooms(1, 50, typeFilter !== 'all' ? typeFilter as ChatType : undefined),
    [typeFilter]
  );

  const chatRooms = chatRoomsData?.data || [];

  useEffect(() => {
    fetchChatRooms();
  }, [typeFilter, fetchChatRooms]);

  const filteredChatRooms = chatRooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (room.description && room.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoomId(roomId);
    if (window.innerWidth < 768) {
      setShowChannelList(false);
    }
  };

  const handleBackToChannels = () => {
    setShowChannelList(true);
    setSelectedRoomId(null);
  };

  const handleCreateRoom = () => {
    console.log('Create new room');
  };

  if (loading) {
    return <LoadingState isLoading={true}>Loading chat rooms...</LoadingState>;
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Chat"
        message={error.message || 'An error occurred'}
        onRetry={fetchChatRooms}
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Channel List Sidebar */}
      <div className={`${showChannelList ? 'block' : 'hidden'} md:block w-full md:w-80 border-r bg-white dark:bg-gray-800`}>
        <Card className="h-full rounded-none border-0">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Rooms
              </CardTitle>
              <Button size="sm" onClick={handleCreateRoom}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value={ChatType.DirectMessage}>Direct Messages</SelectItem>
                  <SelectItem value={ChatType.GroupChat}>Group Chats</SelectItem>
                  <SelectItem value={ChatType.CourseChat}>Course Chats</SelectItem>
                  <SelectItem value={ChatType.AnnouncementChannel}>Announcements</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent className="p-0">
            <ChannelList
              chatRooms={filteredChatRooms}
              selectedRoomId={selectedRoomId}
              onRoomSelect={handleRoomSelect}
            />
          </CardContent>
        </Card>
      </div>

      {/* Chat Window */}
      <div className={`${!showChannelList || selectedRoomId ? 'block' : 'hidden'} md:block flex-1`}>
        {selectedRoomId ? (
          <ChatWindow
            roomId={selectedRoomId}
            onBackToChannels={handleBackToChannels}
            showBackButton={!showChannelList}
          />
        ) : (
          <Card className="h-full rounded-none border-0">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <Hash className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Welcome to Chat
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Select a chat room from the sidebar to start messaging
                </p>
                <Button onClick={handleCreateRoom}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Room
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
