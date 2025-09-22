import { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import ChatUserList from '../components/chat/ChatUserList';
import ChatConversation from '../components/chat/ChatConversation';
import { ChatAltIcon } from '../components/icons';

const Chat = () => {
  const { 
    isConnected, 
    conversations, 
    selectedConversation, 
    loading, 
    error,
    refreshConversations 
  } = useChat();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    refreshConversations();
  }, []);

  const filteredConversations = conversations.filter(conv => 
    conv.otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser?.phoneNo?.includes(searchTerm)
  );

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Connecting to chat server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-h-screen">
      {/* Header - Fixed Height */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ChatAltIcon className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Chat</h1>
              <p className="text-sm text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4 flex-shrink-0">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Interface - Scrollable */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* User List Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <ChatUserList 
            conversations={filteredConversations}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedConversation={selectedConversation}
          />
        </div>

        {/* Chat Conversation Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedConversation ? (
            <ChatConversation 
              conversation={selectedConversation}
              loading={loading}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <ChatAltIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a user from the list to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat; 