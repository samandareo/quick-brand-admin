import { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { getAllChatUsers } from '../../apis';
import { SearchIcon, UserCircleIcon } from '@heroicons/react/outline';

const ChatUserList = ({ 
  conversations, 
  searchTerm, 
  onSearchChange, 
  selectedConversation 
}) => {
  const { selectConversation, isUserOnline, getTotalUnreadCount } = useChat();
  const { user } = useAuth();
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'unread'
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const getLastMessagePreview = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet';
    
    const message = conversation.lastMessage.message;
    return message.length > 30 ? `${message.substring(0, 30)}...` : message;
  };

  const sortConversations = (conversations) => {
    switch (sortBy) {
      case 'unread':
        return [...conversations].sort((a, b) => b.unreadCount - a.unreadCount);
      case 'recent':
      default:
        return [...conversations].sort((a, b) => {
          const aTime = a.lastMessage?.timestamp ? new Date(a.lastMessage.timestamp) : new Date(0);
          const bTime = b.lastMessage?.timestamp ? new Date(b.lastMessage.timestamp) : new Date(0);
          return bTime - aTime;
        });
    }
  };

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await getAllChatUsers({ 
          search: searchTerm, 
          limit: 50, 
          page: 1 
        });
        setAllUsers(response.data.data.users);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [searchTerm]);

  // Combine conversations with all users
  const combinedUsers = allUsers.map(user => {
    const existingConversation = conversations.find(conv => 
      conv.otherUser?.id === user._id || conv.otherUser?._id === user._id
    );
    
    if (existingConversation) {
      console.log('Found existing conversation:', existingConversation);
      return existingConversation;
    } else {
      // Create a placeholder conversation for users without conversations
      // The conversation ID format should be: userId_adminId (sorted)
      const adminId = user?._id || localStorage.getItem('adminId') || 'admin';
      const sortedIds = [user._id, adminId].sort();
      const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;
      
      // Debug: Check if this matches the format from the API
      console.log('Admin ID from context:', user?._id);
      console.log('Admin ID from localStorage:', localStorage.getItem('adminId'));
      
      console.log('Creating placeholder conversation:', {
        userId: user._id,
        adminId: adminId,
        sortedIds: sortedIds,
        conversationId: conversationId
      });
      
      return {
        conversationId: conversationId,
        otherUser: {
          id: user._id,
          name: user.name,
          phoneNo: user.phoneNo,
          isVerified: user.isVerified
        },
        lastMessage: null,
        messageCount: 0,
        unreadCount: 0,
        isPlaceholder: true
      };
    }
  });

  const sortedConversations = sortConversations(combinedUsers);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Conversations</h2>
          <div className="text-sm text-gray-500">
            {getTotalUnreadCount()} unread
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        {/* Sort Options */}
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => setSortBy('recent')}
            className={`px-3 py-1 text-xs rounded-full ${
              sortBy === 'recent' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setSortBy('unread')}
            className={`px-3 py-1 text-xs rounded-full ${
              sortBy === 'unread' 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
            <p className="text-sm">Loading users...</p>
          </div>
        ) : sortedConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <UserCircleIcon className="h-12 w-12 mb-2" />
            <p className="text-sm">
              {searchTerm ? 'No users found' : 'No users available'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedConversations.map((conversation) => {
              const isSelected = selectedConversation?.conversationId === conversation.conversationId;
              const isOnline = isUserOnline(conversation.otherUser?.id);
              
              return (
                <div
                  key={conversation.conversationId}
                  onClick={() => {
                    console.log('Selecting conversation:', conversation);
                    selectConversation(conversation);
                  }}
                  className={`p-4 cursor-pointer transition-colors duration-150 ${
                    isSelected 
                      ? 'bg-primary text-white' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* User Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center ${
                        isSelected ? 'bg-white bg-opacity-20' : 'bg-gray-300'
                      }`}>
                        <UserCircleIcon className={`h-8 w-8 ${
                          isSelected ? 'text-white' : 'text-gray-600'
                        }`} />
                      </div>
                      {/* Online Indicator */}
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium truncate ${
                          isSelected ? 'text-white' : 'text-gray-900'
                        }`}>
                          {conversation.otherUser?.name || 'Unknown User'}
                        </h3>
                        <span className={`text-xs ${
                          isSelected ? 'text-white text-opacity-80' : 'text-gray-500'
                        }`}>
                          {formatTime(conversation.lastMessage?.timestamp)}
                        </span>
                      </div>
                      
                                             <p className={`text-sm truncate mt-1 ${
                         isSelected ? 'text-white text-opacity-80' : 'text-gray-500'
                       }`}>
                         {conversation.isPlaceholder ? 'No messages yet' : getLastMessagePreview(conversation)}
                       </p>
                      
                      <div className="flex items-center justify-between mt-2">
                                                 <span className={`text-xs ${
                           isSelected ? 'text-white text-opacity-60' : 'text-gray-400'
                         }`}>
                           {conversation.otherUser?.phoneNo || 'No phone'}
                         </span>
                         
                         {/* Verification Badge */}
                         {conversation.otherUser?.isVerified && (
                           <span className={`text-xs ${
                             isSelected ? 'text-white text-opacity-80' : 'text-green-600'
                           }`}>
                             ✓ Verified
                           </span>
                         )}
                        
                        {/* Unread Badge */}
                        {conversation.unreadCount > 0 && (
                          <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-medium rounded-full ${
                            isSelected 
                              ? 'bg-white text-primary' 
                              : 'bg-primary text-white'
                          }`}>
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatUserList; 