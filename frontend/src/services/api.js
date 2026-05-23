/**
 * API Service
 * Centralized API calls using Axios
 * Supports all roles: User, Vendor, Admin
 */
import axios from 'axios';

const API_BASE = '/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('buzzbasket_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('buzzbasket_token');
      localStorage.removeItem('buzzbasket_user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============ AUTH API ============
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  toggleWishlist: (productId) => api.post(`/auth/wishlist/${productId}`),
  getSpending: () => api.get('/auth/spending'),
};

// ============ PRODUCTS API ============
export const productsAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getCategories: () => api.get('/products/categories'),
  getAlternatives: (id) => api.get(`/products/${id}/alternatives`),
  getBudgetFriendly: () => api.get('/products/budget-friendly'),
  rate: (id, rating) => api.post(`/products/${id}/rate`, { rating }),
  // Admin
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

// ============ CART API ============
export const cartAPI = {
  get: () => api.get('/cart'),
  add: (productId, quantity) => api.post('/cart/add', { productId, quantity }),
  update: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
  remove: (productId) => api.delete(`/cart/remove/${productId}`),
  clear: () => api.delete('/cart/clear'),
};

// ============ ORDERS API ============
export const ordersAPI = {
  place: (data) => api.post('/orders', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  // Admin
  getAllAdmin: () => api.get('/orders/admin/all'),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
};

// ============ VENDOR API ============
export const vendorAPI = {
  register: (data) => api.post('/vendors/register', data),
  getProfile: () => api.get('/vendors/profile'),
  getDashboard: () => api.get('/vendors/dashboard'),
  getProducts: () => api.get('/vendors/products'),
  addProduct: (data) => api.post('/vendors/products', data),
  updateProduct: (id, data) => api.put(`/vendors/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/vendors/products/${id}`),
  getOrders: () => api.get('/vendors/orders'),
  updateOrderStatus: (id, status) => api.put(`/vendors/orders/${id}/status`, { status }),
};

// ============ ADMIN API ============
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getVendors: () => api.get('/admin/vendors'),
  updateVendorStatus: (id, status) => api.put(`/admin/vendors/${id}/status`, { status }),
  getProducts: () => api.get('/admin/products'),
  removeProduct: (id) => api.delete(`/admin/products/${id}`),
  getOrders: () => api.get('/admin/orders'),
};

// ============ PRICING INSIGHTS API ============
export const pricingAPI = {
  getOverview: () => api.get('/pricing-insights/overview'),
  getProductInsights: (productId) => api.get(`/pricing-insights/${productId}`),
};

// ============ NOTIFICATIONS API ============
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
