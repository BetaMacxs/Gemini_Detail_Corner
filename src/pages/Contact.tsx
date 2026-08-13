import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Send, MessageSquare } from 'lucide-react';

export function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (err: any) {
      setError(err.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: '6rem', paddingBottom: '6rem', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)', opacity: 0.2 }} />
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1 }}>
              Get In <span style={{ color: 'var(--accent)' }}>Touch</span>
            </h1>
            <p style={{ maxWidth: '42rem', margin: '0 auto', fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Whether you're a professional detailer or a weekend enthusiast, we're here to provide the technical support and product guidance you need.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem' }}>
          {/* Contact Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '2rem' }}>
                Connect with the <span style={{ color: 'var(--accent)' }}>Experts</span>
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div className="brand-card" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
                    <Phone className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div style={{ marginLeft: '1.5rem' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontStyle: 'italic' }}>Phone Support</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>021 555 9876</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div className="brand-card" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
                    <Mail className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div style={{ marginLeft: '1.5rem' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontStyle: 'italic' }}>Email Inquiries</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>info@detailcorner.co.za</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div className="brand-card" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
                    <MapPin className="h-6 w-6" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div style={{ marginLeft: '1.5rem' }}>
                    <div style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.25rem', fontStyle: 'italic' }}>Our Location</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-primary)' }}>Pacific Business Park, Mitchell's Plain</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: '20rem' }}>
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=18.608%2C-34.035%2C18.628%2C-34.015&layer=mapnik&marker=-34.025%2C18.618"
                width="100%" height="100%" style={{ border: 0 }}
                allowFullScreen="" loading="lazy"
                title="Map showing Detail Corner location"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="brand-card" style={{ padding: '2.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent)', marginBottom: '2rem' }}>
              <MessageSquare className="h-5 w-5" />
              <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Send Message</span>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>Full Name</label>
                  <input 
                    type="text" name="name" placeholder="John Wick" required value={form.name} onChange={handleChange} 
                    className="auth-input"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>Email Address</label>
                  <input 
                    type="email" name="email" placeholder="john@example.com" required value={form.email} onChange={handleChange} 
                    className="auth-input"
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>Subject</label>
                <select 
                  name="subject" required value={form.subject} onChange={handleChange}
                  className="auth-input form-select"
                >
                  <option value="" disabled hidden>Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="product">Product Question</option>
                  <option value="order">Order Status</option>
                  <option value="technical">Technical Support</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontStyle: 'italic' }}>Your Message</label>
                <textarea 
                  name="message" rows={5} placeholder="How can we help with your vehicle?" required value={form.message} onChange={handleChange}
                  className="auth-input"
                  style={{ resize: 'none' }}
                />
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', fontStyle: 'italic' }}>{error}</div>}
              {success && <div style={{ color: '#22c55e', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', fontStyle: 'italic' }}>Message received. We'll be in touch soon.</div>}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Engage Transmission</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
