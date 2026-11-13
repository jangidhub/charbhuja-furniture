/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Shield,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
  MapPin,
  Plus,
  Trash2,
  AlertCircle,
  Truck,
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { createValidatedOrder } from '../../services/firebase/firestore';
import { Order, CustomerAddress } from '../../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, getSubtotal, getDeliveryEstimate, getTotal, updateQuantity, removeItem, clearCart } =
    useCartStore();
  const { user, addresses, saveAddress } = useAuthStore();

  const subtotal = getSubtotal();
  const deliveryCharge = getDeliveryEstimate();
  const totalAmount = getTotal();

  // Address Selection mode: 'saved' | 'new'
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [useCustomAddress, setUseCustomAddress] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState(user?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '+91 98765 43210');
  const [email, setEmail] = useState(user?.email || 'sudhanshu@charbhuja.com');
  const [streetAddress, setStreetAddress] = useState('B-402, Royal Palms, Civil Lines');
  const [city, setCity] = useState('Jaipur');
  const [state, setState] = useState('Rajasthan');
  const [pinCode, setPinCode] = useState('302006');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Lift available. Call before arrival.');
  const [saveToAddressBook, setSaveToAddressBook] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  // Sync user info and default address if available
  useEffect(() => {
    if (user) {
      if (user.displayName) setFullName(user.displayName);
      if (user.email) setEmail(user.email);
      if (user.phoneNumber) setPhoneNumber(user.phoneNumber);
    }

    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setSelectedAddressId(defaultAddr.addressId);
      applySavedAddress(defaultAddr);
    }
  }, [user, addresses]);

  const applySavedAddress = (addr: CustomerAddress) => {
    setFullName(addr.fullName || user?.displayName || '');
    setPhoneNumber(addr.phoneNumber || user?.phoneNumber || '');
    setStreetAddress(addr.streetAddress);
    setCity(addr.city);
    setState(addr.state);
    setPinCode(addr.pinCode);
    if (addr.deliveryInstructions) setDeliveryInstructions(addr.deliveryInstructions);
  };

  const handleSelectSavedAddress = (addr: CustomerAddress) => {
    setSelectedAddressId(addr.addressId);
    setUseCustomAddress(false);
    applySavedAddress(addr);
  };

  if (items.length === 0 && !placedOrder) {
    return (
      <div className="bg-[#F8F6F2] min-h-screen py-20">
        <div className="max-w-md mx-auto text-center px-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#F0ECE5] flex items-center justify-center text-[#77716A] mx-auto">
            <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#29231E]">Your Cart is Empty</h2>
          <p className="text-xs text-[#77716A] leading-relaxed">
            You don't have any items in your cart. Explore our trending handcrafted collections or upload a custom bespoke idea.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/browse"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#29231E] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#68452D] transition-colors"
            >
              Explore Catalogue
            </Link>
            <Link
              to="/upload-idea"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white border border-[#E7E1D9] text-[#29231E] text-xs font-semibold uppercase tracking-wider hover:bg-[#F0ECE5] transition-colors"
            >
              Custom Idea
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const activeDeliveryAddress: CustomerAddress = {
        addressId: selectedAddressId && !useCustomAddress ? selectedAddressId : `addr_${Date.now()}`,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        deliveryInstructions: deliveryInstructions.trim(),
        isDefault: addresses.length === 0,
      };

      // If user wants to save this new address to their address book
      if (user && saveToAddressBook && useCustomAddress) {
        saveAddress(activeDeliveryAddress).catch((err) =>
          console.warn('Could not save address to book:', err)
        );
      }

      // Call trusted backend price validation in Firestore
      const verifiedOrder = await createValidatedOrder({
        cartItems: items,
        customerSnapshot: {
          name: fullName.trim(),
          email: email.trim(),
          phoneNumber: phoneNumber.trim(),
        },
        deliveryAddress: activeDeliveryAddress,
        userId: user?.uid || `guest_${Date.now()}`,
      });

      setPlacedOrder(verifiedOrder);
      clearCart();
    } catch (err: any) {
      console.error('Order creation error:', err);
      setErrorMessage(
        err.message || 'Unable to register order at this time. Please check your connection.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Confirmed State
  if (placedOrder) {
    return (
      <div className="bg-[#F8F6F2] min-h-screen py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-3xl border border-[#E7E1D9] p-8 sm:p-12 shadow-sm text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto border border-green-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#68452D] bg-[#F8F6F2] px-3 py-1 rounded-full border border-[#E7E1D9]">
                Order Confirmed for Manual Verification
              </span>
              <h1 className="font-serif text-3xl font-bold text-[#29231E] mt-2">
                Order #{placedOrder.orderNumber}
              </h1>
              <p className="text-xs text-[#77716A] mt-2 leading-relaxed max-w-lg mx-auto">
                Thank you for trusting Charbhuja Furniture. Your handcrafted order has been registered in our workshop queue. Our senior carpentry manager will call you at <strong>{placedOrder.customerSnapshot.phoneNumber}</strong> within 2 hours to confirm wood polish options, site delivery access, and final production schedule.
              </p>
            </div>

            <div className="bg-[#F8F6F2] p-6 rounded-2xl border border-[#E7E1D9] text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-[#E7E1D9] pb-2 font-semibold text-[#29231E]">
                <span>Delivery Address</span>
                <span className="text-right font-normal text-[#77716A]">
                  {placedOrder.deliveryAddress.streetAddress}, {placedOrder.deliveryAddress.city}, {placedOrder.deliveryAddress.state} - {placedOrder.deliveryAddress.pinCode}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#E7E1D9] pb-2">
                <span className="text-[#77716A]">Verified Items ({placedOrder.items.length})</span>
                <span className="font-medium text-[#29231E] text-right">
                  {placedOrder.items.map((i) => `${i.name} (×${i.quantity})`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#29231E] pt-1">
                <span>Total Amount Due (Pay on Delivery / NEFT)</span>
                <span className="font-serif text-[#68452D] tabular-nums">
                  ₹{placedOrder.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={`/orders/${placedOrder.orderId}`}
                className="px-6 py-3 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors shadow-xs"
              >
                Track Live Progress
              </Link>
              <Link
                to="/account"
                className="px-6 py-3 bg-white border border-[#E7E1D9] text-[#29231E] rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#F0ECE5] transition-colors"
              >
                View in My Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#77716A] hover:text-[#29231E] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <h1 className="font-serif text-3xl font-bold text-[#29231E] mb-8">
          Order Confirmation & Delivery Details
        </h1>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Address Selection & Contact Info */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Saved Addresses (if available) */}
            {user && addresses && addresses.length > 0 && (
              <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#E7E1D9] pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#68452D]" />
                    <h2 className="font-serif text-lg font-bold text-[#29231E]">
                      Select Saved Delivery Address
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUseCustomAddress(true);
                      setSelectedAddressId('');
                      setStreetAddress('');
                      setCity('');
                      setState('');
                      setPinCode('');
                    }}
                    className="text-xs text-[#68452D] hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add New Address</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => {
                    const isSelected = !useCustomAddress && selectedAddressId === addr.addressId;
                    return (
                      <div
                        key={addr.addressId}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all text-xs space-y-1 ${
                          isSelected
                            ? 'bg-[#F8F6F2] border-[#68452D] ring-1 ring-[#68452D]'
                            : 'bg-white border-[#E7E1D9] hover:border-[#68452D]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#29231E]">{addr.fullName || 'Home'}</span>
                          {addr.isDefault && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#68452D] bg-[#F0ECE5] px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-[#77716A] line-clamp-2">{addr.streetAddress}</p>
                        <p className="text-[#77716A]">
                          {addr.city}, {addr.state} - {addr.pinCode}
                        </p>
                        <p className="text-[11px] font-medium text-[#29231E] pt-1">
                          Phone: {addr.phoneNumber}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Customer & Address Form */}
            <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm space-y-6">
              <h2 className="font-serif text-xl font-bold text-[#29231E] border-b border-[#E7E1D9] pb-3">
                {useCustomAddress || !addresses || addresses.length === 0
                  ? 'Delivery Address & Client Details'
                  : 'Contact & Delivery Details for this Order'}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                    Client Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sudhanshu Jangid"
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-hidden focus:border-[#68452D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                    Mobile Number (for delivery call) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-hidden focus:border-[#68452D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@domain.com"
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-hidden focus:border-[#68452D]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                    Street Address, Flat / Villa No & Landmark <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="e.g. B-402, Royal Palms, Civil Lines, Near Ajmer Road"
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-hidden focus:border-[#68452D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                    City <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Jaipur"
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-hidden focus:border-[#68452D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                    State <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Rajasthan"
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-hidden focus:border-[#68452D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                    PIN Code <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="302006"
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-hidden focus:border-[#68452D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                    Site Access & Delivery Notes
                  </label>
                  <input
                    type="text"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    placeholder="e.g. 2nd floor, service lift available"
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-hidden focus:border-[#68452D]"
                  />
                </div>
              </div>

              {user && useCustomAddress && (
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#29231E] pt-2">
                  <input
                    type="checkbox"
                    checked={saveToAddressBook}
                    onChange={(e) => setSaveToAddressBook(e.target.checked)}
                    className="w-4 h-4 text-[#68452D] rounded-sm border-[#E7E1D9] accent-[#68452D]"
                  />
                  <span>Save this address to My Address Book in profile</span>
                </label>
              )}

              {/* Payment Policy & Notice */}
              <div className="pt-4 border-t border-[#E7E1D9] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#68452D] text-white px-2 py-0.5 rounded-full">
                    Notice
                  </span>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#29231E]">
                    Payment Mode: Manual Order Confirmation
                  </h3>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8F6F2] border border-[#E7E1D9] text-xs text-[#77716A] leading-relaxed">
                  Online card payments are intentionally postponed for direct factory assurance. When you submit this order, it is directly queued in our workshop schedule. Our carpentry team will contact you to confirm raw timber selection, polish tone, and verify site access. Payment can be settled via NEFT/RTGS bank transfer or upon white-glove delivery.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Editable Cart Items & Summary */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#E7E1D9] pb-3">
              <h2 className="font-serif text-xl font-bold text-[#29231E]">
                Order Review ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>
              <span className="text-xs text-[#77716A]">Trusted Price Guarantee</span>
            </div>

            {/* Editable Line Items */}
            <div className="divide-y divide-[#E7E1D9] max-h-96 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="py-4 flex gap-3 text-xs">
                  <img
                    src={(item.product.images && item.product.images[0]) || '/assets/logo.png'}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-[#F0ECE5] shrink-0 border border-[#E7E1D9]"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-semibold text-[#29231E] truncate">{item.product.name}</p>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-[#77716A] hover:text-red-600 transition-colors p-0.5"
                          title="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[#77716A] text-[11px] mt-0.5">
                        {item.selectedFinish} · {item.selectedMaterial}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E7E1D9] rounded-lg bg-[#F8F6F2]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2 py-0.5 text-xs text-[#29231E] hover:bg-[#E7E1D9] transition-colors"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-semibold text-[#29231E] tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2 py-0.5 text-xs text-[#29231E] hover:bg-[#E7E1D9] transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-semibold text-xs text-[#29231E] tabular-nums">
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Breakdown */}
            <div className="pt-3 border-t border-[#E7E1D9] space-y-2.5 text-xs text-[#77716A]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#29231E] tabular-nums">
                  ₹{subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#68452D]" />
                  <span>White Glove Delivery & Installation</span>
                </span>
                <span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-700 font-semibold">Free (Order &gt; ₹50,000)</span>
                  ) : (
                    <span className="tabular-nums">₹{deliveryCharge.toLocaleString('en-IN')}</span>
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E7E1D9] flex justify-between text-base font-bold text-[#29231E]">
                <span>Total Amount Due</span>
                <span className="font-serif text-lg text-[#68452D] tabular-nums">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || items.length === 0}
              className="w-full py-3.5 px-4 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Validating & Registering Order...</span>
              ) : (
                <>
                  <span>Submit Order for Manual Confirmation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-[#77716A]">
              <Shield className="w-3.5 h-3.5 text-[#68452D]" />
              <span>Direct factory warranty · Manual verification · Zero upfront card risk</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
