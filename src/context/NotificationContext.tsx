import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { DatabaseService } from '../db/storage';
import { useAuth } from './AuthContext';

export interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'warning' | 'info';
  title: string;
  message: string;
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  toasts: ToastMessage[];
  showToast: (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => void;
  dismissToast: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const loadNotifications = () => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    const notifs = DatabaseService.getNotifications(
      currentUser.role,
      currentUser.departmentId,
      currentUser.facultyId
    );
    setNotifications(notifs);
  };

  useEffect(() => {
    loadNotifications();
  }, [currentUser]);

  const showToast = (type: 'success' | 'danger' | 'warning' | 'info', title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastMessage = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const markAsRead = (id: string) => {
    DatabaseService.markNotificationRead(id);
    loadNotifications();
  };

  const markAllAsRead = () => {
    if (currentUser) {
      DatabaseService.markAllNotificationsRead(currentUser.role);
      loadNotifications();
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toasts,
        showToast,
        dismissToast,
        markAsRead,
        markAllAsRead,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within a NotificationProvider');
  return context;
};
