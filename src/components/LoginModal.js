'use client';

import { useState } from 'react';
import { X, Loader2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { api } from '@/lib/api';

export default function LoginModal({ isOpen, onClose, onSuccess }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (phone.length < 10 || phone.length > 11 || !phone.startsWith('0')) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      await api.auth.authenticateCustomer(phone);
      onSuccess({ phone, step: 'otp' });
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    console.log('Google Sign In clicked');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Logo Circle */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="w-24 h-24 rounded-full border-4 border-[#FF5533] flex items-center justify-center bg-white shadow-lg">
            <span className="text-4xl font-bold text-[#FF5533]" style={{ fontFamily: 'Arial, sans-serif' }}>
              <Image
                  src="/assets/images/anginarbazar_logo.png"
                  alt="BD"
                  width={54}
                  height={24}
                  className="rounded-sm"
                />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
            Welcome
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Enter your phone number to continue
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Phone Input Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#FF5533] transition-colors w-full">

              {/* Flag */}
              <div className="flex items-center gap-2 px-3 py-3 border-r border-gray-200 bg-gray-50 flex-shrink-0">

                <Image
                  src="/assets/images/bd-flag.png"
                  alt="BD"
                  width={24}
                  height={18}
                  className="rounded-sm w-6 h-auto"
                />

                <span className="text-sm font-medium text-gray-700">
                  +88
                </span>

              </div>

              {/* Input */}
              <input
                type="tel"
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 11) {
                    setPhone(value);
                  }
                }}
                className="flex-1 min-w-0 px-4 py-3 text-gray-700 placeholder-gray-400 focus:outline-none"
                disabled={loading}
              />

            </div>

            {/* Submit Button */}
            <button
            type="submit"
            disabled={loading || phone.length !== 11}
            className="w-full bg-[#FF5533] text-white py-3 rounded-lg font-semibold hover:bg-[#e64e27] transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </form>

          {/* Divider */}
          {/* <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-500">or, sign in with</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div> */}

          {/* Google Sign In Button */}
          {/* <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="font-medium text-gray-700">Sign in</span>
          </button> */}
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
