import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Trash2, Tag, X } from 'lucide-react';

interface GalleryItem {
  id: string;
  type: 'VIDEO' | 'IMAGE';
  url: string;
  tags?: string[];
  title?: string;
}

export function AdminGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'VIDEO' as 'VIDEO' | 'IMAGE',
    url: '',
    tags: ''
  });

  useEffect(() => {
    async function loadGallery() {
      try {
        const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setItems(data);
        } else {
          setItems([
            {
              id: 'g1',
              type: 'VIDEO',
              url: 'https://www.tiktok.com/embed/v2/7200000000000000000',
              tags: ['car detailing', 'ceramic force'],
              title: 'Detailing Transformation TikTok'
            },
            {
              id: 'g2',
              type: 'IMAGE',
              url: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&q=80&w=800',
              tags: ['chemois', 'drying'],
              title: 'Chemois Towel In Action'
            }
          ]);
        }
      } catch (e) {
        console.error("Error loading gallery:", e);
      }
    }
    loadGallery();
  }, []);

  const handleDelete = async (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    try {
      await supabase.from('gallery').delete().eq('id', id);
    } catch (e) {}
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.url) return;

    const newItem: GalleryItem = {
      id: `gal_${Date.now()}`,
      type: formData.type,
      url: formData.url,
      tags: formData.tags ? formData.tags.split(',').map(t => t.trim()) : []
    };

    setItems(prev => [newItem, ...prev]);
    setShowModal(false);

    try {
      await supabase.from('gallery').insert(newItem);
    } catch (e) {}
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f3f4f6' }}>
          Gallery
        </h1>

        <button
          onClick={() => {
            setFormData({ type: 'VIDEO', url: '', tags: '' });
            setShowModal(true);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.45rem 1.15rem',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            borderRadius: '0.375rem',
            fontWeight: 700,
            fontSize: '0.8125rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Plus className="h-4 w-4" /> Upload
        </button>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(18rem, 1fr))', gap: '1.5rem' }}>
        {items.map(item => (
          <div
            key={item.id}
            style={{
              backgroundColor: '#1f1f1f',
              border: '1px solid #2e2e2e',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Media Box */}
            <div style={{ height: '12rem', backgroundColor: '#141414', overflow: 'hidden', position: 'relative' }}>
              {item.type === 'IMAGE' ? (
                <img src={item.url} alt="Gallery item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f0f', color: '#9ca3af', fontSize: '0.8125rem' }}>
                  🎥 TikTok Video Embed
                </div>
              )}

              <button
                onClick={() => handleDelete(item.id)}
                style={{
                  position: 'absolute',
                  top: '0.5rem',
                  right: '0.5rem',
                  padding: '0.35rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.8)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Content Bar */}
            <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.25rem', backgroundColor: '#ef4444', color: '#ffffff', fontSize: '0.7rem', fontWeight: 800 }}>
                  {item.type}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {item.tags?.length ? item.tags.join(', ') : 'no tags'}
                </span>
              </div>

              <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Tag className="h-3 w-3" /> Edit tags
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#222222', border: '1px solid #333333', borderRadius: '0.5rem', padding: '1.5rem', width: '100%', maxWidth: '28rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>Upload Media</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Type</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as any })} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#141414', border: '1px solid #333', borderRadius: '0.375rem', color: '#fff' }}>
                  <option value="VIDEO">VIDEO</option>
                  <option value="IMAGE">IMAGE</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>URL / Embed Link</label>
                <input type="text" required placeholder="https://..." value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#141414', border: '1px solid #333', borderRadius: '0.375rem', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Tags (comma separated)</label>
                <input type="text" placeholder="car detailing, ceramic force" value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#141414', border: '1px solid #333', borderRadius: '0.375rem', color: '#fff' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #333', backgroundColor: 'transparent', color: '#ccc', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', backgroundColor: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
