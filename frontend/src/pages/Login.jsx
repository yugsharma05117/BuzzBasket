/**
 * Login & Signup Page
 * Toggle between login and registration forms
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser, HiOutlinePhone, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';

const Login = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        if (!formData.name || !formData.email || !formData.password) {
          toast.error('Please fill all required fields');
          setLoading(false);
          return;
        }
        const data = await register(formData.name, formData.email, formData.password, formData.phone, selectedRole);
        toast.success('Account created! Welcome to BuzzBasket 🐝');
        if (selectedRole === 'vendor') {
          navigate('/vendor/dashboard');
        } else {
          navigate('/');
        }
      } else {
        if (!formData.email || !formData.password) {
          toast.error('Please enter email and password');
          setLoading(false);
          return;
        }
        const data = await login(formData.email, formData.password);
        toast.success('Welcome back! 🎉');
        if (data.user?.role === 'admin') navigate('/admin');
        else if (data.user?.role === 'vendor') navigate('/vendor/dashboard');
        else navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px 12px 44px',
    borderRadius: 'var(--radius-sm)',
    border: '2px solid var(--border-light)',
    background: 'var(--bg-card)',
    color: 'var(--text-primary)',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.3s',
    fontFamily: 'var(--font-primary)',
  };

  const iconStyle = {
    position: 'absolute',
    left: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-muted)',
    fontSize: '1.1rem',
    pointerEvents: 'none',
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'var(--bg-secondary)',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
      }} className="animate-fadeIn">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span style={{ fontSize: '2.5rem' }}>🐝</span>
          </Link>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.8rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isSignup ? 'Join BuzzBasket for smart grocery shopping' : 'Login to your BuzzBasket account'}
          </p>
        </div>

        {/* Form Card */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-light)',
          padding: '32px',
          boxShadow: 'var(--shadow-lg)',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Name (Signup) */}
            {isSignup && (
              <div style={{ position: 'relative' }}>
                <HiOutlineUser style={iconStyle} />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                />
              </div>
            )}

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <HiOutlineMail style={iconStyle} />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <HiOutlineLockClosed style={iconStyle} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={{ ...inputStyle, paddingRight: '44px' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '14px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  fontSize: '1.1rem', padding: '0',
                }}
              >
                {showPassword ? <HiOutlineEyeOff /> : <HiOutlineEye />}
              </button>
            </div>

            {/* Phone (Signup) */}
            {isSignup && (
              <div style={{ position: 'relative' }}>
                <HiOutlinePhone style={iconStyle} />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number (optional)"
                  value={formData.phone}
                  onChange={handleChange}
                  style={inputStyle}
                  onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-light)'}
                />
              </div>
            )}

            {/* Role Selection (Signup) */}
            {isSignup && (
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>I want to:</p>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[{ id: 'user', label: '🛒 Shop Groceries', desc: 'Customer' }, { id: 'vendor', label: '🏪 Sell Products', desc: 'Vendor' }].map(r => (
                    <button key={r.id} type="button" onClick={() => setSelectedRole(r.id)} style={{
                      flex: 1, padding: '12px', borderRadius: 'var(--radius-sm)',
                      border: selectedRole === r.id ? '2px solid var(--color-primary)' : '2px solid var(--border-light)',
                      background: selectedRole === r.id ? 'var(--color-primary-50)' : 'var(--bg-card)',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                    }}>
                      <span style={{ display: 'block', fontSize: '1.1rem', marginBottom: '4px' }}>{r.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                background: loading ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                color: 'white',
                border: 'none',
                cursor: loading ? 'wait' : 'pointer',
                fontSize: '1rem',
                fontWeight: 700,
                transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow-md)',
                marginTop: '8px',
              }}
              onMouseEnter={(e) => !loading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
            </button>
          </form>

          {/* Demo Login Info */}
          {!isSignup && (
            <div style={{
              marginTop: '16px', padding: '12px',
              background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem', color: 'var(--text-muted)',
            }}>
              <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text-secondary)' }}>Demo Credentials:</p>
              <p>👤 demo@buzzbasket.com · 🔑 demo123</p>
              <p>🏪 vendor@buzzbasket.com · 🔑 vendor123</p>
              <p>👑 admin@buzzbasket.com · 🔑 admin123</p>
            </div>
          )}

          {/* Toggle */}
          <p style={{
            textAlign: 'center', marginTop: '20px',
            color: 'var(--text-muted)', fontSize: '0.9rem',
          }}>
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignup(!isSignup)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-primary)', fontWeight: 600, fontSize: '0.9rem',
              }}
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
