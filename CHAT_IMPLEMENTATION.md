# Live Chat System Implementation

This document describes the complete implementation of a real-time chat system for the admin dashboard using Socket.IO.

## Overview

The chat system enables real-time communication between admins and users with the following features:

- **Real-time messaging** using Socket.IO
- **User list with search and filtering**
- **Unread message indicators**
- **Online/offline status**
- **Typing indicators**
- **Message read receipts**
- **Message grouping by date**
- **Desktop notifications**
- **Chat statistics**

## Architecture

### Frontend Components

1. **ChatContext** (`src/context/ChatContext.jsx`)
   - Manages Socket.IO connection
   - Handles real-time events
   - Manages chat state (conversations, messages, typing indicators)

2. **Chat Page** (`src/pages/Chat.jsx`)
   - Main chat interface
   - Combines user list and conversation area

3. **ChatUserList** (`src/components/chat/ChatUserList.jsx`)
   - Displays list of users/conversations
   - Search and filtering functionality
   - Unread message badges
   - Online status indicators

4. **ChatConversation** (`src/components/chat/ChatConversation.jsx`)
   - Message display area
   - Message input and sending
   - Typing indicators
   - Message grouping by date

5. **ChatNotification** (`src/components/chat/ChatNotification.jsx`)
   - Header notification badge
   - Shows unread message count

6. **ChatStats** (`src/components/chat/ChatStats.jsx`)
   - Displays chat statistics
   - Used in dashboard

7. **ChatSettings** (`src/components/chat/ChatSettings.jsx`)
   - Chat preferences and settings
   - Notification testing

### API Integration

The chat system integrates with the backend through:

- **Socket.IO events** for real-time communication
- **REST API endpoints** for data retrieval and management
- **JWT authentication** for secure connections

## Features

### Real-time Messaging
- Instant message delivery
- Message status tracking (sent/seen)
- Typing indicators
- Auto-scroll to new messages

### User Management
- Searchable user list
- Sort by recent, unread, or name
- Online/offline status indicators
- Unread message counts

### Message Organization
- Messages grouped by date
- Timestamp display
- Read receipts
- Message previews

### Notifications
- Desktop notifications
- Sound alerts
- Header notification badge
- Unread count in sidebar

### Settings & Preferences
- Sound notifications toggle
- Desktop notifications toggle
- Auto-scroll settings
- Typing indicator preferences
- Connection status monitoring

## Socket.IO Events

### Client → Server
- `send_message` - Send a new message
- `message_seen` - Mark messages as seen
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `get_conversations` - Get user conversations
- `get_conversation_messages` - Get messages for a conversation
- `get_online_users` - Get online users list

### Server → Client
- `new_message` - New message received
- `message_sent` - Message sent confirmation
- `message_seen` - Message seen notification
- `user_typing` - User typing indicator
- `user_online` - User came online
- `user_offline` - User went offline
- `conversations` - Conversations list
- `conversation_messages` - Messages for a conversation

## API Endpoints

### Chat Management
- `GET /api/v1/chat/conversations` - Get conversations
- `GET /api/v1/chat/conversations/:id/messages` - Get conversation messages
- `POST /api/v1/chat/conversations/:id/seen` - Mark conversation as seen
- `GET /api/v1/chat/unread-count` - Get unread message count
- `GET /api/v1/chat/stats` - Get chat statistics
- `GET /api/v1/chat/users` - Get all users
- `DELETE /api/v1/chat/messages/:id` - Delete message

## Installation & Setup

### Prerequisites
- Node.js backend with Socket.IO server running on port 3001
- JWT authentication system
- MongoDB database with chat collections

### Frontend Setup
1. Ensure `socket.io-client` is installed:
   ```bash
   npm install socket.io-client
   ```

2. The chat system is automatically integrated into the admin dashboard

3. Access the chat at `/chat` route

### Configuration
- Backend URL: `http://:3001` (configurable in `src/config/config.js`)
- Socket.IO transports: WebSocket and polling
- JWT token authentication required

## Usagelocalhost

### For Admins
1. Navigate to the "Live Chat" section in the sidebar
2. View the list of users with conversations
3. Click on a user to start chatting
4. Send messages using the input field
5. Monitor online status and typing indicators
6. Check unread message counts

### Features Available
- **Search users** by name or phone number
- **Sort conversations** by recent, unread, or name
- **Real-time messaging** with instant delivery
- **Message status** tracking (sent/seen)
- **Typing indicators** to show when users are typing
- **Online status** indicators
- **Desktop notifications** for new messages
- **Chat statistics** in the dashboard

## Customization

### Styling
The chat components use Tailwind CSS classes and follow the existing design system:
- Primary color: `bg-primary` (configurable)
- Consistent spacing and typography
- Responsive design for mobile and desktop

### Settings
Chat preferences are stored in localStorage and include:
- Sound notifications
- Desktop notifications
- Auto-scroll behavior
- Typing indicators
- Message previews
- Online status display

### Extensions
The chat system can be extended with:
- File/image sharing
- Voice messages
- Video calls
- Message reactions
- Message editing/deletion
- Chat rooms/groups

## Troubleshooting

### Common Issues
1. **Connection failed**: Check if backend server is running
2. **Authentication error**: Verify JWT token is valid
3. **Messages not sending**: Check network connection
4. **Notifications not working**: Ensure browser permissions

### Debug Mode
Enable debug logging by setting:
```javascript
localStorage.setItem('chatDebug', 'true');
```

## Security Considerations

- All connections require valid JWT tokens
- Messages are validated on both client and server
- Rate limiting should be implemented on the backend
- Input sanitization for message content
- CORS configuration for cross-origin requests

## Performance

- Efficient message rendering with virtualization for large conversations
- Optimized Socket.IO connection management
- Minimal re-renders using React hooks
- Lazy loading of conversation messages
- Debounced typing indicators

## Browser Support

- Modern browsers with WebSocket support
- Fallback to polling for older browsers
- Progressive enhancement for features

## Future Enhancements

- Message encryption
- File upload support
- Voice/video calling
- Chat analytics
- Message search
- Chat export functionality
- Multi-language support
- Accessibility improvements

## Support

For issues or questions about the chat implementation:
1. Check the browser console for errors
2. Verify backend server status
3. Test with different browsers
4. Review Socket.IO documentation
5. Check network connectivity

---

This implementation provides a complete, production-ready chat system that integrates seamlessly with the existing admin dashboard architecture. 