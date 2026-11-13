/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowUpDown, UploadCloud, Sparkles, Filter, X } from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { ProductCard } from '../../components/products/ProductCard';
import { subscribeProducts } from '../../services/firebase/firestore';
import { INITIAL_PRODUCTS } from '../../data/products';
import { Product } from '../../types';

export const BrowsePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('cat') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');

  useEffect(() => {
    const unsubscribe = subscribeProducts((data) => {
      if (data && data.length > 0) {
        setProducts(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        // Must be active
        if (product.isActive === false) return false;

        // Category filter
        if (selectedCategory !== 'all' && product.categoryId !== selectedCategory) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = product.name?.toLowerCase().includes(q);
          const matchesCategory = product.categoryName?.toLowerCase().includes(q);
          const matchesDesc = product.description?.toLowerCase().includes(q);
          const matchesMaterial = product.materials?.some((m) => m.toLowerCase().includes(q));
          if (!matchesName && !matchesCategory && !matchesDesc && !matchesMaterial) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const handleCategorySelect = (slug: string) => {
    if (slug === 'all') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', slug);
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchQuery('');
    searchParams.delete('cat');
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-[#E7E1D9] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0ECE5] border border-[#E7E1D9] text-[11px] font-semibold uppercase tracking-wider text-[#68452D] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Trending Designs · Crafted on Demand</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#29231E]">
              Curated Furniture Styles
            </h1>
            <p className="text-xs sm:text-sm text-[#77716A] mt-1 max-w-xl">
              Handpicked designs for sofas, wardrobes, dining sets, and bespoke suites. Crafted to order by Rajasthan master carpenters to your exact room measurements.
            </p>
          </div>

          {/* Search bar & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#77716A]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sofas, wardrobes, teak..."
                className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#E7E1D9] rounded-full text-xs text-[#29231E] placeholder-[#77716A] focus:outline-none focus:border-[#68452D]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77716A] hover:text-[#29231E]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative inline-flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-[#E7E1D9] rounded-full pl-4 pr-9 py-2.5 text-xs font-medium text-[#29231E] focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Alphabetical</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-[#77716A] absolute right-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Upload Idea Banner */}
        <div className="my-6 p-6 rounded-2xl bg-[#F0ECE5] border border-[#E7E1D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-[#29231E]">
              Have a screenshot of a sofa or wardrobe from Pinterest or Instagram?
            </h3>
            <p className="text-xs text-[#77716A]">
              Upload your photo directly. We manufacture it to your exact room size and provide estimated quotes or in-home measurement visits.
            </p>
          </div>
          <Link
            to="/upload-idea"
            className="px-5 py-2.5 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors shrink-0 flex items-center gap-2 shadow-xs"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Idea Photo</span>
          </Link>
        </div>

        {/* Category Filter Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#29231E] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            All Trending ({products.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.slug
                  ? 'bg-[#29231E] text-white shadow-xs'
                  : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Results Counter & Active Filter Reset */}
        {(selectedCategory !== 'all' || searchQuery) && (
          <div className="flex items-center justify-between mb-6 pb-2 text-xs text-[#77716A]">
            <span>Showing {filteredProducts.length} pieces</span>
            <button
              onClick={clearFilters}
              className="font-medium text-[#68452D] hover:underline flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset all filters</span>
            </button>
          </div>
        )}

        {/* Loading State or Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-3xl border border-[#E7E1D9] p-4 space-y-3">
                <div className="aspect-4/3 bg-[#E7E1D9] rounded-2xl"></div>
                <div className="h-4 w-1/3 bg-[#E7E1D9] rounded-md"></div>
                <div className="h-5 w-2/3 bg-[#E7E1D9] rounded-md"></div>
                <div className="h-4 w-1/4 bg-[#E7E1D9] rounded-md"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-[#E7E1D9] p-8 shadow-xs">
            <h3 className="font-serif text-xl font-bold text-[#29231E]">No pieces match your search</h3>
            <p className="text-sm text-[#77716A] mt-2 max-w-sm mx-auto">
              Want a custom size, distinct timber, or specific piece made? Upload a photo of your idea directly.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded-full border border-[#E7E1D9] text-[#29231E] text-xs font-semibold uppercase tracking-wider hover:bg-[#F0ECE5]"
              >
                Clear Filters
              </button>
              <Link
                to="/upload-idea"
                className="px-6 py-2.5 rounded-full bg-[#68452D] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#523724]"
              >
                Upload Idea Photo
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
