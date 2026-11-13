/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, CheckCircle2, Ruler, Shield, ArrowRight, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { submitCustomIdeaRequest, CustomIdeaSubmission } from '../../services/firebase/firestore';

export const BookVisitPage: React.FC = () => {
  const { user } = useAuthStore();
  const [customerName, setCustomerName] = useState(user?.displayName || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phoneNumber || '');
  const [visitAddress, setVisitAddress] = useState('');
  const [city, setCity] = useState('Jaipur');
  const [roomType, setRoomType] = useState('wardrobe');
  const [preferredDate, setPreferredDate] = useState('This Weekend');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerPhone.trim()) return;

    setIsSubmitting(true);
    try {
      const reqId = `VISIT-${Date.now().toString().slice(-6)}`;
      const submission: CustomIdeaSubmission = {
        requestId: reqId,
        userId: user?.uid || `guest_${Date.now()}`,
        customerName: customerName || 'Valued Client',
        customerPhone,
        customerEmail: user?.email || 'client@charbhuja.com',
        itemType: roomType,
        description: `Measurement visit booked for ${roomType}. Address: ${visitAddress}, ${city}. Preferred: ${preferredDate}. Notes: ${notes}`,
        estimatedBudget: 'On-site measurement',
        imageUrl: '/assets/logo.png',
        requestType: 'book_visit',
        visitAddress: `${visitAddress}, ${city}`,
        preferredVisitDate: preferredDate,
        status: 'submitted',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await submitCustomIdeaRequest(submission);
      setBookingConfirmed(reqId);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingConfirmed) {
    return (
      <div className="bg-[#F8F6F2] min-h-screen py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl border border-[#E7E1D9] p-8 shadow-sm space-y-6">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-700 flex items-center justify-center mx-auto border border-green-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#68452D]">
                Visit Requested
              </span>
              <h1 className="font-serif text-2xl font-bold text-[#29231E] mt-1">
                Booking #{bookingConfirmed}
              </h1>
              <p className="text-sm text-[#77716A] mt-2 leading-relaxed">
                Our carpenter will call you on <strong>{customerPhone}</strong> to confirm the exact visit time and bring wood samples.
              </p>
            </div>
            <Link
              to="/"
              className="inline-block w-full py-3 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724]"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8F6F2] min-h-screen py-12">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#68452D] bg-[#F0ECE5] px-3 py-1 rounded-full border border-[#E7E1D9]">
            Complimentary Measurement Visit
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#29231E]">
            Book a Carpenter Visit
          </h1>
          <p className="text-sm text-[#77716A]">
            We visit your home with timber samples, measure your space accurately, and give you an exact manufacturing quote.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E7E1D9] p-8 shadow-sm space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
              What do you want to manufacture? *
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
            >
              <option value="wardrobe">Custom Wardrobe / Walk-in Closet</option>
              <option value="sofa">Custom Living Room Sofa / Sectional</option>
              <option value="kitchen">Modular Kitchen Setup</option>
              <option value="bed">Custom Bed & Wall Paneling</option>
              <option value="full_home">Full Home Interior Woodwork</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                Your Name *
              </label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Sudhanshu Sharma"
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
              Home / Site Address *
            </label>
            <input
              type="text"
              required
              value={visitAddress}
              onChange={(e) => setVisitAddress(e.target.value)}
              placeholder="e.g. Flat 402, Civil Lines"
              className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                City *
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
                Preferred Date / Time
              </label>
              <input
                type="text"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                placeholder="e.g. Sunday 11 AM"
                className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1">
              Notes / Special Requests (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any specific wood preference, floor level, or architectural requirement..."
              className="w-full bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl p-3 text-xs text-[#29231E] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-[#68452D] text-white rounded-full text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? 'Booking Visit...' : 'Schedule Free Measurement Visit'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
