/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { MobileNav } from '../components/layout/MobileNav';
import { CartDrawer } from '../components/cart/CartDrawer';
import { HomePage } from '../pages/Home/HomePage';
import { BrowsePage } from '../pages/Browse/BrowsePage';
import { ProductDetailsPage } from '../pages/ProductDetails/ProductDetailsPage';
import { UploadIdeaPage } from '../pages/CustomDesign/UploadIdeaPage';
import { BookVisitPage } from '../pages/BookVisit/BookVisitPage';
import { ProjectsPage } from '../pages/Projects/ProjectsPage';
import { CheckoutPage } from '../pages/Checkout/CheckoutPage';
import { AccountPage } from '../pages/Account/AccountPage';
import { OrderTrackingPage } from '../pages/Orders/OrderTrackingPage';
import { LoginPage } from '../pages/Auth/LoginPage';
import { AdminDashboardPage } from '../pages/Admin/AdminDashboardPage';

// Scroll to top helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Layout wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && !isAdminPage && <Header />}
      <main className="flex-1">{children}</main>
      {!isAuthPage && !isAdminPage && <Footer />}
      {!isAuthPage && !isAdminPage && <MobileNav />}
      <CartDrawer />
    </div>
  );
};

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/product/:productId" element={<ProductDetailsPage />} />
          <Route path="/upload-idea" element={<UploadIdeaPage />} />
          <Route path="/custom-design" element={<UploadIdeaPage />} />
          <Route path="/book-visit" element={<BookVisitPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/cart" element={<CheckoutPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/orders" element={<AccountPage />} />
          <Route path="/orders/:orderId" element={<OrderTrackingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/*" element={<AdminDashboardPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
};
