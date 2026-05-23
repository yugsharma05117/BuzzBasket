/**
 * Products Page
 * Browse, search, and filter products with category sidebar
 */
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { HiOutlineFilter, HiOutlineX, HiOutlineSearch, HiOutlineAdjustments } from 'react-icons/hi';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state from URL params
  const currentCategory = searchParams.get('category') || '';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentPage = Number(searchParams.get('page')) || 1;
  const budgetFriendly = searchParams.get('budgetFriendly') || '';
  const organic = searchParams.get('organic') || '';

  const [searchInput, setSearchInput] = useState(currentSearch);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { page: currentPage, limit: 16 };
        if (currentCategory) params.category = currentCategory;
        if (currentSearch) params.search = currentSearch;
        if (currentSort) params.sort = currentSort;
        if (budgetFriendly) params.budgetFriendly = budgetFriendly;
        if (organic) params.organic = organic;

        const { data } = await productsAPI.getAll(params);
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const { data } = await productsAPI.getCategories();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [currentCategory, currentSearch, currentSort, currentPage, budgetFriendly, organic]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateFilter('search', searchInput.trim());
  };

  const clearAllFilters = () => {
    setSearchParams({});
    setSearchInput('');
  };

  const hasActiveFilters = currentCategory || currentSearch || budgetFriendly || organic;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.8rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '8px',
        }}>
          {currentCategory ? `${currentCategory}` : currentSearch ? `Results for "${currentSearch}"` : 'All Products'}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {products.length > 0 ? `Showing ${products.length} products` : 'No products found'}
        </p>
      </div>

      {/* Search & Filters Bar */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '240px', display: 'flex', gap: '8px' }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            background: 'var(--bg-card)',
            border: '2px solid var(--border-light)',
            borderRadius: 'var(--radius-full)',
            padding: '0 16px',
            transition: 'border-color 0.3s',
          }}>
            <HiOutlineSearch style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                flex: 1, padding: '10px 12px', border: 'none',
                background: 'transparent', outline: 'none',
                color: 'var(--text-primary)', fontSize: '0.9rem',
              }}
            />
          </div>
        </form>

        {/* Sort */}
        <select
          value={currentSort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--border-light)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>

        {/* Filter Toggle (Mobile) */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--border-light)',
            background: showFilters ? 'var(--color-primary)' : 'var(--bg-card)',
            color: showFilters ? 'white' : 'var(--text-secondary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <HiOutlineAdjustments /> Filters
        </button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button onClick={clearAllFilters} style={{
            padding: '10px 16px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: '#FEE2E2',
            color: '#DC2626',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <HiOutlineX /> Clear All
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Sidebar Filters */}
        <aside style={{
          width: '220px',
          flexShrink: 0,
          display: showFilters ? 'block' : undefined,
        }} className={showFilters ? '' : 'filters-desktop'}>
          {/* Categories */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            padding: '16px',
            marginBottom: '16px',
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Categories
            </h3>
            <button
              onClick={() => updateFilter('category', '')}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '8px 12px', borderRadius: 'var(--radius-sm)',
                border: 'none', cursor: 'pointer', fontSize: '0.9rem',
                marginBottom: '4px',
                background: !currentCategory ? 'var(--color-primary-50)' : 'transparent',
                color: !currentCategory ? 'var(--color-primary-dark)' : 'var(--text-secondary)',
                fontWeight: !currentCategory ? 600 : 400,
              }}
            >
              All Products
            </button>
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => updateFilter('category', cat.name)}
                style={{
                  display: 'flex', width: '100%', justifyContent: 'space-between',
                  alignItems: 'center', padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer',
                  fontSize: '0.9rem', marginBottom: '4px',
                  background: currentCategory === cat.name ? 'var(--color-primary-50)' : 'transparent',
                  color: currentCategory === cat.name ? 'var(--color-primary-dark)' : 'var(--text-secondary)',
                  fontWeight: currentCategory === cat.name ? 600 : 400,
                  transition: 'all 0.2s',
                }}
              >
                <span>{cat.emoji} {cat.name}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.count}</span>
              </button>
            ))}
          </div>

          {/* Quick Filters */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            padding: '16px',
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Quick Filters
            </h3>
            {[
              { label: '💰 Budget Friendly', key: 'budgetFriendly', value: budgetFriendly },
              { label: '🌿 Organic Only', key: 'organic', value: organic },
            ].map((filter) => (
              <label key={filter.key} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 0', cursor: 'pointer', fontSize: '0.9rem',
                color: 'var(--text-secondary)',
              }}>
                <input
                  type="checkbox"
                  checked={filter.value === 'true'}
                  onChange={(e) => updateFilter(filter.key, e.target.checked ? 'true' : '')}
                  style={{
                    width: '18px', height: '18px', cursor: 'pointer',
                    accentColor: 'var(--color-primary)',
                  }}
                />
                {filter.label}
              </label>
            ))}
          </div>
        </aside>

        {/* Products Grid */}
        <main style={{ flex: 1 }}>
          {loading ? (
            <Loader size="lg" text="Loading products..." />
          ) : products.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 20px',
              background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
            }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '16px' }}>🔍</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                No products found
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                Try adjusting your filters or search terms
              </p>
              <button onClick={clearAllFilters} style={{
                padding: '10px 24px', borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)', color: 'white',
                border: 'none', cursor: 'pointer', fontWeight: 600,
              }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px',
              }}>
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex', justifyContent: 'center', gap: '8px',
                  marginTop: '32px',
                }}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => updateFilter('page', String(page))}
                      style={{
                        width: '40px', height: '40px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: '0.9rem',
                        background: currentPage === page ? 'var(--color-primary)' : 'var(--bg-card)',
                        color: currentPage === page ? 'white' : 'var(--text-secondary)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .filters-desktop { display: none !important; }
        }
        @media (min-width: 769px) {
          .filters-desktop { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default Products;
