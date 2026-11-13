/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Shield, Sparkles, UploadCloud, CalendarCheck } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

export const Header: React.FC = () => {
  const location = useLocation();
  const { toggleCart, getTotalItems } = useCartStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
  const totalCartCount = getTotalItems();

  // Clean, minimal navigation as requested
  const navLinks = [
    { label: 'Trending Designs', path: '/browse', icon: Sparkles },
    { label: 'Upload Your Idea', path: '/upload-idea', icon: UploadCloud },
    { label: 'Book Measurement Visit', path: '/book-visit', icon: CalendarCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F2]/95 backdrop-blur-md border-b border-[#E7E1D9] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-17 flex items-center justify-between gap-6">
        {/* Zone 1: Logo & Brand Name */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <img
            src="/assets/logo.png"
            alt="Charbhuja"
            className="h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="flex flex-col">
            <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#29231E] leading-tight">
              Charbhuja
            </span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#77716A] font-medium -mt-0.5">
              Custom Furniture
            </span>
          </div>
        </Link>

        {/* Zone 2: Minimalist Navigation Links (Only 3 essential items) */}
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-[#77716A]" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`flex items-center gap-2 whitespace-nowrap transition-colors hover:text-[#29231E] relative py-1 ${
                  isActive ? 'text-[#29231E] font-semibold' : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#68452D]' : 'text-[#77716A]'}`} />
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#68452D] rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: Actions (Cart & Auth) */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          {/* Cart Drawer Trigger */}
          <button
            onClick={toggleCart}
            aria-label="Shopping Cart"
            className="relative p-2 text-[#29231E] hover:bg-[#F0ECE5] rounded-full transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-5 h-5 text-[#29231E]" />
            {totalCartCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-[#68452D] rounded-full">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* User Profile or Sign In */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {/* Admin Badge & Direct Portal Link (ONLY visible if verified admin) */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#68452D] text-white text-xs font-semibold hover:bg-[#523724] transition-all shadow-xs"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin Portal</span>
                </Link>
              )}

              <Link
                to="/account"
                className="flex items-center gap-2 py-1.5 px-3 rounded-full border border-[#E7E1D9] bg-white text-xs font-medium text-[#29231E] hover:border-[#A17A58] transition-all"
              >
                <User className="w-4 h-4 text-[#68452D]" />
                <span className="max-w-[120px] truncate">
                  {user?.displayName?.split(' ')[0] || 'My Account'}
                </span>
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-medium px-4 py-2 rounded-full bg-[#29231E] text-white hover:bg-[#68452D] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
