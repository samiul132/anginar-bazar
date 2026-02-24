'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  Trash2, 
  AlertTriangle,
  Loader2,
  ShieldAlert,
  XCircle,
  Database,
  MapPin,
  ShoppingBag,
  User,
  LogIn
} from 'lucide-react';
import Swal from 'sweetalert2';
import { api, storage } from '@/lib/api';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = storage.getAuthToken();
      const customer = storage.getCustomerData();

      if (token && customer) {
        setIsAuthenticated(true);
        setCustomerData(customer);
      } else {
        setIsAuthenticated(false);
        setCustomerData(null);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setCustomerData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginRequest = () => {
    // Trigger login modal from ClientLayout
    window.dispatchEvent(new CustomEvent('openLoginModal'));
  };

  const handleDeleteAccount = async () => {
    // If not authenticated, show login prompt
    if (!isAuthenticated) {
      await Swal.fire({
        title: 'Login Required',
        text: 'You need to login to delete your account.',
        icon: 'info',
        confirmButtonColor: '#FF5533',
        confirmButtonText: 'Login Now',
      });
      handleLoginRequest();
      return;
    }

    const result = await Swal.fire({
      title: 'Are you absolutely sure?',
      html: `
        <div style="text-align: left; padding: 10px;">
          <p style="margin-bottom: 15px; color: #374151; font-size: 15px;">
            This action will <strong>permanently delete</strong> your account and all associated data:
          </p>
          <ul style="color: #6b7280; font-size: 14px; line-height: 1.8; list-style: none; padding-left: 0;">
            <li style="margin-bottom: 8px;">
              <span style="color: #ef4444; font-weight: bold;">✗</span> Personal information
            </li>
            <li style="margin-bottom: 8px;">
              <span style="color: #ef4444; font-weight: bold;">✗</span> Delivery addresses
            </li>
            <li style="margin-bottom: 8px;">
              <span style="color: #ef4444; font-weight: bold;">✗</span> Order history
            </li>
            <li style="margin-bottom: 8px;">
              <span style="color: #ef4444; font-weight: bold;">✗</span> All saved preferences
            </li>
          </ul>
          <p style="margin-top: 15px; color: #dc2626; font-weight: 600; font-size: 14px;">
            ⚠️ This action cannot be undone!
          </p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Delete My Account',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      width: '500px',
      padding: '2em',
    });

    if (result.isConfirmed) {
      setDeleting(true);
      
      try {
        console.log('Initiating account deletion...');
        
        const response = await api.auth.deleteAccount();
        
        console.log('Delete account response:', response);
        
        // Check if deletion was successful
        if (response.success || response.message) {
          
          // IMMEDIATELY clear all auth data BEFORE showing success message
          storage.clearAuthData();
          
          // Remove any cached data from localStorage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('customer');
            localStorage.removeItem('auth_token');
            sessionStorage.clear();
          }
          
          // Update local state immediately
          setIsAuthenticated(false);
          setCustomerData(null);
          
          // Dispatch event to update auth state across the app (Header, BottomNav, etc.)
          window.dispatchEvent(new Event('authStateChanged'));
          
          // Show success message
          await Swal.fire({
            title: 'Account Deleted Successfully!',
            text: 'Your account has been permanently deleted. Redirecting to homepage...',
            icon: 'success',
            confirmButtonColor: '#059669',
            confirmButtonText: 'OK',
            timer: 2500,
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
          });

          // Force immediate redirect to homepage with page reload
          window.location.href = '/';
          
        } else {
          throw new Error(response.message || 'Failed to delete account');
        }
      } catch (error) {
        console.error('Delete account error:', error);
        
        // Check if error is due to already deleted account (Unauthenticated)
        if (error.message === 'Unauthenticated.' || 
            error.response?.status === 401 ||
            error.message?.includes('Unauthenticated')) {
          
          // Account was already deleted, just logout and redirect
          storage.clearAuthData();
          
          if (typeof window !== 'undefined') {
            localStorage.removeItem('customer');
            localStorage.removeItem('auth_token');
            sessionStorage.clear();
          }
          
          window.dispatchEvent(new Event('authStateChanged'));
          
          await Swal.fire({
            title: 'Logged Out',
            text: 'Your session has expired. Redirecting to homepage...',
            icon: 'info',
            confirmButtonColor: '#059669',
            timer: 2000,
            timerProgressBar: true,
            allowOutsideClick: false,
          });
          
          window.location.href = '/';
          return;
        }
        
        // Show error for other types of errors
        let errorMessage = 'Failed to delete account. Please try again.';
        
        if (error.response) {
          errorMessage = error.response.data?.message || error.response.data?.error || errorMessage;
        } else if (error.message && error.message !== 'Unauthenticated.') {
          errorMessage = error.message;
        }
        
        await Swal.fire({
          title: 'Error!',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#ef4444',
          confirmButtonText: 'OK',
        });
      } finally {
        setDeleting(false);
      }
    }
  };

  useEffect(() => {
    // Listen for auth state changes
    const handleAuthChange = () => {
      checkAuthentication();
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin" />
      </div>
    );
  }

  const dataItems = [
    {
      icon: User,
      title: 'Personal Information',
      description: 'Your name, phone number, and email',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: MapPin,
      title: 'Delivery Addresses',
      description: 'All saved delivery addresses',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: ShoppingBag,
      title: 'Order History',
      description: 'Past orders and transaction records',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: Database,
      title: 'Saved Preferences',
      description: 'App settings and preferences',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Delete Account
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Warning Banner */}
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-red-900 mb-2">
                Warning: Permanent Action
              </h2>
              <p className="text-red-700 leading-relaxed">
                Deleting your account is a permanent action that cannot be undone. 
                All your data will be permanently removed from our servers.
              </p>
            </div>
          </div>
        </div>

        {/* Guest User Notice */}
        {/* {!isAuthenticated && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <LogIn className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-blue-900 mb-2">
                  Login Required
                </h2>
                <p className="text-blue-700 leading-relaxed mb-4">
                  You need to login to delete your account. Please login with your phone number to proceed.
                </p>
                <button
                  onClick={handleLoginRequest}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <LogIn size={18} />
                  Login Now
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Account Info Card - Only show if authenticated */}
        {isAuthenticated && customerData && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF5533] to-[#e64e27] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {customerData?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {customerData?.name || 'User'}
                </h3>
                <p className="text-gray-600">
                  {customerData?.phone ? `+88 ${customerData.phone}` : 'No phone'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Data to be Deleted */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <ShieldAlert className="w-6 h-6 text-red-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Data That Will Be Deleted
            </h3>
          </div>

          <div className="space-y-4">
            {dataItems.map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
                >
                  <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <IconComponent className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Before You Proceed
          </h3>
          <ul className="space-y-2 text-amber-800 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold mt-0.5">•</span>
              <span>Make sure you have no pending orders or unresolved issues</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold mt-0.5">•</span>
              <span>Download any important order history or invoices you need</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold mt-0.5">•</span>
              <span>This action cannot be reversed - your data will be permanently deleted</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-600 font-bold mt-0.5">•</span>
              <span>You will need to create a new account to use our services again</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Deleting Account...
              </>
            ) : !isAuthenticated ? (
              <>
                <LogIn className="w-5 h-5" />
                Delete Account
              </>
            ) : (
              <>
                <Trash2 className="w-5 h-5" />
                Delete My Account Permanently
              </>
            )}
          </button>

          <button
            onClick={() => router.back()}
            disabled={deleting}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-xl font-bold transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Support Link */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Need help? Contact our support team</p>
          <a href="mailto:anginarbazar@gmail.com" className="text-[#FF5533] hover:underline">
            anginarbazar@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}