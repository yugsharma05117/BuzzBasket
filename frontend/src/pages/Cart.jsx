/**
 * Cart Page
 * Full cart view with item management, totals, and checkout
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ordersAPI } from '../services/api';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { HiOutlineTrash, HiPlus, HiMinus, HiOutlineArrowLeft, HiOutlineShoppingCart, HiOutlineTruck } from 'react-icons/hi';

const Cart = () => {
  const { cart, loading, updateQuantity, removeFromCart, clearCart, fetchCart } = useCart();
  const { isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to place an order');
      navigate('/login');
      return;
    }
    if (!cart.items || cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setPlacing(true);
    try {
      const { data } = await ordersAPI.place({ paymentMethod });
      if (data.success) {
        toast.success(`Order placed! 🎉 Order #${data.order.orderNumber}`);
        await fetchCart();
        await refreshUser();
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <span style={{ fontSize: '4rem', display: 'block', marginBottom: '20px' }}>🛒</span>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '12px' }}>Login to View Cart</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>You need to be logged in to manage your cart</p>
        <Link to="/login" style={{
          padding: '12px 32px', borderRadius: 'var(--radius-full)',
          background: 'var(--color-primary)', color: 'white',
          textDecoration: 'none', fontWeight: 600,
        }}>Login</Link>
      </div>
    );
  }

  if (loading) return <Loader size="lg" text="Loading cart..." />;

  const deliveryFee = cart.totalPrice >= 499 ? 0 : 40;
  const grandTotal = cart.totalPrice + deliveryFee;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', minHeight: '80vh' }}>
      <Link to="/products" style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem',
        marginBottom: '20px',
      }}>
        <HiOutlineArrowLeft /> Continue Shopping
      </Link>

      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>
        Shopping Cart 🛒
      </h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
        {cart.items?.length || 0} items · ₹{cart.totalPrice?.toLocaleString() || 0}
      </p>

      {!cart.items || cart.items.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
        }}>
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '16px' }}>🛒</span>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '8px' }}>Cart is Empty</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add some delicious items to get started!</p>
          <Link to="/products" style={{
            padding: '12px 32px', borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary)', color: 'white',
            textDecoration: 'none', fontWeight: 600,
          }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }} className="cart-layout">
          {/* Cart Items */}
          <div>
            {/* Clear Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
              <button onClick={async () => { await clearCart(); toast.success('Cart cleared'); }} style={{
                padding: '6px 16px', borderRadius: 'var(--radius-full)',
                border: 'none', background: '#FEE2E2', color: '#DC2626',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <HiOutlineTrash /> Clear Cart
              </button>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cart.items.map((item) => {
                const product = item.product;
                if (!product) return null;
                return (
                  <div key={item._id} style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    background: 'var(--bg-card)', borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)', padding: '16px',
                    transition: 'all 0.3s ease',
                  }}>
                    {/* Emoji */}
                    <Link to={`/products/${product._id}`} style={{
                      width: '70px', height: '70px', flexShrink: 0,
                      background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '2rem', textDecoration: 'none',
                    }}>
                      {product.emoji || '🛒'}
                    </Link>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link to={`/products/${product._id}`} style={{
                        textDecoration: 'none', color: 'var(--text-primary)',
                        fontWeight: 600, fontSize: '0.95rem',
                        display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {product.name}
                      </Link>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                        {product.brand} · ₹{item.price} per {product.unit}
                      </p>
                    </div>

                    {/* Quantity */}
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0px',
                      borderRadius: 'var(--radius-sm)', border: '2px solid var(--border-light)',
                      overflow: 'hidden',
                    }}>
                      <button
                        onClick={() => item.quantity > 1 ? updateQuantity(product._id, item.quantity - 1) : removeFromCart(product._id)}
                        style={{
                          width: '32px', height: '32px', border: 'none',
                          background: 'var(--bg-tertiary)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-primary)',
                        }}
                      ><HiMinus /></button>
                      <span style={{ width: '36px', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product._id, item.quantity + 1)}
                        style={{
                          width: '32px', height: '32px', border: 'none',
                          background: 'var(--bg-tertiary)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--text-primary)',
                        }}
                      ><HiPlus /></button>
                    </div>

                    {/* Item Total */}
                    <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', minWidth: '70px', textAlign: 'right' }}>
                      ₹{(item.price * item.quantity).toLocaleString()}
                    </p>

                    {/* Remove */}
                    <button onClick={() => removeFromCart(product._id)} style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      border: 'none', background: '#FEE2E2', color: '#DC2626',
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FECACA'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#FEE2E2'}
                    >
                      <HiOutlineTrash style={{ fontSize: '0.9rem' }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div style={{
              background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)', padding: '24px',
              position: 'sticky', top: '90px',
            }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '20px' }}>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Subtotal ({cart.totalItems} items)</span>
                  <span style={{ fontWeight: 600 }}>₹{cart.totalPrice?.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <span>Delivery</span>
                  <span style={{ fontWeight: 600, color: deliveryFee === 0 ? '#059669' : 'inherit' }}>
                    {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </span>
                </div>
                {deliveryFee > 0 && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--color-primary)', background: 'var(--color-primary-50)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                    🚚 Add ₹{499 - cart.totalPrice} more for free delivery!
                  </p>
                )}
              </div>

              <div style={{
                borderTop: '2px solid var(--border-light)', paddingTop: '16px', marginBottom: '20px',
                display: 'flex', justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: '1.3rem', color: 'var(--color-primary-dark)' }}>
                  ₹{grandTotal.toLocaleString()}
                </span>
              </div>

              {/* Payment Method */}
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Payment Method</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {[
                    { value: 'cod', label: '💵 COD' },
                    { value: 'upi', label: '📱 UPI' },
                    { value: 'card', label: '💳 Card' },
                  ].map((pm) => (
                    <button key={pm.value} onClick={() => setPaymentMethod(pm.value)} style={{
                      padding: '8px 16px', borderRadius: 'var(--radius-sm)',
                      border: `2px solid ${paymentMethod === pm.value ? 'var(--color-primary)' : 'var(--border-light)'}`,
                      background: paymentMethod === pm.value ? 'var(--color-primary-50)' : 'var(--bg-card)',
                      color: paymentMethod === pm.value ? 'var(--color-primary-dark)' : 'var(--text-secondary)',
                      cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                    }}>
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Place Order */}
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                style={{
                  width: '100%', padding: '14px', borderRadius: 'var(--radius-sm)',
                  background: placing ? 'var(--text-muted)' : 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))',
                  color: 'white', border: 'none', cursor: placing ? 'wait' : 'pointer',
                  fontSize: '1rem', fontWeight: 700, transition: 'all 0.3s',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                {placing ? 'Placing Order...' : `Place Order — ₹${grandTotal.toLocaleString()}`}
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                marginTop: '16px', justifyContent: 'center',
                color: 'var(--text-muted)', fontSize: '0.8rem',
              }}>
                <HiOutlineTruck /> Estimated delivery: 30-45 minutes
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .cart-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default Cart;
