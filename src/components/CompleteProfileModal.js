'use client';

import { useState } from 'react';
import { X, Loader2, ArrowLeft, User, MapPin, Info } from 'lucide-react';
import { api } from '@/lib/api';

export default function CompleteProfileModal({ isOpen, onClose, onSuccess, onBack, phone }) {
  const [name, setName] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fixed location data matching your app
  const locationData = {
    division: { id: 1, name: 'Chattagram', bn_name: 'চট্টগ্রাম' },
    district: { id: 6, name: 'Chandpur', bn_name: 'চাঁদপুর' },
    upazila: { id: 58, name: 'Matlab North', bn_name: 'মতলব উত্তর' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!streetAddress.trim()) {
      setError('Please enter delivery address');
      return;
    }

    setLoading(true);

    try {
      const response = await api.auth.initProfile({
        name: name.trim(),
        street_address: streetAddress.trim(),
        division_id: locationData.division.id,
        district_id: locationData.district.id,
        upazila_id: locationData.upazila.id,
      });
      
      // Check for success and user object
      if (response && response.user) {
        // Update user data with phone
        const updatedUser = {
          ...response.user,
          phone: phone,
        };
        onSuccess({ user: updatedUser });
      } else {
        setError(response.message || 'Failed to complete profile');
      }
    } catch (err) {
      setError('Failed to complete profile. Please try again.');
      console.error('Profile completion error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal - Scrollable */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-slideUp">
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
          <div className="w-20 h-20 bg-[#FF5533] rounded-full flex items-center justify-center shadow-lg">
            <User size={40} color="#fff" />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          {/* Title */}
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            Complete Your Profile
          </h2>
          
          <p className="text-center text-gray-600 mb-6">
            Help us serve you better
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#FF5533] focus:outline-none transition-colors disabled:bg-gray-100 text-gray-800"
                />
              </div>
            </div>

            {/* Service Area Info */}
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
              <div className="flex items-start gap-2 mb-2">
                <Info size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-800 font-semibold text-sm mb-1">
                    Service Area
                  </p>
                  <p className="text-gray-600 text-sm">
                    Currently serving: {locationData.district.name} - {locationData.upazila.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Address Input */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Delivery Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-4 pointer-events-none">
                  <MapPin size={20} className="text-gray-400" />
                </div>
                <textarea
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="House/Flat number, Street, Area"
                  disabled={loading}
                  rows={3}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#FF5533] focus:outline-none transition-colors disabled:bg-gray-100 text-gray-800 resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5533] text-white py-4 rounded-xl font-semibold hover:bg-[#e64e27] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                'Save & Continue'
              )}
            </button>
          </form>

          {/* Info Text */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By continuing, you agree to our{' '}
            <span className="text-[#FF5533]">Terms of Service</span> and{' '}
            <span className="text-[#FF5533]">Privacy Policy</span>
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}