/**
 * Navbar Component
 * Main navigation with search, cart badge, dark mode toggle, and user menu
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { HiOutlineShoppingCart, HiOutlineUser, HiOutlineSearch, HiOutlineSun, HiOutlineMoon, HiOutlineMenu, HiOutlineX, HiOutlineLogout, HiOutlineClipboardList, HiOutlineHeart } from 'react-icons/hi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cart } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: `1px solid var(--border-light)`,
      transition: 'all 0.3s ease',
    }} className="glass">
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 20px',
        height: '70px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
      }}>
        {/* Logo */}
        <Link to="/" style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '2rem' }}>🐝</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            BuzzBasket
          </span>
        </Link>

        {/* Search Bar - Desktop */}
        <form onSubmit={handleSearch} style={{
          flex: 1,
          maxWidth: '500px',
          display: 'flex',
          position: 'relative',
        }} className="hidden-mobile">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            background: 'var(--bg-tertiary)',
            borderRadius: 'var(--radius-full)',
            padding: '0 16px',
            transition: 'all 0.3s ease',
            border: '2px solid transparent',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
          >
            <HiOutlineSearch style={{ color: 'var(--text-muted)', fontSize: '1.2rem', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search groceries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 12px',
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-primary)',
              }}
            />
          </div>
        </form>

        {/* Right Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
        }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              fontSize: '1.2rem',
              transition: 'all 0.3s ease',
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <HiOutlineSun /> : <HiOutlineMoon />}
          </button>

          {/* Cart Button */}
          <Link to="/cart" style={{
            position: 'relative',
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-full)',
            border: 'none',
            background: 'var(--bg-tertiary)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            fontSize: '1.3rem',
            textDecoration: 'none',
            transition: 'all 0.3s ease',
          }}>
            <HiOutlineShoppingCart />
            {cart.totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                color: 'white',
                fontSize: '0.7rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }} className="animate-bounceIn">
                {cart.totalItems}
              </span>
            )}
          </Link>

          {/* User Menu */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: 'var(--radius-full)',
                  border: '2px solid var(--color-primary)',
                  background: 'linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-primary-dark)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  transition: 'all 0.3s ease',
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || <HiOutlineUser />}
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <>
                  <div 
                    onClick={() => setShowUserMenu(false)}
                    style={{ position: 'fixed', inset: 0, zIndex: 40 }} 
                  />
                  <div style={{
                    position: 'absolute',
                    top: '52px',
                    right: 0,
                    width: '220px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--border-light)',
                    overflow: 'hidden',
                    zIndex: 50,
                  }} className="animate-scaleIn">
                    <div style={{
                      padding: '16px',
                      borderBottom: '1px solid var(--border-light)',
                    }}>
                      <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{user?.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</p>
                    </div>
                    <div style={{ padding: '8px' }}>
                      {/* Role-based menu items */}
                      {user?.role === 'vendor' && (
                        <Link to="/vendor/dashboard" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--color-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                          <span>🏪</span> Vendor Dashboard
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link to="/admin" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: 'var(--radius-sm)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.9rem', transition: 'all 0.2s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--color-primary)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}>
                          <span>👑</span> Admin Panel
                        </Link>
                      )}
                      {(user?.role === 'user' || user?.role === 'admin') && [
                        { icon: <HiOutlineUser />, label: 'Dashboard', path: '/dashboard' },
                        { icon: <HiOutlineClipboardList />, label: 'Orders', path: '/dashboard' },
                        { icon: <HiOutlineHeart />, label: 'Wishlist', path: '/dashboard' },
                      ].map((item, i) => (
                        <Link
                          key={i}
                          to={item.path}
                          onClick={() => setShowUserMenu(false)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'var(--bg-tertiary)';
                            e.currentTarget.style.color = 'var(--color-primary)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-secondary)';
                          }}
                        >
                          {item.icon}
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: 'var(--radius-sm)',
                          color: '#EF4444',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <HiOutlineLogout />
                        Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-full)',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
              color: 'white',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              boxShadow: 'var(--shadow-md)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Login
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            style={{
              display: 'none',
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: 'var(--bg-tertiary)',
              cursor: 'pointer',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              fontSize: '1.3rem',
            }}
            className="mobile-menu-btn"
          >
            {showMobileMenu ? <HiOutlineX /> : <HiOutlineMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      {showMobileMenu && (
        <div style={{
          padding: '12px 20px 16px',
          borderTop: '1px solid var(--border-light)',
        }} className="animate-fadeIn">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Search groceries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: '2px solid var(--border-light)',
                background: 'var(--bg-tertiary)',
                outline: 'none',
                fontSize: '0.95rem',
                color: 'var(--text-primary)',
              }}
            />
            <button type="submit" style={{
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}>
              Search
            </button>
          </form>
        </div>
      )}

      <style>{`
        @media (min-width: 769px) {
          .hidden-mobile { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
