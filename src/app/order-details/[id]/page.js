'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronLeft,
  Package,
  MapPin,
  Calendar,
  CheckCircle2,
  Loader2,
  Download,
  ShoppingBag,
  CreditCard,
  FileText,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { api, getImageUrl } from '@/lib/api';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;
  const isGuest = params?.isGuest === 'true';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.orders.getDetails(orderId, isGuest);

      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        throw new Error(response.message || 'Order not found');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOrderDetails();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusSteps = (status) => {
    if (!status) return 1;

    const statusUpper = status.toUpperCase();
    
    if (statusUpper === 'CANCELLED') {
      return 0;
    }
    
    if (statusUpper === 'DELIVERED') {
      return 4;
    } else if (statusUpper === 'SHIPPED') {
      return 3;
    } else if (statusUpper === 'PROCESSING') {
      return 2;
    } else if (statusUpper === 'PENDING') {
      return 1;
    }
    
    return 1; 
  };

  const formatPrice = (value) => {
    return Number(value).toFixed(2);
  };

  const getDeliveryTimeMessage = () => {
    const now = new Date();
    const bdTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    const currentHour = bdTime.getHours();

    if (currentHour < 8) {
      return {
        show: true,
        message: "⏰ Your order will be delivered after 8:00 AM today.",
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-800",
      };
    }

    if (currentHour >= 17) {
      return {
        show: true,
        message: "📅 Our delivery hours are over. Your order will be delivered tomorrow after 8:00 AM.",
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-800",
      };
    }

    return { show: false, message: "", bg: "", border: "", text: "" };
  };

  const deliveryTimeInfo = getDeliveryTimeMessage();

  const handleDownloadInvoice = () => {
    // Placeholder for invoice download functionality
    alert('Invoice download will be available soon');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center text-gray-800 gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Order Details
              </h1>
            </div>
          </div>
        </div>

        {/* Loading State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Order Details
              </h1>
            </div>
          </div>
        </div>

        {/* Not Found State */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">
              We couldn&apos;t find the order you&apos;re looking for
            </p>
            <button
              onClick={() => router.back()}
              className="bg-[#FF5533] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#e64e27] transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusStep = getStatusSteps(order.order_status);
  const statusSteps = [
    { label: 'Order Placed', icon: Package },
    { label: 'Processing', icon: FileText },
    { label: 'Delivery', icon: ShoppingBag },
    { label: 'Completed', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Order Details
              </h1>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
            >
              <Loader2
                className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Delivery Time Alert */}
        {deliveryTimeInfo.show && (
          <div className={`${deliveryTimeInfo.bg} border ${deliveryTimeInfo.border} rounded-lg px-4 py-3 flex items-center gap-3`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={`${deliveryTimeInfo.text} text-sm font-medium`}>
              {deliveryTimeInfo.message}
            </p>
          </div>
        )}
        {/* Order Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          {/* Order Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Order #{order.id}
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(order.order_date)}</span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full self-start sm:self-auto ${
              order.order_status?.toUpperCase() === 'CANCELLED' 
                ? 'bg-red-100' 
                : 'bg-[#FF5533]/10'
            }`}>
              <span className={`font-semibold ${
                order.order_status?.toUpperCase() === 'CANCELLED'
                  ? 'text-red-600'
                  : 'text-[#FF5533]'
              }`}>
                {order.order_status || 'Pending'}
              </span>
            </div>
          </div>

          {/* Progress Steps */}
          {order.order_status?.toUpperCase() !== 'CANCELLED' && (
            <div className="relative">
              <div className="flex justify-between items-start">
                {statusSteps.map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = index < statusStep;
                  const isCurrent = index === statusStep - 1;

                  return (
                    <div key={index} className="flex flex-col items-center relative" style={{ flex: 1 }}>
                      {/* Step Circle */}
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10 ${
                          isActive
                            ? 'bg-[#FF5533] text-white'
                            : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-[#FF5533]/20' : ''}`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>

                      {/* Step Label */}
                      <span
                        className={`mt-2 text-xs text-center px-1 ${
                          isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>

                      {/* Connecting Line */}
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`absolute top-5 h-0.5 transition-colors ${
                            index < statusStep - 1 ? 'bg-[#FF5533]' : 'bg-gray-200'
                          }`}
                          style={{
                            left: '50%',
                            right: '-50%',
                            width: '100%',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Show cancellation message if cancelled */}
        {order.order_status?.toUpperCase() === 'CANCELLED' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium text-center">
              This order has been cancelled
            </p>
          </div>
        )}

        {/* Delivery Address Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF5533]" />
            Delivery Address
          </h3>
          <div className="text-gray-600 leading-relaxed">
            <p>{order.address?.street_address || 'No address available'}</p>
            {order.address?.upazila?.name && order.address?.district?.name && (
              <p className="mt-1">
                {order.address.upazila.name}, {order.address.district.name}
              </p>
            )}
            {order.address?.division?.name && (
              <p className="mt-1">{order.address.division.name}</p>
            )}
          </div>
        </div>

        {/* Order Items Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Order Items ({order.order_details?.length || 0})
          </h3>
          <div className="space-y-4">
            {order.order_details?.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0"
              >
                {/* Product Image */}
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={getImageUrl(item.product?.image)}
                    alt={item.product?.product_name || 'Product'}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {item.product?.product_name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    ৳{formatPrice(item.price)} × {item.quantity}
                  </p>
                  <p className="text-[#FF5533] font-bold">
                    ৳{formatPrice(item.sub_total)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#FF5533]" />
            Payment Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">
                ৳{formatPrice(order.total_amount)}
              </span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span className="font-semibold text-green-600">
                  -৳{formatPrice(order.discount_amount)}
                </span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span className="font-semibold text-gray-900">
                ৳{formatPrice(order.shipping_charge)}
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-[#FF5533]">
                ৳{formatPrice(order.payable_amount)}
              </span>
            </div>

            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-semibold text-gray-900 capitalize">
                {order.payment_method === 'cod'
                  ? 'Cash on Delivery'
                  : order.payment_method}
              </span>
            </div>

            {order.payment_status && (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span
                  className={`font-semibold capitalize ${
                    order.payment_status.toLowerCase() === 'paid'
                      ? 'text-green-600'
                      : 'text-orange-600'
                  }`}
                >
                  {order.payment_status}
                </span>
              </div>
            )}

            {order.due_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Due Amount</span>
                <span className="font-semibold text-red-600">
                  ৳{formatPrice(order.due_amount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Order Note Card */}
        {order.order_note && (
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#FF5533]" />
              Order Note
            </h3>
            <p className="text-gray-600 leading-relaxed">{order.order_note}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            href="/shop"
            className="bg-[#FF5533] text-white text-center py-3 px-6 rounded-lg font-bold hover:bg-[#e64e27] transition"
          >
            Continue Shopping
          </Link>
          <button
            onClick={handleDownloadInvoice}
            className="bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-bold hover:bg-gray-300 transition flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
}