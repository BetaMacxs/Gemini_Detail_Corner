export function Gallery() {
  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', paddingTop: '6rem', paddingBottom: '6rem', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, var(--accent-glow) 0%, transparent 70%)', opacity: 0.2 }} />
        <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', letterSpacing: '-0.05em', color: 'var(--text-primary)', marginBottom: '1.5rem', lineHeight: 1 }}>
            Our <span style={{ color: 'var(--accent)' }}>Gallery</span>
          </h1>
          <p style={{ maxWidth: '42rem', margin: '0 auto', fontSize: '1.125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Witness the transformation. Our gallery showcases the unrivaled depth, clarity, and protection achieved using Detail Corner's premium formulations.
          </p>
        </div>
      </section>

      <div className="container" style={{ paddingTop: '6rem', paddingBottom: '6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
          {[
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1599256621730-535171e28e50?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1597404294360-feeeda04612e?auto=format&fit=crop&q=80&w=800",
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=800"
          ].map((url, i) => (
            <div key={i} className="brand-card" style={{ aspectRatio: '16/10', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
              <img 
                src={url} 
                alt={`Detailing result ${i + 1}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
