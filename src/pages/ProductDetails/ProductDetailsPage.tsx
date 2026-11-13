/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Plus,
  FolderPlus,
  Shield,
  Truck,
  Clock,
  Ruler,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  Maximize2,
  X,
} from 'lucide-react';
import { getProductById, getProducts } from '../../services/firebase/firestore';
import { INITIAL_PRODUCTS } from '../../data/products';
import { useCartStore } from '../../store/useCartStore';
import { useProjectStore } from '../../store/useProjectStore';
import { ProductCard } from '../../components/products/ProductCard';
import { Product } from '../../types';

export const ProductDetailsPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const { addItem } = useCartStore();
  const { projects, addProductToProject } = useProjectStore();

  const [selectedFinish, setSelectedFinish] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [projectSuccess, setProjectSuccess] = useState(false);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.projectId || '');

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    setActiveImageIndex(0);

    // Fetch product by ID from Firestore (or fallback)
    getProductById(productId)
      .then((data) => {
        if (data) {
          setProduct(data);
          setSelectedFinish(data.finishes?.[0] || '');
          setSelectedMaterial(data.materials?.[0] || '');
        } else {
          // Check static initial products
          const fallback = INITIAL_PRODUCTS.find((p) => p.productId === productId);
          if (fallback) {
            setProduct(fallback);
            setSelectedFinish(fallback.finishes?.[0] || '');
            setSelectedMaterial(fallback.materials?.[0] || '');
          }
        }
      })
      .catch((err) => {
        console.warn('Error fetching product:', err);
        const fallback = INITIAL_PRODUCTS.find((p) => p.productId === productId);
        if (fallback) setProduct(fallback);
      })
      .finally(() => setLoading(false));

    // Fetch related products
    getProducts()
      .then((allProds) => {
        const pool = allProds && allProds.length > 0 ? allProds : INITIAL_PRODUCTS;
        const related = pool.filter((p) => p.productId !== productId).slice(0, 3);
        setRelatedProducts(related);
      })
      .catch(() => {
        const fallbackRelated = INITIAL_PRODUCTS.filter((p) => p.productId !== productId).slice(0, 3);
        setRelatedProducts(fallbackRelated);
      });
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-[#F8F6F2] min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-6 w-32 bg-[#E7E1D9] rounded-full"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7 aspect-4/3 bg-[#E7E1D9] rounded-3xl"></div>
              <div className="lg:col-span-5 space-y-4">
                <div className="h-4 w-24 bg-[#E7E1D9] rounded-sm"></div>
                <div className="h-8 w-3/4 bg-[#E7E1D9] rounded-sm"></div>
                <div className="h-6 w-1/3 bg-[#E7E1D9] rounded-sm"></div>
                <div className="h-20 bg-[#E7E1D9] rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-4 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#29231E]">Product Not Found</h2>
        <p className="text-sm text-[#77716A] mt-2">The requested design may have been updated or archived.</p>
        <Link
          to="/browse"
          className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#29231E] text-white text-xs font-semibold uppercase tracking-wider"
        >
          Return to Catalogue
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : ['/assets/logo.png'];
  const currentImage = images[activeImageIndex] || images[0];

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleAddToCart = () => {
    addItem(product, quantity, selectedFinish, selectedMaterial);
    setCartSuccess(true);
    setTimeout(() => setCartSuccess(false), 2500);
  };

  const handleAddToProject = () => {
    if (selectedProject) {
      addProductToProject(selectedProject, product.productId);
      setProjectSuccess(true);
      setTimeout(() => setProjectSuccess(false), 2500);
    }
  };

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#77716A] hover:text-[#29231E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to browsing</span>
          </button>
          <div className="text-xs text-[#77716A]">
            <Link to="/browse" className="hover:text-[#29231E]">Trending</Link>
            <span className="mx-2">/</span>
            <span className="text-[#29231E] font-medium">{product.categoryName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ── LEFT: INTERACTIVE IMAGE GALLERY & SPECS ── */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Stage View */}
            <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E7E1D9] shadow-sm aspect-4/3 group">
              <img
                src={currentImage}
                alt={`${product.name} - View ${activeImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-102"
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                <span className="bg-white/95 backdrop-blur-xs text-[#29231E] text-[11px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg border border-[#E7E1D9] shadow-xs">
                  {product.productType === 'ready_made'
                    ? 'Ready to Ship'
                    : product.productType === 'custom'
                    ? 'Bespoke Architecture'
                    : 'Crafted on Demand'}
                </span>
                {product.isFeatured && (
                  <span className="bg-[#68452D] text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1 w-max">
                    <Sparkles className="w-3 h-3" />
                    <span>Trending Style</span>
                  </span>
                )}
              </div>

              {/* Lightbox / Zoom Button */}
              <button
                onClick={() => setLightboxOpen(true)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#29231E] border border-[#E7E1D9] shadow-xs flex items-center justify-center transition-transform hover:scale-105 z-10"
                title="View full image"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Prev / Next Controls if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#29231E] border border-[#E7E1D9] shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 z-10"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-[#29231E] border border-[#E7E1D9] shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 z-10"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Image Counter indicator */}
                  <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[11px] font-medium px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {activeImageIndex + 1} / {images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#68452D] ring-2 ring-[#68452D]/20 scale-102 shadow-xs'
                        : 'border-[#E7E1D9] opacity-70 hover:opacity-100 hover:border-[#77716A]'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Standard Dimensions & Custom Modification Banner */}
            <div className="p-6 bg-white rounded-3xl border border-[#E7E1D9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#F8F6F2] text-[#68452D] flex items-center justify-center border border-[#E7E1D9] shrink-0">
                  <Ruler className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#29231E]">
                    Standard Dimensions
                  </h4>
                  <p className="text-xs text-[#77716A] mt-0.5">
                    {product.dimensions.width} {product.dimensions.unit || 'cm'} (Width) ×{' '}
                    {product.dimensions.depth} {product.dimensions.unit || 'cm'} (Depth) ×{' '}
                    {product.dimensions.height} {product.dimensions.unit || 'cm'} (Height)
                  </p>
                </div>
              </div>

              <Link
                to={`/upload-idea?title=${encodeURIComponent(product.name)}`}
                className="px-4 py-2 rounded-xl bg-[#F0ECE5] hover:bg-[#E7E1D9] text-[#68452D] text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Need Custom Dimensions?</span>
              </Link>
            </div>
          </div>

          {/* ── RIGHT: CONTIGUOUS ORDER & SPECS MODULE ── */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E7E1D9] p-7 sm:p-9 shadow-sm space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#A17A58]">
                {product.categoryName}
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#29231E] mt-1 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-2.5 mt-3">
                <span className="font-serif text-3xl font-bold text-[#68452D] tabular-nums">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                {product.startingPrice && (
                  <span className="text-xs text-[#77716A]">
                    (Starting base quotation; finalized based on room dimensions & timber selection)
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-[#77716A] leading-relaxed">
              {product.description}
            </p>

            {/* Timber & Material selection */}
            {product.materials && product.materials.length > 0 && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-2">
                  Select Timber / Core Material
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.materials.map((mat) => (
                    <button
                      key={mat}
                      type="button"
                      onClick={() => setSelectedMaterial(mat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedMaterial === mat
                          ? 'bg-[#29231E] text-white shadow-xs'
                          : 'bg-[#F8F6F2] text-[#29231E] border border-[#E7E1D9] hover:border-[#68452D]'
                      }`}
                    >
                      {mat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Polish & Finish selection */}
            {product.finishes && product.finishes.length > 0 && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-2">
                  Select Finish & Polish
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.finishes.map((fin) => (
                    <button
                      key={fin}
                      type="button"
                      onClick={() => setSelectedFinish(fin)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selectedFinish === fin
                          ? 'bg-[#68452D] text-white shadow-xs'
                          : 'bg-[#F8F6F2] text-[#29231E] border border-[#E7E1D9] hover:border-[#68452D]'
                      }`}
                    >
                      {fin}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="pt-3 border-t border-[#E7E1D9] space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#E7E1D9] rounded-xl overflow-hidden bg-[#F8F6F2]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3.5 py-2 text-sm text-[#29231E] hover:bg-[#E7E1D9] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold text-[#29231E] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3.5 py-2 text-sm text-[#29231E] hover:bg-[#E7E1D9] transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-6 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    cartSuccess
                      ? 'bg-green-700 text-white'
                      : 'bg-[#68452D] text-white hover:bg-[#523724] shadow-xs'
                  }`}
                >
                  {cartSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* Add to Project Collection */}
              <div className="p-4 bg-[#F8F6F2] rounded-2xl border border-[#E7E1D9] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#77716A] block">
                  Organize into My Project
                </span>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    className="flex-1 bg-white border border-[#E7E1D9] rounded-xl px-3 py-2 text-xs font-medium text-[#29231E] focus:outline-none"
                  >
                    {projects.map((proj) => (
                      <option key={proj.projectId} value={proj.projectId}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleAddToProject}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      projectSuccess
                        ? 'bg-green-700 text-white'
                        : 'bg-[#29231E] text-white hover:bg-[#68452D]'
                    }`}
                  >
                    {projectSuccess ? <Check className="w-3.5 h-3.5" /> : <FolderPlus className="w-3.5 h-3.5" />}
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Custom Idea / In-home visit CTA */}
            <div className="p-4 rounded-2xl bg-[#F0ECE5] border border-[#E7E1D9] space-y-2">
              <div className="flex items-center gap-2 text-[#68452D]">
                <Camera className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Have an alternative design in mind?
                </span>
              </div>
              <p className="text-xs text-[#77716A]">
                We can manufacture this piece in custom dimensions, alter armrests, or build from an entirely different photo you have.
              </p>
              <div className="pt-1 flex gap-2">
                <Link
                  to={`/upload-idea?title=${encodeURIComponent(product.name)}`}
                  className="text-xs font-semibold text-[#68452D] underline hover:text-[#523724]"
                >
                  Upload idea photo for quote →
                </Link>
                <span className="text-[#77716A]">·</span>
                <Link
                  to="/book-visit"
                  className="text-xs font-semibold text-[#68452D] underline hover:text-[#523724]"
                >
                  Book visit →
                </Link>
              </div>
            </div>

            {/* Reassurance points */}
            <div className="pt-3 border-t border-[#E7E1D9] space-y-2.5 text-xs text-[#77716A]">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-[#68452D] shrink-0" />
                <span>25-year structural timber warranty against borer & warping</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-[#68452D] shrink-0" />
                <span>Complimentary white-glove delivery on orders over ₹50,000</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#68452D] shrink-0" />
                <span>Standard workshop crafting time: {product.leadTimeWeeks || 3} weeks</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── RELATED TRENDING PIECES ── */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pt-12 border-t border-[#E7E1D9]">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-[#A17A58]">
                  Curated Catalog
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#29231E] mt-1">
                  Explore Complementary Designs
                </h3>
              </div>
              <Link
                to="/browse"
                className="text-xs font-semibold uppercase tracking-wider text-[#68452D] hover:underline"
              >
                View all pieces →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.productId} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/20 text-white hover:bg-white/40 flex items-center justify-center transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={currentImage}
            alt={product.name}
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
