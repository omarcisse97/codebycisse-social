
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { useHabboAvatar } from './HabboAvatarContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCountNotification, setUnreadCountNotification] = useState(0);
  const [unreadCountMessages, setUnreadCountMessages] = useState(0);
  const { userInfo } = useAuth();
  const { avatar } = useHabboAvatar();
  
  useEffect(() => {
    if (userInfo?.id && avatar) {
      console.log('🔌 Connecting to WebSocket server...');
      
      // STEP 1: Connect to your server
      const newSocket = io(import.meta.env.VITE_SERVER_URL, {
        withCredentials: true
      });

      // STEP 2: When connected, tell server who you are
      newSocket.on('connect', () => {
        console.log('✅ Connected to server with socket ID:', newSocket.id);
        setIsConnected(true);
        
        // Authenticate - this puts you in your personal room
        newSocket.emit('authenticate', {
          userId: userInfo.id,
          username: userInfo.username,
          avatar: avatar
        });
      });

      // STEP 3: Server confirms you're authenticated
      newSocket.on('auth_success', (data) => {
        console.log('🎉 Authenticated successfully:', data);
        console.log(`You are now in room: user_${userInfo.id}`);
      });

      // STEP 4: Listen for real-time notifications (follows, likes, etc.)
      newSocket.on('new_notification', (notification) => {
        console.log('🔔 New notification received:', notification);
        
        // Add to notifications list
        setNotifications(prev => [notification, ...prev]);
        
        // Only increase notification count (not message count!)
        setUnreadCountNotification(prev => prev + 1);
        
        // Show notification toast/alert
        alert(`New ${notification.type}: ${notification.message}`);
      });

      // STEP 5: Listen for real-time messages (chat/DMs)
      newSocket.on('new_message', (message) => {
        console.log('💬 New message received:', message);
        
        // Add to messages list
        setMessages(prev => [message, ...prev]);
        
        // Increase message count
        setUnreadCountMessages(prev => prev + 1);
        
        // Optional: show message notification
        // alert(`New message from ${message.from_username}: ${message.content}`);
      });

      // STEP 6: Listen for online/offline status
      newSocket.on('user_online', (userId) => {
        console.log(`👤 User ${userId} came online`);
      });

      newSocket.on('user_offline', (userId) => {
        console.log(`👤 User ${userId} went offline`);
      });

      // STEP 7: Handle disconnection
      newSocket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from server:', reason);
        setIsConnected(false);
      });

      // STEP 8: Handle connection errors
      newSocket.on('connect_error', (error) => {
        console.error('🚨 Connection error:', error);
      });

      setSocket(newSocket);

      // Cleanup when component unmounts
      return () => {
        console.log('🧹 Cleaning up socket connection');
        newSocket.close();
      };
    }
  }, [userInfo, avatar]);

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
    setUnreadCountNotification(prev => Math.max(0, prev - 1));
  };

  const markMessageAsRead = (messageId) => {
    setMessages(prev => 
      prev.map(m => 
        m.id === messageId ? { ...m, is_read: true } : m
      )
    );
    setUnreadCountMessages(prev => Math.max(0, prev - 1));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCountNotification(0);
  };

  const clearAllMessages = () => {
    setMessages([]);
    setUnreadCountMessages(0);
  };

  // Helper function to send a message
  const sendMessage = (recipientId, content) => {
    if (socket && isConnected) {
      socket.emit('send_message', {
        to: recipientId,
        content: content,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      notifications,
      messages,
      unreadCountNotification,
      unreadCountMessages,
      markNotificationAsRead,
      markMessageAsRead,
      clearAllNotifications,
      clearAllMessages,
      sendMessage
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};