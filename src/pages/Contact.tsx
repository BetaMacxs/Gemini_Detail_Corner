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
    <div className="bg-brand-bg min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden border-b border-brand-border">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--brand-accent-glow)_0%,_transparent_70%)] opacity-20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter text-brand-text-primary mb-6 leading-none">
              Get In <span className="text-brand-accent">Touch</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-brand-text-secondary leading-relaxed">
              Whether you're a professional detailer or a weekend enthusiast, we're here to provide the technical support and product guidance you need.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 xl:gap-24">
          {/* Contact Info */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tighter text-brand-text-primary mb-8">
                Connect with the <span className="text-brand-accent">Experts</span>
              </h2>
              <div className="space-y-8">
                <div className="flex items-start group">
                  <div className="p-4 bg-brand-surface border border-brand-border rounded-2xl group-hover:border-brand-accent transition-all">
                    <Phone className="h-6 w-6 text-brand-accent" />
                  </div>
                  <div className="ml-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-1 italic">Phone Support</div>
                    <div className="text-xl font-black text-brand-text-primary">021 555 9876</div>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="p-4 bg-brand-surface border border-brand-border rounded-2xl group-hover:border-brand-accent transition-all">
                    <Mail className="h-6 w-6 text-brand-accent" />
                  </div>
                  <div className="ml-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-1 italic">Email Inquiries</div>
                    <div className="text-xl font-black text-brand-text-primary">info@detailcorner.co.za</div>
                  </div>
                </div>
                <div className="flex items-start group">
                  <div className="p-4 bg-brand-surface border border-brand-border rounded-2xl group-hover:border-brand-accent transition-all">
                    <MapPin className="h-6 w-6 text-brand-accent" />
                  </div>
                  <div className="ml-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-1 italic">Our Location</div>
                    <div className="text-xl font-black text-brand-text-primary">Pacific Business Park, Mitchell's Plain</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-brand-surface border border-brand-border rounded-3xl overflow-hidden h-80 grayscale hover:grayscale-0 transition-all duration-700">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=18.608%2C-34.035%2C18.628%2C-34.015&layer=mapnik&marker=-34.025%2C18.618"
                width="100%" height="100%" style={{ border: 0 }}
                allowFullScreen="" loading="lazy"
                title="Map showing Detail Corner location"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-7 bg-brand-surface border border-brand-border rounded-[2.5rem] p-8 md:p-12">
            <div className="flex items-center space-x-2 text-brand-accent mb-8">
              <MessageSquare className="h-5 w-5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Send Message</span>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-3 italic">Full Name</label>
                  <input 
                    type="text" name="name" placeholder="John Wick" required value={form.name} onChange={handleChange} 
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-6 py-4 text-brand-text-primary focus:ring-1 focus:ring-brand-accent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-3 italic">Email Address</label>
                  <input 
                    type="email" name="email" placeholder="john@example.com" required value={form.email} onChange={handleChange} 
                    className="w-full bg-brand-bg border border-brand-border rounded-xl px-6 py-4 text-brand-text-primary focus:ring-1 focus:ring-brand-accent outline-none transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-3 italic">Subject</label>
                <select 
                  name="subject" required value={form.subject} onChange={handleChange}
                  className="w-full bg-brand-bg border border-brand-border rounded-xl px-6 py-4 text-brand-text-primary focus:ring-1 focus:ring-brand-accent outline-none transition-all appearance-none"
                >
                  <option value="" disabled hidden>Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="product">Product Question</option>
                  <option value="order">Order Status</option>
                  <option value="technical">Technical Support</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-brand-text-secondary mb-3 italic">Your Message</label>
                <textarea 
                  name="message" rows={5} placeholder="How can we help with your vehicle?" required value={form.message} onChange={handleChange}
                  className="w-full bg-brand-bg border border-brand-border rounded-2xl px-6 py-4 text-brand-text-primary focus:ring-1 focus:ring-brand-accent outline-none transition-all resize-none"
                />
              </div>

              {error && <div className="text-red-500 text-xs font-bold uppercase tracking-widest italic">{error}</div>}
              {success && <div className="text-green-500 text-xs font-bold uppercase tracking-widest italic">Message received. We'll be in touch soon.</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-brand-accent text-white font-black uppercase italic tracking-widest text-sm rounded-2xl hover:bg-brand-accent-hover shadow-xl shadow-brand-accent/20 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
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
