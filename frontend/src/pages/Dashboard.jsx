/**
 * Dashboard Page
 * User profile, spending stats, order history, wishlist
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, authAPI } from '../services/api';
import Loader from '../components/Loader';
import { HiOutlineUser, HiOutlineClipboardList, HiOutlineHeart, HiOutlineCurrencyRupee, HiOutlineTrendingUp, HiOutlineLogout, HiOutlineShoppingBag } from 'react-icons/hi';

const Dashboard = () => {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [spending, setSpending] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        const [ordersRes, spendingRes] = await Promise.all([
          ordersAPI.getAll(),
          authAPI.getSpending(),
        ]);
        setOrders(ordersRes.data.orders || []);
        setSpending(spendingRes.data.spending || {});
        await refreshUser();
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAuthenticated]);

  if (loading) return <Loader size="lg" text="Loading dashboard..." />;

  const statusColors = {
    pending: { bg: '#FEF3C7', text: '#92400E' },
    confirmed: { bg: '#DBEAFE', text: '#1E40AF' },
    processing: { bg: '#E0E7FF', text: '#3730A3' },
    shipped: { bg: '#D1FAE5', text: '#065F46' },
    delivered: { bg: '#ECFDF5', text: '#047857' },
    cancelled: { bg: '#FEE2E2', text: '#991B1B' },
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <HiOutlineTrendingUp /> },
    { id: 'orders', label: 'Orders', icon: <HiOutlineClipboardList /> },
    { id: 'profile', label: 'Profile', icon: <HiOutlineUser /> },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', minHeight: '80vh' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '28px', flexWrap: 'wrap', gap: '12px',
      }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700 }}>
            Hello, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Welcome to your dashboard
          </p>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} style={{
          padding: '8px 20px', borderRadius: 'var(--radius-full)',
          border: '2px solid #FEE2E2', background: 'transparent', color: '#DC2626',
          cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
          display: 'flex', alignItems: 'center', gap: '6px',
        }}>
          <HiOutlineLogout /> Logout
        </button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '24px',
        background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)',
        padding: '4px', width: 'fit-content',
      }}>
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            padding: '10px 20px', borderRadius: 'var(--radius-full)',
            border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '6px',
            background: activeTab === tab.id ? 'var(--bg-card)' : 'transparent',
            color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--text-muted)',
            boxShadow: activeTab === tab.id ? 'var(--shadow-sm)' : 'none',
            transition: 'all 0.3s ease',
          }}>
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ============ OVERVIEW TAB ============ */}
      {activeTab === 'overview' && (
        <div className="animate-fadeIn">
          {/* Stats Cards */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px', marginBottom: '32px',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #059669, #047857)',
              borderRadius: 'var(--radius-lg)', padding: '24px', color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <HiOutlineCurrencyRupee style={{ fontSize: '1.5rem', opacity: 0.8 }} />
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Total Spent</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>₹{(user?.totalSpent || 0).toLocaleString()}</p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #D97706, #B45309)',
              borderRadius: 'var(--radius-lg)', padding: '24px', color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <HiOutlineTrendingUp style={{ fontSize: '1.5rem', opacity: 0.8 }} />
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>This Week</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>₹{(user?.weeklySpent || 0).toLocaleString()}</p>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
              borderRadius: 'var(--radius-lg)', padding: '24px', color: 'white',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <HiOutlineShoppingBag style={{ fontSize: '1.5rem', opacity: 0.8 }} />
                <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>Total Orders</span>
              </div>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>{orders.length}</p>
            </div>
          </div>

          {/* Spending Tip */}
          <div style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px',
            display: 'flex', alignItems: 'center', gap: '16px',
            marginBottom: '32px', border: '1px solid #FCD34D',
          }}>
            <span style={{ fontSize: '2rem' }}>💡</span>
            <div>
              <p style={{ fontWeight: 700, color: '#92400E' }}>Smart Saving Tip</p>
              <p style={{ color: '#B45309', fontSize: '0.9rem' }}>
                {(user?.weeklySpent || 0) > 1000
                  ? 'You\'re spending above average this week. Check our budget-friendly section for great alternatives!'
                  : 'Great job! You\'re staying within a healthy weekly budget. Keep it up! 🎯'
                }
              </p>
            </div>
            <Link to="/products?budgetFriendly=true" style={{
              padding: '8px 16px', borderRadius: 'var(--radius-full)',
              background: '#D97706', color: 'white', textDecoration: 'none',
              fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap',
            }}>
              View Deals
            </Link>
          </div>

          {/* Recent Orders */}
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
            Recent Orders
          </h3>
          {orders.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px', background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)',
            }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>📦</span>
              <p style={{ color: 'var(--text-muted)' }}>No orders yet. Start shopping!</p>
              <Link to="/products" style={{
                display: 'inline-block', marginTop: '12px',
                padding: '8px 24px', borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)', color: 'white',
                textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem',
              }}>Browse Products</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.slice(0, 5).map((order) => (
                <div key={order._id} style={{
                  background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)', padding: '16px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '12px',
                }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>#{order.orderNumber}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })} · {order.totalItems} items
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                      background: statusColors[order.status]?.bg || '#F1F5F9',
                      color: statusColors[order.status]?.text || '#64748B',
                    }}>
                      {order.status}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>₹{order.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ ORDERS TAB ============ */}
      {activeTab === 'orders' && (
        <div className="animate-fadeIn">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '20px' }}>
            Order History ({orders.length})
          </h3>

          {orders.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px', background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)',
            }}>
              <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>📦</span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>No orders yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Your order history will appear here</p>
              <Link to="/products" style={{
                padding: '10px 24px', borderRadius: 'var(--radius-full)',
                background: 'var(--color-primary)', color: 'white',
                textDecoration: 'none', fontWeight: 600,
              }}>Start Shopping</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((order) => (
                <div key={order._id} style={{
                  background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-light)', overflow: 'hidden',
                }}>
                  {/* Order Header */}
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '16px 20px', borderBottom: '1px solid var(--border-light)',
                    flexWrap: 'wrap', gap: '8px',
                  }}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: '1rem' }}>#{order.orderNumber}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '12px' }}>
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        padding: '4px 14px', borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize',
                        background: statusColors[order.status]?.bg || '#F1F5F9',
                        color: statusColors[order.status]?.text || '#64748B',
                      }}>
                        {order.status}
                      </span>
                      <span style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--color-primary-dark)' }}>
                        ₹{order.totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 12px', background: 'var(--bg-secondary)',
                          borderRadius: 'var(--radius-sm)', fontSize: '0.85rem',
                        }}>
                          <span>{item.emoji || '🛒'}</span>
                          <span style={{ fontWeight: 500 }}>{item.name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>×{item.quantity}</span>
                          <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{
                      display: 'flex', gap: '16px', marginTop: '12px',
                      color: 'var(--text-muted)', fontSize: '0.8rem',
                    }}>
                      <span>💳 {order.paymentMethod?.toUpperCase()}</span>
                      <span>📦 {order.totalItems} items</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============ PROFILE TAB ============ */}
      {activeTab === 'profile' && (
        <div className="animate-fadeIn">
          <div style={{
            background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)', padding: '32px',
            maxWidth: '600px',
          }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, marginBottom: '24px' }}>
              Profile Information
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { label: 'Name', value: user?.name },
                { label: 'Email', value: user?.email },
                { label: 'Phone', value: user?.phone || 'Not set' },
                { label: 'Role', value: user?.role === 'admin' ? '👑 Admin' : '👤 User' },
                { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) },
              ].map((field, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)',
                }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{field.label}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{field.value}</span>
                </div>
              ))}
            </div>

            {user?.address && (user.address.street || user.address.city) && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                  📍 Delivery Address
                </h4>
                <p style={{
                  padding: '12px 16px', borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontSize: '0.9rem',
                }}>
                  {[user.address.street, user.address.city, user.address.state, user.address.pincode].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
