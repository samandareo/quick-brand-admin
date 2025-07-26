import { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { ChatAltIcon } from '@heroicons/react/outline';

const ChatNotification = () => {
  const { getTotalUnreadCount, isConnected } = useChat();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const updateUnreadCount = () => {
      setUnreadCount(getTotalUnreadCount());
    };

    updateUnreadCount();

    const interval = setInterval(updateUnreadCount, 5000);

    return () => clearInterval(interval);
  }, [getTotalUnreadCount]);

  if (!isConnected || unreadCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {unreadCount > 99 ? '99+' : unreadCount}
      </div>
      <ChatAltIcon className="h-6 w-6 text-gray-600" />
    </div>
  );
};

export default ChatNotification; 