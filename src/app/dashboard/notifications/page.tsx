'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, Settings, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface Notification {
  id: string;
  type: 'new_contract_match' | 'deadline_reminder';
  title: string;
  message: string;
  data?: any;
  notification_status: 'pending' | 'sent' | 'failed' | 'read';
  channel: 'email' | 'in_app' | 'whatsapp';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  created_at: string;
  read_at?: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (user) {
    fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      if (!user) {
        console.error('No user found');
        return;
      }

      // Fetch notifications directly from Supabase
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (notificationsError) {
        console.error('Error fetching notifications:', notificationsError);
        return;
      }

      // Get unread count
      const { count: unreadCount, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('notification_status', 'sent')
        .is('read_at', null);

      if (countError) {
        console.error('Error fetching unread count:', countError);
        return;
      }

      setNotifications(notifications || []);
      setUnreadCount(unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
          notification_status: 'read',
          updated_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, notification_status: 'read', read_at: new Date().toISOString() }
            : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user) {
        console.error('No user found');
        return;
      }

      const { error } = await supabase
        .from('notifications')
        .update({
          read_at: new Date().toISOString(),
          notification_status: 'read',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('notification_status', 'sent');

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notif => ({ 
          ...notif, 
          notification_status: 'read', 
          read_at: new Date().toISOString() 
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-blue-600 bg-blue-50';
      case 'low': return 'text-black bg-gray-50';
      default: return 'text-black bg-gray-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'new_contract_match': return '📋';
      case 'deadline_reminder': return '⏰';
      default: return '🔔';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') {
      return notif.notification_status === 'sent' && !notif.read_at;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-800">Loading notifications...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
        <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
              <h1 className="text-3xl font-bold text-black">Notifications</h1>
              <p className="mt-2 text-gray-800">
                Stay updated with contract matches and deadline reminders
          </p>
        </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard/notifications/settings"
                className="flex items-center px-4 py-2 text-black hover:text-black transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
                  <CheckCheck className="w-4 h-4 mr-2" />
                  Mark All Read
          </button>
        )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-black hover:text-black'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-black hover:text-black'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-black">
                {filter === 'unread' 
                  ? 'All your notifications have been read.'
                  : 'You\'ll receive notifications when new contracts match your preferences or when deadlines approach.'
                }
              </p>
        </div>
        ) : (
            <div className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
            <div 
              key={notification.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    notification.notification_status === 'sent' && !notification.read_at 
                      ? 'bg-blue-50 border-l-4 border-blue-500' 
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                        <h3 className="text-lg font-semibold text-black">
                        {notification.title}
                      </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                          {notification.priority}
                        </span>
                      </div>
                      
                      <p className="text-black mb-4 whitespace-pre-line">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          {new Date(notification.created_at).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="capitalize">{notification.channel}</span>
                        {notification.data?.contract_url && (
                          <Link
                            href={notification.data.contract_url}
                            className="flex items-center text-blue-600 hover:text-blue-700"
                          >
                            View Contract
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </Link>
                      )}
                    </div>
                  </div>
                    
                    {notification.notification_status === 'sent' && !notification.read_at && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Mark as Read
                      </button>
                    )}
              </div>
            </div>
          ))}
        </div>
        )}
        </div>
      </div>
    </div>
  );
}
