import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';
import { ProductDetails } from './pages/ProductDetails';
import { Categories } from './pages/Categories';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Account } from './pages/Account';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';
import { Addresses } from './pages/Addresses';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ScrollToTop } from './components/ScrollToTop';
import { useAuthStore } from './features/auth/store';
import { usePageTracking } from './utils/analytics';

import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Gallery } from './pages/Gallery';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { Terms } from './pages/Terms';
import { Returns } from './pages/Returns';
import { Wishlist } from './pages/Wishlist';

import { AdminInvoices } from './pages/admin/AdminInvoices';
import { AdminPOS } from './pages/admin/AdminPOS';
import { AdminAnnouncements } from './pages/admin/AdminAnnouncements';
import { AdminMessages } from './pages/admin/AdminMessages';
import { AdminGallery } from './pages/admin/AdminGallery';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { TrackOrder } from "./pages/TrackOrder";
import { Success } from './pages/Success';
import { Cancel } from './pages/Cancel';
import { NotFound } from './pages/NotFound';

// Wrapper component to use hooks that require Router context
function AppContent() {
  const initialize = useAuthStore(state => state.initialize);
  usePageTracking();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/category/:slug" element={<Shop />} />
          <Route path="/track" element={<TrackOrder />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/order-tracking" element={<TrackOrder />} />
          <Route path="/orders/track" element={<TrackOrder />} />
          <Route path="/products" element={<Shop />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          <Route path="/products/:slug" element={<ProductDetails />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/terms-of-service" element={<Terms />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/refund-policy" element={<Returns />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes */}
          <Route 
            path="/account" 
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } 
          />
          <Route path="/account/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/account/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
          <Route path="/account/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />
          
          <Route path="/cart" element={<Cart />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success/:id" element={<Success />} />
          <Route path="/checkout/success" element={<Success />} />
          <Route path="/order-success/:id" element={<Success />} />
          <Route path="/success/:id" element={<Success />} />
          <Route path="/checkout/cancel" element={<Cancel />} />
          <Route path="/cancel" element={<Cancel />} />

          {/* Admin Protected Routes inside MainLayout */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/inventory" element={<ProtectedRoute requireAdmin><AdminInventory /></ProtectedRoute>} />
          <Route path="/admin/stock" element={<ProtectedRoute requireAdmin><AdminInventory /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/invoices" element={<ProtectedRoute requireAdmin><AdminInvoices /></ProtectedRoute>} />
          <Route path="/admin/pos" element={<ProtectedRoute requireAdmin><AdminPOS /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute requireAdmin><AdminAnnouncements /></ProtectedRoute>} />
          <Route path="/admin/messages" element={<ProtectedRoute requireAdmin><AdminMessages /></ProtectedRoute>} />
          <Route path="/admin/gallery" element={<ProtectedRoute requireAdmin><AdminGallery /></ProtectedRoute>} />
          <Route path="/admin/notifications" element={<ProtectedRoute requireAdmin><AdminNotifications /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute requireAdmin><AdminCustomers /></ProtectedRoute>} />
          <Route path="/admin/*" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />

          {/* Global 404 Catch-All Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
