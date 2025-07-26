import { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { getChatConversationMessages, markChatConversationAsSeen } from '../../apis';
import {
  PaperAirplaneIcon,
  UserCircleIcon,
  CheckIcon,
  CheckCircleIcon,
  RefreshIcon
} from '@heroicons/react/outline';

const ChatConversation = ({ conversation, loading }) => {
  const {
    messages,
    sendMessage,
    setTypingIndicator,
    isUserTyping,
    isUserOnline
  } = useChat();
  const { user } = useAuth();
  const [localMessages, setLocalMessages] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesTopRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const isOnline = isUserOnline(conversation.otherUser?.id);
  const isTypingUser = isUserTyping(conversation.otherUser?.id);

  useEffect(() => {
    if (conversation && !conversation.isPlaceholder) {
      loadInitialMessages();
    }
  }, [conversation]);

  useEffect(() => {
    if (conversation && !conversation.isPlaceholder) {
      const realtimeMessages = messages.filter(msg => 
        msg.conversationId === conversation.conversationId
      );
      
      console.log('Real-time messages for conversation:', {
        conversationId: conversation.conversationId,
        realtimeMessages: realtimeMessages,
        localMessagesCount: localMessages.length
      });
      
      const existingIds = new Set(localMessages.map(msg => msg._id));
      const newMessages = realtimeMessages.filter(msg => !existingIds.has(msg._id));
      
      if (newMessages.length > 0) {
        console.log('Adding new real-time messages to chat:', newMessages);
        setLocalMessages(prev => [...prev, ...newMessages]);
      }
    }
  }, [messages, conversation, localMessages]);




  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation]);


  const loadInitialMessages = async () => {
    if (!conversation?.conversationId) return;
    
    console.log('Loading INITIAL messages (last page) for conversation:', conversation.conversationId);
    
    try {
      setLocalLoading(true);
      setCurrentPage(1);
      setHasMoreMessages(true);
      
      const response = await getChatConversationMessages(conversation.conversationId, {
        limit: 20,
        page: 1
      });
      
      console.log('Initial messages response:', response.data.data);
      const messages = response.data.data.messages || [];
      setLocalMessages(messages);
      

      setHasMoreMessages(messages.length === 20);
      

      if (conversation.unreadCount > 0) {
        try {
          console.log('Marking conversation as seen after loading messages');
          await markChatConversationAsSeen(conversation.conversationId);
        } catch (error) {
          console.error('Failed to mark conversation as seen:', error);
        }
      }
    } catch (error) {
      console.error('Failed to load initial messages:', error);
    } finally {
      setLocalLoading(false);
    }
  };


  const loadRecentMessages = async () => {
    if (!conversation?.conversationId || localMessages.length === 0) return;
    
    try {
      const response = await getChatConversationMessages(conversation.conversationId, {
        limit: 20,
        page: 1
      });
      
      const newMessages = response.data.data.messages || [];
      const existingIds = new Set(localMessages.map(msg => msg._id));
      const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg._id));
      
      if (uniqueNewMessages.length > 0) {
        console.log('Adding recent messages:', uniqueNewMessages);
        setLocalMessages(prev => [...prev, ...uniqueNewMessages]);
      }
    } catch (error) {
      console.error('Failed to load recent messages:', error);
    }
  };


  const loadOlderMessages = async () => {
    if (!conversation?.conversationId || !hasMoreMessages || loadingOlderMessages) return;
    
    console.log('Loading OLDER messages for page:', currentPage + 1);
    
    try {
      setLoadingOlderMessages(true);
      const nextPage = currentPage + 1;
      
      const response = await getChatConversationMessages(conversation.conversationId, {
        limit: 20,
        page: nextPage
      });
      
      const olderMessages = response.data.data.messages || [];
      console.log('Older messages loaded:', olderMessages.length);
      
      if (olderMessages.length > 0) {
        setLocalMessages(prev => [...olderMessages, ...prev]);
        setCurrentPage(nextPage);
        setHasMoreMessages(olderMessages.length === 20);
      } else {
        setHasMoreMessages(false);
      }
    } catch (error) {
      console.error('Failed to load older messages:', error);
    } finally {
      setLoadingOlderMessages(false);
    }
  };


  const handleScroll = useCallback((e) => {
    const { scrollTop } = e.target;
    

    if (scrollTop === 0 && hasMoreMessages && !loadingOlderMessages) {
      console.log('Scrolled to top, loading older messages...');
      loadOlderMessages();
    }
  }, [hasMoreMessages, loadingOlderMessages, currentPage]);


  useEffect(() => {
    if (!loadingOlderMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, loadingOlderMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    
    sendMessage(conversation.otherUser.id, newMessage.trim(), 'user');
    setNewMessage('');
    setIsTyping(false);

    
    if (conversation.isPlaceholder) {
      setTimeout(() => {
        loadInitialMessages();
      }, 1000); 
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping) {
      setIsTyping(true);
      setTypingIndicator(conversation.otherUser.id, 'user');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatMessageDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(message => {
      const date = formatMessageDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    return groups;
  };

  const displayMessages = localMessages;
  

  const messageGroups = groupMessagesByDate(displayMessages);

  if (loading || localLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Conversation Header - Fixed Height */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-gray-600" />
              </div>
              {isOnline && (
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {conversation.otherUser?.name || 'Unknown User'}
              </h3>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                {isTypingUser && (
                  <span className="text-sm text-gray-500">typing...</span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={loadInitialMessages}
            disabled={localLoading}
            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 transition-colors duration-150"
            title="Refresh messages"
          >
            <RefreshIcon className={`h-5 w-5 ${localLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Messages Area - Scrollable with Fixed Height */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 p-4 min-h-0"
        onScroll={handleScroll}
      >
        {/* Loading older messages indicator */}
        {loadingOlderMessages && (
          <div className="flex justify-center py-4">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm">Loading older messages...</span>
            </div>
          </div>
        )}

        {/* Top reference for scroll detection */}
        <div ref={messagesTopRef} />

        {conversation.isPlaceholder ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-sm">No conversation yet</p>
              <p className="text-xs mt-1">Send a message to start chatting!</p>
            </div>
          </div>
        ) : Object.keys(messageGroups).length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(messageGroups).map(([date, dateMessages]) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex justify-center mb-4">
                  <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 border">
                    {date}
                  </span>
                </div>
                
                {/* Messages for this date */}
                <div className="space-y-3">
                  {dateMessages.map((message) => {
                    // Determine if this is an admin message by checking senderId against current admin
                    const isOwnMessage = message.senderId === user?._id || message.senderType === 'admin';
                    const showAvatar = !isOwnMessage;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {/* Avatar */}
                          {showAvatar && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                              <UserCircleIcon className="h-5 w-5 text-gray-600" />
                            </div>
                          )}
                          
                          {/* Message Bubble */}
                          <div className={`px-4 py-2 rounded-lg ${
                            isOwnMessage 
                              ? 'bg-primary text-white' 
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}>
                            <p className="text-sm break-words">{message.message}</p>
                            
                            {/* Message Time and Status */}
                            <div className={`flex items-center justify-end space-x-1 mt-1 ${
                              isOwnMessage ? 'text-white text-opacity-70' : 'text-gray-400'
                            }`}>
                              <span className="text-xs">
                                {formatMessageTime(message.timestamp)}
                              </span>
                              {isOwnMessage && (
                                <span className="text-xs">
                                  {message.status === 'seen' ? (
                                    <CheckCircleIcon className="h-3 w-3" />
                                  ) : (
                                    <CheckIcon className="h-3 w-3" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input - Fixed Height */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex space-x-3">
          <div className="flex-1">
            <textarea
              ref={inputRef}
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              rows="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatConversation; 