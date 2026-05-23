/**
 * Vendor Dashboard Page
 * Full vendor management: stats, products, orders, pricing insights
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { vendorAPI, pricingAPI } from '../services/api';
import DashboardSidebar from '../components/DashboardSidebar';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#10B981', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6', '#F97316', '#8B5CF6', '#EF4444'];
const CATEGORIES = ['Fruits', 'Vegetables', 'Dairy', 'Snacks', 'Beverages', 'Grains', 'Meat', 'Bakery', 'Frozen', 'Household'];

const VendorDashboard = () => {
  const { user, isAuthenticated, isVendor } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [pricingOverview, setPricingOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '', description: '', price: '', originalPrice: '', category: 'Fruits',
    stock: '', unit: 'kg', emoji: '🛒', isBudgetFriendly: false, isOrganic: false, brand: '', discount: 0,
  });

  useEffect(() => {
    if (!isAuthenticated || !isVendor) { navigate('/login'); return; }
    fetchAll();
  }, [isAuthenticated, isVendor]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, ordRes] = await Promise.all([
        vendorAPI.getDashboard(), vendorAPI.getProducts(), vendorAPI.getOrders(),
      ]);
      setStats(dashRes.data.stats);
      setProducts(prodRes.data.products || []);
      setOrders(ordRes.data.orders || []);
      try { const pr = await pricingAPI.getOverview(); setPricingOverview(pr.data); } catch {}
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock), originalPrice: Number(productForm.originalPrice) || Number(productForm.price), discount: Number(productForm.discount) };
      if (editProduct) {
        await vendorAPI.updateProduct(editProduct._id, payload);
        toast.success('Product updated!');
      } else {
        await vendorAPI.addProduct(payload);
        toast.success('Product added!');
      }
      setShowAddProduct(false); setEditProduct(null);
      setProductForm({ name: '', description: '', price: '', originalPrice: '', category: 'Fruits', stock: '', unit: 'kg', emoji: '🛒', isBudgetFriendly: false, isOrganic: false, brand: '', discount: 0 });
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await vendorAPI.deleteProduct(id); toast.success('Deleted'); fetchAll(); } catch { toast.error('Failed'); }
  };

  const handleOrderStatus = async (id, status) => {
    try { await vendorAPI.updateOrderStatus(id, status); toast.success(`Order ${status}`); fetchAll(); } catch { toast.error('Failed'); }
  };

  if (loading) return <Loader size="lg" text="Loading vendor dashboard..." />;

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'products', label: 'Products', icon: '📦', badge: products.length },
    { id: 'orders', label: 'Orders', icon: '🛒', badge: orders.filter(o => o.status === 'pending').length, badgeColor: '#EF4444' },
    { id: 'pricing', label: 'Competition', icon: '💰' },
  ];

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem', fontFamily: 'var(--font-primary)' };
  const btnPrimary = { padding: '10px 24px', borderRadius: 'var(--radius-full)', border: 'none', background: 'var(--color-primary)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' };
  const cardStyle = { background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '24px' };

  const statusColors = { pending: '#FEF3C7', confirmed: '#DBEAFE', processing: '#E0E7FF', shipped: '#D1FAE5', delivered: '#ECFDF5', cancelled: '#FEE2E2' };
  const statusTextColors = { pending: '#92400E', confirmed: '#1E40AF', processing: '#3730A3', shipped: '#065F46', delivered: '#047857', cancelled: '#991B1B' };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 70px)' }}>
      <DashboardSidebar items={sidebarItems} activeItem={activeTab} onItemClick={setActiveTab} title="Vendor Panel" titleEmoji="🏪" />
      <main style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>

        {/* ===== OVERVIEW ===== */}
        {activeTab === 'overview' && (
          <div className="animate-fadeIn">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '24px' }}>Dashboard Overview</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {[
                { label: 'Total Products', value: stats?.totalProducts || 0, bg: 'linear-gradient(135deg,#10B981,#059669)', icon: '📦' },
                { label: 'Total Orders', value: stats?.totalOrders || 0, bg: 'linear-gradient(135deg,#6366F1,#4F46E5)', icon: '🛒' },
                { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, bg: 'linear-gradient(135deg,#F59E0B,#D97706)', icon: '💰' },
                { label: 'Pending', value: stats?.pendingOrders || 0, bg: 'linear-gradient(135deg,#EF4444,#DC2626)', icon: '⏳' },
              ].map((s, i) => (
                <div key={i} style={{ background: s.bg, borderRadius: 'var(--radius-lg)', padding: '20px', color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', opacity: 0.9 }}>
                    <span>{s.icon}</span><span style={{ fontSize: '0.85rem' }}>{s.label}</span>
                  </div>
                  <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{s.value}</p>
                </div>
              ))}
            </div>
            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={cardStyle}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={stats?.monthlySales || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
                    <XAxis dataKey="_id" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ fill: '#10B981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={cardStyle}>
                <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Category Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={stats?.categoryDistribution || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={90} label={({ _id, count }) => `${_id}: ${count}`}>
                      {(stats?.categoryDistribution || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ===== PRODUCTS ===== */}
        {activeTab === 'products' && (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>My Products ({products.length})</h1>
              <button onClick={() => { setShowAddProduct(true); setEditProduct(null); setProductForm({ name: '', description: '', price: '', originalPrice: '', category: 'Fruits', stock: '', unit: 'kg', emoji: '🛒', isBudgetFriendly: false, isOrganic: false, brand: '', discount: 0 }); }} style={btnPrimary}>+ Add Product</button>
            </div>

            {/* Add/Edit Modal */}
            {showAddProduct && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddProduct(false)}>
                <div onClick={e => e.stopPropagation()} style={{ ...cardStyle, width: '90%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }}>
                  <h2 style={{ fontWeight: 700, marginBottom: '20px' }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                  <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Name</label><input required value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} style={inputStyle} /></div>
                    <div style={{ gridColumn: 'span 2' }}><label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Description</label><textarea required value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Price (₹)</label><input required type="number" min="0" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} style={inputStyle} /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Stock</label><input required type="number" min="0" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} style={inputStyle} /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Category</label><select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} style={inputStyle}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Unit</label><select value={productForm.unit} onChange={e => setProductForm({ ...productForm, unit: e.target.value })} style={inputStyle}>{['kg','g','L','ml','pcs','pack','dozen'].map(u => <option key={u}>{u}</option>)}</select></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Discount (%)</label><input type="number" min="0" max="100" value={productForm.discount} onChange={e => setProductForm({ ...productForm, discount: e.target.value })} style={inputStyle} /></div>
                    <div><label style={{ fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px', display: 'block', color: 'var(--text-secondary)' }}>Emoji</label><input value={productForm.emoji} onChange={e => setProductForm({ ...productForm, emoji: e.target.value })} style={inputStyle} /></div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><input type="checkbox" checked={productForm.isBudgetFriendly} onChange={e => setProductForm({ ...productForm, isBudgetFriendly: e.target.checked })} /> Budget Friendly</label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}><input type="checkbox" checked={productForm.isOrganic} onChange={e => setProductForm({ ...productForm, isOrganic: e.target.checked })} /> Organic</label>
                    </div>
                    <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                      <button type="button" onClick={() => setShowAddProduct(false)} style={{ ...btnPrimary, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>Cancel</button>
                      <button type="submit" style={btnPrimary}>{editProduct ? 'Update' : 'Add Product'}</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {products.map(p => (
                <div key={p._id} style={{ ...cardStyle, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.5rem' }}>{p.emoji}</span>
                      <div>
                        <h3 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{p.name}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category}</span>
                      </div>
                    </div>
                    <span style={{ fontWeight: 800, color: 'var(--color-primary-dark)', fontSize: '1.1rem' }}>₹{p.price}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.7rem', fontWeight: 600, background: p.stock > 0 ? '#D1FAE5' : '#FEE2E2', color: p.stock > 0 ? '#065F46' : '#991B1B' }}>Stock: {p.stock}</span>
                    {p.discount > 0 && <span className="badge-discount">{p.discount}% OFF</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => { setEditProduct(p); setProductForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice || '', category: p.category, stock: p.stock, unit: p.unit, emoji: p.emoji, isBudgetFriendly: p.isBudgetFriendly, isOrganic: p.isOrganic, brand: p.brand || '', discount: p.discount || 0 }); setShowAddProduct(true); }} style={{ ...btnPrimary, padding: '6px 14px', fontSize: '0.8rem', background: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>Edit</button>
                    <button onClick={() => handleDeleteProduct(p._id)} style={{ ...btnPrimary, padding: '6px 14px', fontSize: '0.8rem', background: '#FEE2E2', color: '#DC2626' }}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
            {products.length === 0 && <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}><span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>📦</span><p>No products yet. Add your first product!</p></div>}
          </div>
        )}

        {/* ===== ORDERS ===== */}
        {activeTab === 'orders' && (
          <div className="animate-fadeIn">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '20px' }}>Incoming Orders ({orders.length})</h1>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px', ...cardStyle }}><span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>📋</span><p style={{ color: 'var(--text-muted)' }}>No orders yet</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {orders.map(order => (
                  <div key={order._id} style={{ ...cardStyle }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>#{order.orderNumber}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '12px' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '12px' }}>👤 {order.user?.name || 'User'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ padding: '4px 14px', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'capitalize', background: statusColors[order.status], color: statusTextColors[order.status] }}>{order.status}</span>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>₹{order.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      {order.items?.map((item, i) => (
                        <span key={i} style={{ padding: '4px 10px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>{item.emoji || '🛒'} {item.name} ×{item.quantity}</span>
                      ))}
                    </div>
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {order.status === 'pending' && <><button onClick={() => handleOrderStatus(order._id, 'confirmed')} style={{ ...btnPrimary, padding: '6px 16px', fontSize: '0.8rem' }}>Accept</button><button onClick={() => handleOrderStatus(order._id, 'cancelled')} style={{ ...btnPrimary, padding: '6px 16px', fontSize: '0.8rem', background: '#FEE2E2', color: '#DC2626' }}>Reject</button></>}
                        {order.status === 'confirmed' && <button onClick={() => handleOrderStatus(order._id, 'processing')} style={{ ...btnPrimary, padding: '6px 16px', fontSize: '0.8rem' }}>Start Packing</button>}
                        {order.status === 'processing' && <button onClick={() => handleOrderStatus(order._id, 'shipped')} style={{ ...btnPrimary, padding: '6px 16px', fontSize: '0.8rem' }}>Ship</button>}
                        {order.status === 'shipped' && <button onClick={() => handleOrderStatus(order._id, 'delivered')} style={{ ...btnPrimary, padding: '6px 16px', fontSize: '0.8rem' }}>Mark Delivered</button>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===== PRICING / COMPETITION ENGINE ===== */}
        {activeTab === 'pricing' && (
          <div className="animate-fadeIn">
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, marginBottom: '24px' }}>🏆 Competition Engine</h1>
            {pricingOverview ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                  {[
                    { label: 'Products Analyzed', value: pricingOverview.summary?.totalAnalyzed || 0, color: '#6366F1' },
                    { label: 'Competitive', value: pricingOverview.summary?.competitive || 0, color: '#10B981' },
                    { label: 'Overpriced', value: pricingOverview.summary?.overpriced || 0, color: '#EF4444' },
                    { label: 'Underpriced', value: pricingOverview.summary?.underpriced || 0, color: '#F59E0B' },
                    { label: 'Score', value: `${pricingOverview.summary?.competitivenessScore || 100}%`, color: '#14B8A6' },
                  ].map((s, i) => (
                    <div key={i} style={{ ...cardStyle, borderLeft: `4px solid ${s.color}` }}>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</p>
                      <p style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                    </div>
                  ))}
                </div>
                <div style={cardStyle}>
                  <h3 style={{ fontWeight: 700, marginBottom: '16px' }}>Product Price Analysis</h3>
                  {pricingOverview.products?.length > 0 ? (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead><tr style={{ borderBottom: '2px solid var(--border-light)' }}>
                          {['Product', 'Your Price', 'Avg Competitor', 'Difference', 'Status'].map(h => <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{h}</th>)}
                        </tr></thead>
                        <tbody>
                          {pricingOverview.products.map((p, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                              <td style={{ padding: '12px 14px', fontWeight: 500 }}>{p.productName}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 700 }}>₹{p.yourPrice}</td>
                              <td style={{ padding: '12px 14px' }}>₹{p.avgCompetitorPrice}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 600, color: p.priceDifference > 0 ? '#EF4444' : '#10B981' }}>{p.priceDifference > 0 ? '+' : ''}{p.priceDifference}%</td>
                              <td style={{ padding: '12px 14px' }}>
                                <span style={{ padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, background: p.status === 'competitive' ? '#D1FAE5' : p.status === 'overpriced' ? '#FEE2E2' : '#FEF3C7', color: p.status === 'competitive' ? '#065F46' : p.status === 'overpriced' ? '#991B1B' : '#92400E' }}>{p.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No competitor data available yet. Add products to see insights.</p>}
                </div>
              </>
            ) : (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>🔍</span>
                <p style={{ color: 'var(--text-muted)' }}>Add products and we'll analyze competitor pricing for you</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default VendorDashboard;
