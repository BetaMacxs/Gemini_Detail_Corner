import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Trash2, CheckCircle2, Search, Calendar } from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  created_at: string;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    let list: ContactMessage[] = [];

    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        list = data as ContactMessage[];
      }
    } catch (e) {
      console.warn("Error fetching DB messages:", e);
    }

    setMessages(list);
    if (list.length > 0 && !selectedMessage) {
      setSelectedMessage(list[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleToggleRead = async (msg: ContactMessage) => {
    const newStatus = msg.status === 'READ' ? 'UNREAD' : 'READ';
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, status: newStatus as any } : m));
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage({ ...selectedMessage, status: newStatus as any });
    }

    try {
      await supabase.from('contact_messages').update({ status: newStatus }).eq('id', msg.id);
    } catch (e) {
      console.warn("Toggle read message warning:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;
    setMessages(prev => prev.filter(m => m.id !== id));
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }

    try {
      await supabase.from('contact_messages').delete().eq('id', id);
    } catch (e) {
      console.warn("Delete message error:", e);
    }
  };

  const filteredMessages = messages.filter(m => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.email.toLowerCase().includes(term) ||
      (m.subject && m.subject.toLowerCase().includes(term)) ||
      m.message.toLowerCase().includes(term)
    );
  });

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Customer <span style={{ color: 'var(--accent)' }}>Messages</span>
        </h1>
        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Contact form submissions and customer inquiry tickets directly from database.
        </p>
      </div>

      <AdminNav />

      {loading ? (
        <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading contact messages...
        </div>
      ) : messages.length === 0 ? (
        <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No contact messages found in database.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 1.8fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left List */}
          <div className="brand-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                
                style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '32rem', overflowY: 'auto' }}>
              {filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    style={{
                      padding: '0.85rem 1rem',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border)',
                      backgroundColor: isSelected ? 'var(--accent-glow)' : (msg.status === 'READ' ? 'var(--bg)' : 'rgba(255, 255, 255, 0.05)'),
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: msg.status === 'READ' ? 600 : 800, color: 'var(--text-primary)' }}>{msg.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{new Date(msg.created_at).toLocaleDateString('en-ZA')}</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {msg.subject || msg.message}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Message Details */}
          {selectedMessage ? (
            <div className="brand-card" style={{ padding: '2rem', borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedMessage.subject || 'Customer Contact Submission'}</h3>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    From: <strong style={{ color: 'var(--text-primary)' }}>{selectedMessage.name}</strong> ({selectedMessage.email})
                  </div>
                  {selectedMessage.phone && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                      Phone: {selectedMessage.phone}
                    </div>
                  )}
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    Sent on {new Date(selectedMessage.created_at).toLocaleString('en-ZA')}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleToggleRead(selectedMessage)} className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem' }}>
                    {selectedMessage.status === 'READ' ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button onClick={() => handleDelete(selectedMessage.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message}
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                <a href={`mailto:${selectedMessage.email}?subject=Re: ${encodeURIComponent(selectedMessage.subject || 'Inquiry')}`} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.8125rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={16} /> Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Select a message from the list to read.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
