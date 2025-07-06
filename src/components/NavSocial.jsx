
import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from './contexts/SocketContext';
import { useAuth } from './contexts/AuthContext';
import { 
  XMarkIcon, 
  UserPlusIcon, 
  HeartIcon, 
  ChatBubbleLeftIcon,
  CheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Notifications Dropdown Component
export const NotificationsDropdown = ({ isOpen, onClose }) => {
  const { notifications, markNotificationAsRead, clearAllNotifications } = useSocket();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'follow':
        return <UserPlusIcon className="w-5 h-5 text-blue-500" />;
      case 'like':
        return <HeartIcon className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <ChatBubbleLeftIcon className="w-5 h-5 text-green-500" />;
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        <div className="flex items-center space-x-2">
          {notifications.length > 0 && (
            <button
              onClick={clearAllNotifications}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            
            <p>No notifications</p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={index}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                !notification.is_read ? 'bg-blue-50' : ''
              }`}
              onClick={() => markNotificationAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(notification.created_at)}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Messages Dropdown Component
export const MessagesDropdown = ({ isOpen, onClose, onStartChat }) => {
  const { messages, markMessageAsRead, clearAllMessages } = useSocket();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <button
              onClick={clearAllMessages}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="max-h-80 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No messages</p>
            
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                !message.is_read ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                markMessageAsRead(message.id);
                onStartChat(message.from_user_id);
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {message.from_username}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 truncate mt-1">
                    {message.content}
                  </p>
                </div>
                {!message.is_read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Friends/Following List Component
export const FriendsDropdown = ({ isOpen, onClose, onStartChat }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userInfo } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      fetchFriends();
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/users/${userInfo.id}/following`, {
        headers: {
          'api_key': 'your-api-key'
        }
      });
      const data = await response.json();
      if (data.success) {
        setFriends(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">People</h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Friends List */}
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : friends.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No friends</p>
          </div>
        ) : (
          friends.map((friend, index) => (
            <div
              key={index}
              className="p-3 border-b border-gray-100 hover:bg-gray-50"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                    {/* Online status indicator */}
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{friend.full_name}</p>
                    <p className="text-xs text-gray-500">@{friend.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => onStartChat(friend.id)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};