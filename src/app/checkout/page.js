'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, MapPin, Clock, CreditCard, Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { api, storage, getImageUrl } from '@/lib/api';
import AuthenticationManager from '@/components/AuthenticationManager';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [mounted, setMounted] = useState(false);

  // Auth & User State
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [customerData, setCustomerData] = useState(null);

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Address State
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressesLoading, setAddressesLoading] = useState(false);
  
  // Modals
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showEditAddressesModal, setShowEditAddressesModal] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);

  // Order Details
  const [paymentMethod, setPaymentMethod] = useState('Cash On delivery');
  const [deliveryType, setDeliveryType] = useState('standard');
  const [orderNote, setOrderNote] = useState('');
  const [guestNote, setGuestNote] = useState('');

  // Guest User
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestAddress, setGuestAddress] = useState('');

  // Location Data (Fixed)
  const locationData = {
    division: { id: 1, name: 'Chattagram', bn_name: 'Chattagram' },
    district: { id: 6, name: 'Chandpur', bn_name: 'Chandpur' },
    upazila: { id: 58, name: 'Matlab North', bn_name: 'Matlab North' },
  };

  // Price Calculations
  const baseDeliveryFee = 30;
  const expressCharge = 20;
  const freeDeliveryThreshold = 1000;

  const subtotal = getCartTotal();

  // Delivery time alert based on BD time
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

  let shippingCharge = 0;

    if (isAuthenticated) {
      shippingCharge = deliveryType === 'express'
        ? baseDeliveryFee + expressCharge
        : baseDeliveryFee;
    } else {
      shippingCharge = 0;
    }

  const totalAmount = subtotal + shippingCharge;

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = storage.getAuthToken();
      const customer = storage.getCustomerData();

      if (token && customer && customer.name) {
        setIsAuthenticated(true);
        setCustomerData(customer);
        await fetchAddresses();
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleAuthSuccess = async (userData) => {
    console.log('User authenticated:', userData);
    setIsLoginModalOpen(false);
    setIsAuthenticated(true);
    setCustomerData(userData);
    
    // Dispatch auth change event
    window.dispatchEvent(new Event('authStateChanged'));
    
    // Reload addresses after successful login
    await fetchAddresses();
  };

  const fetchAddresses = async () => {
    setAddressesLoading(true);
    try {
      const response = await api.address.getAll();
      if (response.success && response.data?.addressList && Array.isArray(response.data.addressList)) {
        setAddresses(response.data.addressList);
        
        // ✅ FIX: Auto-select default address (handle both 1 and true)
        const defaultAddress = response.data.addressList.find((addr) => addr.is_default == 1);
        setSelectedAddressId(defaultAddress?.id || response.data.addressList[0]?.id);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  };

  const handleAddNewAddress = async () => {
    if (!newAddress.trim()) {
      alert('Please enter an address');
      return;
    }

    setAddingAddress(true);
    try {
      const response = await api.address.add({
        street_address: newAddress.trim(),
        division_id: locationData.division.id,
        district_id: locationData.district.id,
        upazila_id: locationData.upazila.id,
        is_default: 1, // ✅ FIX: Send 1 instead of true
      });

      if (response.success) {
        await fetchAddresses();
        setShowAddAddressModal(false);
        setNewAddress('');
      }
    } catch (error) {
      alert('Failed to add address: ' + error.message);
    } finally {
      setAddingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const address = addresses.find((addr) => addr.id === addressId);
      if (!address) return;

      await api.address.update(addressId, {
        street_address: address.street_address,
        division_id: address.division_id,
        district_id: address.district_id,
        upazila_id: address.upazila_id,
        is_default: 1, // ✅ FIX: Send 1 instead of true
      });

      await fetchAddresses();
    } catch (error) {
      alert('Failed to update default address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (addresses.length === 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cannot Delete',
        text: 'You must have at least one address',
        confirmButtonColor: '#FF5533',
        confirmButtonText: 'Okay',
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Address?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await api.address.delete(addressId);
        await fetchAddresses();
        
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Address has been deleted.',
          confirmButtonColor: '#FF5533',
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Failed',
          text: 'Failed to delete address',
          confirmButtonColor: '#FF5533',
        });
      }
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Please add products to cart');
      return;
    }

    if (isAuthenticated && !selectedAddressId && addresses.length === 0) {
      alert('Please add a delivery address');
      return;
    }

    if (!isAuthenticated) {
      if (!guestName || !guestPhone || !guestAddress) {
        alert('Please fill in all fields');
        return;
      }
      if (guestPhone.length < 10) {
        alert('Please enter a valid phone number');
        return;
      }
    }

    await submitOrder();
  };

  const submitOrder = async () => {
    setPlacing(true);

    try {
      const cartData = cartItems.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      }));

      let orderPayload;

      if (isAuthenticated && customerData) {
        const addressId = selectedAddressId || addresses[0]?.id;
        if (!addressId) {
          alert('Please add a delivery address');
          setPlacing(false);
          return;
        }

        orderPayload = {
          address_id: addressId,
          total_amount: subtotal,
          shipping_charge: shippingCharge,
          payable_amount: totalAmount,
          payment_method: paymentMethod,
          order_note: orderNote,
          cart_data: cartData,
        };
      } else {
        orderPayload = {
          name: guestName.trim(),
          phone: guestPhone.trim(),
          division_id: locationData.division.id,
          district_id: locationData.district.id,
          upazila_id: locationData.upazila.id,
          street_address: guestAddress.trim(),
          total_amount: subtotal,
          shipping_charge: shippingCharge,
          payable_amount: totalAmount,
          payment_method: paymentMethod,
          order_note: orderNote,
          cart_data: cartData,
        };
      }

      const response = await api.orders.place(orderPayload);

      if (response.success) {
        // Handle guest user auto-login
        if (!isAuthenticated && response.token && response.user) {
          console.log('Auto-logging in guest user...');
          
          // Save auth token
          storage.setAuthToken(response.token);
          
          // Ensure we have complete customer data with all fields
          const customerDataToSave = {
            id: response.user.id,
            name: response.user.name || guestName.trim(),
            phone: response.user.phone || guestPhone.trim(),
            email: response.user.email || null,
            ...response.user, // Include all other fields from API response
          };
          
          storage.setCustomerData(customerDataToSave);
          
          // Update local state immediately
          setIsAuthenticated(true);
          setCustomerData(customerDataToSave);
          
          // Dispatch event for header and other components to update
          window.dispatchEvent(new Event('authStateChanged'));
          
          console.log('Guest user auto-login successful:', customerDataToSave);
          
          // Small delay to ensure all state updates propagate
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Clear cart after successful order
        clearCart();
        
        // Navigate to order success page with order details
        router.push(`/order-success?orderId=${response.data?.id || 'N/A'}&total=${totalAmount}&payment=${paymentMethod}&delivery=${deliveryType}`);
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('Order failed: ' + error.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gray-50 min-h-screen flex flex-col pb-20 md:pb-8">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center text-gray-800 gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 text-gray-800 rounded-full transition cursor-pointer">
                <ChevronLeft size={24} />
              </Link>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Checkout</h1>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto w-full px-4 py-6">
          {/* Delivery Time Alert */}
          {deliveryTimeInfo.show && (
            <div className={`${deliveryTimeInfo.bg} border ${deliveryTimeInfo.border} rounded-lg px-4 py-3 mb-6 flex items-center gap-3`}>
              <svg className="w-5 h-5 flex-shrink-0 text-current" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className={`${deliveryTimeInfo.text} text-sm font-medium`}>
                {deliveryTimeInfo.message}
              </p>
            </div>
          )}
          
          {/* Login Prompt for Guest Users */}
          {!isAuthenticated && (
            <div className="bg-gradient-to-r from-[#FF5533] to-[#e64e27] rounded-lg px-4 py-2 mb-6 shadow-lg">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 rounded-full p-2">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">Have an account?</h3>
                    <p className="text-white/90 text-sm">Login for faster checkout</p>
                  </div>
                </div>
                <button
                  onClick={handleLoginClick}
                  className="w-full bg-white text-[#FF5533] rounded-lg py-3 font-bold flex items-center justify-center gap-2 hover:bg-gray-100 transition cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login Now
                </button>
              </div>
            </div>
          )}

          {/* Delivery Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="text-[#FF5533]" size={20} />
              Delivery Information
            </h2>

            {isAuthenticated && customerData ? (
              <div>
                {/* Customer Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FF5533]/10 rounded-full p-2">
                      <svg className="w-5 h-5 text-[#FF5533]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{customerData.name}</p>
                      <p className="text-sm text-gray-600">+88 {customerData.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Address Section Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Delivery Address</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowEditAddressesModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 border border-[#FF5533] text-[#FF5533] rounded-lg hover:bg-[#FF5533]/5 transition text-sm font-medium cursor-pointer"
                    >
                      <Edit2 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => setShowAddAddressModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] transition text-sm font-medium cursor-pointer"
                    >
                      <Plus size={14} />
                      Add New
                    </button>
                  </div>
                </div>

                {/* Address List */}
                {addressesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-[#FF5533] animate-spin" />
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="space-y-3">
                    {addresses.map((address) => (
                      <button
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`w-full text-left p-4 rounded-lg border transition cursor-pointer ${
                          selectedAddressId === address.id
                            ? 'border-[#FF5533] bg-[#FF5533]/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <MapPin
                            size={20}
                            className={selectedAddressId === address.id ? 'text-[#FF5533]' : 'text-gray-400'}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{address.street_address}</p>
                          </div>
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              selectedAddressId === address.id ? 'border-[#FF5533]' : 'border-gray-300'
                            }`}
                          >
                            {selectedAddressId === address.id && (
                              <div className="w-2.5 h-2.5 bg-[#FF5533] rounded-full" />
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800 text-sm">
                      No address found. Please add a delivery address.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // Guest Form
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border dark:text-black border-gray-300 rounded-lg focus:outline-none focus:border-[#FF5533] focus:ring-1 focus:ring-[#FF5533]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-600 rounded-l-lg">
                      +88
                    </span>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      maxLength={11}
                      className="flex-1 px-4 py-3 border dark:text-black border-gray-300 rounded-r-lg focus:outline-none focus:border-[#FF5533] focus:ring-1 focus:ring-[#FF5533]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={guestAddress}
                    onChange={(e) => setGuestAddress(e.target.value)}
                    placeholder="House/Flat, Street, Area"
                    rows={3}
                    className="w-full px-4 py-3 border dark:text-black border-gray-300 rounded-lg focus:outline-none focus:border-[#FF5533] focus:ring-1 focus:ring-[#FF5533]/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Note
                  </label>
                  <textarea
                    value={guestNote}
                    onChange={(e) => setGuestNote(e.target.value)}
                    placeholder="আপনি যদি কোনো পণ্য খুঁজে না পান, তাহলে অর্ডার নোটে লিখে অর্ডার করতে পারেন। যেমন: ১ কেজি আলু, ৫০০ গ্রাম টমেটো। অথবা ০১৮৮৯০৯৩৯৬৭ নম্বরে কল করুন।"

                    rows={4}
                    className="w-full px-4 py-3 border dark:text-black border-gray-300 rounded-lg focus:outline-none focus:border-[#FF5533] focus:ring-1 focus:ring-[#FF5533]/20"
                  />
                </div>

                <div className="bg-[#FF5533]/5 border border-[#FF5533]/20 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Service Area:</span> {locationData.district.name} - {locationData.upazila.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Delivery Time */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="text-[#FF5533]" size={20} />
              Delivery Time
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setDeliveryType('standard')}
                className={`p-2 rounded-lg border-2 transition cursor-pointer ${
                  deliveryType === 'standard'
                    ? 'border-[#FF5533] bg-[#FF5533] text-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-center dark:text-black">Standard</p>
                <p className={`text-xs text-center mt-1 ${deliveryType === 'standard' ? 'text-white/90' : 'text-gray-500'}`}>
                  Within 3 hours
                </p>
              </button>

              <button
                onClick={() => setDeliveryType('express')}
                className={`px-2 rounded-lg border-2 transition cursor-pointer ${
                  deliveryType === 'express'
                    ? 'border-[#FF5533] bg-[#FF5533] text-white'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-center dark:text-black">Express</p>
                <p className={`text-xs text-center mt-1 ${deliveryType === 'express' ? 'text-white/90' : 'text-gray-500'}`}>
                  Within 1 hour (+৳20)
                </p>
              </button>
            </div>
          </div>

          {isAuthenticated && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order Note</h2>
              <textarea
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="আপনি যদি কোনো পণ্য খুঁজে না পান, তাহলে অর্ডার নোটে লিখে অর্ডার করতে পারেন। যেমন: ১ কেজি আলু, ৫০০ গ্রাম টমেটো। অথবা ০১৮৮৯০৯৩৯৬৭ নম্বরে কল করুন।"
                rows={4}
                className="w-full px-4 py-3 border dark:text-black border-gray-300 rounded-lg focus:outline-none focus:border-[#FF5533] focus:ring-1 focus:ring-[#FF5533]/20"
              />
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge</span>
                <span className="font-semibold">
                  {!isAuthenticated ? (
                    <span className="text-green-600 font-bold">Free</span>
                  ) : (
                    `৳${shippingCharge.toFixed(2)}`
                  )}
                </span>
              </div>

              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-[#FF5533]">৳{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="text-[#FF5533]" size={20} />
              Payment Method
            </h2>

            <div className="bg-gray-50 rounded-lg p-4 flex items-center gap-3">
              <svg className="w-6 h-6 text-[#FF5533]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium text-gray-900">Cash on Delivery</span>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={placing || cartItems.length === 0}
            className={`w-full py-4 rounded-lg font-bold text-lg transition cursor-pointer ${
              placing || cartItems.length === 0
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#FF5533] hover:bg-[#e64e27] text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {placing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing Order...
              </span>
            ) : (
              `Place Order - ৳${totalAmount.toFixed(2)}`
            )}
          </button>
        </div>

        {/* Add Address Modal */}
        {showAddAddressModal && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowAddAddressModal(false);
              setNewAddress('');
            }}
          >
            <div 
              className="bg-white rounded-2xl w-full md:max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Add New Address</h3>
                  <button
                    onClick={() => {
                      setShowAddAddressModal(false);
                      setNewAddress('');
                    }}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="House/Flat, Street, Area"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 text-gray-800 rounded-lg focus:outline-none focus:border-[#FF5533] focus:ring-1 focus:ring-[#FF5533]/20"
                  />
                </div>

                <div className="bg-[#FF5533]/5 border border-[#FF5533]/20 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Service Area:</span> {locationData.district.name} - {locationData.upazila.name}
                  </p>
                </div>

                <button
                  onClick={handleAddNewAddress}
                  disabled={addingAddress}
                  className={`w-full py-3 rounded-lg font-bold transition cursor-pointer ${
                    addingAddress
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#FF5533] hover:bg-[#e64e27] text-white'
                  }`}
                >
                  {addingAddress ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Save Address'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ FIXED: Edit Addresses Modal - Middle position + Outside click close + No "Default" text */}
        {showEditAddressesModal && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditAddressesModal(false)}
          >
            <div 
              className="bg-white rounded-2xl w-full md:max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-40 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900">Manage Addresses</h3>
                  <button
                    onClick={() => setShowEditAddressesModal(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition cursor-pointer"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3 mb-4">
                  {addresses.map((address, index) => (
                    <div key={address.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">Address {index + 1}</p>
                            {address.is_default == 1 && (
                              <span className="inline-block bg-[#FF5533] text-white text-xs px-2 py-0.5 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-700">{address.street_address}</p>
                        </div>
                        {addresses.length > 1 && (
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full p-2 transition cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>

                      {/* "Default" text */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-600">Set as default</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={address.is_default == 1}
                            onChange={(e) => {
                              if (e.target.checked) {
                                handleSetDefaultAddress(address.id);
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#FF5533]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF5533]"></div>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setShowEditAddressesModal(false);
                    setShowAddAddressModal(true);
                  }}
                  className="w-full bg-[#FF5533] text-white py-3 rounded-lg font-bold hover:bg-[#e64e27] transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Add New Address
                </button>
              </div>
            </div>
          </div>
        )}
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