/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  MapPin,
  Settings,
  LogOut,
  Camera,
  Shield,
  Phone,
  Mail,
  Plus,
  ArrowRight,
  Clock,
  Ruler,
  CheckCircle2,
  XCircle,
  FileText,
  Check,
  FolderHeart,
  ShoppingBag,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import {
  subscribeUserIdeaRequests,
  subscribeUserOrders,
  approveCustomQuotation,
  updateCustomIdeaStatus,
  CustomIdeaSubmission,
  cancelOrder,
} from '../../services/firebase/firestore';
import { Order, Product, CustomerAddress } from '../../types';

export const AccountPage: React.FC = () => {
  const { user, addresses, saveAddress, deleteAddress, setDefaultAddress, isAdmin, logout } =
    useAuthStore();
  const { addItem } = useCartStore();
  const [activeTab, setActiveTab] = useState<'requests' | 'orders' | 'addresses' | 'settings'>('requests');

  const [ideaRequests, setIdeaRequests] = useState<CustomIdeaSubmission[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [acceptedSuccessId, setAcceptedSuccessId] = useState<string | null>(null);

  // Address modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<CustomerAddress>({
    addressId: '',
    fullName: user?.displayName || '',
    phoneNumber: user?.phoneNumber || '',
    streetAddress: '',
    city: '',
    state: '',
    pinCode: '',
    deliveryInstructions: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!user?.uid) return;

    const unsubRequests = subscribeUserIdeaRequests(user.uid, (data) => setIdeaRequests(data));
    const unsubOrders = subscribeUserOrders(user.uid, (data) => setOrders(data));

    return () => {
      unsubRequests();
      unsubOrders();
    };
  }, [user?.uid]);

  const handleAcceptQuote = async (req: CustomIdeaSubmission) => {
    await approveCustomQuotation(req.requestId);
    setAcceptedSuccessId(req.requestId);

    // Create custom product in cart for direct checkout if price is known
    const parsedPrice = parseInt((req.quotedAmount || '').replace(/[^0-9]/g, ''), 10) || 45000;
    const customProduct: Product = {
      productId: `custom_${req.requestId}`,
      name: `Custom ${req.itemType.toUpperCase()} (Ref #${req.requestId})`,
      slug: `custom-${req.requestId.toLowerCase()}`,
      description: req.description,
      categoryId: req.itemType,
      categoryName: req.itemType.charAt(0).toUpperCase() + req.itemType.slice(1),
      images: [req.imageUrl || '/assets/logo.png'],
      price: parsedPrice,
      dimensions: { width: 180, depth: 85, height: 80, unit: 'cm' },
      materials: [req.timberPreference || 'Solid Teak Wood'],
      finishes: ['Raw Natural Polish'],
      productType: 'custom',
      isActive: true,
      isFeatured: false,
      inStock: true,
      leadTimeWeeks: req.estimatedTimelineWeeks || 3,
    };

    addItem(customProduct, 1);
  };

  const handleCancelRequest = async (reqId: string) => {
    if (confirm('Cancel this custom quotation request?')) {
      await updateCustomIdeaStatus(reqId, 'cancelled');
    }
  };

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl border border-[#E7E1D9] p-8 shadow-sm mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#F0ECE5] border border-[#E7E1D9] flex items-center justify-center text-[#68452D] font-serif text-2xl font-bold shadow-2xs">
              {user?.displayName?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl font-bold text-[#29231E]">
                  {user?.displayName || 'Valued Client'}
                </h1>
                {isAdmin && (
                  <span className="text-[10px] bg-[#68452D] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Staff Admin
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-[#77716A] mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email || 'client@charbhuja.com'}
                </span>
                {user?.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {user?.phoneNumber}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/projects"
              className="px-4 py-2 bg-[#F8F6F2] border border-[#E7E1D9] text-[#29231E] rounded-full text-xs font-semibold hover:bg-[#E7E1D9] transition-colors flex items-center gap-1.5"
            >
              <FolderHeart className="w-3.5 h-3.5 text-[#68452D]" />
              <span>Room Projects</span>
            </Link>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-[#68452D] text-white rounded-full text-xs font-semibold hover:bg-[#523724] transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Operations</span>
              </Link>
            )}

            <button
              onClick={logout}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-full text-xs font-semibold hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar border-b border-[#E7E1D9]">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'requests'
                ? 'bg-[#29231E] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>My Custom Ideas & Quotations ({ideaRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#29231E] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'addresses'
                ? 'bg-[#29231E] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#29231E] text-white shadow-xs'
                : 'bg-white text-[#77716A] border border-[#E7E1D9] hover:text-[#29231E]'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Account Details</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="bg-white rounded-3xl border border-[#E7E1D9] p-8 shadow-sm">
          {/* ── CUSTOM IDEAS & QUOTATIONS ── */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E1D9] gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#29231E]">
                    My Custom Design Submissions & Quotations
                  </h3>
                  <p className="text-xs text-[#77716A] mt-0.5">
                    Private records of your uploaded furniture photos, measurement visits, and itemized quotations from Charbhuja.
                  </p>
                </div>
                <Link
                  to="/upload-idea"
                  className="px-5 py-2.5 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload Another Idea</span>
                </Link>
              </div>

              {ideaRequests.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#77716A] space-y-3">
                  <Camera className="w-10 h-10 text-[#77716A] mx-auto stroke-1" />
                  <p className="font-medium text-[#29231E]">You haven't uploaded any custom furniture ideas yet.</p>
                  <p className="max-w-sm mx-auto">
                    Found an inspirational photo online? Upload it to get an estimated quote or schedule a free carpenter measurement visit.
                  </p>
                  <Link
                    to="/upload-idea"
                    className="mt-4 inline-block px-6 py-2.5 bg-[#29231E] text-white rounded-full text-xs font-semibold uppercase tracking-wider"
                  >
                    Upload Idea Photo
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {ideaRequests.map((req) => (
                    <div
                      key={req.requestId}
                      className="p-6 rounded-2xl bg-[#F8F6F2] border border-[#E7E1D9] flex flex-col md:flex-row items-start justify-between gap-6 text-xs"
                    >
                      {/* Left: Image & Specs */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-white border border-[#E7E1D9] shrink-0">
                          <img
                            src={req.imageUrl || '/assets/logo.png'}
                            alt={req.itemType}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-[#29231E] text-sm">
                              {req.itemType.toUpperCase()} — Ref #{req.requestId}
                            </span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                req.status === 'approved'
                                  ? 'bg-blue-100 text-blue-800'
                                  : req.status === 'quote_sent'
                                  ? 'bg-green-100 text-green-800'
                                  : req.status === 'visit_scheduled'
                                  ? 'bg-purple-100 text-purple-800'
                                  : req.status === 'in_production'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'cancelled'
                                  ? 'bg-gray-200 text-gray-700'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status.replace('_', ' ')}
                            </span>
                          </div>

                          <p className="text-[#29231E] leading-relaxed font-normal">
                            {req.description}
                          </p>

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[#77716A] text-[11px] pt-1">
                            {req.timberPreference && (
                              <span><strong>Timber:</strong> {req.timberPreference}</span>
                            )}
                            {req.roomDimensions && (
                              <span><strong>Dimensions:</strong> {req.roomDimensions}</span>
                            )}
                            <span><strong>Budget:</strong> {req.estimatedBudget}</span>
                          </div>

                          {/* Quotation Proposal Card */}
                          {req.quotedAmount && (
                            <div className="mt-3 p-3.5 bg-green-50 border border-green-200 rounded-2xl text-green-950 space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold uppercase tracking-wider text-[10px] text-green-800">
                                  Official Manufacturer Quotation
                                </span>
                                <span className="font-serif text-base font-bold text-green-900">
                                  {req.quotedAmount}
                                </span>
                              </div>
                              {req.internalNotes && (
                                <p className="text-[11px] text-green-800 leading-relaxed">
                                  <strong>Carpenter Specs:</strong> {req.internalNotes}
                                </p>
                              )}
                              {req.estimatedTimelineWeeks && (
                                <p className="text-[10px] text-green-800">
                                  <strong>Crafting Timeline:</strong> {req.estimatedTimelineWeeks} weeks
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex md:flex-col items-center sm:items-end gap-2.5 shrink-0 self-end md:self-center w-full md:w-auto">
                        {req.status === 'quote_sent' && (
                          <>
                            <button
                              onClick={() => handleAcceptQuote(req)}
                              className="flex-1 md:flex-initial px-5 py-2.5 bg-[#68452D] text-white rounded-xl font-semibold uppercase tracking-wider hover:bg-[#523724] transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                            >
                              <ShoppingBag className="w-4 h-4" />
                              <span>Accept & Order Piece</span>
                            </button>
                            <button
                              onClick={() => handleCancelRequest(req.requestId)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl font-medium"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {req.status === 'approved' && (
                          <div className="flex items-center gap-1.5 text-blue-700 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 font-semibold">
                            <Check className="w-4 h-4" />
                            <span>Quotation Approved & Added to Order</span>
                          </div>
                        )}

                        {req.status === 'submitted' && (
                          <span className="text-[11px] text-[#77716A] italic bg-white px-3 py-1.5 rounded-xl border border-[#E7E1D9]">
                            Under Artisan Review
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[#E7E1D9]">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#29231E]">Recent Orders</h3>
                  <p className="text-xs text-[#77716A] mt-0.5">
                    Track real-time workshop carpentry, crating, and white-glove site delivery.
                  </p>
                </div>
                <Link
                  to="/browse"
                  className="px-4 py-2 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors"
                >
                  Explore Catalogue
                </Link>
              </div>

              {orders.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#77716A] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F0ECE5] flex items-center justify-center mx-auto text-[#77716A]">
                    <Package className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p>No orders placed yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.orderId}
                      className="bg-[#F8F6F2] rounded-2xl border border-[#E7E1D9] p-6 space-y-4 text-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E7E1D9] gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[#29231E]">Order #{ord.orderNumber}</span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                ord.orderStatus === 'delivered'
                                  ? 'bg-green-100 text-green-800'
                                  : ord.orderStatus === 'dispatched'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ord.orderStatus === 'processing'
                                  ? 'bg-purple-100 text-purple-800'
                                  : ord.orderStatus === 'confirmed'
                                  ? 'bg-amber-100 text-amber-800'
                                  : ord.orderStatus === 'cancelled'
                                  ? 'bg-gray-200 text-gray-700'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {ord.orderStatus.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#77716A] mt-0.5">
                            Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="font-serif text-base font-bold text-[#68452D] tabular-nums block">
                            ₹{ord.totalAmount.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-[#77716A]">Manual / Pay on Delivery</span>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {ord.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-xl p-3 border border-[#E7E1D9] flex items-center gap-3"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-12 h-12 rounded-lg object-cover bg-[#F0ECE5] shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#F0ECE5] flex items-center justify-center shrink-0">
                                <Package className="w-5 h-5 text-[#77716A]" />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-[#29231E] truncate">{item.name}</p>
                              <p className="text-[11px] text-[#77716A]">Qty: {item.quantity} · ₹{item.unitPrice.toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-[#E7E1D9] gap-3">
                        <span className="text-[11px] text-[#77716A]">
                          Destination: {ord.deliveryAddress.streetAddress}, {ord.deliveryAddress.city}
                        </span>

                        <div className="flex items-center gap-3">
                          {ord.orderStatus === 'pending' && user && (
                            <button
                              type="button"
                              onClick={async () => {
                                if (confirm('Are you sure you want to cancel Order #' + ord.orderNumber + '?')) {
                                  await cancelOrder(ord.orderId, user.uid);
                                }
                              }}
                              className="text-xs text-red-600 hover:text-red-700 font-medium underline"
                            >
                              Cancel Order
                            </button>
                          )}
                          <Link
                            to={`/orders/${ord.orderId}`}
                            className="px-4 py-2 bg-white border border-[#E7E1D9] rounded-xl text-xs font-semibold text-[#29231E] hover:border-[#68452D] hover:text-[#68452D] transition-colors flex items-center gap-1.5 shadow-2xs"
                          >
                            <span>Track Workshop Progress</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── ADDRESSES ── */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E7E1D9] gap-3">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#29231E]">Delivery Address Book</h3>
                  <p className="text-xs text-[#77716A] mt-0.5">
                    Save and manage frequent residences, site locations, or client villas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingAddressId(null);
                    setAddressForm({
                      addressId: '',
                      fullName: user?.displayName || '',
                      phoneNumber: user?.phoneNumber || '',
                      streetAddress: '',
                      city: '',
                      state: '',
                      pinCode: '',
                      deliveryInstructions: '',
                      isDefault: addresses.length === 0,
                    });
                    setShowAddressModal(true);
                  }}
                  className="px-4 py-2 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors flex items-center gap-1.5 self-start sm:self-auto shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Address</span>
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="py-16 text-center text-xs text-[#77716A] space-y-3">
                  <div className="w-12 h-12 rounded-full bg-[#F0ECE5] flex items-center justify-center mx-auto text-[#77716A]">
                    <MapPin className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <p>No saved delivery addresses. Addresses used during checkout will automatically appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.addressId}
                      className={`p-5 rounded-2xl border text-xs space-y-2 relative transition-all ${
                        addr.isDefault
                          ? 'bg-[#F8F6F2] border-[#68452D] ring-1 ring-[#68452D]'
                          : 'bg-white border-[#E7E1D9]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#29231E]">{addr.fullName}</span>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#68452D] bg-[#F0ECE5] px-2.5 py-0.5 rounded-full">
                            Default Address
                          </span>
                        )}
                      </div>
                      <p className="text-[#77716A] leading-relaxed">{addr.streetAddress}</p>
                      <p className="text-[#77716A]">
                        {addr.city}, {addr.state} - {addr.pinCode}
                      </p>
                      <p className="text-[#29231E] font-medium pt-1">
                        Phone: {addr.phoneNumber}
                      </p>
                      {addr.deliveryInstructions && (
                        <p className="text-[11px] italic text-[#A17A58] bg-white p-2 rounded-lg border border-[#E7E1D9]/60">
                          "{addr.deliveryInstructions}"
                        </p>
                      )}

                      <div className="flex items-center gap-3 pt-3 border-t border-[#E7E1D9]">
                        {!addr.isDefault && (
                          <button
                            type="button"
                            onClick={() => setDefaultAddress(addr.addressId)}
                            className="text-xs font-semibold text-[#68452D] hover:underline"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingAddressId(addr.addressId);
                            setAddressForm({ ...addr });
                            setShowAddressModal(true);
                          }}
                          className="text-xs font-semibold text-[#29231E] hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Delete this delivery address?')) {
                              deleteAddress(addr.addressId);
                            }
                          }}
                          className="text-xs font-semibold text-red-600 hover:underline ml-auto"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeTab === 'settings' && (
            <div className="space-y-6 max-w-lg text-xs">
              <h3 className="font-serif text-xl font-bold text-[#29231E] border-b border-[#E7E1D9] pb-3">
                Client Profile Dossier
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block font-bold text-[#29231E] mb-1">Client Full Name</label>
                  <input
                    type="text"
                    readOnly
                    value={user?.displayName || ''}
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-[#29231E]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29231E] mb-1">Google Email Account</label>
                  <input
                    type="email"
                    readOnly
                    value={user?.email || ''}
                    className="w-full bg-[#F0ECE5] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-[#77716A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#29231E] mb-1">Account Role</label>
                  <input
                    type="text"
                    readOnly
                    value={user?.role === 'admin' ? 'Authorized Operations Administrator' : 'Verified Customer'}
                    className="w-full bg-[#F0ECE5] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-[#77716A]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Address Create / Edit Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E1D9] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#29231E]">
              {editingAddressId ? 'Edit Delivery Address' : 'New Delivery Address'}
            </h3>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await saveAddress({
                  ...addressForm,
                  addressId: editingAddressId || `addr_${Date.now()}`,
                });
                setShowAddressModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="font-bold text-[#29231E] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={addressForm.fullName}
                  onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2 text-[#29231E] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#29231E] block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={addressForm.phoneNumber}
                  onChange={(e) => setAddressForm({ ...addressForm, phoneNumber: e.target.value })}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2 text-[#29231E] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#29231E] block mb-1">Street Address & Landmark *</label>
                <input
                  type="text"
                  required
                  value={addressForm.streetAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, streetAddress: e.target.value })}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2 text-[#29231E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#29231E] block mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2 text-[#29231E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#29231E] block mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2 text-[#29231E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#29231E] block mb-1">PIN Code *</label>
                <input
                  type="text"
                  required
                  value={addressForm.pinCode}
                  onChange={(e) => setAddressForm({ ...addressForm, pinCode: e.target.value })}
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2 text-[#29231E] focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-[#29231E] block mb-1">Site Delivery Instructions</label>
                <input
                  type="text"
                  value={addressForm.deliveryInstructions || ''}
                  onChange={(e) => setAddressForm({ ...addressForm, deliveryInstructions: e.target.value })}
                  placeholder="e.g. Service lift available"
                  className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-3.5 py-2 text-[#29231E] focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 text-[#68452D] rounded-sm accent-[#68452D]"
                />
                <span>Set as default delivery address</span>
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#77716A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#68452D] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#523724]"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
