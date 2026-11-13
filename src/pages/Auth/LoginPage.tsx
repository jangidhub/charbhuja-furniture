/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, setDemoAdmin } = useAuthStore();

  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 7) {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setOtpSent(true);
      }, 700);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      useAuthStore.getState().setUser({
        uid: `phone_${Date.now()}`,
        displayName: 'Client',
        email: `${phoneNumber}@charbhuja.com`,
        phoneNumber: `${countryCode} ${phoneNumber}`,
        role: 'customer',
      });
      navigate('/account');
    }, 700);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val[0];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="bg-[#F8F6F2] min-h-screen flex items-center justify-center p-4">
      {/* Back button */}
      <Link
        to="/"
        className="fixed top-6 left-6 w-10 h-10 rounded-full bg-white border border-[#E7E1D9] flex items-center justify-center text-[#29231E] hover:bg-[#F0ECE5] shadow-xs transition-transform hover:scale-105"
        aria-label="Back to storefront"
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="w-full max-w-md bg-white border border-[#E7E1D9] rounded-3xl p-8 sm:p-10 shadow-lg">
        {/* Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <img src="/assets/logo.png" alt="Charbhuja" className="h-14 w-auto mb-3" />
          <h1 className="font-serif text-2xl font-bold text-[#29231E]">Welcome to Charbhuja</h1>
          <p className="text-xs text-[#77716A] mt-1">Sign in to track orders, project spaces, and custom designs</p>
        </div>

        {/* Social / Direct Sign-in */}
        <div className="space-y-3 mb-6">
          <button
            onClick={async () => {
              try {
                await signInWithGoogle();
                navigate('/account');
              } catch (err: any) {
                console.error(err);
              }
            }}
            className="w-full py-3 px-4 rounded-xl border border-[#E7E1D9] bg-white hover:bg-[#F8F6F2] text-xs font-semibold text-[#29231E] transition-all flex items-center justify-center gap-3 shadow-2xs"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.3 30.1 0 24 0 14.8 0 7 5.4 3 13.3l7.8 6C13 13.5 18 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4 7.1-10 7.1-17z"/>
              <path fill="#FBBC05" d="M10.8 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7L2.5 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.5 10.6l8.3-5.9z"/>
              <path fill="#34A853" d="M24 48c6.1 0 11.3-2 15-5.5l-7.5-5.8c-2 1.4-4.6 2.3-7.5 2.3-6 0-11-4-12.8-9.4l-8 6.1C7 43.5 15 48 24 48z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Staff Administrator Portal Entrance */}
          <button
            onClick={() => {
              setDemoAdmin();
              navigate('/admin');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#68452D] hover:bg-[#523724] text-xs font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Staff Administrator (sudhanshujangid143@gmail.com)</span>
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-[#E7E1D9] flex-1" />
          <span className="text-[11px] text-[#77716A] uppercase tracking-wider">or mobile OTP</span>
          <div className="h-px bg-[#E7E1D9] flex-1" />
        </div>

        {/* Mobile Number Flow */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#29231E] block mb-1.5">
                Mobile Number
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-2.5 py-2.5 text-xs text-[#29231E] focus:outline-none"
                >
                  <option value="+91">🇮🇳 +91</option>
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+44">🇬🇧 +44</option>
                  <option value="+971">🇦🇪 +971</option>
                </select>
                <input
                  type="tel"
                  required
                  placeholder="98765 43210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-1 bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl px-4 py-2.5 text-xs text-[#29231E] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || phoneNumber.length < 7}
              className="w-full py-3 bg-[#29231E] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#68452D] transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-xs text-[#77716A] text-center">
              Enter the 6-digit verification code sent to <br />
              <strong className="text-[#29231E]">{countryCode} {phoneNumber}</strong>
            </p>

            <div className="flex justify-center gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  className="w-10 h-12 text-center font-bold text-base bg-[#F8F6F2] border border-[#E7E1D9] rounded-xl text-[#29231E] focus:outline-none focus:border-[#68452D]"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#68452D] text-white rounded-xl text-xs font-semibold uppercase tracking-wider hover:bg-[#523724] transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>

            <button
              type="button"
              onClick={() => setOtpSent(false)}
              className="w-full text-center text-xs text-[#77716A] hover:text-[#29231E]"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
