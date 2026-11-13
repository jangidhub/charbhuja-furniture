/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#29231E] text-[#F0ECE5] pt-16 pb-24 lg:pb-16 border-t border-[#3a322b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 pb-12 border-b border-[#3a322b]">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/assets/logo.png"
                alt="Charbhuja"
                className="h-9 w-auto brightness-200 invert"
              />
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Charbhuja
              </span>
            </Link>
            <p className="text-xs text-[#E7E1D9]/70 leading-relaxed max-w-sm">
              Furniture, made to stay. Crafted from seasoned Indian hardwoods and engineered for generations of family living.
            </p>
            <div className="pt-2 text-xs text-[#E7E1D9]/60 flex flex-col gap-1.5">
              <span>GST Registered Manufacturer</span>
              <span>Central Province Teak & Rosewood Specialists</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#A17A58]">
              Catalogue & Collections
            </h4>
            <ul className="space-y-2 text-xs text-[#E7E1D9]/80">
              <li>
                <Link to="/browse?cat=sofas" className="hover:text-white transition-colors">
                  Solid Teak Sofas
                </Link>
              </li>
              <li>
                <Link to="/browse?cat=dining" className="hover:text-white transition-colors">
                  Rosewood Dining Tables
                </Link>
              </li>
              <li>
                <Link to="/browse?cat=walkin" className="hover:text-white transition-colors">
                  Walk-in Dressing Suites
                </Link>
              </li>
              <li>
                <Link to="/browse?cat=chairs" className="hover:text-white transition-colors">
                  Hand-Woven Cane Chairs
                </Link>
              </li>
              <li>
                <Link to="/browse?cat=kitchen" className="hover:text-white transition-colors">
                  Modular Timber Kitchens
                </Link>
              </li>
              <li>
                <Link to="/browse?cat=doors" className="hover:text-white transition-colors">
                  Engineered Flush Doors
                </Link>
              </li>
            </ul>
          </div>

          {/* Bespoke Services */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#A17A58]">
              Services & Ideas
            </h4>
            <ul className="space-y-2 text-xs text-[#E7E1D9]/80">
              <li>
                <Link to="/upload-idea" className="hover:text-white transition-colors inline-flex items-center gap-1">
                  <span>Upload Your Idea Photo</span>
                  <ArrowUpRight className="w-3 h-3 text-[#A17A58]" />
                </Link>
              </li>
              <li>
                <Link to="/book-visit" className="hover:text-white transition-colors">
                  Book Free Measurement Visit
                </Link>
              </li>
              <li>
                <Link to="/browse" className="hover:text-white transition-colors">
                  Trending Furniture Styles
                </Link>
              </li>
              <li>
                <Link to="/account" className="hover:text-white transition-colors">
                  Track My Quotation & Orders
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-[#A17A58] hover:text-white transition-colors font-medium">
                  Staff Admin Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Workshop & Contact */}
          <div className="space-y-3" id="contact">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#A17A58]">
              Artisan Workshop
            </h4>
            <div className="space-y-2.5 text-xs text-[#E7E1D9]/80">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#A17A58] shrink-0 mt-0.5" />
                <span>Charbhuja Furniture Works, Industrial Area, Rajasthan, India</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#A17A58] shrink-0" />
                <span>+91 98290 00000 / +91 94140 00000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#A17A58] shrink-0" />
                <span>orders@charbhuja.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#A17A58] shrink-0" />
                <span>Mon – Sat: 9:30 AM – 7:30 PM IST</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#E7E1D9]/50">
          <p>© {new Date().getFullYear()} Charbhuja Furniture. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Crafted with solid hardwood</span>
            <span>·</span>
            <span>Made in India</span>
            <span>·</span>
            <Link to="/admin" className="hover:text-white transition-colors">
              Admin Access
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
