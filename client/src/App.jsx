import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';

import Header from './components/Header';
import FloatingSidebar from './components/FloatingSidebar';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import CartDrawer from './components/CartDrawer';

import HomePage from './pages/HomePage';
import ProductDetailPage from './pages/ProductDetailPage';
import PasteAndBuyPage from './pages/PasteAndBuyPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import TrackingPage from './pages/TrackingPage';
import UserDashboardPage from './pages/UserDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import ShippingInfoPage from './pages/ShippingInfoPage';
import CostCalculatorPage from './pages/CostCalculatorPage';
import NotificationsPage from './pages/NotificationsPage';

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <NotificationProvider>
              <Router>
                <div className="flex flex-col min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#18181b] dark:text-[#f4f4f5] transition-colors overflow-x-hidden selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
                  {/* Header */}
                  <Header />

                  {/* Main View */}
                  <div className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/product/:idOrSlug" element={<ProductDetailPage />} />
                      <Route path="/paste-and-buy" element={<PasteAndBuyPage />} />
                      <Route path="/cart" element={<CartPage />} />
                      <Route path="/checkout" element={<CheckoutPage />} />
                      <Route path="/order-success/:orderNumber" element={<OrderSuccessPage />} />
                      <Route path="/tracking" element={<TrackingPage />} />
                      <Route path="/dashboard" element={<UserDashboardPage />} />
                      <Route path="/admin" element={<AdminDashboardPage />} />
                      <Route path="/shipping-info" element={<ShippingInfoPage />} />
                      <Route path="/calculator" element={<CostCalculatorPage />} />
                      <Route path="/notifications" element={<NotificationsPage />} />
                    </Routes>
                  </div>

                  {/* Floating Dock */}
                  <FloatingSidebar />

                  {/* Modals & Drawers */}
                  <CartDrawer />
                  <AuthModal />

                  {/* Footer */}
                  <Footer />
                </div>
              </Router>
            </NotificationProvider>
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
