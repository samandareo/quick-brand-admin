import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { markChatConversationAsSeen } from '../apis';
import config from '../config/config';

const ChatContext = createContext();

const isDebugEnabled = import.meta.env.VITE_CHAT_DEBUG === 'true' || localStorage.getItem('chatDebug') === 'true';

const debugLog = (...args) => {
  if (isDebugEnabled) {
    console.log('[Chat Debug]:', ...args);
  }
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const typingTimeouts = useRef(new Map());

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const newSocket = io("https://adminquickbondplush.aspshopping.com/api", {
      auth: { token },
      transports: ['polling', 'websocket'], // Try polling first, then websocket
      secure: true,
      rejectUnauthorized: false,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 20000,
      // Additional options for better connection handling
      upgrade: true,
      rememberUpgrade: true,
      withCredentials: true
    });

    debugLog('Attempting to connect to:', config.apiUrl);
    debugLog('Socket configuration:', {
      auth: { token: token ? 'present' : 'missing' },
      transports: ['websocket', 'polling'],
      secure: true
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      debugLog('Connected to chat server');
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
      setError(`Connection failed: ${error.message}`);
      debugLog('Socket connection error:', error);
    });

    newSocket.on('disconnect', (reason) => {
      setIsConnected(false);
      debugLog('Disconnected from chat server:', reason);
      if (reason === 'io server disconnect') {
        // Server disconnected, reconnect manually
        newSocket.connect();
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      setIsConnected(true);
      setError(null);
      debugLog('Reconnected to chat server after', attemptNumber, 'attempts');
    });

    newSocket.on('reconnect_error', (error) => {
      debugLog('Reconnection failed:', error);
      setError(`Reconnection failed: ${error.message}`);
    });

    newSocket.on('user_joined', (data) => {
      console.log('Joined as:', data.userType, data.userId);
    });

    newSocket.on('new_message', (message) => {
      console.log('New message received:', message);
      handleNewMessage(message);
    });

    newSocket.on('message_sent', (message) => {
      console.log('Message sent confirmation:', message);
      handleMessageSent(message);
    });

    newSocket.on('message_seen', (data) => {
      handleMessageSeen(data);
    });

    newSocket.on('user_typing', (data) => {
      handleTypingIndicator(data);
    });

    newSocket.on('user_online', (data) => {
      setOnlineUsers(prev => new Set([...prev, data.userId]));
    });

    newSocket.on('user_offline', (data) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });

    newSocket.on('conversations', (conversations) => {
      console.log('Received conversations:', conversations);
      setConversations(conversations);
      updateUnreadCounts(conversations);
    });

    newSocket.on('conversation_messages', (data) => {
      if (data.conversationId === selectedConversation?.conversationId) {
        setMessages(data.messages);
      }
    });

    newSocket.on('error', (error) => {
      setError(error.message);
      console.error('Chat error:', error);
    });

    newSocket.emit('get_conversations');
    newSocket.emit('get_online_users');

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const handleNewMessage = (message) => {
    console.log('New message received via Socket.IO:', message);
    
    setConversations(prev => {
      const updated = prev.map(conv => {
        if (conv.conversationId === message.conversationId) {
          return {
            ...conv,
            lastMessage: message,
            messageCount: conv.messageCount + 1,
            unreadCount: conv.unreadCount + (message.senderType === 'user' ? 1 : 0)
          };
        }
        return conv;
      });
      updateUnreadCounts(updated);
      return updated;
    });

    setMessages(prev => [...prev, message]);
    
    if (selectedConversation?.conversationId === message.conversationId && message.senderType === 'user') {
      socket?.emit('message_seen', { conversationId: message.conversationId });
    }
  };

  const handleMessageSent = (message) => {
    console.log('Message sent confirmation via Socket.IO:', message);
    setMessages(prev => [...prev, message]);
  };

  const handleMessageSeen = (data) => {
    console.log('Message seen notification received:', data);
    
    setMessages(prev => 
      prev.map(msg => 
        msg._id === data.messageId 
          ? { ...msg, status: 'seen' }
          : msg
      )
    );

    if (data.conversationId) {
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.conversationId === data.conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        );
        updateUnreadCounts(updated);
        return updated;
      });
    }
  };

  const handleTypingIndicator = (data) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      if (data.isTyping) {
        newSet.add(data.userId);
      } else {
        newSet.delete(data.userId);
      }
      return newSet;
    });
  };

  const updateUnreadCounts = (conversations) => {
    const counts = {};
    conversations.forEach(conv => {
      counts[conv.conversationId] = conv.unreadCount;
    });
    setUnreadCounts(counts);
    console.log('Updated unread counts:', counts);
  };

  const sendMessage = (receiverId, message, receiverType = 'user') => {
    if (!socket || !isConnected) {
      setError('Not connected to chat server');
      return;
    }

    socket.emit('send_message', {
      receiverId,
      message,
      receiverType
    });
  };

  const startTyping = (receiverId, receiverType = 'user') => {
    if (!socket || !isConnected) return;
    socket.emit('typing_start', { receiverId, receiverType });
  };

  const stopTyping = (receiverId, receiverType = 'user') => {
    if (!socket || !isConnected) return;
    socket.emit('typing_stop', { receiverId, receiverType });
  };

  const setTypingIndicator = (receiverId, receiverType = 'user', duration = 3000) => {
    startTyping(receiverId, receiverType);
    
    const key = `${receiverId}_${receiverType}`;
    if (typingTimeouts.current.has(key)) {
      clearTimeout(typingTimeouts.current.get(key));
    }
    
    typingTimeouts.current.set(key, setTimeout(() => {
      stopTyping(receiverId, receiverType);
      typingTimeouts.current.delete(key);
    }, duration));
  };

  const selectConversation = async (conversation) => {
    console.log('Selecting conversation:', conversation);
    setSelectedConversation(conversation);
    setMessages([]); 
    setLoading(true);

    if (conversation.isPlaceholder) {
      setLoading(false);
      return;
    }

    if (conversation.unreadCount > 0) {
      try {
        console.log('Marking conversation as seen:', conversation.conversationId);
        
        await markChatConversationAsSeen(conversation.conversationId);
        
        socket?.emit('message_seen', { conversationId: conversation.conversationId });
        
        setConversations(prev => {
          const updated = prev.map(conv => 
            conv.conversationId === conversation.conversationId
              ? { ...conv, unreadCount: 0 }
              : conv
          );
          updateUnreadCounts(updated);
          return updated;
        });
        
        console.log('Conversation marked as seen successfully');
      } catch (error) {
        console.error('Failed to mark conversation as seen:', error);
      }
    }

    setLoading(false);
  };

  const getConversationMessages = (conversationId, limit = 50, skip = 0) => {
    if (!socket || !isConnected) return;
    
    socket.emit('get_conversation_messages', {
      conversationId,
      limit,
      skip
    });
  };

  const refreshConversations = () => {
    if (socket && isConnected) {
      socket.emit('get_conversations');
    }
  };

  const getTotalUnreadCount = () => {
    const total = Object.values(unreadCounts).reduce((total, count) => total + count, 0);
    console.log('Total unread count:', total, 'from counts:', unreadCounts);
    return total;
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const isUserTyping = (userId) => {
    return typingUsers.has(userId);
  };

  const markConversationAsSeen = async (conversationId) => {
    try {
      console.log('Manually marking conversation as seen:', conversationId);
      await markChatConversationAsSeen(conversationId);
      
      setConversations(prev => {
        const updated = prev.map(conv => 
          conv.conversationId === conversationId
            ? { ...conv, unreadCount: 0 }
            : conv
        );
        updateUnreadCounts(updated);
        return updated;
      });
      
      socket?.emit('message_seen', { conversationId });
      
      console.log('Conversation marked as seen successfully');
    } catch (error) {
      console.error('Failed to mark conversation as seen:', error);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        isConnected,
        conversations,
        selectedConversation,
        messages,
        typingUsers,
        onlineUsers,
        unreadCounts,
        loading,
        error,
        
        sendMessage,
        startTyping,
        stopTyping,
        setTypingIndicator,
        selectConversation,
        getConversationMessages,
        refreshConversations,
        getTotalUnreadCount,
        isUserOnline,
        isUserTyping,
        markConversationAsSeen,
        
        socket
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}; 