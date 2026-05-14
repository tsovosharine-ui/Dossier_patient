'use client';

import { useState, useRef, useEffect } from 'react';
import { useNotifications, Notification } from '@/hooks/useNotifications';

interface Props {
  userId: string;
  service?: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "À l'instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

function urgenceDot(contenu: any) {
  if (contenu?.urgence === 'tu') return { bg: '#dc2626', label: 'STAT' };
  if (contenu?.urgence === 'u')  return { bg: '#d97706', label: 'Urgent' };
  return null;
}

export default function NotificationBell({ userId, service }: Props) {
  const { notifications, connected, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId, service);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fermer en cliquant dehors
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Cloche */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', transition: 'background .15s',
        }}
        title="Notifications"
      >
        <span className="ms" style={{ fontSize: 20, color: '#fff' }}>
          {unreadCount > 0 ? 'notifications_active' : 'notifications'}
        </span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            background: '#dc2626', color: '#fff',
            borderRadius: '50%', width: 16, height: 16,
            fontSize: 9, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--navy)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
        {/* Point de connexion */}
        <span style={{
          position: 'absolute', bottom: 3, right: 3,
          width: 7, height: 7, borderRadius: '50%',
          background: connected ? '#22c55e' : '#ef4444',
          border: '1px solid var(--navy)',
        }} />
      </button>

      {/* Panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 44, right: 0,
          width: 340, maxHeight: 480,
          background: 'var(--card)', borderRadius: 14,
          border: '1px solid var(--bdr)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          zIndex: 1000, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Header panel */}
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid var(--bdr)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="ms" style={{ fontSize: 18, color: 'var(--navy)' }}>notifications</span>
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--txt)' }}>Notifications</span>
              {!connected && (
                <span style={{ fontSize: 10, background: '#fef2f2', color: '#dc2626', borderRadius: 6, padding: '2px 6px', fontWeight: 600 }}>
                  Hors ligne
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} style={{
                fontSize: 11, color: 'var(--navy)', background: 'none',
                border: 'none', cursor: 'pointer', fontWeight: 600,
              }}>
                Tout marquer lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: 32, textAlign: 'center', color: 'var(--txt3)', fontSize: 13 }}>
                <span className="ms" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}>notifications_off</span>
                Aucune notification
              </div>
            ) : (
              notifications.map(n => {
                const urg = urgenceDot(n.contenu);
                const isUnread = n.statut !== 'LU';
                return (
                  <div
                    key={n.id}
                    onClick={() => { if (isUnread) markAsRead(n.id); }}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid var(--bdr)',
                      background: isUnread ? 'var(--navy-lt)' : 'transparent',
                      cursor: isUnread ? 'pointer' : 'default',
                      transition: 'background .15s',
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                    }}
                  >
                    {/* Icône type */}
                    <div style={{
                      width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                      background: urg ? urg.bg : 'var(--navy)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span className="ms" style={{ fontSize: 16, color: '#fff' }}>
                        {n.type === 'infirmier' ? 'health_and_safety' :
                         n.type === 'labo' ? 'biotech' :
                         n.type === 'imagerie' ? 'radiology' :
                         n.type === 'depot-sang' ? 'bloodtype' :
                         n.type === 'bloc' ? 'medical_services' : 'notifications'}
                      </span>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        {urg && (
                          <span style={{
                            fontSize: 9, fontWeight: 700, color: '#fff',
                            background: urg.bg, borderRadius: 4, padding: '1px 5px',
                          }}>{urg.label}</span>
                        )}
                        <span style={{ fontSize: 12, fontWeight: isUnread ? 700 : 500, color: 'var(--txt)', flex: 1 }}>
                          {n.titre}
                        </span>
                        {isUnread && (
                          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--navy)', flexShrink: 0 }} />
                        )}
                      </div>
                      <p style={{ fontSize: 11, color: 'var(--txt2)', margin: 0 }}>
                        Patient : {n.patientId?.slice(0, 8)}...
                      </p>
                      <p style={{ fontSize: 10, color: 'var(--txt3)', margin: '3px 0 0' }}>
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
