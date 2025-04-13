import React, { useState, useEffect, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { Bell, X, AlertTriangle, Package, Users, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../App';
import type { Database } from '../types/supabase';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'incident' | 'resource' | 'volunteer' | 'system';
  read: boolean;
  link?: string;
  created_at: string;
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useContext(AuthContext);

  // Mock notifications for demonstration
  useEffect(() => {
    if (!user) return;

    // Create mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New Incident Reported',
        message: 'A new flood incident has been reported in downtown area.',
        type: 'incident',
        read: false,
        link: '/incidents',
        created_at: new Date(Date.now() - 30 * 60000).toISOString(),
      },
      {
        id: '2',
        title: 'Resource Update',
        message: 'Medical supplies have been depleted at North Center.',
        type: 'resource',
        read: false,
        link: '/resources',
        created_at: new Date(Date.now() - 2 * 60 * 60000).toISOString(),
      },
      {
        id: '3',
        title: 'Volunteer Assignment',
        message: 'You have been assigned to the flood response team.',
        type: 'volunteer',
        read: true,
        link: '/volunteers',
        created_at: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(notification => !notification.read).length);

    // In a real app, you would subscribe to real-time notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        (payload) => {
          console.log('New notification:', payload);
          // Handle real notifications here
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const formatTimeAgo = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'incident':
        return <AlertTriangle className="h-4 w-4 text-danger-500" />;
      case 'resource':
        return <Package className="h-4 w-4 text-warning-500" />;
      case 'volunteer':
        return <Users className="h-4 w-4 text-secondary-500" />;
      default:
        return <Info className="h-4 w-4 text-primary-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button 
        onClick={() => setShowNotifications(!showNotifications)}
        className="p-2 rounded-full hover:bg-primary-400 transition-colors relative"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-danger-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse-slow">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-10 border border-gray-200 animate-fade-in">
          <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50">
            <h3 className="text-sm font-medium text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-xs text-primary-600 hover:text-primary-800 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No notifications
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div 
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 ${notification.read ? 'bg-white' : 'bg-primary-50'} animate-slide-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {getNotificationIcon(notification.type)}
                        <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <span className="text-xs text-gray-500 mt-1 block">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)} 
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Mark as read"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {notification.link && (
                    <Link
                      to={notification.link}
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs text-primary-600 hover:text-primary-800 transition-colors block mt-2"
                    >
                      View details →
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 