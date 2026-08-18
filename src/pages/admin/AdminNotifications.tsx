import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminNav } from '../../components/AdminNav';
import { Bell, CheckCircle, AlertTriangle, Package, ShoppingBag, Info, Trash2, CheckSquare, Mail, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'ORDER' | 'STOCK' | 'SYSTEM';
  read: boolean;
  link?: string;
  created_at: string;
}

export function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState<string | null>(null);

  useEffect(() => {
    // Set default test email from user profile if available
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) setTestEmail(user.email);
    });
  }, []);

  const sendTestEmail = async (type: string) => {
    if (!testEmail) {
      alert('Please enter a test email address');
      return;
    }

    setSendingTest(type);
    try {
      const { data, error } = await supabase.functions.invoke('send-test-email', {
        body: { templateType: type, targetEmail: testEmail }
      });

      if (error) throw error;
      alert('Test email sent successfully!');
    } catch (err: any) {
      console.error('Error sending test email:', err);
      alert(`Failed to send test email: ${err.message}`);
    } finally {
      setSendingTest(null);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
      
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return <CheckCircle size={18} color="#22c55e" />;
      case 'WARNING': return <AlertTriangle size={18} color="#f59e0b" />;
      case 'ERROR': return <AlertTriangle size={18} color="#ef4444" />;
      case 'ORDER': return <ShoppingBag size={18} color="var(--accent)" />;
      case 'STOCK': return <Package size={18} color="#f59e0b" />;
      default: return <Info size={18} color="var(--text-secondary)" />;
    }
  };

  return (
    <div className="container page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Admin <span style={{ color: 'var(--accent)' }}>Notifications</span>
          </h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            System alerts and activity logs.
          </p>
        </div>

        <button 
          onClick={markAllAsRead} 
          className="btn btn-outline" 
          style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          disabled={!notifications.some(n => !n.read)}
        >
          <CheckSquare size={14} />
          Mark All Read
        </button>
      </div>

      <AdminNav />

      <div className="brand-card" style={{ padding: '0' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <Bell size={48} style={{ color: 'var(--border)', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>No Notifications</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Your inbox is currently clear.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <AnimatePresence>
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: n.read ? 'transparent' : 'rgba(196, 30, 58, 0.03)',
                    display: 'flex',
                    gap: '1.25rem',
                    position: 'relative',
                    transition: 'background-color 0.3s ease'
                  }}
                >
                  <div style={{ 
                    marginTop: '0.25rem',
                    padding: '0.65rem',
                    backgroundColor: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    height: 'fit-content'
                  }}>
                    {getIcon(n.type)}
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <h4 style={{ 
                        fontSize: '0.9375rem', 
                        fontWeight: 900, 
                        color: n.read ? 'var(--text-primary)' : 'var(--accent)',
                        fontStyle: 'italic',
                        textTransform: 'uppercase',
                        letterSpacing: '-0.02em'
                      }}>
                        {n.title}
                      </h4>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                        {new Date(n.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, maxWidth: '40rem' }}>
                      {n.message}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      {!n.read && (
                        <button 
                          onClick={() => markAsRead(n.id)}
                          style={{ 
                            background: 'none', 
                            border: 'none', 
                            color: 'var(--accent)', 
                            fontSize: '0.75rem', 
                            fontWeight: 900, 
                            textTransform: 'uppercase', 
                            cursor: 'pointer',
                            padding: 0,
                            fontStyle: 'italic'
                          }}
                        >
                          Mark as Read
                        </button>
                      )}
                      {n.link && (
                        <a 
                          href={n.link}
                          style={{ 
                            color: 'var(--text-primary)', 
                            fontSize: '0.75rem', 
                            fontWeight: 900, 
                            textTransform: 'uppercase', 
                            textDecoration: 'underline',
                            fontStyle: 'italic'
                          }}
                        >
                          View Details
                        </a>
                      )}
                      <button 
                        onClick={() => deleteNotification(n.id)}
                        style={{ 
                          marginLeft: 'auto',
                          background: 'none', 
                          border: 'none', 
                          color: 'var(--text-secondary)', 
                          cursor: 'pointer',
                          padding: '0.25rem',
                          opacity: 0.5
                        }}
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div style={{ marginTop: '3rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.5rem', backgroundColor: 'rgba(196, 30, 58, 0.1)', borderRadius: 'var(--radius-md)' }}>
            <Mail size={20} color="var(--accent)" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>
            Email Template <span style={{ color: 'var(--accent)' }}>Testing</span>
          </h2>
        </div>

        <div className="brand-card">
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Test Recipient Email
            </label>
            <div style={{ display: 'flex', gap: '1rem', maxWidth: '30rem' }}>
              <input 
                type="email" 
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="input-field"
                placeholder="Enter email for test delivery"
                style={{ flex: 1 }}
              />
            </div>
            <p style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Enter the email address where you want to receive the test templates.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[
              { id: 'ORDER_CONFIRMATION', label: 'Order Confirmation', description: 'Sent to customers after successful payment.' },
              { id: 'PAYMENT_FAILURE', label: 'Payment Failed', description: 'Sent to customers when payment fails.' },
              { id: 'SHIPPING_UPDATE', label: 'Order Shipped', description: 'Sent to customers when tracking is added.' },
              { id: 'ADMIN_NEW_ORDER', label: 'Admin: New Order', description: 'Sent to store admin for new sales.' },
              { id: 'LOW_STOCK', label: 'Admin: Low Stock', description: 'Sent to store admin when stock is low.' }
            ].map((template) => (
              <div 
                key={template.id}
                style={{ 
                  padding: '1.25rem', 
                  backgroundColor: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{template.label}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1.25rem' }}>{template.description}</p>
                </div>
                <button 
                  onClick={() => sendTestEmail(template.id)}
                  disabled={sendingTest !== null}
                  className="btn btn-outline"
                  style={{ 
                    width: '100%', 
                    fontSize: '0.6875rem', 
                    padding: '0.5rem', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem' 
                  }}
                >
                  {sendingTest === template.id ? (
                    'Sending...'
                  ) : (
                    <>
                      <Send size={12} />
                      Send Test Email
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
