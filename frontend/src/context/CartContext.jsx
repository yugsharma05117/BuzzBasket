/**
 * Cart Context
 * Manages shopping cart state globally
 */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalPrice: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  // Fetch cart when authenticated
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await cartAPI.get();
      if (data.success) {
        setCart(data.cart);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to cart
  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await cartAPI.add(productId, quantity);
      if (data.success) {
        setCart(data.cart);
      }
      return data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to add to cart' };
    }
  };

  // Update quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      const { data } = await cartAPI.update(productId, quantity);
      if (data.success) {
        setCart(data.cart);
      }
      return data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update cart' };
    }
  };

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      const { data } = await cartAPI.remove(productId);
      if (data.success) {
        setCart(data.cart);
      }
      return data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to remove from cart' };
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      const { data } = await cartAPI.clear();
      if (data.success) {
        setCart({ items: [], totalPrice: 0, totalItems: 0 });
      }
      return data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to clear cart' };
    }
  };

  // Check if product is in cart
  const isInCart = (productId) => {
    return cart.items?.some((item) => 
      (item.product?._id || item.product) === productId
    );
  };

  // Get item quantity in cart
  const getItemQuantity = (productId) => {
    const item = cart.items?.find((item) => 
      (item.product?._id || item.product) === productId
    );
    return item?.quantity || 0;
  };

  // Reset cart on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setCart({ items: [], totalPrice: 0, totalItems: 0 });
    }
  }, [isAuthenticated]);

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    fetchCart,
    isInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export default CartContext;
