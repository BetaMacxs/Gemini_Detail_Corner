import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../features/auth/store';
import { supabase } from '../lib/supabase';
import { MapPin, Plus, Trash2, CheckCircle2, Edit2, X } from 'lucide-react';

interface Address {
  id: string;
  first_name: string;
  last_name: string;
  company?: string | null;
  address_line_1: string;
  address_line_2?: string | null;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  phone?: string | null;
  is_default_shipping: boolean;
  is_default_billing: boolean;
}

export function Addresses() {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    company: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    province: 'Western Cape',
    postal_code: '',
    country: 'South Africa',
    phone: '',
    is_default_shipping: false,
    is_default_billing: false
  });

  const fetchAddresses = async () => {
    if (!user) return;
    setLoading(true);
    let fetchedList: Address[] = [];

    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        fetchedList = data as Address[];
      }
    } catch (e) {
      console.warn("DB address fetch notice:", e);
    }

    if (fetchedList.length === 0) {
      try {
        const localData = JSON.parse(localStorage.getItem(`addresses_${user.id}`) || '[]');
        fetchedList = localData;
      } catch (e) {
        // ignore
      }
    }

    setAddresses(fetchedList);
    setLoading(false);
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const handleOpenNew = () => {
    setEditingAddress(null);
    setFormData({
      first_name: '',
      last_name: '',
      company: '',
      address_line_1: '',
      address_line_2: '',
      city: '',
      province: 'Western Cape',
      postal_code: '',
      country: 'South Africa',
      phone: '',
      is_default_shipping: addresses.length === 0,
      is_default_billing: addresses.length === 0
    });
    setShowForm(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setEditingAddress(addr);
    setFormData({
      first_name: addr.first_name || '',
      last_name: addr.last_name || '',
      company: addr.company || '',
      address_line_1: addr.address_line_1 || '',
      address_line_2: addr.address_line_2 || '',
      city: addr.city || '',
      province: addr.province || 'Western Cape',
      postal_code: addr.postal_code || '',
      country: addr.country || 'South Africa',
      phone: addr.phone || '',
      is_default_shipping: addr.is_default_shipping || false,
      is_default_billing: addr.is_default_billing || false
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      profile_id: user.id,
      ...formData
    };

    let updatedList = [...addresses];

    if (editingAddress) {
      try {
        await supabase
          .from('addresses')
          .update(payload)
          .eq('id', editingAddress.id);
      } catch (e) {
        console.warn("Address update error:", e);
      }

      updatedList = updatedList.map(a => a.id === editingAddress.id ? { ...a, ...payload } : a);
    } else {
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `addr_${Date.now()}`;
      const newAddr = { id: newId, ...payload };

      try {
        const { data, error: insertErr } = await supabase
          .from('addresses')
          .insert(payload)
          .select()
          .single();

        if (!insertErr && data) {
          updatedList = [data as Address, ...updatedList];
        } else {
          updatedList = [newAddr, ...updatedList];
        }
      } catch (e) {
        updatedList = [newAddr, ...updatedList];
      }
    }

    try {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(updatedList));
    } catch (e) {
      // ignore
    }

    setAddresses(updatedList);
    setSubmitting(false);
    setShowForm(false);
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const filtered = addresses.filter(a => a.id !== id);

    try {
      await supabase.from('addresses').delete().eq('id', id);
    } catch (e) {
      console.warn("Delete address notice:", e);
    }

    try {
      localStorage.setItem(`addresses_${user.id}`, JSON.stringify(filtered));
    } catch (e) {
      // ignore
    }

    setAddresses(filtered);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '20rem' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', borderBottom: '2px solid var(--accent)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingTop: '3rem', paddingBottom: '6rem' }}>
      <div className="container" style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 900, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>
              Saved <span style={{ color: 'var(--accent)' }}>Addresses</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Manage your default shipping and billing destinations.
            </p>
          </div>
          <button
            onClick={handleOpenNew}
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
          >
            <Plus className="h-4 w-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {showForm && (
          <div className="brand-card" style={{ padding: '2rem', borderRadius: 'var(--radius-lg)', marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 800, textTransform: 'uppercase', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                {editingAddress ? 'Edit Address' : 'New Delivery Address'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>First Name</label>
                  <input type="text" required value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} className="auth-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Last Name</label>
                  <input type="text" required value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} className="auth-input" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Street Address</label>
                <input type="text" required placeholder="Line 1" value={formData.address_line_1} onChange={e => setFormData({ ...formData, address_line_1: e.target.value })} className="auth-input" style={{ marginBottom: '0.5rem' }} />
                <input type="text" placeholder="Line 2 (Optional, e.g. Suite/Unit)" value={formData.address_line_2} onChange={e => setFormData({ ...formData, address_line_2: e.target.value })} className="auth-input" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>City</label>
                  <input type="text" required value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="auth-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Province</label>
                  <input type="text" required value={formData.province} onChange={e => setFormData({ ...formData, province: e.target.value })} className="auth-input" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Postal Code</label>
                  <input type="text" required value={formData.postal_code} onChange={e => setFormData({ ...formData, postal_code: e.target.value })} className="auth-input" />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.is_default_shipping} onChange={e => setFormData({ ...formData, is_default_shipping: e.target.checked })} />
                  <span>Set as Default Shipping Address</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowForm(false)} className="btn btn-outline" style={{ padding: '0.75rem 1.25rem', fontSize: '0.875rem' }}>Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
                  {submitting ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        )}

        {addresses.length === 0 ? (
          <div className="brand-card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <MapPin className="h-12 w-12" style={{ margin: '0 auto', color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', fontStyle: 'italic' }}>No Addresses Saved</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Save your address for a faster checkout experience.
            </p>
            <button onClick={handleOpenNew} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}>
              Add Your First Address
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {addresses.map((addr) => (
              <div key={addr.id} className="brand-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {addr.first_name} {addr.last_name}
                    </div>
                    {addr.is_default_shipping && (
                      <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--accent)', backgroundColor: 'var(--accent-glow)', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                        Default
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <div>{addr.address_line_1}</div>
                    {addr.address_line_2 && <div>{addr.address_line_2}</div>}
                    <div>{addr.city}, {addr.province} {addr.postal_code}</div>
                    <div>{addr.country}</div>
                    {addr.phone && <div style={{ marginTop: '0.5rem', color: 'var(--text-primary)' }}>Phone: {addr.phone}</div>}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                  <button onClick={() => handleOpenEdit(addr)} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', flex: 1, justifyContent: 'center' }}>
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="btn btn-outline" style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', flex: 1, justifyContent: 'center' }}>
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
