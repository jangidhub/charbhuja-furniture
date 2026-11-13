/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  TreePine,
  Sparkles,
  Ruler,
  Clock,
  Compass,
  CheckCircle2,
  X,
  Plus,
} from 'lucide-react';
import { CATEGORIES } from '../../data/categories';
import { INITIAL_PRODUCTS } from '../../data/products';
import { subscribeProducts } from '../../services/firebase/firestore';
import { ProductCard } from '../../components/products/ProductCard';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';

export const HomePage: React.FC = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const { addItem } = useCartStore();

  React.useEffect(() => {
    const unsub = subscribeProducts((data) => {
      if (data && data.length > 0) setProducts(data);
    });
    return () => unsub();
  }, []);

  const featuredProducts = products.filter((p) => p.isFeatured && p.isActive !== false).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── 1. HERO SECTION ─────────────────────────────────── */}
      <section className="relative bg-[#F8F6F2] pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-[#E7E1D9] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F0ECE5] border border-[#E7E1D9] text-xs font-semibold uppercase tracking-wider text-[#68452D]">
                <TreePine className="w-3.5 h-3.5" />
                <span>Handcrafted Solid Hardwood · Made in India</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#29231E] leading-[1.08] text-balance">
                Furniture,<br />
                <span className="italic font-normal text-[#68452D]">made to stay.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#77716A] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Curated trending designs crafted on demand for your space. Found a sofa, wardrobe, or dining table photo you love? Upload your idea photo and get an estimate or book a home visit.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/browse"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#29231E] text-white rounded-full text-sm font-semibold tracking-wide hover:bg-[#68452D] transition-all shadow-sm"
                >
                  <span>Explore Trending</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/upload-idea"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#29231E] border border-[#E7E1D9] rounded-full text-sm font-semibold tracking-wide hover:bg-[#F0ECE5] hover:border-[#A17A58] transition-all"
                >
                  <span>Upload Your Idea</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-[#E7E1D9]/70 grid grid-cols-3 gap-4 text-left">
                <div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#29231E]">100%</p>
                  <p className="text-[11px] text-[#77716A] uppercase tracking-wider">Solid Hardwood</p>
                </div>
                <div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#29231E]">25 Yr</p>
                  <p className="text-[11px] text-[#77716A] uppercase tracking-wider">Structural Guarantee</p>
                </div>
                <div>
                  <p className="font-serif text-xl sm:text-2xl font-bold text-[#29231E]">Custom</p>
                  <p className="text-[11px] text-[#77716A] uppercase tracking-wider">Made to Measure</p>
                </div>
              </div>
            </div>

            {/* Right Column: Hero High-Res Furniture Showcase */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-[#E7E1D9] aspect-16/10 bg-[#F0ECE5] group">
                <img
                  src="/src/assets/images/hero_charbhuja_living_1794381204538.jpg"
                  alt="Charbhuja Furniture Minimalist Teak Living Room"
                  className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-103"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />

                {/* Floating caption card */}
                <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-[#E7E1D9] flex items-center justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#68452D]">
                      Living Room Collection
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#29231E]">
                      Aastha Solid Teak 3-Seater Suite
                    </h3>
                  </div>
                  <Link
                    to="/browse?cat=sofas"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#68452D] hover:text-[#29231E] transition-colors"
                  >
                    <span>View Suite</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* ── USER'S BESPOKE CATEGORY STRIP (WITH SVG ILLUSTRATIONS) ─── */}
          <div className="mt-16 pt-10 border-t border-[#E7E1D9]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#77716A]">
                Explore by Category
              </span>
              <Link
                to="/browse"
                className="text-xs font-medium text-[#68452D] hover:underline flex items-center gap-1"
              >
                <span>All Categories</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Scrollable Horizontal Strip */}
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/browse?cat=${cat.slug}`}
                  className="flex flex-col items-center gap-2.5 shrink-0 group w-24 sm:w-28 text-center"
                >
                  <div className="w-24 sm:w-28 h-16 sm:h-18 bg-white border border-[#E7E1D9] rounded-2xl flex items-center justify-center p-2.5 transition-all duration-300 group-hover:border-[#68452D] group-hover:shadow-md group-hover:-translate-y-1">
                    {cat.renderIcon()}
                  </div>
                  <span className="text-xs font-medium text-[#29231E] group-hover:text-[#68452D] transition-colors line-clamp-1">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED FURNITURE ───────────────────────────── */}
      <section className="py-20 bg-white border-b border-[#E7E1D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#A17A58] block mb-2">
                Handcrafted Signatures
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29231E]">
                Featured Pieces
              </h2>
            </div>
            <p className="text-sm text-[#77716A] max-w-md">
              Each piece is created in our workshop using seasoned hardwoods, traditional joinery, and durable eco-friendly polishes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full border border-[#29231E] text-xs font-semibold uppercase tracking-wider text-[#29231E] hover:bg-[#29231E] hover:text-white transition-all"
            >
              <span>View Full Catalogue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 3. CUSTOM DESIGN & MANUFACTURING SPOTLIGHT ───────── */}
      <section className="py-20 bg-[#F0ECE5] border-b border-[#E7E1D9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[#E7E1D9] p-8 sm:p-12 lg:p-16 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-semibold uppercase tracking-widest text-[#68452D] bg-[#F8F6F2] px-3 py-1 rounded-full border border-[#E7E1D9]">
                  Bespoke Manufacturing
                </span>

                <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#29231E] leading-tight">
                  Your vision. Our craftsmanship.<br />
                  <span className="text-[#68452D] italic font-normal">Made to your exact measurements.</span>
                </h2>

                <p className="text-sm sm:text-base text-[#77716A] leading-relaxed">
                  Have an architect’s blueprint, a Pinterest reference, or a specific awkward corner? We manufacture tailored solid wood furniture, customized wardrobes, and modular kitchens down to the millimeter.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#68452D] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#29231E]">Upload Drawings or Photos</h4>
                      <p className="text-xs text-[#77716A]">CAD plans, 3D renders, sketch pads or photos.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#68452D] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#29231E]">Transparent Itemized Quotation</h4>
                      <p className="text-xs text-[#77716A]">Detailed timber specs and manufacturing timeline.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#68452D] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#29231E]">Select Timbers & Finishes</h4>
                      <p className="text-xs text-[#77716A]">CP Teak, Sheesham, Oak, Walnut, and brass.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#68452D] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#29231E]">Production Tracking</h4>
                      <p className="text-xs text-[#77716A]">Follow progress from timber cut to white glove delivery.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap gap-4">
                  <Link
                    to="/upload-idea"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-all shadow-sm"
                  >
                    <span>Upload Your Furniture Idea</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    to="/book-visit"
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#F8F6F2] text-[#29231E] border border-[#E7E1D9] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#E7E1D9] transition-all"
                  >
                    <span>Book Measurement Visit</span>
                  </Link>
                </div>
              </div>

              {/* Right: Bespoke Visual Representation */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden border border-[#E7E1D9] shadow-md bg-[#F8F6F2] aspect-4/3 relative">
                  <img
                    src="/src/assets/images/furniture_walkin_wardrobe_1794381205607.jpg"
                    alt="Custom Bespoke Walk-in Dressing Suite by Charbhuja"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#A17A58]">
                      Custom Installation
                    </span>
                    <p className="text-xs font-medium text-white/90 mt-0.5">
                      Fluted Oak Walk-in Suite with Integrated Architectural Lighting
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. CRAFTSMANSHIP & MANUFACTURING PROCESS ─────────── */}
      <section className="py-20 bg-[#F8F6F2] border-b border-[#E7E1D9]" id="craftsmanship">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 order-2 lg:order-1">
              <div className="rounded-3xl overflow-hidden border border-[#E7E1D9] shadow-xl aspect-16/10 bg-[#F0ECE5]">
                <img
                  src="/src/assets/images/craftsmanship_workshop_1794381206504.jpg"
                  alt="Charbhuja Artisan Woodworking Workshop"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-[#A17A58]">
                Master Joinery
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29231E]">
                Built for generations, not seasons.
              </h2>
              <p className="text-sm sm:text-base text-[#77716A] leading-relaxed">
                Mass-market furniture is built to be discarded. At Charbhuja, every joint is secured with mortise and tenon joinery, every timber slab is naturally and mechanically seasoned to less than 10% moisture content, and every surface is finished by hand.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0ECE5] flex items-center justify-center text-[#68452D] shrink-0 font-bold text-xs">
                    01
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#29231E]">Kiln-Dried Hardwood Selection</h4>
                    <p className="text-xs text-[#77716A] mt-0.5">Guaranteed against warping, bending, or climate contraction.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0ECE5] flex items-center justify-center text-[#68452D] shrink-0 font-bold text-xs">
                    02
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#29231E]">Traditional Tenon & Dowel Joinery</h4>
                    <p className="text-xs text-[#77716A] mt-0.5">No fragile particleboard or plastic corner brackets.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#F0ECE5] flex items-center justify-center text-[#68452D] shrink-0 font-bold text-xs">
                    03
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#29231E]">Eco-Friendly Natural Grain Polishes</h4>
                    <p className="text-xs text-[#77716A] mt-0.5">Non-toxic matte oils and PU topcoats that celebrate the organic grain.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. ABOUT CHARBHUJA & THE EMBLEM ──────────────────── */}
      <section className="py-20 bg-white border-b border-[#E7E1D9]" id="about">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="flex justify-center">
            <img
              src="/assets/logo.png"
              alt="Charbhuja Emblem: Four hands in tree formation"
              className="h-20 w-auto object-contain"
            />
          </div>

          <span className="text-xs font-semibold uppercase tracking-widest text-[#68452D]">
            The Charbhuja Philosophy
          </span>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#29231E]">
            Four Hands. One Purpose.
          </h2>

          <p className="text-sm sm:text-base text-[#77716A] leading-relaxed max-w-2xl mx-auto">
            The Charbhuja emblem represents four hands growing together in an enduring tree-like formation. It embodies the harmonious collaboration between the forest, the artisan carpenter, the architectural designer, and your family home.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-left">
            <div className="p-6 rounded-2xl bg-[#F8F6F2] border border-[#E7E1D9]">
              <TreePine className="w-6 h-6 text-[#68452D] mb-3" />
              <h4 className="font-serif text-base font-bold text-[#29231E]">Honest Timber</h4>
              <p className="text-xs text-[#77716A] mt-1">Sustainably sourced CP Teak, Sheesham, Oak, and Walnut with verified origins.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F6F2] border border-[#E7E1D9]">
              <ShieldCheck className="w-6 h-6 text-[#68452D] mb-3" />
              <h4 className="font-serif text-base font-bold text-[#29231E]">Lifelong Integrity</h4>
              <p className="text-xs text-[#77716A] mt-1">Every structural joint is backed by our direct 25-year manufacturer guarantee.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8F6F2] border border-[#E7E1D9]">
              <Sparkles className="w-6 h-6 text-[#68452D] mb-3" />
              <h4 className="font-serif text-base font-bold text-[#29231E]">Custom Solitude</h4>
              <p className="text-xs text-[#77716A] mt-1">Direct communication with master craftsmen without intermediary markups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── QUICK SPECIFICATION MODAL ───────────────────────── */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full border border-[#E7E1D9] shadow-2xl p-6 sm:p-8">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 text-[#77716A] hover:text-[#29231E] rounded-full hover:bg-[#F0ECE5]"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="aspect-square rounded-2xl overflow-hidden bg-[#F0ECE5] border border-[#E7E1D9]">
                <img
                  src={quickViewProduct.images[0]}
                  alt={quickViewProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A17A58]">
                    {quickViewProduct.categoryName}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#29231E] mt-0.5">
                    {quickViewProduct.name}
                  </h3>
                  <p className="font-serif text-2xl font-bold text-[#68452D] mt-1">
                    ₹{quickViewProduct.price.toLocaleString('en-IN')}
                  </p>
                </div>

                <p className="text-xs text-[#77716A] leading-relaxed">
                  {quickViewProduct.description}
                </p>

                <div className="text-xs space-y-1.5 pt-2 border-t border-[#E7E1D9]">
                  <p>
                    <strong className="text-[#29231E]">Dimensions:</strong>{' '}
                    <span className="text-[#77716A]">
                      {quickViewProduct.dimensions.width} W × {quickViewProduct.dimensions.depth} D × {quickViewProduct.dimensions.height} H {quickViewProduct.dimensions.unit}
                    </span>
                  </p>
                  <p>
                    <strong className="text-[#29231E]">Materials:</strong>{' '}
                    <span className="text-[#77716A]">{quickViewProduct.materials.join(', ')}</span>
                  </p>
                  <p>
                    <strong className="text-[#29231E]">Finishes:</strong>{' '}
                    <span className="text-[#77716A]">{quickViewProduct.finishes.join(', ')}</span>
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      addItem(quickViewProduct, 1);
                      setQuickViewProduct(null);
                    }}
                    className="flex-1 py-3 px-4 bg-[#68452D] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                  <Link
                    to={`/product/${quickViewProduct.productId}`}
                    onClick={() => setQuickViewProduct(null)}
                    className="py-3 px-4 bg-[#F8F6F2] text-[#29231E] border border-[#E7E1D9] rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#E7E1D9] transition-colors"
                  >
                    Full Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
