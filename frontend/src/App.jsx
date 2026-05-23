/**
 * App Component
 * Main application with role-based routing and layout
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import VendorDashboard from './pages/VendorDashboard';
import AdminPanel from './pages/AdminPanel';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: '100vh',
            }}>
              {/* Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    fontFamily: 'var(--font-primary)',
                    fontSize: '0.9rem',
                  },
                  success: {
                    iconTheme: { primary: '#10B981', secondary: '#ECFDF5' },
                  },
                  error: {
                    iconTheme: { primary: '#EF4444', secondary: '#FEF2F2' },
                  },
                }}
              />

              {/* Navigation */}
              <Navbar />

              {/* Main Content */}
              <main style={{ flex: 1 }}>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Login />} />

                  {/* User Dashboard */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute allowedRoles={['user', 'admin']}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />

                  {/* Vendor Dashboard */}
                  <Route path="/vendor/dashboard" element={
                    <ProtectedRoute allowedRoles={['vendor']}>
                      <VendorDashboard />
                    </ProtectedRoute>
                  } />

                  {/* Admin Panel */}
                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminPanel />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>

              {/* Footer */}
              <Footer />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
