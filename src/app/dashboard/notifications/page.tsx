"use client";

import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Clock,
  X,
  Check
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Notification } from "@/types/database";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching notifications:', error);
        return;
      }

      setNotifications(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marking notification as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        return;
      }

      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "error":
        return <X className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-600">
            Stay updated with your bid activities and important updates
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Check className="w-4 h-4 mr-2" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications</h3>
            <p className="text-slate-600">You're all caught up! We'll notify you when new contracts match your preferences.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-slate-50 transition-colors ${
                  !notification.read ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-medium ${
                        !notification.read ? 'text-slate-900' : 'text-slate-600'
                      }`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-500 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(notification.created_at)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {notification.message}
                    </p>
                    {!notification.read && (
                      <button 
                        onClick={() => markAsRead(notification.id)}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}