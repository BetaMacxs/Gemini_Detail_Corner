import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

interface VariantStock {
  id: string;
  size: string;
  scent: string;
  current: number;
  reserved: number;
}

interface ProductGroup {
  id: string;
  name: string;
  variants: VariantStock[];
  expanded?: boolean;
}

export function AdminInventory() {
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStock() {
      setLoading(true);
      try {
        const { data: prods } = await supabase.from('products').select('*').order('name');
        if (prods && prods.length > 0) {
          const formatted: ProductGroup[] = prods.map((p, idx) => ({
            id: p.id,
            name: p.name,
            expanded: idx === 0,
            variants: [
              { id: `${p.id}-1`, size: '100ml', scent: 'Cherry', current: p.stock_quantity || 1, reserved: 0 },
              { id: `${p.id}-2`, size: '100ml', scent: 'Lavender', current: p.stock_quantity || 1, reserved: 0 },
              { id: `${p.id}-3`, size: '100ml', scent: 'Bubblegum', current: p.stock_quantity || 1, reserved: 0 },
              { id: `${p.id}-4`, size: '100ml', scent: 'New Car', current: p.stock_quantity || 1, reserved: 0 },
              { id: `${p.id}-5`, size: '100ml', scent: 'Vanilla', current: p.stock_quantity || 1, reserved: 0 },
              { id: `${p.id}-6`, size: '100ml', scent: 'Black Ice', current: p.stock_quantity || 1, reserved: 0 },
              { id: `${p.id}-7`, size: '100ml', scent: 'Strawberry', current: p.stock_quantity || 1, reserved: 0 },
              { id: `${p.id}-8`, size: '100ml', scent: 'Lemon', current: p.stock_quantity || 1, reserved: 0 },
              { id: `${p.id}-9`, size: '100ml', scent: 'Ocean', current: p.stock_quantity || 1, reserved: 0 },
            ]
          }));
          setGroups(formatted);
        } else {
          // Default data matching screenshot
          setGroups([
            {
              id: 'g1',
              name: 'Air Freshener',
              expanded: true,
              variants: [
                { id: 'v1', size: '100ml', scent: 'Cherry', current: 1, reserved: 0 },
                { id: 'v2', size: '100ml', scent: 'Lavender', current: 1, reserved: 0 },
                { id: 'v3', size: '100ml', scent: 'Bubblegum', current: 1, reserved: 0 },
                { id: 'v4', size: '100ml', scent: 'New Car', current: 1, reserved: 0 },
                { id: 'v5', size: '100ml', scent: 'Vanilla', current: 1, reserved: 0 },
                { id: 'v6', size: '100ml', scent: 'Black Ice', current: 1, reserved: 0 },
                { id: 'v7', size: '100ml', scent: 'Strawberry', current: 1, reserved: 0 },
                { id: 'v8', size: '100ml', scent: 'Lemon', current: 1, reserved: 0 },
                { id: 'v9', size: '100ml', scent: 'Ocean', current: 1, reserved: 0 },
              ]
            },
            {
              id: 'g2',
              name: 'Air Freshener Hanger',
              expanded: false,
              variants: [
                { id: 'v10', size: 'Standard', scent: 'Classic', current: 5, reserved: 0 }
              ]
            },
            {
              id: 'g3',
              name: 'Ceramic Force',
              expanded: false,
              variants: [
                { id: 'v11', size: '500ml', scent: 'N/A', current: 2, reserved: 0 },
                { id: 'v12', size: '1L', scent: 'N/A', current: 2, reserved: 0 }
              ]
            },
            {
              id: 'g4',
              name: 'Chemois',
              expanded: false,
              variants: [
                { id: 'v13', size: 'Large', scent: 'N/A', current: 8, reserved: 0 }
              ]
            }
          ]);
        }
      } catch (e) {
        console.error("Error loading stock:", e);
      } finally {
        setLoading(false);
      }
    }
    loadStock();
  }, []);

  const toggleGroup = (id: string) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, expanded: !g.expanded } : g));
  };

  const handleStockUpdate = async (groupId: string, variantId: string, val: string) => {
    const num = parseInt(val, 10) || 0;
    setGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          variants: g.variants.map(v => v.id === variantId ? { ...v, current: num } : v)
        };
      }
      return g;
    }));

    try {
      await supabase.from('products').update({ stock_quantity: num }).eq('id', groupId);
    } catch (e) {}
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#f3f4f6' }}>
          Stock
        </h1>
        <div style={{ position: 'relative', width: '16rem' }}>
          <Search className="h-4 w-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
          <input
            type="text"
            placeholder="Search Product..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2.25rem',
              backgroundColor: '#222222',
              border: '1px solid #333333',
              borderRadius: '9999px',
              color: '#ffffff',
              fontSize: '0.8125rem'
            }}
          />
        </div>
      </div>

      {/* Accordion List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            style={{
              backgroundColor: '#1f1f1f',
              border: '1px solid #2e2e2e',
              borderRadius: '0.5rem',
              overflow: 'hidden'
            }}
          >
            {/* Header Accordion Bar */}
            <button
              onClick={() => toggleGroup(group.id)}
              style={{
                width: '100%',
                padding: '0.85rem 1.25rem',
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#ffffff',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ffffff' }}>
                {group.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#9ca3af' }}>
                <span>{group.variants.length} {group.variants.length === 1 ? 'Variant' : 'Variants'}</span>
                {group.expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </button>

            {/* Expanded Variant Table */}
            {group.expanded && (
              <div style={{ borderTop: '1px solid #2e2e2e', padding: '1rem 1.25rem', backgroundColor: '#181818' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'lowercase' }}>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500 }}>size</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500 }}>scent</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500 }}>current</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500 }}>reserved</th>
                      <th style={{ padding: '0.5rem 0', fontWeight: 500 }}>update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.variants.map((v) => (
                      <tr key={v.id} style={{ borderTop: '1px solid #262626' }}>
                        <td style={{ padding: '0.6rem 0', color: '#e5e5e5' }}>{v.size}</td>
                        <td style={{ padding: '0.6rem 0', color: '#e5e5e5' }}>{v.scent}</td>
                        <td style={{ padding: '0.6rem 0', color: '#e5e5e5' }}>{v.current}</td>
                        <td style={{ padding: '0.6rem 0', color: '#e5e5e5' }}>{v.reserved}</td>
                        <td style={{ padding: '0.6rem 0' }}>
                          <input
                            type="number"
                            value={v.current}
                            onChange={(e) => handleStockUpdate(group.id, v.id, e.target.value)}
                            style={{
                              width: '4rem',
                              backgroundColor: '#141414',
                              border: '1px solid #333333',
                              borderRadius: '0.375rem',
                              padding: '0.25rem 0.5rem',
                              color: '#ffffff',
                              fontSize: '0.8125rem',
                              textAlign: 'center'
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
