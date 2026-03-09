'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccessClient() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get('orderId') || 'N/A';
  const totalAmount = searchParams.get('total') || '0';
  const paymentMethod = searchParams.get('payment') || 'cod';
  const deliveryType = searchParams.get('delivery') || 'standard';

  const deliveryTimeText =
    deliveryType === 'express'
      ? 'Within 1 hour (Express Delivery)'
      : 'Within 3 hours (Standard Delivery)';

  const paymentMethodText =
    paymentMethod === 'cod' ? 'Cash on Delivery' : paymentMethod;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">

        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <span className="text-green-600 dark:text-green-400 text-5xl font-bold">✓</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
            Order Successful! 🎉
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your order has been placed successfully
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
          <div className="flex justify-between py-2 text-gray-700 dark:text-gray-300">
            <span>Order Number</span>
            <span className="font-bold">#{orderId}</span>
          </div>

          <div className="flex justify-between py-2">
            <span className="text-gray-700 dark:text-gray-300">Total</span>
            <span className="font-bold text-[#FF5533]">
              ৳{parseFloat(totalAmount).toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between py-2 text-gray-700 dark:text-gray-300">
            <span>Payment</span>
            <span>{paymentMethodText}</span>
          </div>

          <div className="flex justify-between py-2 text-gray-700 dark:text-gray-300">
            <span>Delivery</span>
            <span className="text-right max-w-[180px]">
              {deliveryTimeText}
            </span>
          </div>
        </div>

        <Link
          href="/my-orders"
          className="block bg-[#FF5533] hover:bg-[#e64e27] text-white py-4 rounded-xl text-center font-bold mb-3 transition"
        >
          View My Orders
        </Link>

        <Link
          href="/"
          className="block border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white py-4 rounded-xl text-center font-bold"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}