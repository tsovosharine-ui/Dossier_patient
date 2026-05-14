import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  titre: string;
  type: string;
  statut: string;
  patientId?: string;
  contenu?: any;
  read: boolean;
  createdAt: string;
}

export function useNotifications(userId: string, service?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    setUnreadCount(notifications.filter(n => n.statut !== 'LU').length);
  }, [notifications]);

  function markAsRead(id: string) {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, statut: 'LU', read: true } : n)
    );
  }

  function markAllAsRead() {
    setNotifications(prev => prev.map(n => ({ ...n, statut: 'LU', read: true })));
  }

  return { notifications, unreadCount, connected, markAsRead, markAllAsRead };
}
