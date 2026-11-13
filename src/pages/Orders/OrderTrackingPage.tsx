/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  CheckCircle2,
  Hammer,
  Truck,
  PackageCheck,
  AlertCircle,
  ArrowLeft,
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  XCircle,
} from 'lucide-react';
import { getOrderById, subscribeOrderById, cancelOrder } from '../../services/firebase/firestore';
import { useAuthStore } from '../../store/useAuthStore';
import { Order, OrderStatus } from '../../types';

const STATUS_STEPS: Array<{
  status: OrderStatus;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    status: 'pending',
    label: 'Order Registered',
    description: 'Awaiting manual factory verification & polish confirmation',
    icon: Clock,
  },
  {
    status: 'confirmed',
    label: 'Order Confirmed',
    description: 'Specifications verified & seasoned timber allocated',
    icon: CheckCircle2,
  },
  {
    status: 'processing',
    label: 'In Workshop',
    description: 'Hand joinery, carpentry, sanding & polish in progress',
    icon: Hammer,
  },
  {
    status: 'dispatched',
    label: 'Dispatched',
    description: 'Protective wooden crating & en route with white-glove team',
    icon: Truck,
  },
  {
    status: 'delivered',
    label: 'Delivered & Assembled',
    description: 'On-site room placement & customer inspection complete',
    icon: PackageCheck,
  },
];

