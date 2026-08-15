import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, X, Image as ImageIcon, Video } from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';

interface GalleryItem {
  id: string;
  title: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  tags?: string;
  created_at: string;
}

export function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    type: 'IMAGE' as 'IMAGE' | 'VIDEO',
    url: '',
    tags: 'Ceramic Coating'
  });

  const fetchGallery = async () => {
    setLoading(true);
    let list: GalleryItem[] = [];

    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        list = data as GalleryItem[];
      }
    } catch (e) {
      console.warn("Error fetching DB gallery:", e);
    }

    try {
      const local = JSON.parse(localStorage.getItem('gallery') || '[]');
      const combined = [...list];
      local.forEach((g: any) => {
        if (!combined.some(c => c.id === g.id)) {
          combined.push(g);
        }
      });
      list = combined;
    } catch (e) {
      console.warn("Local gallery notice:", e);
    }

    setItems(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this item from gallery?")) return;
    setItems(prev => prev.filter(item => item.id !== id));

    try {
      const local = JSON.parse(localStorage.getItem('gallery') || '[]');
      localStorage.setItem('gallery', JSON.stringify(local.filter((item: any) => item.id !== id)));
    } catch (e) {
      console.warn("Local storage delete warning:", e);
    }

    try {
      await supabase.from('gallery').delete().eq('id', id);
    } catch (e) {
      console.warn("Delete gallery error:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newItem = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `gal_${Date.now()}`,
      title: formData.title,
      type: formData.type,
      url: formData.url,
      tags: formData.tags,
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('gallery').insert([newItem]);
    } catch (e) {
      console.warn("Insert gallery error:", e);
    }

    try {
      const local = JSON.parse(localStorage.getItem('gallery') || '[]');
      localStorage.setItem('gallery', JSON.stringify([newItem, ...local]));
    } catch (e) {
      console.warn("LocalStorage notice:", e);
    }

    setShowModal(false);
    fetchGallery();
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Media & <span style={{ color: 'var(--accent)' }}>Gallery</span>
          </h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Manage TikTok videos, transformation photos & customer showcase media.
          </p>
        </div>

        <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} />
          <span>Add Media Item</span>
        </button>
      </div>

      <AdminNav />

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="brand-card" style={{ width: '100%', maxWidth: '32rem', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>Add Media Item</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Media Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="auth-input" placeholder="e.g. BMW M3 Ceramic Gloss Transformation" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Media Type</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} className="auth-input">
                    <option value="IMAGE">IMAGE</option>
                    <option value="VIDEO">VIDEO (TikTok/MP4)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Tag / Category</label>
                  <input type="text" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} className="auth-input" placeholder="e.g. Paint Correction" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Media URL / Image Link</label>
                <input type="text" required value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="auth-input" placeholder="https://..." />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}>Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading gallery items...
        </div>
      ) : items.length === 0 ? (
        <div className="brand-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No gallery media items found in database.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {items.map((item) => (
            <div key={item.id} className="brand-card" style={{ overflow: 'hidden', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ position: 'relative', height: '12rem', backgroundColor: 'var(--bg)', overflow: 'hidden' }}>
                  <img src={item.url} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as any).src = 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=800'; }} />
                  <span style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(0,0,0,0.7)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {item.type === 'VIDEO' ? <Video size={12} /> : <ImageIcon size={12} />}
                    {item.type}
                  </span>
                </div>
                <div style={{ padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.tags || 'General'}</span>
                </div>
              </div>

              <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={() => handleDelete(item.id)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
