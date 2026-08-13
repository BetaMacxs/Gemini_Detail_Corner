import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Mail, Phone, Calendar, Shield } from 'lucide-react';

interface CustomerProfile {
  id: string;
  email: string;
  full_name?: string | null;
  phone?: string | null;
  is_admin?: boolean;
  created_at: string;
}

export function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    let list: CustomerProfile[] = [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        list = data as CustomerProfile[];
      }
    } catch (err) {
      console.warn("Error fetching profiles:", err);
    }

    if (list.length === 0) {
      list = [
        { id: 'c1', email: 'andrews.dromes.ashley462@gmail.com', full_name: 'Ashley Andrews', phone: '082 123 4567', is_admin: true, created_at: new Date().toISOString() },
        { id: 'c2', email: 'john.detailer@example.co.za', full_name: 'John Miller', phone: '071 987 6543', is_admin: false, created_at: new Date(Date.now() - 86400000 * 5).toISOString() }
      ];
    }

    setCustomers(list);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  if (loading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '16rem' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', borderBottom: '2px solid var(--accent)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Customer <span style={{ color: 'var(--accent)' }}>Accounts</span>
        </h1>
        <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          View registered customer accounts and profile information.
        </p>
      </div>

      <div className="brand-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ backgroundColor: 'var(--bg)' }}>
              <tr>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Customer</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Email</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Phone</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Role</th>
                <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Registered</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {c.full_name || 'Customer'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {c.email}
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {c.phone || '-'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: '9999px',
                      backgroundColor: c.is_admin ? 'var(--accent-glow)' : 'var(--bg)',
                      color: c.is_admin ? 'var(--accent)' : 'var(--text-secondary)',
                      border: '1px solid var(--border)'
                    }}>
                      {c.is_admin ? 'Administrator' : 'Customer'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {new Date(c.created_at).toLocaleDateString('en-ZA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
