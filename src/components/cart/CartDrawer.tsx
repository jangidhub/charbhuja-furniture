/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { X, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const CartDrawer: React.FC = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal } = useCartStore();
  const subtotal = getSubtotal();
  const deliveryEstimated = subtotal > 50000 ? 0 : 2500;
  const total = subtotal + deliveryEstimated;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#F8F6F2] shadow-2xl flex flex-col border-l border-[#E7E1D9]">
          {/* Header */}
          <div className="p-6 border-b border-[#E7E1D9] flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#68452D]" />
              <h2 className="font-serif text-lg font-bold text-[#29231E]">Your Cart</h2>
              <span className="text-xs text-[#77716A]">({items.length} items)</span>
            </div>
            <button
              onClick={closeCart}
              aria-label="Close cart drawer"
              className="p-2 text-[#77716A] hover:text-[#29231E] rounded-full hover:bg-[#F0ECE5] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-[#F0ECE5] flex items-center justify-center text-[#77716A] mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="font-serif text-lg font-medium text-[#29231E]">Your cart is empty</h3>
                <p className="text-sm text-[#77716A] mt-1 max-w-xs">
                  Explore our handcrafted solid wood pieces or design a custom furniture project.
                </p>
                <Link
                  to="/browse"
                  onClick={closeCart}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider bg-[#29231E] text-white rounded-full hover:bg-[#68452D] transition-colors"
                >
                  Explore Catalogue
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 p-4 bg-white rounded-xl border border-[#E7E1D9] shadow-xs"
                >
                  <img
                    src={item.product.images[0] || '/assets/logo.png'}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-[#F0ECE5] shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-semibold text-[#29231E] truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-[#77716A] hover:text-red-600 transition-colors p-1"
                          aria-label={`Remove ${item.product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-[#77716A] mt-0.5">
                        {item.selectedFinish} · {item.selectedMaterial}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity stepper */}
                      <div className="flex items-center border border-[#E7E1D9] rounded-lg overflow-hidden bg-[#F8F6F2]">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1 text-xs text-[#29231E] hover:bg-[#E7E1D9] transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-medium text-[#29231E] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1 text-xs text-[#29231E] hover:bg-[#E7E1D9] transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-sm font-semibold text-[#29231E] tabular-nums">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#E7E1D9] bg-white space-y-3">
              <div className="flex justify-between text-xs text-[#77716A]">
                <span>Subtotal</span>
                <span className="font-medium text-[#29231E] tabular-nums">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#77716A]">
                <span>White Glove Delivery</span>
                <span>
                  {deliveryEstimated === 0 ? (
                    <span className="text-green-700 font-medium">Free (Order above ₹50,000)</span>
                  ) : (
                    <span className="tabular-nums">₹{deliveryEstimated.toLocaleString('en-IN')}</span>
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E7E1D9] flex justify-between text-sm font-bold text-[#29231E]">
                <span>Estimated Total</span>
                <span className="font-serif text-base text-[#68452D] tabular-nums">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#68452D] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full py-2 text-xs text-[#77716A] hover:text-[#29231E] transition-colors text-center"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
