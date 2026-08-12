export function Contact() {
  return (
    <div className="bg-brand-bg">
      {/* Hero section */}
      <section style={{
        position: 'relative', width: '100%', minHeight: '30vh',
        backgroundImage: `url(https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=1400&auto=format&fit=crop)`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(26,26,26,0.85) 0%, rgba(26,26,26,0.75) 40%, rgba(26,26,26,0.9) 100%), linear-gradient(135deg, rgba(196,30,58,0.25) 0%, transparent 60%)',
          zIndex: 1,
        }} />
        <div style={{
          position: 'relative', zIndex: 2, textAlign: 'center', padding: '2rem 1rem',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}>
          <h1 style={{
            fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 400, color: 'var(--text-primary)',
            lineHeight: 1.1, letterSpacing: '-1px',
          }}>
            Get <span style={{ color: 'var(--accent)', fontWeight: 400 }}>In Touch</span>
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', maxWidth: '600px',
            margin: '1rem auto 0',
          }}>
            Have questions? We&apos;re here to help. Get in touch with our team.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input type="text" name="name" placeholder="Name *" required value={form.name} onChange={handleChange} style={inputStyle} />
              <input type="email" name="email" placeholder="Email *" required value={form.email} onChange={handleChange} style={inputStyle} />
              <input type="tel" name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} style={inputStyle} />
              <select name="subject" required value={form.subject} onChange={handleChange} style={{ ...inputStyle, color: form.subject ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                <option value="" disabled hidden>Select a subject *</option>
                <option value="general">General Inquiry</option>
                <option value="product">Product Question</option>
                <option value="order">Order Status</option>
                <option value="shipping">Shipping Information</option>
                <option value="technical">Technical Support</option>
                <option value="other">Other</option>
              </select>
              <textarea name="message" rows="5" placeholder="Message *" required value={form.message} onChange={handleChange} style={inputStyle} />

              {error && (
                <p id="contact-error" style={{ color: 'var(--accent)', fontSize: '0.9rem', margin: 0 }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                style={{
                  background: 'var(--accent)', color: '#fff', border: 'none', padding: '0.7rem 2rem',
                  fontSize: '0.95rem', fontWeight: 500, borderRadius: '20px',
                  cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                  alignSelf: 'flex-start', opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.4 }}>
                * This form uses a free third‑party service. For sensitive information, please email us directly.
              </p>
            </form>

          </div>

          {/* Map Placeholder */}
          <div style={{
            borderRadius: '12px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)', height: '350px',
          }}>
            <iframe
              src="https://www.openstreetmap.org/export/embed.html?bbox=18.608%2C-34.035%2C18.628%2C-34.015&layer=mapnik&marker=-34.025%2C18.618"
              width="100%" height="100%" style={{ border: 0, display: 'block' }}
              allowFullScreen="" loading="lazy"
              title="Map showing Detail Corner location"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
