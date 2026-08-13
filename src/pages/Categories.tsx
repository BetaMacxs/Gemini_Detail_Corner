import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProductsStore } from '../features/products/store';
import { Layers } from 'lucide-react';

export function Categories() {
  const { categories, isLoading, error, fetchCategories } = useProductsStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '3rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '16rem' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', borderBottom: '2px solid var(--accent)', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)' }}>Product Categories</h1>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Browse our selection of premium detailing supplies by category.</p>
      </div>

      {error ? (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center' }}>
          <p>{error}</p>
        </div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '6rem 1rem', backgroundColor: 'var(--bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Layers style={{ margin: '0 auto', height: '3rem', width: '3rem', color: 'var(--text-secondary)' }} />
          <h3 style={{ marginTop: '1rem', fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)' }}>No categories found</h3>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {categories.map((category) => (
            <Link 
              key={category.id} 
              to={`/shop?category=${category.id}`}
              className="brand-card"
              style={{ display: 'block', overflow: 'hidden', textDecoration: 'none' }}
            >
              <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--surface)', overflow: 'hidden' }}>
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }}
                  />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <Layers className="h-16 w-16 opacity-50" />
                  </div>
                )}
              </div>
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {category.name}
                </h3>
                {category.description && (
                  <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {category.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
