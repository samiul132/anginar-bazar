'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Package, Calendar, ShoppingBag, Loader2, Receipt } from 'lucide-react';
import Link from 'next/link';
import { api, storage } from '@/lib/api';
import AuthenticationManager from '@/components/AuthenticationManager';

export default function MyOrdersPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // State
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  
  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const isLoadingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    checkAuthAndLoadOrders();
  }, []);

  const checkAuthAndLoadOrders = async () => {
    try {
      const token = storage.getAuthToken();
      if (token) {
        setIsAuthenticated(true);
        await fetchOrders(1, true);
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const fetchOrders = async (page = 1, isInitial = false) => {
    if (isLoadingRef.current) return;
    if (!isInitial && page > lastPage) return;

    try {
      isLoadingRef.current = true;

      if (isInitial) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.orders.getMyOrders(page);

      if (response.success) {
        if (isInitial) {
          setOrders(response.data);
          setCurrentPage(response.current_page || 1);
          setLastPage(response.last_page || 1);
        } else {
          setOrders((prev) => [...prev, ...response.data]);
          setCurrentPage(response.current_page || 1);
          setLastPage(response.last_page || 1);
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
      isLoadingRef.current = false;
    }
  };

  const handleLoadMore = () => {
    const hasMorePages = currentPage < lastPage;
    if (!isLoadingRef.current && !loadingMore && hasMorePages) {
      fetchOrders(currentPage + 1, false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrders(1, true);
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleAuthSuccess = async (userData) => {
    console.log('User authenticated:', userData);
    setIsLoginModalOpen(false);
    setIsAuthenticated(true);
    
    // Dispatch auth change event
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Reload orders after successful login
    await checkAuthAndLoadOrders();
  };

  const getStatusColor = (status) => {
    if (!status) return 'text-gray-600';

    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered') || statusLower.includes('complete')) {
      return 'text-green-600';
    } else if (statusLower.includes('processing') || statusLower.includes('pending')) {
      return 'text-orange-600';
    } else if (statusLower.includes('shipped') || statusLower.includes('on the way')) {
      return 'text-blue-600';
    } else if (statusLower.includes('cancelled')) {
      return 'text-red-600';
    }
    return 'text-gray-600';
  };

  const getStatusBgColor = (status) => {
    if (!status) return 'bg-gray-100';

    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered') || statusLower.includes('complete')) {
      return 'bg-green-100';
    } else if (statusLower.includes('processing') || statusLower.includes('pending')) {
      return 'bg-orange-100';
    } else if (statusLower.includes('shipped') || statusLower.includes('on the way')) {
      return 'bg-blue-100';
    } else if (statusLower.includes('cancelled')) {
      return 'bg-red-100';
    }
    return 'bg-gray-100';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center text-gray-800 gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer">
                <ChevronLeft size={24} />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Orders</h1>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Header */}
          <div className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 py-3">
              <div className="flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer">
                  <ChevronLeft size={24} />
                </Link>
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Orders</h1>
              </div>
            </div>
          </div>

          {/* Login Required State */}
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-[#FF5533]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Receipt className="w-12 h-12 text-[#FF5533]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Login Required</h2>
              <p className="text-gray-600 mb-6">Please login to view your orders</p>
              <button
                onClick={handleLoginClick}
                className="inline-block bg-[#FF5533] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#e64e27] transition cursor-pointer"
              >
                Login Now
              </button>
            </div>
          </div>
        </div>

        {/* Authentication Manager - Login Modal */}
        <AuthenticationManager
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer">
                <ChevronLeft size={24} />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">My Orders</h1>
            </div>
            
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-full transition cursor-pointer disabled:opacity-50"
            >
              <Loader2 className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto w-full px-4 py-6">
        {orders.length === 0 ? (
          // Empty State
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Receipt className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">No Orders Yet</h2>
              <p className="text-gray-600 mb-6">You haven&apos;t placed any orders yet</p>
              <Link
                href="/"
                className="inline-block bg-[#FF5533] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#e64e27] transition cursor-pointer"
              >
                Start Shopping
              </Link>
            </div>
          </div>
        ) : (
          // Orders List
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/order-details/${order.id}`}
                className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="p-4 md:p-6">
                  {/* Order Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#FF5533]" />
                      <h3 className="font-bold text-gray-900">Order #{order.id}</h3>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBgColor(order.order_status)} ${getStatusColor(order.order_status)}`}>
                      {order.order_status || 'Pending'}
                    </span>
                  </div>

                  {/* Order Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{formatDate(order.order_date)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <ShoppingBag className="w-4 h-4" />
                      <span className="text-sm">{order.order_details?.length || 0} items</span>
                    </div>
                  </div>

                  {/* Total Amount */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-gray-700 font-medium">Total Amount</span>
                    <span className="text-[#FF5533] font-bold text-lg">
                      ৳{order.payable_amount?.toFixed(2) || '0.00'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Load More Indicator */}
            {loadingMore && (
              <div className="py-4 text-center">
                <Loader2 className="w-6 h-6 text-[#FF5533] animate-spin mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Loading more orders...</p>
              </div>
            )}

            {/* Load More Button */}
            {currentPage < lastPage && !loadingMore && (
              <div className="py-4 text-center">
                <button
                  onClick={handleLoadMore}
                  className="bg-white border-2 border-[#FF5533] text-[#FF5533] px-6 py-2 rounded-lg font-semibold hover:bg-[#FF5533] hover:text-white transition cursor-pointer"
                >
                  Load More Orders
                </button>
              </div>
            )}

            {/* End of List */}
            {currentPage >= lastPage && orders.length > 0 && (
              <div className="py-4 text-center">
                <p className="text-gray-500 text-sm">No more orders</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}