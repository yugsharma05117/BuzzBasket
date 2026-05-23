/**
 * ProductCard Component
 * Reusable card for displaying products with add-to-cart, wishlist, and budget badges
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { HiOutlineHeart, HiHeart, HiPlus, HiMinus, HiOutlineStar, HiStar } from 'react-icons/hi';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onWishlistToggle }) => {
  const { isAuthenticated, user } = useAuth();
  const { addToCart, isInCart, getItemQuantity, updateQuantity, removeFromCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(
    user?.wishlist?.some((w) => (w._id || w) === product._id) || false
  );

  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const inCart = isInCart(product._id);
  const quantity = getItemQuantity(product._id);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    setIsAdding(true);
    try {
      await addToCart(product._id, 1);
      toast.success(`${product.name} added to cart! 🛒`);
    } catch (err) {
      toast.error(err.message || 'Failed to add');
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuantityChange = async (newQty) => {
    try {
      if (newQty <= 0) {
        await removeFromCart(product._id);
        toast.success('Removed from cart');
      } else {
        await updateQuantity(product._id, newQty);
      }
    } catch (err) {
      toast.error('Failed to update');
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to use wishlist');
      return;
    }
    try {
      await authAPI.toggleWishlist(product._id);
      setIsWishlisted(!isWishlisted);
      toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist 💛');
      onWishlistToggle?.();
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} style={{ color: i < Math.round(rating) ? '#F59E0B' : 'var(--border-medium)', fontSize: '0.75rem' }}>
        {i < Math.round(rating) ? <HiStar /> : <HiOutlineStar />}
      </span>
    ));
  };

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border-light)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      position: 'relative',
      cursor: 'pointer',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
    >
      {/* Badges */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        zIndex: 2,
      }}>
        {discount > 0 && <span className="badge-discount">{discount}% OFF</span>}
        {product.isBudgetFriendly && <span className="badge-budget">💰 Budget</span>}
        {product.isOrganic && <span className="badge-organic">🌿 Organic</span>}
      </div>

      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); handleWishlist(); }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          border: 'none',
          background: 'rgba(255,255,255,0.9)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.1rem',
          zIndex: 2,
          color: isWishlisted ? '#EF4444' : 'var(--text-muted)',
          transition: 'all 0.3s ease',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {isWishlisted ? <HiHeart /> : <HiOutlineHeart />}
      </button>

      {/* Product Image */}
      <Link to={`/products/${product._id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          height: '160px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-secondary)',
          fontSize: '4rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <span style={{ transition: 'transform 0.3s ease' }} className="product-emoji">
            {product.emoji || '🛒'}
          </span>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '14px' }}>
        <Link to={`/products/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          {/* Category */}
          <p style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: 'var(--color-primary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '4px',
          }}>
            {product.category}
          </p>

          {/* Name */}
          <h3 style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '6px',
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {product.name}
          </h3>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
            <div style={{ display: 'flex' }}>{renderStars(product.ratings?.average || 4)}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ({product.ratings?.count || 0})
            </span>
          </div>

          {/* Brand & Unit */}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            {product.brand} · {product.unit}
          </p>
        </Link>

        {/* Price & Cart */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}>
          <div>
            <span style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}>
              ₹{product.price}
            </span>
            {product.originalPrice > product.price && (
              <span style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                textDecoration: 'line-through',
                marginLeft: '6px',
              }}>
                ₹{product.originalPrice}
              </span>
            )}
          </div>

          {/* Add / Quantity Control */}
          {!inCart ? (
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                border: '2px solid var(--color-primary)',
                background: 'transparent',
                color: 'var(--color-primary)',
                cursor: isAdding ? 'wait' : 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--color-primary)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
            >
              <HiPlus /> Add
            </button>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0px',
              borderRadius: 'var(--radius-sm)',
              border: '2px solid var(--color-primary)',
              overflow: 'hidden',
            }}>
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                }}
              >
                <HiMinus />
              </button>
              <span style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'var(--color-primary)',
              }}>
                {quantity}
              </span>
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  border: 'none',
                  background: 'var(--color-primary)',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem',
                }}
              >
                <HiPlus />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
