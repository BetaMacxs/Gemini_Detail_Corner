import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMessages() {
      setLoading(true);
      try {
        const { data } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setMessages(data);
        } else {
          setMessages([
            {
              id: 'm1',
              name: 'Gadjah Khan',
              email: 'khan.gadjah87@gmail.com',
              message: 'I just love your products they are absolutely easy to use and produce incredible shine!',
              read: false,
              created_at: '2026-08-10T14:30:00Z'
            },
            {
              id: 'm2',
              name: 'Ashley Petersen',
              email: 'ashley@example.com',
              message: 'When will the Ceramic Force 1L be back in stock?',
              read: true,
              created_at: '2026-08-08T09:15:00Z'
            }
          ]);
        }
      } catch (e) {
        console.error("Error loading contact messages:", e);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, []);

  const handleToggleRead = async (msg: ContactMessage) => {
    const updated = !msg.read;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, read: updated } : m));

    try {
      await supabase.from('contact_messages').update({ read: updated }).eq('id', msg.id);
    } catch (e) {}
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f3f4f6', marginBottom: '2rem' }}>
        Messages
      </h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              backgroundColor: '#1f1f1f',
              border: '1px solid #2e2e2e',
              borderRadius: '0.5rem',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
                  {msg.name}
                </div>
                <div style={{ fontSize: '0.8125rem', color: '#9ca3af' }}>
                  {msg.email}
                </div>
              </div>

              <button
                onClick={() => handleToggleRead(msg)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'none',
                  border: 'none',
                  color: msg.read ? '#9ca3af' : '#ef4444',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {!msg.read && (
                  <span style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#ef4444', display: 'inline-block' }} />
                )}
                {msg.read ? 'replied' : 'Mark read'}
              </button>
            </div>

            <div style={{ fontSize: '0.875rem', color: '#e5e5e5', lineHeight: 1.5, backgroundColor: '#141414', padding: '0.85rem', borderRadius: '0.375rem', border: '1px solid #262626' }}>
              "{msg.message}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
