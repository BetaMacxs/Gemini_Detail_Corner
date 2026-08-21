import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, CheckCircle2, Search, Send, MessageSquare, Clock, RefreshCw, Sparkles, Check } from 'lucide-react';
import { PiEnvelope } from 'react-icons/pi';
import { AdminNav } from '../../components/AdminNav';
import { toast } from '../../features/toast/store';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'ARCHIVED';
  replied_at?: string;
  reply_text?: string;
  created_at: string;
}

const REPLY_TEMPLATES = [
  {
    label: 'Custom / Blank',
    subject: '',
    body: ''
  },
  {
    label: 'Order Inquiry & Status',
    subject: 'Update on your Detail Corner Order',
    body: `Hi there,\n\nThank you for reaching out regarding your order. We are reviewing your order status and will ensure it is prepared and dispatched promptly. If you have any specific tracking questions, please reply directly with your order number.\n\nBest regards,\nDetail Corner Support Team`
  },
  {
    label: 'Product Advice & Stock',
    subject: 'Product Guidance from Detail Corner',
    body: `Hi there,\n\nThank you for your product inquiry. Our technical detailing team is glad to help! For optimal application on automotive surfaces, we recommend starting with a clean, decontaminated finish before applying ceramic or sealant layers.\n\nPlease let us know if you need specific dilution or application advice for your vehicle!\n\nBest regards,\nDetail Corner Specialist Team`
  },
  {
    label: 'Shipping & Delivery',
    subject: 'Detail Corner Shipping Information',
    body: `Hi there,\n\nOrders placed before 1:00 PM are dispatched same-day via our courier network across South Africa. Main center delivery typically takes 2–4 business days with tracking provided via SMS and email.\n\nBest regards,\nDetail Corner Logistics`
  },
  {
    label: 'General Thank You & Support',
    subject: 'Thank You for Contacting Detail Corner',
    body: `Hi there,\n\nThank you for contacting Detail Corner! We have received your note and are here to assist with anything you need for your detailing setup.\n\nWarm regards,\nDetail Corner Team`
  }
];

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Reply Composer State
  const [replySubject, setReplySubject] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('Custom / Blank');

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
      initReplyComposer(list[0]);
    }
    setLoading(false);
  };

  const initReplyComposer = (msg: ContactMessage) => {
    setReplySubject(msg.subject ? (msg.subject.toLowerCase().startsWith('re:') ? msg.subject : `Re: ${msg.subject}`) : 'Regarding your inquiry at Detail Corner');
    setReplyBody(`Hi ${msg.name},\n\nThank you for reaching out to Detail Corner.\n\n`);
    setSelectedTemplate('Custom / Blank');
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelectMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    initReplyComposer(msg);
  };

  const handleTemplateSelect = (templateLabel: string) => {
    setSelectedTemplate(templateLabel);
    const tmpl = REPLY_TEMPLATES.find(t => t.label === templateLabel);
    if (tmpl && selectedMessage) {
      if (tmpl.subject) {
        setReplySubject(tmpl.subject);
      }
      if (tmpl.body) {
        const personalized = tmpl.body.replace('Hi there,', `Hi ${selectedMessage.name},`);
        setReplyBody(personalized);
      }
    }
  };

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
      toast.success('Message Deleted', 'Contact ticket removed.');
    } catch (e) {
      console.warn("Delete message error:", e);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage) return;
    if (!replyBody.trim()) {
      toast.error('Empty Reply', 'Please enter a message to send to the customer.');
      return;
    }

    setIsSendingReply(true);

    try {
      // 1. Invoke the edge function to dispatch email via Brevo
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: {
          templateType: 'ADMIN_REPLY',
          targetEmail: selectedMessage.email,
          customerName: selectedMessage.name,
          subject: replySubject.trim() || `Re: ${selectedMessage.subject || 'Detail Corner Inquiry'}`,
          replyText: replyBody.trim(),
          originalMessage: selectedMessage.message
        }
      });

      if (error) {
        throw error;
      }

      const now = new Date().toISOString();

      // 2. Mark as read & update replied state in DB
      try {
        await supabase
          .from('contact_messages')
          .update({ 
            status: 'READ',
            updated_at: now
          })
          .eq('id', selectedMessage.id);
      } catch (dbErr) {
        console.warn('DB update notice on reply:', dbErr);
      }

      // 3. Update local state
      const updatedMessage: ContactMessage = {
        ...selectedMessage,
        status: 'READ',
        replied_at: now,
        reply_text: replyBody.trim()
      };

      setMessages(prev => prev.map(m => m.id === selectedMessage.id ? updatedMessage : m));
      setSelectedMessage(updatedMessage);

      toast.success('Reply Sent!', `Direct email sent to ${selectedMessage.email}`);
    } catch (err: any) {
      console.error('Failed to send admin reply:', err);
      toast.error('Dispatch Failed', err.message || 'Could not send reply. Please verify email settings.');
    } finally {
      setIsSendingReply(false);
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
    <div className="container page-container">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Customer <span style={{ color: 'var(--accent)' }}>Messages</span>
        </h1>
        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Direct customer inquiry tickets with integrated email replies.
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
            <div className="admin-search-wrapper" style={{ marginBottom: '1rem', maxWidth: '100%' }}>
              <Search size={16} className="admin-search-icon" />
              <input
                type="text"
                className="admin-search-input"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '36rem', overflowY: 'auto' }}>
              {filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    style={{
                      padding: '0.85rem var(--spacing-container-px)',
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
                    {msg.replied_at && (
                      <div style={{ marginTop: '0.25rem', fontSize: '0.7rem', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Check size={12} /> Replied
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Message Details & Reply Panel */}
          {selectedMessage ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Message Details */}
              <div className="brand-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>{selectedMessage.subject || 'Customer Contact Submission'}</h3>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      From: <strong style={{ color: 'var(--text-primary)' }}>{selectedMessage.name}</strong> ({selectedMessage.email})
                    </div>
                    {selectedMessage.phone && (
                      <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        Phone: {selectedMessage.phone}
                      </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Received on {new Date(selectedMessage.created_at).toLocaleString('en-ZA')}
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

                {/* Message Body */}
                <div style={{ padding: '1.25rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.9375rem', lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                  {selectedMessage.message}
                </div>

                {selectedMessage.replied_at && (
                  <div style={{ marginTop: '1rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.25)', color: '#22c55e', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} />
                    <span>A direct reply was sent to <strong>{selectedMessage.email}</strong> on {new Date(selectedMessage.replied_at).toLocaleString('en-ZA')}</span>
                  </div>
                )}
              </div>

              {/* In-App Reply Composer */}
              <div className="brand-card" style={{ padding: '1.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)' }}>
                    <MessageSquare size={18} />
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                      Send Direct Reply
                    </h4>
                  </div>

                  {/* Quick Templates Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={14} style={{ color: 'var(--text-secondary)' }} />
                    <select
                      value={selectedTemplate}
                      onChange={(e) => handleTemplateSelect(e.target.value)}
                      className="auth-input form-select"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem', width: 'auto' }}
                    >
                      {REPLY_TEMPLATES.map(t => (
                        <option key={t.label} value={t.label}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      className="auth-input"
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      placeholder="Subject line..."
                      style={{ fontSize: '0.875rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                      Message to {selectedMessage.name} ({selectedMessage.email})
                    </label>
                    <textarea
                      rows={6}
                      className="auth-input"
                      value={replyBody}
                      onChange={(e) => setReplyBody(e.target.value)}
                      placeholder="Write your professional reply..."
                      style={{ fontSize: '0.875rem', lineHeight: 1.5, resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Email will be dispatched via official Detail Corner support channel.
                    </span>

                    <button
                      onClick={handleSendReply}
                      disabled={isSendingReply || !replyBody.trim()}
                      className="btn btn-primary"
                      style={{ padding: '0.65rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', opacity: isSendingReply ? 0.7 : 1 }}
                    >
                      {isSendingReply ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          <span>Dispatching...</span>
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          <span>Send Direct Reply</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Select a message from the list to read and reply.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