export const OrderTrackingPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuthStore();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const unsub = subscribeOrderById(orderId, (data) => {
      setOrder(data);
      setLoading(false);
    });

    return () => unsub();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (!order || !user) return;
    setCancelling(true);
    try {
      await cancelOrder(order.orderId, user.uid, cancelReason || 'Customer requested cancellation.');
      setShowCancelModal(false);
    } catch (err: any) {
      alert('Could not cancel order: ' + (err.message || 'Unknown error'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#F8F6F2] min-h-screen py-24 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#68452D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#77716A]">Loading Order Dossier...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#F8F6F2] min-h-screen py-24">
        <div className="max-w-md mx-auto text-center px-4 space-y-4">
          <AlertCircle className="w-12 h-12 text-[#A17A58] mx-auto" />
          <h1 className="font-serif text-2xl font-bold text-[#29231E]">Order Not Found</h1>
          <p className="text-xs text-[#77716A] leading-relaxed">
            We could not find an active order matching ID <strong>{orderId}</strong>. Please check your reference code or log in to view your orders.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              to="/account"
              className="px-6 py-2.5 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider"
            >
              My Account
            </Link>
            <Link
              to="/browse"
              className="px-6 py-2.5 bg-white border border-[#E7E1D9] text-[#29231E] rounded-full text-xs font-semibold uppercase tracking-wider"
            >
              Explore Catalogue
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'cancelled';
  const currentStepIndex = STATUS_STEPS.findIndex((s) => s.status === order.orderStatus);

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E7E1D9] mb-8">
          <Link
            to="/account"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#77716A] hover:text-[#29231E] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Orders</span>
          </Link>

          <div className="flex items-center gap-3 text-xs">
            <a
              href="tel:+919876543210"
              className="px-3 py-1.5 bg-white border border-[#E7E1D9] rounded-full text-[#29231E] hover:border-[#68452D] transition-colors flex items-center gap-1.5 font-medium shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#68452D]" />
              <span>Workshop Desk</span>
            </a>
            <a
              href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello Charbhuja Furniture, I am inquiring about my Order #${order.orderNumber}`)}`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-[#25D366] text-white rounded-full font-medium hover:bg-[#20ba5a] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Order Header Card */}
        <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#68452D] text-white px-2.5 py-0.5 rounded-full">
                  Furniture Manufacturing Order
                </span>
                <span className="text-xs text-[#77716A]">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#29231E] mt-1.5">
                Order #{order.orderNumber}
              </h1>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-[#77716A] block">Total Amount Due</span>
              <span className="font-serif text-2xl font-bold text-[#68452D] tabular-nums">
                ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-[#A17A58] block mt-0.5">
                Payment: Manual / Pay on Delivery
              </span>
            </div>
          </div>

          {/* Cancellation Banner if cancelled */}
          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-3 text-xs text-red-800">
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-semibold">Order Cancelled</strong>
                <p className="mt-0.5 text-red-700">
                  This order was revoked. If you wish to re-order this piece or make modifications, please visit our catalogue or contact our workshop team.
                </p>
              </div>
            </div>
          ) : (
            /* Visual Progress Stepper */
            <div className="pt-4 border-t border-[#E7E1D9]">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {STATUS_STEPS.map((step, idx) => {
                  const Icon = step.icon;
                  const isDone = currentStepIndex > idx;
                  const isCurrent = currentStepIndex === idx;

                  return (
                    <div
                      key={step.status}
                      className={`relative p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-[#F8F6F2] border-[#68452D] shadow-xs ring-1 ring-[#68452D]'
                          : isDone
                          ? 'bg-white border-[#E7E1D9]'
                          : 'bg-white/50 border-[#E7E1D9]/60 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                            isDone
                              ? 'bg-green-700 text-white'
                              : isCurrent
                              ? 'bg-[#68452D] text-white'
                              : 'bg-[#F0ECE5] text-[#77716A]'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#77716A]">
                          Step {idx + 1}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-[#29231E] leading-snug">{step.label}</h4>
                      <p className="text-[11px] text-[#77716A] mt-1 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancel Order Action if still pending */}
          {!isCancelled && order.orderStatus === 'pending' && user && user.uid === order.userId && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="text-xs text-red-600 hover:text-red-700 font-medium underline"
              >
                Cancel this Order
              </button>
            </div>
          )}
        </div>

        {/* Two Column Layout: Items + Delivery Address */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Ordered Pieces Snapshot */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#29231E] border-b border-[#E7E1D9] pb-3">
              Crafted Pieces ({order.items.length})
            </h2>

            <div className="divide-y divide-[#E7E1D9]">
              {order.items.map((item, index) => (
                <div key={index} className="py-4 flex gap-4 text-xs">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-xl object-cover bg-[#F0ECE5] shrink-0 border border-[#E7E1D9]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-[#F0ECE5] flex items-center justify-center shrink-0 border border-[#E7E1D9] text-[#77716A]">
                      <Hammer className="w-6 h-6 stroke-[1.5]" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm text-[#29231E] truncate">{item.name}</h4>
                        <span className="font-semibold text-sm text-[#29231E] tabular-nums shrink-0">
                          ₹{item.totalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#77716A] mt-1 space-y-0.5">
                        <p>Quantity: <strong className="text-[#29231E]">{item.quantity}</strong> (₹{item.unitPrice.toLocaleString('en-IN')} each)</p>
                        {item.selectedFinish && <p>Finish: <strong className="text-[#29231E]">{item.selectedFinish}</strong></p>}
                        {item.selectedMaterial && <p>Timber: <strong className="text-[#29231E]">{item.selectedMaterial}</strong></p>}
                        {item.dimensions && (
                          <p>
                            Dimensions: {item.dimensions.width} × {item.dimensions.depth} × {item.dimensions.height} {item.dimensions.unit}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="pt-4 border-t border-[#E7E1D9] space-y-2 text-xs text-[#77716A]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-[#29231E] tabular-nums">
                  ₹{order.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span>White Glove Transport & Delivery</span>
                <span>
                  {order.deliveryCharge === 0 ? (
                    <span className="text-green-700 font-medium">Free</span>
                  ) : (
                    `₹${order.deliveryCharge.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-[#E7E1D9] flex justify-between text-base font-bold text-[#29231E]">
                <span>Total Amount Due</span>
                <span className="font-serif text-lg text-[#68452D] tabular-nums">
                  ₹{order.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Delivery Details & Workshop History */}
          <div className="lg:col-span-5 space-y-8">
            {/* Delivery Destination */}
            <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-[#E7E1D9] pb-3">
                <MapPin className="w-4 h-4 text-[#68452D]" />
                <h3 className="font-serif text-base font-bold text-[#29231E]">Delivery Destination</h3>
              </div>

              <div className="space-y-1 text-[#29231E]">
                <p className="font-bold text-sm">{order.deliveryAddress.fullName || order.customerSnapshot.name}</p>
                <p className="text-[#77716A]">{order.deliveryAddress.streetAddress}</p>
                <p className="text-[#77716A]">
                  {order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.pinCode}
                </p>
                <p className="text-[#77716A] pt-1">
                  Contact: <strong>{order.deliveryAddress.phoneNumber || order.customerSnapshot.phoneNumber}</strong>
                </p>
                {order.deliveryAddress.deliveryInstructions && (
                  <p className="pt-2 text-[11px] italic text-[#A17A58] bg-[#F8F6F2] p-2.5 rounded-xl border border-[#E7E1D9]/60">
                    "{order.deliveryAddress.deliveryInstructions}"
                  </p>
                )}
              </div>
            </div>

            {/* Workshop Progress Log */}
            <div className="bg-white rounded-3xl border border-[#E7E1D9] p-6 sm:p-8 shadow-sm space-y-4 text-xs">
              <div className="flex items-center gap-2 border-b border-[#E7E1D9] pb-3">
                <Calendar className="w-4 h-4 text-[#68452D]" />
                <h3 className="font-serif text-base font-bold text-[#29231E]">Workshop Timeline</h3>
              </div>

              <div className="space-y-4">
                {order.statusHistory && order.statusHistory.length > 0 ? (
                  order.statusHistory.map((item, idx) => (
                    <div key={idx} className="flex gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#68452D] mt-1.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold uppercase tracking-wider text-[10px] text-[#29231E]">
                            {item.status}
                          </span>
                          <span className="text-[10px] text-[#77716A]">
                            {new Date(item.timestamp).toLocaleString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-[#77716A] mt-0.5 leading-relaxed">{item.note}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#77716A]">Order registered in workshop queue.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E7E1D9] max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#29231E]">Cancel Order #{order.orderNumber}?</h3>
            <p className="text-xs text-[#77716A] leading-relaxed">
              Are you sure you want to cancel this order? Since manufacturing has not yet commenced, you can cancel immediately.
            </p>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                Reason for Cancellation (Optional)
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Need to change room dimensions or wood finish..."
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl p-3 text-xs text-[#29231E] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-xs font-semibold text-[#77716A]"
              >
                Keep Order
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={handleCancelOrder}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
