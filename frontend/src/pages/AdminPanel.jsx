/**
 * Admin Panel Page
 * Platform management: analytics, users, vendors, products, orders
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminAPI } from '../services/api';
import DashboardSidebar from '../components/DashboardSidebar';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#10B981', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6', '#F97316'];

const AdminPanel = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) { navigate('/login'); return; }
    fetchAll();
  }, [isAuthenticated, isAdmin]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, usersRes, vendorsRes, prodsRes, ordersRes] = await Promise.all([
        adminAPI.getDashboard(), adminAPI.getUsers(), adminAPI.getVendors(), adminAPI.getProducts(), adminAPI.getOrders(),
      ]);
      setStats(dashRes.data.stats);
      setUsers(usersRes.data.users || []);
      setVendors(vendorsRes.data.vendors || []);
      setProducts(prodsRes.data.products || []);
      setOrders(ordersRes.data.orders || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleVendorStatus = async (id, status) => {
    try { await adminAPI.updateVendorStatus(id, status); toast.success(`Vendor ${status}`); fetchAll(); } catch { toast.error('Failed'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Delete this user?')) return;
    try { await adminAPI.deleteUser(id); toast.success('User deleted'); fetchAll(); } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveProduct = async (id) => {
    if (!confirm('Remove this product?')) return;
    try { await adminAPI.removeProduct(id); toast.success('Product removed'); fetchAll(); } catch { toast.error('Failed'); }
  };

  if (loading) return <Loader size="lg" text="Loading admin panel..." />;

  const cardStyle = { background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '24px' };
  const btnStyle = (bg, color) => ({ padding: '5px 14px', borderRadius: 'var(--radius-full)', border: 'none', background: bg, color, cursor: 'pointer', fontWeight: 600, fontSize: '0.78rem' });
  const statusColors = { pending: '#FEF3C7', approved: '#D1FAE5', rejected: '#FEE2E2', suspended: '#E0E7FF' };
  const statusTextC = { pending: '#92400E', approved: '#065F46', rejected: '#991B1B', suspended: '#3730A3' };

  const sidebarItems = [
    { id: 'overview', label: 'Analytics', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👤', badge: stats?.totalUsers },
    { id: 'vendors', label: 'Vendors', icon: '🏪', badge: stats?.pendingVendors, badgeColor: '#EF4444' },
    { id: 'products', label: 'Products', icon: '📦', badge: stats?.totalProducts },
    { id: 'orders', label: 'Orders', icon: '🛒', badge: stats?.totalOrders },
  ];

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      <DashboardSidebar items={sidebarItems} activeItem={activeTab} onItemClick={setActiveTab} title="Admin Panel" titleEmoji="👑" />
      <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>

        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '24px' }}>Platform Analytics</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Users', value: stats?.totalUsers || 0, bg: 'linear-gradient(135deg,#6366F1,#4F46E5)', icon: '👤' },
                { label: 'Vendors', value: stats?.totalVendors || 0, bg: 'linear-gradient(135deg,#10B981,#059669)', icon: '🏪' },
                { label: 'Products', value: stats?.totalProducts || 0, bg: 'linear-gradient(135deg,#F59E0B,#D97706)', icon: '📦' },
                { label: 'Orders', value: stats?.totalOrders || 0, bg: 'linear-gradient(135deg,#EC4899,#DB2777)', icon: '🛒' },
                { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, bg: 'linear-gradient(135deg,#14B8A6,#0D9488)', icon: '💰' },
                { label: 'Pending Vendors', value: stats?.pendingVendors || 0, bg: 'linear-gradient(135deg,#EF4444,#DC2626)', icon: '⏳' },
              ].map((s, i) => (
                <div key={i} style={{ background: s.bg, borderRadius: 'var(--radius-lg)', padding: '18px', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', opacity: 0.85, fontSize: '0.8rem' }}><span>{s.icon}</span>{s.label}</div>
                  <p style={{ fontSize: '1.7rem', fontWeight: 800 }}>{s.value}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={cardStyle}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats?.monthlyRevenue || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis dataKey="_id" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#10B981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={cardStyle}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Order Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={stats?.statusBreakdown || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id, count }) => `${_id}: ${count}`}>
                      {(stats?.statusBreakdown || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            {/* Recent Users */}
            <div style={{ ...cardStyle, marginTop: '20px' }}>
              <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Recent Signups</h3>
              {(stats?.recentUsers || []).map((u, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: i < (stats?.recentUsers?.length || 0) - 1 ? '1px solid var(--border-light)' : 'none' }}>
                  <div><span style={{ fontWeight: 600 }}>{u.name}</span><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>{u.email}</span></div>
                  <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: u.role === 'admin' ? '#FEF3C7' : u.role === 'vendor' ? '#D1FAE5' : '#DBEAFE', color: u.role === 'admin' ? '#92400E' : u.role === 'vendor' ? '#065F46' : '#1E40AF' }}>{u.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {activeTab === 'users' && (
          <div className="animate-fadeIn">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>All Users ({users.length})</h1>
            <div style={{ ...cardStyle, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                  {['Name', 'Email', 'Role', 'Joined', 'Action'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 500 }}>{u.name}</td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{u.email}</td>
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: u.role === 'admin' ? '#FEF3C7' : u.role === 'vendor' ? '#D1FAE5' : '#DBEAFE', color: u.role === 'admin' ? '#92400E' : u.role === 'vendor' ? '#065F46' : '#1E40AF' }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '12px 14px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding: '12px 14px' }}>{u.role !== 'admin' && <button onClick={() => handleDeleteUser(u._id)} style={btnStyle('#FEE2E2', '#DC2626')}>Delete</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VENDORS */}
        {activeTab === 'vendors' && (
          <div className="animate-fadeIn">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>Vendor Management ({vendors.length})</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {vendors.map(v => (
                <div key={v._id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>🏪 {v.storeName}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{v.user?.name} · {v.user?.email}</p>
                      {v.storeDescription && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>{v.storeDescription}</p>}
                      <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <span>📦 {v.totalProducts} products</span>
                        <span>💰 ₹{(v.totalRevenue || 0).toLocaleString()} revenue</span>
                        <span>🛒 {v.totalSales || 0} sales</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', background: statusColors[v.status], color: statusTextC[v.status] }}>{v.status}</span>
                      {v.status === 'pending' && (
                        <>
                          <button onClick={() => handleVendorStatus(v._id, 'approved')} style={btnStyle('#D1FAE5', '#065F46')}>Approve</button>
                          <button onClick={() => handleVendorStatus(v._id, 'rejected')} style={btnStyle('#FEE2E2', '#991B1B')}>Reject</button>
                        </>
                      )}
                      {v.status === 'approved' && <button onClick={() => handleVendorStatus(v._id, 'suspended')} style={btnStyle('#FEE2E2', '#991B1B')}>Suspend</button>}
                      {v.status === 'suspended' && <button onClick={() => handleVendorStatus(v._id, 'approved')} style={btnStyle('#D1FAE5', '#065F46')}>Reinstate</button>}
                    </div>
                  </div>
                </div>
              ))}
              {vendors.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}><span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🏪</span><p>No vendors registered yet</p></div>}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {activeTab === 'products' && (
          <div className="animate-fadeIn">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>All Products ({products.length})</h1>
            <div style={{ ...cardStyle, overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                  {['Product', 'Category', 'Price', 'Stock', 'Vendor', 'Action'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 500 }}>{p.emoji} {p.name}</td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem' }}>{p.category}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700 }}>₹{p.price}</td>
                      <td style={{ padding: '12px 14px' }}><span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: p.stock > 0 ? '#D1FAE5' : '#FEE2E2', color: p.stock > 0 ? '#065F46' : '#991B1B' }}>{p.stock}</span></td>
                      <td style={{ padding: '12px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.vendor?.storeName || 'Platform'}</td>
                      <td style={{ padding: '12px 14px' }}><button onClick={() => handleRemoveProduct(p._id)} style={btnStyle('#FEE2E2', '#DC2626')}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className="animate-fadeIn">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>All Orders ({orders.length})</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orders.map(o => (
                <div key={o._id} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 700 }}>#{o.orderNumber}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '12px' }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '12px' }}>👤 {o.user?.name || 'User'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize', background: statusColors[o.status] || '#F1F5F9', color: statusTextC[o.status] || '#64748B' }}>{o.status}</span>
                      <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>₹{o.totalPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
