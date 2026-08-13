import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, X } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  category: 'announcement' | 'promo' | 'competition';
  date_range?: string;
  visible: boolean;
  created_at: string;
}

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'announcement' as 'announcement' | 'promo' | 'competition',
    date_range: '',
    visible: true
  });

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setAnnouncements(data);
        } else {
          setAnnouncements([
            {
              id: 'a1',
              title: 'Free shipping on orders over R500.',
              category: 'promo',
              date_range: '07 Jun 2026 - 30 Jun 2026',
              visible: true,
              created_at: '2026-06-07T00:00:00Z'
            },
            {
              id: 'a2',
              title: 'New Ceramic Force coating stock now available!',
              category: 'announcement',
              date_range: '01 Aug 2026 - 31 Aug 2026',
              visible: true,
              created_at: '2026-08-01T00:00:00Z'
            }
          ]);
        }
      } catch (e) {
        console.error("Error loading announcements:", e);
      }
    }
    loadAnnouncements();
  }, []);

  const handleToggleVisible = async (item: Announcement) => {
    const updated = !item.visible;
    setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, visible: updated } : a));

    try {
      await supabase.from('announcements').update({ visible: updated }).eq('id', item.id);
    } catch (e) {}
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingId) {
      setAnnouncements(prev => prev.map(a => a.id === editingId ? { ...a, ...formData } : a));
      try {
        await supabase.from('announcements').update(formData).eq('id', editingId);
      } catch (e) {}
    } else {
      const newItem: Announcement = {
        id: `ann_${Date.now()}`,
        title: formData.title,
        category: formData.category,
        date_range: formData.date_range || 'Active',
        visible: formData.visible,
        created_at: new Date().toISOString()
      };
      setAnnouncements(prev => [newItem, ...prev]);
      try {
        await supabase.from('announcements').insert(newItem);
      } catch (e) {}
    }

    setShowModal(false);
    setEditingId(null);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ title: '', category: 'announcement', date_range: '', visible: true });
    setShowModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditingId(a.id);
    setFormData({ title: a.title, category: a.category, date_range: a.date_range || '', visible: a.visible });
    setShowModal(true);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f3f4f6' }}>
          Announcements
        </h1>

        <button
          onClick={openNew}
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
          <Plus className="h-4 w-4" /> NEW
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {announcements.map(a => (
          <div
            key={a.id}
            style={{
              backgroundColor: '#1f1f1f',
              border: '1px solid #2e2e2e',
              borderRadius: '0.5rem',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.35rem' }}>
                {a.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem' }}>
                <span style={{ padding: '0.15rem 0.6rem', borderRadius: '9999px', backgroundColor: '#2e2e2e', color: '#ef4444', fontWeight: 700, textTransform: 'lowercase' }}>
                  {a.category}
                </span>
                {a.date_range && (
                  <span style={{ color: '#9ca3af' }}>{a.date_range}</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => openEdit(a)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: 'transparent',
                  border: '1px solid #333333',
                  borderRadius: '0.375rem',
                  color: '#e5e5e5',
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>

              <button
                onClick={() => handleToggleVisible(a)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: a.visible ? '#4ade80' : '#f87171',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {a.visible ? 'show' : 'hide'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ backgroundColor: '#222222', border: '1px solid #333333', borderRadius: '0.5rem', padding: '1.5rem', width: '100%', maxWidth: '28rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>{editingId ? 'Edit Announcement' : 'New Announcement'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Title / Text</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#141414', border: '1px solid #333', borderRadius: '0.375rem', color: '#fff' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Category</label>
                <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as any })} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#141414', border: '1px solid #333', borderRadius: '0.375rem', color: '#fff' }}>
                  <option value="announcement">announcement</option>
                  <option value="promo">promo</option>
                  <option value="competition">competition</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#9ca3af', marginBottom: '0.25rem' }}>Date Range (optional)</label>
                <input type="text" placeholder="e.g. 07 Jun 2026 - 30 Jun 2026" value={formData.date_range} onChange={e => setFormData({ ...formData, date_range: e.target.value })} style={{ width: '100%', padding: '0.5rem', backgroundColor: '#141414', border: '1px solid #333', borderRadius: '0.375rem', color: '#fff' }} />
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
