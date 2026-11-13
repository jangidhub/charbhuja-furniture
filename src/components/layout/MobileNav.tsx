/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sparkles, UploadCloud, CalendarCheck, User } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Trending', path: '/browse', icon: Sparkles },
    { label: 'Upload Idea', path: '/upload-idea', icon: UploadCloud },
    { label: 'Book Visit', path: '/book-visit', icon: CalendarCheck },
    { label: 'Account', path: '/account', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F8F6F2]/95 backdrop-blur-lg border-t border-[#E7E1D9] pb-safe px-2 py-1 shadow-lg">
      <nav className="flex items-center justify-around h-14" aria-label="Mobile Navigation Bar">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-[#68452D] font-semibold' : 'text-[#77716A] hover:text-[#29231E]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
              <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
