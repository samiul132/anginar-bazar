'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Phone, 
  Mail, 
  ShoppingBag,
  LayoutDashboard, 
  LogOut, 
  ChevronRight,
  Loader2,
  Edit2,
  Trash2
} from 'lucide-react';
import { api, storage } from '@/lib/api';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [ordersCount, setOrdersCount] = useState(0);

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
        await fetchProfileData();
      } else {
        setIsAuthenticated(false);
        router.push('/');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      const ordersResponse = await api.orders.getMyOrders(1);
      if (ordersResponse.success) {
        setOrdersCount(ordersResponse.total || 0);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      storage.clearAuthData();
      window.dispatchEvent(new Event('authStateChanged'));
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const menuItems = [
    {
      icon: Edit2,
      title: 'Edit Profile',
      description: 'Update your personal information',
      color: '#059669',
      bgColor: 'bg-green-100',
      route: '/edit-profile',
    },
    {
      icon: ShoppingBag,
      title: 'Order History',
      description: 'Track and view your orders',
      color: '#7c3aed',
      bgColor: 'bg-purple-100',
      route: '/my-orders',
      badge: ordersCount > 0 ? ordersCount : null,
    },
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'View your dashboard',
      color: '#059669',
      bgColor: 'bg-green-100',
      route: '/dashboard',
    },
    {
      icon: Trash2,
      title: 'Delete Account',
      description: 'Delete your account permanently',
      color: '#ef4444',
      bgColor: 'bg-red-100',
      route: '/delete-account',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Back Button - Mobile */}
      <div className="md:hidden bg-white shadow-sm p-4 flex items-center gap-4 sticky top-0 z-40">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 text-gray-800 rounded-full transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-br from-[#FF5533] to-[#e64e27] rounded-2xl overflow-hidden shadow-xl mb-6">
          <div className="p-6 md:p-8 text-white text-center">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 md:w-28 md:h-28 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg mb-4">
                <span className="text-4xl md:text-5xl font-bold">
                  {customerData?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {customerData?.name || 'Guest User'}
              </h2>
              <p className="text-white/90 text-sm md:text-base">
                {customerData?.phone ? `+88 ${customerData.phone}` : 'No phone'}
              </p>
              {customerData?.email && (
                <p className="text-white/80 text-xs md:text-sm mt-2 flex items-center gap-1">
                  <Mail size={14} />
                  {customerData.email}
                </p>
              )}
            </div>

            {/* Stats */}
            <Link href="/my-orders"> 
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-xs mx-auto">
                <p className="text-3xl font-bold mb-1">{ordersCount}</p>
                <p className="text-white/90 text-sm">Total Orders</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Account Details Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User size={24} className="text-[#FF5533]" />
            Account Details
          </h3>

          <div className="space-y-4">
            {/* Name */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Full Name</p>
                <p className="font-semibold text-gray-900">{customerData?.name || 'N/A'}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Phone size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                <p className="font-semibold text-gray-900">
                  {customerData?.phone ? `+88 ${customerData.phone}` : 'N/A'}
                </p>
              </div>
            </div>

            {/* Email */}
            {customerData?.email && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Mail size={20} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <p className="font-semibold text-gray-900">{customerData.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={index}
                href={item.route}
                className="block bg-white rounded-xl p-4 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <IconComponent size={22} style={{ color: item.color }} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-[#FF5533] transition-colors">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <span className="bg-[#FF5533] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight 
                      size={20} 
                      className="text-gray-400 group-hover:text-[#FF5533] group-hover:translate-x-1 transition-all" 
                    />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full bg-white border-2 border-red-200 rounded-xl p-4 hover:bg-red-50 hover:border-red-300 transition-all duration-300 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <LogOut size={22} className="text-red-600" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-red-600">Logout</p>
                  <p className="text-sm text-red-500">Sign out from your account</p>
                </div>
              </div>
              <ChevronRight 
                size={20} 
                className="text-red-400 group-hover:translate-x-1 transition-transform" 
              />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}