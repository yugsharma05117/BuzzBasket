/**
 * Home Page
 * Landing page with hero, categories, featured products, and smart spending widget
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import { HiOutlineArrowRight, HiOutlineTrendingDown, HiOutlineSparkles, HiOutlineLightningBolt, HiOutlineTruck } from 'react-icons/hi';

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [budgetProducts, setBudgetProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, featRes, budgetRes] = await Promise.all([
          productsAPI.getCategories(),
          productsAPI.getAll({ limit: 8, sort: 'rating' }),
          productsAPI.getBudgetFriendly(),
        ]);
        setCategories(catRes.data.categories || []);
        setFeaturedProducts(featRes.data.products || []);
        setBudgetProducts(budgetRes.data.products || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader size="lg" text="Loading BuzzBasket..." />;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* ============ HERO SECTION ============ */}
      <section style={{
        background: 'linear-gradient(135deg, #064E3B 0%, #065F46 30%, #047857 60%, #059669 100%)',
        padding: '60px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '300px', height: '300px', borderRadius: '50%',
          background: 'rgba(52, 211, 153, 0.15)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-60px', left: '-60px',
          width: '250px', height: '250px', borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.1)', pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '40px', alignItems: 'center', position: 'relative',
        }}>
          <div className="animate-fadeIn">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)',
              padding: '6px 16px', marginBottom: '20px', backdropFilter: 'blur(10px)',
            }}>
              <HiOutlineLightningBolt style={{ color: '#FCD34D' }} />
              <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: 500 }}>
                Smart Grocery Shopping
              </span>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.15,
              marginBottom: '16px',
            }}>
              Fresh Groceries,<br />
              <span style={{ color: '#FCD34D' }}>Smarter Savings</span> 🐝
            </h1>

            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '1.1rem',
              lineHeight: 1.7,
              marginBottom: '28px',
              maxWidth: '500px',
            }}>
              Shop from 500+ products, track your spending, and discover budget-friendly alternatives for everything you need.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/products" style={{
                padding: '14px 32px',
                borderRadius: 'var(--radius-full)',
                background: 'white',
                color: '#059669',
                textDecoration: 'none',
                fontSize: '1rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Shop Now <HiOutlineArrowRight />
              </Link>
              {!isAuthenticated && (
                <Link to="/login" style={{
                  padding: '14px 32px',
                  borderRadius: 'var(--radius-full)',
                  background: 'rgba(255,255,255,0.15)',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                  border: '2px solid rgba(255,255,255,0.3)',
                  backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>

          {/* Hero Right - Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="hero-right-hide">
            {[
              { icon: '🛒', label: 'Products', value: '500+', color: '#10B981' },
              { icon: '📦', label: 'Categories', value: `${categories.length}`, color: '#F59E0B' },
              { icon: '🚀', label: 'Delivery', value: '30 min', color: '#8B5CF6' },
              { icon: '💰', label: 'You Save', value: 'Up to 40%', color: '#EF4444' },
            ].map((stat, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                border: '1px solid rgba(255,255,255,0.15)',
              }} className={`animate-fadeIn delay-${(i + 1) * 100}`}>
                <span style={{ fontSize: '2rem' }}>{stat.icon}</span>
                <div>
                  <p style={{ fontWeight: 800, fontSize: '1.3rem', color: stat.color }}>{stat.value}</p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .hero-right-hide { display: none !important; }
          }
        `}</style>
      </section>

      {/* ============ FEATURES BAR ============ */}
      <section style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-light)',
        padding: '20px',
      }}>
        <div style={{
          maxWidth: '1400px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px',
        }}>
          {[
            { icon: <HiOutlineTruck />, text: 'Free delivery above ₹499' },
            { icon: <HiOutlineSparkles />, text: 'Freshness guaranteed' },
            { icon: <HiOutlineTrendingDown />, text: 'Smart price tracking' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              color: 'var(--text-secondary)', fontSize: '0.9rem',
            }}>
              <span style={{ color: 'var(--color-primary)', fontSize: '1.3rem' }}>{f.icon}</span>
              <span style={{ fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============ SPENDING WIDGET (Authenticated) ============ */}
      {isAuthenticated && user && (
        <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px 0' }}>
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            border: '1px solid #FCD34D',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '2rem' }}>📊</span>
              <div>
                <p style={{ fontWeight: 700, color: '#92400E', fontSize: '1rem' }}>
                  You spent ₹{(user.weeklySpent || 0).toLocaleString()} this week
                </p>
                <p style={{ color: '#B45309', fontSize: '0.85rem' }}>
                  Total: ₹{(user.totalSpent || 0).toLocaleString()} · Track your spending in the dashboard
                </p>
              </div>
            </div>
            <Link to="/dashboard" style={{
              padding: '8px 20px', borderRadius: 'var(--radius-full)',
              background: '#D97706', color: 'white', textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 600,
            }}>
              View Details →
            </Link>
          </div>
        </section>
      )}

      {/* ============ CATEGORIES ============ */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Shop by Category
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Browse our curated collection
            </p>
          </div>
          <Link to="/products" style={{
            color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600,
            fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            View All <HiOutlineArrowRight />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '16px',
        }}>
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '20px 12px', borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                textDecoration: 'none', transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              className={`animate-fadeIn delay-${Math.min((i + 1) * 100, 500)}`}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
            >
              <span style={{ fontSize: '2.2rem', marginBottom: '8px' }}>{cat.emoji}</span>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', textAlign: 'center' }}>{cat.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>{cat.count} items</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px 40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              ⭐ Top Rated Products
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Customer favorites this week
            </p>
          </div>
          <Link to="/products?sort=rating" style={{
            color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600,
            fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            See All <HiOutlineArrowRight />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '20px',
        }}>
          {featuredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* ============ BUDGET FRIENDLY ============ */}
      {budgetProducts.length > 0 && (
        <section style={{
          background: 'var(--bg-secondary)',
          padding: '40px 20px',
          borderTop: '1px solid var(--border-light)',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  💰 Budget-Friendly Picks
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Great value without compromising quality
                </p>
              </div>
              <Link to="/products?budgetFriendly=true" style={{
                color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600,
                fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                View All <HiOutlineArrowRight />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '20px',
            }}>
              {budgetProducts.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ CTA BANNER ============ */}
      <section style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #7C3AED, #6D28D9, #5B21B6)',
          borderRadius: 'var(--radius-xl)',
          padding: '48px 40px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-40px', right: '10%',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }} />
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
            fontWeight: 800, color: 'white', marginBottom: '12px',
          }}>
            Save Smarter with BuzzBasket 🐝
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
            Get personalized cheaper alternatives, track weekly spending, and never overpay for groceries again.
          </p>
          <Link to={isAuthenticated ? '/products' : '/signup'} style={{
            padding: '14px 36px', borderRadius: 'var(--radius-full)',
            background: 'white', color: '#5B21B6', textDecoration: 'none',
            fontSize: '1rem', fontWeight: 700, display: 'inline-flex',
            alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {isAuthenticated ? 'Start Shopping' : 'Get Started Free'} <HiOutlineArrowRight />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
