'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, Loader2, ArrowLeft, MessageCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function OtpVerificationModal({ isOpen, onClose, onSuccess, onBack, phone }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  // Resend Timer
  useEffect(() => {
    if (isOpen && resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, resendTimer]);

  // Focus first input on modal open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleOtpChange = (index, value) => {
    // Handle paste of 6 digits
    if (value.length === 6 && /^\d{6}$/.test(value)) {
      const digits = value.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      setTimeout(() => handleSubmit(value), 100);
      return;
    }

    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (newOtp.every(d => d !== '') && index === 5) {
      setTimeout(() => handleSubmit(newOtp.join('')), 100);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split('').forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastIndex]?.focus();

    if (pastedData.length === 6) {
      setTimeout(() => handleSubmit(pastedData), 100);
    }
  };

  const handleSubmit = async (otpValue = null) => {
    const otpCode = otpValue || otp.join('');

    if (otpCode.length !== 6) {
      setError('Please enter complete OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.auth.verifyOtp(phone, otpCode);

      if (response && response.user) {
        const customer = response.user;
        if (customer.name && customer.name.trim() !== '' && customer.name !== 'null') {
          onSuccess({ user: customer, requiresProfile: false });
        } else {
          onSuccess({ user: customer, requiresProfile: true });
        }
      } else {
        setError(response.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('OTP verification failed. Please try again.');
      console.error('OTP verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setIsResending(true);
    setError('');

    try {
      await api.auth.authenticateCustomer(phone);
      setResendTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Logo Circle */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="w-24 h-24 rounded-full border-4 border-[#FF5533] flex items-center justify-center bg-white shadow-lg">
            <span className="text-4xl font-bold text-[#FF5533]" style={{ fontFamily: 'Arial, sans-serif' }}>
              <Image
                src="/assets/images/anginarbazar_logo.png"
                alt="Logo"
                width={54}
                height={24}
              />
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Verify OTP</h2>
          <p className="text-center text-gray-600 text-sm mb-6">
            Enter the 6-digit code sent to<br />
            <span className="font-semibold text-gray-800">+88 {phone}</span>
          </p>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* OTP Inputs */}
          <div className="flex gap-2 justify-center mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={index === 0 ? 6 : 1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={loading}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 rounded-lg focus:border-[#FF5533] focus:outline-none transition-colors disabled:bg-gray-50"
              />
            ))}
          </div>

          {/* Verify Button */}
          <button
            onClick={() => handleSubmit()}
            disabled={loading || otp.some(d => !d)}
            className="w-full bg-[#FF5533] text-white py-3 rounded-lg font-semibold hover:bg-[#e64e27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} /> Verifying...
              </>
            ) : (
              'Verify OTP'
            )}
          </button>

          {/* Resend OTP */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResendOtp}
                disabled={isResending}
                className="text-sm font-semibold text-[#FF5533] hover:text-[#e64e27] transition-colors disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend OTP'}
              </button>
            ) : (
              <p className="text-sm text-gray-500">
                Resend OTP in <span className="font-semibold text-[#FF5533]">{resendTimer}s</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>
    </div>
  );
}
