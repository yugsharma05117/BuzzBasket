/**
 * Footer Component
 * Site-wide footer with links and branding
 */
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-light)',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px 20px 20px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '32px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>🐝</span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.3rem',
                fontWeight: 800,
              }} className="text-gradient">BuzzBasket</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Your smart grocery companion. Fresh products, smart savings, delivered fast.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Shop
            </h4>
            {['Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages'].map((cat) => (
              <Link key={cat} to={`/products?category=${cat}`} style={{
                display: 'block',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                padding: '4px 0',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Account */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Account
            </h4>
            {[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'My Orders', path: '/dashboard' },
              { label: 'Cart', path: '/cart' },
              { label: 'Login', path: '/login' },
            ].map((item) => (
              <Link key={item.label} to={item.path} style={{
                display: 'block',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textDecoration: 'none',
                padding: '4px 0',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--color-primary)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Support
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '4px 0' }}>📧 support@buzzbasket.com</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '4px 0' }}>📞 1800-BUZZ-SHOP</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '4px 0' }}>🕐 24/7 Customer Care</p>
          </div>
        </div>

        {/* Bottom */}
        <div style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
        }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            © 2026 BuzzBasket. All rights reserved.
          </p>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Made with 🐝 for smart shoppers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
