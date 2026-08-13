import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Megaphone } from 'lucide-react';
import { AdminNav } from '../../components/AdminNav';

interface Announcement {
  id: string;
  title: string;
  category: string;
  date_range: string;
  visible: boolean;
  created_at: string;
}

export function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Announcement | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'SALE',
    date_range: '',
    visible: true
  });

  const fetchAnnouncements = async () => {
    setLoading(true);
    let list: Announcement[] = [];

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        list = data as Announcement[];
      }
    } catch (e) {
      console.warn("Error fetching DB announcements:", e);
    }

    try {
      const local = JSON.parse(localStorage.getItem('announcements') || '[]');
      const combined = [...list];
      local.forEach((a: any) => {
        if (!combined.some(c => c.id === a.id)) {
          combined.push(a);
        }
      });
      list = combined;
    } catch (e) {
      console.warn("Local announcements read notice:", e);
    }

    setAnnouncements(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'PROMOTION',
      date_range: 'Limited Time',
      visible: true
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: Announcement) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      category: item.category,
      date_range: item.date_range,
      visible: item.visible
    });
    setShowModal(true);
  };

  const handleToggleVisibility = async (item: Announcement) => {
    const updated = !item.visible;
    setAnnouncements(prev => prev.map(a => a.id === item.id ? { ...a, visible: updated } : a));

    try {
      await supabase.from('announcements').update({ visible: updated }).eq('id', item.id);
    } catch (e) {
      console.warn("Visibility toggle warning:", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    setAnnouncements(prev => prev.filter(a => a.id !== id));

    try {
      await supabase.from('announcements').delete().eq('id', id);
    } catch (e) {
      console.warn("Delete announcement warning:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      try {
        await supabase.from('announcements').update(formData).eq('id', editingItem.id);
      } catch (e) {
        console.warn("Update announcement warning:", e);
      }
    } else {
      try {
        await supabase.from('announcements').insert([formData]);
      } catch (e) {
        console.warn("Insert announcement warning:", e);
      }
    }

    setShowModal(false);
    fetchAnnouncements();
  };

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Store <span style={{ color: 'var(--accent)' }}>Announcements</span>
          </h1>
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Promotional headers, sales notification bars & store updates.
          </p>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus className="h-4 w-4" />
          <span>New Announcement</span>
        </button>
      </div>

      <AdminNav />

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="brand-card" style={{ width: '100%', maxWidth: '32rem', padding: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                {editingItem ? 'Edit Announcement' : 'New Announcement'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Banner Text</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="auth-input" placeholder="e.g. Free Shipping on orders over R1000!" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Category Tag</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} className="auth-input">
                    <option value="PROMOTION">PROMOTION</option>
                    <option value="NEW ARRIVAL">NEW ARRIVAL</option>
                    <option value="NOTICE">NOTICE</option>
                    <option value="DISCOUNT">DISCOUNT</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Date Range / Label</label>
                  <input type="text" value={formData.date_range} onChange={e => setFormData({ ...formData, date_range: e.target.value })} className="auth-input" placeholder="e.g. Valid until Sunday" />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={formData.visible} onChange={e => setFormData({ ...formData, visible: e.target.checked })} />
                <span>Visible immediately on site header bar</span>
              </label>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-outline" style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', fontSize: '0.875rem' }}>Save Banner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="brand-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Banner Text</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Period</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Status</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading announcements...
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No store announcements found in database.
                  </td>
                </tr>
              ) : (
                announcements.map((item) => (
                  <tr key={item.id} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.title}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span style={{ padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg)', border: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700 }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {item.date_range || 'Ongoing'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button
                        onClick={() => handleToggleVisibility(item)}
                        style={{
                          padding: '0.25rem 0.6rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: '9999px',
                          backgroundColor: item.visible ? '#dcfce7' : '#fee2e2',
                          color: item.visible ? '#166534' : '#991b1b',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        {item.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        <span>{item.visible ? 'Visible' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => handleOpenEdit(item)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Edit2 className="h-3 w-3" /> Edit
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
