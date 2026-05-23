/**
 * Product Detail Page
 * Shows full product info with alternatives suggestion
 */
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { HiOutlineArrowLeft, HiStar, HiOutlineStar, HiPlus, HiMinus, HiOutlineLightningBolt } from 'react-icons/hi';

const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart, isInCart, getItemQuantity, updateQuantity, removeFromCart } = useCart();
  const [product, setProduct] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const [prodRes, altRes] = await Promise.all([
          productsAPI.getById(id),
          productsAPI.getAlternatives(id),
        ]);
        setProduct(prodRes.data.product);
        setAlternatives(altRes.data.alternatives || []);
        setSavings(altRes.data.savings || []);
      } catch (err) {
        console.error('Failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login first');
      return;
    }
    try {
      await addToCart(product._id, qty);
      toast.success(`Added ${qty}x ${product.name} to cart!`);
    } catch (err) {
      toast.error('Failed to add');
    }
  };

  const inCart = product ? isInCart(product._id) : false;
  const cartQty = product ? getItemQuantity(product._id) : 0;

  if (loading) return <Loader size="lg" text="Loading product..." />;
  if (!product) return <div style={{ textAlign: 'center', padding: '60px' }}>Product not found</div>;

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px', minHeight: '80vh' }}>
      {/* Breadcrumb */}
      <Link to="/products" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem',
        marginBottom: '24px',
      }}>
        <HiOutlineArrowLeft /> Back to Products
      </Link>

      {/* Product Info */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '40px', marginBottom: '40px',
      }} className="product-detail-grid">
        {/* Image */}
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '350px', position: 'relative',
        }}>
          <span style={{ fontSize: '8rem' }} className="animate-float">{product.emoji || '🛒'}</span>
          {/* Badges */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
            {discount > 0 && <span className="badge-discount" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>{discount}% OFF</span>}
            {product.isBudgetFriendly && <span className="badge-budget" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>💰 Budget</span>}
            {product.isOrganic && <span className="badge-organic" style={{ fontSize: '0.85rem', padding: '4px 12px' }}>🌿 Organic</span>}
          </div>
        </div>

        {/* Details */}
        <div>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            {product.category}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>{product.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>{product.brand} · Per {product.unit}</p>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <span key={i} style={{ color: i < Math.round(product.ratings?.average || 4) ? '#F59E0B' : 'var(--border-medium)', fontSize: '1.2rem' }}>
                  {i < Math.round(product.ratings?.average || 4) ? <HiStar /> : <HiOutlineStar />}
                </span>
              ))}
            </div>
            <span style={{ fontWeight: 600 }}>{product.ratings?.average || 4.0}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({product.ratings?.count || 0} reviews)</span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>₹{product.price}</span>
            {product.originalPrice > product.price && (
              <>
                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: '12px' }}>₹{product.originalPrice}</span>
                <span style={{ color: '#059669', fontWeight: 600, marginLeft: '8px' }}>Save ₹{product.originalPrice - product.price}</span>
              </>
            )}
          </div>

          {/* Description */}
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px', fontSize: '0.95rem' }}>
            {product.description}
          </p>

          {/* Stock */}
          <p style={{
            color: product.stock > 0 ? '#059669' : '#DC2626',
            fontWeight: 600, fontSize: '0.9rem', marginBottom: '24px',
          }}>
            {product.stock > 0 ? `✅ In Stock (${product.stock} available)` : '❌ Out of Stock'}
          </p>

          {/* Add to Cart */}
          {!inCart ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{
                display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-sm)',
                border: '2px solid var(--border-light)', overflow: 'hidden',
              }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{
                  width: '40px', height: '40px', border: 'none',
                  background: 'var(--bg-tertiary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-primary)',
                }}><HiMinus /></button>
                <span style={{ width: '50px', textAlign: 'center', fontWeight: 700, fontSize: '1.1rem' }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{
                  width: '40px', height: '40px', border: 'none',
                  background: 'var(--bg-tertiary)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-primary)',
                }}><HiPlus /></button>
              </div>

              <button onClick={handleAddToCart} style={{
                flex: 1, padding: '12px 24px', borderRadius: 'var(--radius-sm)',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                color: 'white', border: 'none', cursor: 'pointer',
                fontSize: '1rem', fontWeight: 700, transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow-md)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Add to Cart — ₹{product.price * qty}
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '12px 20px', background: 'var(--color-primary-50)',
              borderRadius: 'var(--radius-sm)', marginBottom: '24px',
              border: '2px solid var(--color-primary)',
            }}>
              <span style={{ fontWeight: 600, color: 'var(--color-primary-dark)' }}>In Cart:</span>
              <button onClick={() => { if(cartQty > 1) updateQuantity(product._id, cartQty - 1); else removeFromCart(product._id); }} style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--color-primary)', color: 'white',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><HiMinus /></button>
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{cartQty}</span>
              <button onClick={() => updateQuantity(product._id, cartQty + 1)} style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'var(--color-primary)', color: 'white',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}><HiPlus /></button>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {product.tags.map((tag, i) => (
                <span key={i} style={{
                  padding: '4px 12px', borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-tertiary)', color: 'var(--text-muted)',
                  fontSize: '0.8rem', fontWeight: 500,
                }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ============ CHEAPER ALTERNATIVES ============ */}
      {alternatives.length > 0 && (
        <section style={{
          background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          marginBottom: '40px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <HiOutlineLightningBolt style={{ color: '#D97706', fontSize: '1.5rem' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#92400E' }}>
              💡 Cheaper Alternatives Found!
            </h2>
          </div>
          <p style={{ color: '#B45309', fontSize: '0.9rem', marginBottom: '20px' }}>
            Save money with these similar products in {product.category}
          </p>

          {/* Savings info */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {savings.map((s, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.7)', borderRadius: 'var(--radius-md)',
                padding: '12px 16px', flex: '1', minWidth: '180px',
              }}>
                <p style={{ fontWeight: 600, color: '#92400E', fontSize: '0.9rem' }}>{s.name}</p>
                <p style={{ fontWeight: 800, color: '#059669', fontSize: '1.1rem' }}>
                  Save ₹{s.savedAmount} ({s.savedPercentage}%)
                </p>
              </div>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            {alternatives.map((alt) => (
              <ProductCard key={alt._id} product={alt} />
            ))}
          </div>
        </section>
      )}

      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;
