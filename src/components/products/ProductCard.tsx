/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, FolderPlus, Eye } from 'lucide-react';
import { Product } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { useProjectStore } from '../../store/useProjectStore';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCartStore();
  const { projects, activeProjectId, addProductToProject } = useProjectStore();
  const [added, setAdded] = useState(false);
  const [projectAdded, setProjectAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleAddToProject = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeProjectId) {
      addProductToProject(activeProjectId, product.productId);
      setProjectAdded(true);
      setTimeout(() => setProjectAdded(false), 2000);
    } else if (projects.length > 0) {
      addProductToProject(projects[0].projectId, product.productId);
      setProjectAdded(true);
      setTimeout(() => setProjectAdded(false), 2000);
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-[#E7E1D9] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      {/* Product Image Area */}
      <div className="relative aspect-4/3 w-full bg-[#F0ECE5] overflow-hidden">
        <Link to={`/product/${product.productId}`}>
          <img
            src={product.images[0] || '/assets/logo.png'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Floating Quick Action Buttons on Hover */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-90 transition-opacity">
          {/* Add to Project */}
          <button
            onClick={handleAddToProject}
            title="Save to My Project Folder"
            aria-label={`Save ${product.name} to project`}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              projectAdded
                ? 'bg-[#68452D] text-white'
                : 'bg-white/90 text-[#29231E] hover:bg-white hover:text-[#68452D] shadow-sm backdrop-blur-xs'
            }`}
          >
            {projectAdded ? <Check className="w-4 h-4" /> : <FolderPlus className="w-4 h-4" />}
          </button>

          {/* Quick View */}
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              title="Quick Specifications"
              aria-label={`Quick view ${product.name}`}
              className="w-9 h-9 rounded-full bg-white/90 text-[#29231E] hover:bg-white hover:text-[#68452D] shadow-sm backdrop-blur-xs flex items-center justify-center transition-all"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Product Type Tag */}
        <div className="absolute bottom-3 left-3">
          <span className="text-[11px] font-medium tracking-wide uppercase px-2.5 py-1 rounded-md bg-white/95 text-[#29231E] backdrop-blur-xs border border-[#E7E1D9]/60 shadow-xs">
            {product.productType === 'ready_made' ? 'Ready to Ship' : product.productType === 'made_to_order' ? 'Made to Order' : 'Bespoke Custom'}
          </span>
        </div>
      </div>

      {/* Info Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Dimensions */}
          <div className="flex items-center justify-between text-xs text-[#77716A] mb-1.5">
            <span className="font-medium uppercase tracking-wider text-[11px] text-[#A17A58]">
              {product.categoryName}
            </span>
            <span className="tabular-nums">
              {product.dimensions.width} × {product.dimensions.depth} × {product.dimensions.height} {product.dimensions.unit}
            </span>
          </div>

          {/* Name */}
          <Link to={`/product/${product.productId}`}>
            <h3 className="font-serif text-base font-semibold text-[#29231E] group-hover:text-[#68452D] transition-colors leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Materials snippet */}
          <p className="text-xs text-[#77716A] mt-1 line-clamp-1">
            {product.materials.join(' · ')}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-4 mt-4 border-t border-[#E7E1D9] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-[#77716A] block">
              {product.startingPrice ? 'Starting from' : 'Direct Price'}
            </span>
            <span className="font-serif text-lg font-bold text-[#29231E] tabular-nums">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            aria-label={`Add ${product.name} to cart`}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              added
                ? 'bg-green-700 text-white'
                : 'bg-[#29231E] text-white hover:bg-[#68452D]'
            }`}
          >
            {added ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
