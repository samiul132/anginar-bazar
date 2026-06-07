'use client';

import { useState, useEffect, useRef } from 'react';
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
import { api, getImageUrl, handleApiError } from '@/lib/api';
import { useInvoiceDownload } from '@/components/Invoice';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params?.id;
  const isGuest = params?.isGuest === 'true';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { InvoiceTemplate, downloadInvoice } = useInvoiceDownload(order);

  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const [showCancelModal, setShowCancelModal] = useState(false);

  const [paying, setPaying] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [payMessage, setPayMessage] = useState(null); 
  const pollRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

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

  useEffect(() => {
  if (!verifying || !order) return;
  const recheck = async () => {
    try {
      const resp = await api.orders.getDetails(order.id, false);
      if (resp.success && resp.data) {
        const ps = resp.data.payment_status?.toUpperCase();
        if (ps === 'PAID' || ps === 'PARTIAL') {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setVerifying(false);
          try { if (popupRef.current && !popupRef.current.closed) popupRef.current.close(); } catch (_) {}
          setOrder(resp.data);
          setPayMessage({ type: 'success', text: 'পেমেন্ট সফলভাবে সম্পন্ন হয়েছে ✅' });
        }
      }
    } catch (_) {}
  };
  window.addEventListener('focus', recheck);
  return () => window.removeEventListener('focus', recheck);
}, [verifying, order]);


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
    if (statusUpper === 'CANCELLED') return 0;
    if (statusUpper === 'DELIVERED') return 4;
    if (statusUpper === 'SHIPPING') return 3;
    if (statusUpper === 'PROCESSING') return 2;
    if (statusUpper === 'PENDING') return 1;
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

  const handleCancelOrder = async () => {
    setCancelling(true);
    setCancelError('');
    try {
      const response = await api.orders.cancel(orderId);
      if (response.success) {
        setShowCancelModal(false);
        await fetchOrderDetails();
      } else {
        setCancelError(response.message || 'Failed to cancel order');
      }
    } catch (err) {
      setCancelError('Something went wrong');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center text-gray-800 gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Order Details</h1>
            </div>
          </div>
        </div>
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
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Order Details</h1>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Not Found</h2>
            <p className="text-gray-600 mb-6">We couldn&apos;t find the order you&apos;re looking for</p>
            <button onClick={() => router.back()} className="bg-[#FF5533] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#e64e27] transition">
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const finishPolling = (success, freshOrder) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setVerifying(false);
    try {
      if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
    } catch (_) {}

    if (success) {
      if (freshOrder) setOrder(freshOrder);
      setPayMessage({ type: 'success', text: 'পেমেন্ট সফলভাবে সম্পন্ন হয়েছে ✅' });
    } else {
      // সর্বশেষ অবস্থা টেনে আনি — backend যা বলবে তাই সত্য
      fetchOrderDetails();
    }
  };

  const startPolling = () => {
    const startPaid = Number(order?.paid_amount || 0);
    let elapsed = 0;
    setVerifying(true);

    pollRef.current = setInterval(async () => {
      elapsed += 3;
      const popupClosed = popupRef.current && popupRef.current.closed;

      try {
        const resp = await api.orders.getDetails(order.id, false);
        if (resp.success && resp.data) {
          const o = resp.data;
          const ps = o.payment_status?.toUpperCase();
          const paidNow = Number(o.paid_amount || 0);
          if (ps === 'PAID' || ps === 'PARTIAL' || paidNow > startPaid) {
            finishPolling(true, o);
            return;
          }
        }
      } catch (_) {}

      if (popupClosed) { finishPolling(false); return; }   // user popup বন্ধ করেছে
      if (elapsed >= 180) { finishPolling(false); }          // ৩ মিনিট timeout
    }, 3000);
  };

  const handlePayNow = async () => {
    setPayMessage(null);

    // popup-blocker এড়াতে click gesture-এর ভেতরেই window খুলে ফেলি
    const w = 480, h = 720;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top = window.screenY + (window.outerHeight - h) / 2;
    const popup = window.open(
      '', 'bkash_payment',
      `width=${w},height=${h},left=${left},top=${top}`
    );
    if (popup) {
      try {
        popup.document.write(
          '<p style="font-family:sans-serif;text-align:center;margin-top:48px;color:#555">bKash লোড হচ্ছে...</p>'
        );
      } catch (_) {}
    }

    setPaying(true);
    try {
      const res = await api.orders.createBkashPayment(order.id);
      if (res.success && res.bkashURL) {
        if (popup) {
          popup.location.href = res.bkashURL;
          popupRef.current = popup;
          startPolling();
        } else {
          // popup blocked → full redirect (degraded fallback)
          window.location.href = res.bkashURL;
        }
      } else {
        if (popup) popup.close();
        setPayMessage({ type: 'error', text: res.message || 'পেমেন্ট শুরু করা যায়নি' });
      }
    } catch (e) {
      if (popup) popup.close();
      setPayMessage({ type: 'error', text: handleApiError(e) });
    } finally {
      setPaying(false);
    }
  };

  const checkNow = async () => {
  try {
    const resp = await api.orders.getDetails(order.id, false);
    if (resp.success && resp.data) {
      const ps = resp.data.payment_status?.toUpperCase();
      if (ps === 'PAID' || ps === 'PARTIAL') {
        finishPolling(true, resp.data);
        return;
      }
    }
    setPayMessage({ type: 'error', text: 'এখনো পেমেন্ট নিশ্চিত হয়নি। সম্পন্ন করে আবার চেক করুন।' });
  } catch (_) {
    setPayMessage({ type: 'error', text: 'চেক করা যায়নি, আবার চেষ্টা করুন।' });
  }
};

const cancelVerify = () => {
  if (pollRef.current) clearInterval(pollRef.current);
  pollRef.current = null;
  setVerifying(false);
  try { if (popupRef.current && !popupRef.current.closed) popupRef.current.close(); } catch (_) {}
  fetchOrderDetails();
};

  const statusStep = getStatusSteps(order.order_status);
  // const canCancel = ['PENDING', 'PROCESSING'].includes(
  //   order.order_status?.toUpperCase()
  // );
  const canCancel = order.order_status?.toUpperCase() === 'PENDING';
  const statusSteps = [
    { label: 'Order Placed', icon: Package },
    { label: 'Processing', icon: FileText },
    { label: 'Delivery', icon: ShoppingBag },
    { label: 'Completed', icon: CheckCircle2 },
  ];

  const canPay =
    ['SHIPPING', 'DELIVERED'].includes(order.order_status?.toUpperCase()) &&
    order.payment_status?.toUpperCase() !== 'PAID' &&
    Number(order.due_amount ?? order.payable_amount) > 0;
  const payAmount = Number(order.due_amount) > 0 ? order.due_amount : order.payable_amount;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-8">

      {/* Invoice Modal */}
      <InvoiceTemplate />

      {verifying && (
  <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-xs text-center space-y-4">
      <Loader2 className="w-10 h-10 text-[#E2136E] animate-spin mx-auto" />
      <h3 className="font-bold text-gray-900">পেমেন্ট যাচাই করা হচ্ছে...</h3>
      <p className="text-gray-500 text-sm">
        bKash উইন্ডোতে পেমেন্ট সম্পন্ন করুন। সম্পন্ন হলে স্বয়ংক্রিয়ভাবে আপডেট হবে।
      </p>
      <div className="flex flex-col gap-2 pt-1">
        <button
          onClick={checkNow}
          className="w-full py-2.5 rounded-xl font-bold text-white"
          style={{ backgroundColor: '#E2136E' }}
        >
          পেমেন্ট করেছি — চেক করুন
        </button>
        <button
          onClick={cancelVerify}
          className="w-full py-2.5 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
        >
          বন্ধ করুন
        </button>
      </div>
    </div>
  </div>
)}
      
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mx-auto">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900">Cancel Order?</h3>
              <p className="text-gray-500 text-sm mt-1">
                Are you sure you want to cancel Order #{order.id}? This action cannot be undone.
              </p>
            </div>
            {cancelError && (
              <p className="text-red-500 text-sm text-center">{cancelError}</p>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelError(''); }}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={cancelling}
                className="flex-1 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {cancelling ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Order Details</h1>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
            >
              <Loader2 className={`w-5 h-5 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">

      {payMessage && (
        <div className={`rounded-lg px-4 py-3 text-sm font-medium border ${
          payMessage.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {payMessage.text}
        </div>
      )}

        {/* Delivery Time Alert */}
        {deliveryTimeInfo.show && (
          <div className={`${deliveryTimeInfo.bg} border ${deliveryTimeInfo.border} rounded-lg px-4 py-3 flex items-center gap-3`}>
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className={`${deliveryTimeInfo.text} text-sm font-medium`}>{deliveryTimeInfo.message}</p>
          </div>
        )}

        {/* Order Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Order #{order.id}</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(order.order_date)}</span>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full self-start sm:self-auto ${
              order.order_status?.toUpperCase() === 'CANCELLED' ? 'bg-red-100' : 'bg-[#FF5533]/10'
            }`}>
              <span className={`font-semibold ${
                order.order_status?.toUpperCase() === 'CANCELLED' ? 'text-red-600' : 'text-[#FF5533]'
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
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors z-10 ${
                        isActive ? 'bg-[#FF5533] text-white' : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-[#FF5533]/20' : ''}`}>
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className={`mt-2 text-xs text-center px-1 ${isActive ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {step.label}
                      </span>
                      {index < statusSteps.length - 1 && (
                        <div
                          className={`absolute top-5 h-0.5 transition-colors ${index < statusStep - 1 ? 'bg-[#FF5533]' : 'bg-gray-200'}`}
                          style={{ left: '50%', right: '-50%', width: '100%' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cancelled message */}
          {order.order_status?.toUpperCase() === 'CANCELLED' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 font-medium text-center">This order has been cancelled</p>
            </div>
          )}
        </div>

        {/* Delivery Address Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF5533]" />
            Delivery Address
          </h3>
          <div className="text-gray-600 leading-relaxed">
            <p>{order.address?.street_address || 'No address available'}</p>
            {order.address?.upazila?.name && order.address?.district?.name && (
              <p className="mt-1">{order.address.upazila.name}, {order.address.district.name}</p>
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
              <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0 last:pb-0">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image
                    src={getImageUrl(item.product?.image)}
                    alt={item.product?.product_name || 'Product'}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{item.product?.product_name}</h4>
                  <p className="text-sm text-gray-600 mb-2">৳{formatPrice(item.price)} × {item.quantity}</p>
                  <p className="text-[#FF5533] font-bold">৳{formatPrice(item.sub_total)}</p>
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
              <span className="font-semibold text-gray-900">৳{formatPrice(order.total_amount)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span className="font-semibold text-green-600">-৳{formatPrice(order.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Charge</span>
              <span className="font-semibold text-gray-900">৳{formatPrice(order.shipping_charge)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-[#FF5533]">৳{formatPrice(order.payable_amount)}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-gray-200">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-semibold text-gray-900 capitalize">
                {order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}
              </span>
            </div>
            {order.payment_status && (
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status</span>
                <span className={`font-semibold capitalize ${
                  order.payment_status.toLowerCase() === 'paid' ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {order.payment_status}
                </span>
              </div>
            )}
            {order.due_amount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Due Amount</span>
                <span className="font-semibold text-red-600">৳{formatPrice(order.due_amount)}</span>
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


        {canPay && (
          <button
            onClick={handlePayNow}
            disabled={paying || verifying}
            className="w-full py-3.5 px-6 rounded-lg font-bold text-white transition flex items-center justify-center gap-2 disabled:opacity-60"
            style={{ backgroundColor: '#00A300' }}
          >
            {paying ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Image
                  src="/assets/images/bkash_logo.png"
                  alt="bKash"
                  width={22}
                  height={22}
                  className="object-contain"
                />
                বিকাশে পেমেন্ট করুন · ৳{formatPrice(payAmount)}
              </>
            )}
          </button>
        )}
        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            href="/shop"
            className="bg-[#FF5533] text-white text-center py-3 px-6 rounded-lg font-bold hover:bg-[#e64e27] transition"
          >
            Continue Shopping
          </Link>
          {(() => {
            const canDownload =
              order.order_status?.toUpperCase() === 'DELIVERED' &&
              order.payment_status?.toLowerCase() === 'paid';
            return (
              <button
                onClick={canDownload ? downloadInvoice : undefined}
                disabled={!canDownload}
                title={!canDownload ? 'Invoice available after delivery and payment' : ''}
                className={`py-3 px-6 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                  canDownload
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Download className="w-5 h-5" />
                Download Invoice
              </button>
            );
          })()}
          {canCancel && (
          <div className="col-span-1 sm:col-span-2 space-y-2">
            {cancelError && (
              <p className="text-red-500 text-sm text-center">{cancelError}</p>
            )}
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={cancelling}
              className="w-full py-3 px-6 rounded-lg font-bold border-2 border-red-500 text-red-500 hover:bg-red-50 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {cancelling ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              Cancel Order
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}