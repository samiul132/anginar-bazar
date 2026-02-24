'use client';

import { useState, forwardRef, useImperativeHandle } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useCart } from '@/lib/CartContext';
import { getImageUrl } from '@/lib/api';

const FloatingCart = forwardRef(function FloatingCart(props, ref) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { cartItems, updateQuantity, removeFromCart, getCartCount, getCartTotal } = useCart();

  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
  }));

  const totalItems = getCartCount();
  const totalPrice = getCartTotal();
  const deliveryThreshold = 1000;
  const minSpend = 49;
  const progress = Math.min((totalPrice / deliveryThreshold) * 100, 100);

  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add some products.');
      return;
    }
    setIsOpen(false); 
    router.push('/checkout');
  };

  return (
    <>
      {/* Floating Cart Button - Desktop Only */}
      <div className="hidden md:block fixed right-4 top-5/7 -translate-y-1/2 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-[#FF5533] text-white px-3 pt-3 pb-1 rounded-lg shadow-xl hover:bg-[#e64e27] transition-all hover:scale-105 cursor-pointer"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <span className="font-bold text-xs">
          ৳{Math.round(totalPrice)}
          </span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-[#319F00] text-gray-100 text-xs font-bold min-w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 border-white">
              {totalItems > 9 ? '9+' : totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Back/Close Button - Left Side of Drawer - Desktop Only */}
      {isOpen && (
        <div className="hidden md:block fixed left-[calc(100%-394px-46px)] top-1/2 -translate-y-1/2 z-50">
          <button
            onClick={() => setIsOpen(false)}
            className="bg-[#319F00] text-gray-100 py-3 rounded-md shadow-xl hover:bg-green-500 transition-all hover:scale-105 cursor-pointer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Cart Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-105 bg-white shadow-2xl z-60 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="bg-[#319F00] px-5 py-1 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="bg-white p-1 text-gray-800 rounded-lg shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <span className="text-gray-100 font-bold text-md">{totalItems} items</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-100 hover:text-gray-700 transition cursor-pointer flex items-center gap-1 font-semibold text-sm"
            >
              <X size={16} strokeWidth={2.5} />
              <span>Close</span>
            </button>
          </div>

          {/* Delivery Progress */}
          {/* <div className="px-5 py-2.5 bg-white border-b border-gray-100 shrink-0">
            <p className="text-xs font-medium text-gray-700 mb-2">
              {totalPrice >= deliveryThreshold 
                ? '🎉 Congratulations! You get FREE Delivery' 
                : `Shop ৳${Math.max(0, deliveryThreshold - totalPrice)} more for FREE Delivery`}
            </p>
            <div className="relative">
              <div className="h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#319F00] to-[#47c611] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-between px-3">
                <span className={`text-[10px] font-bold transition-colors ${totalPrice >= minSpend ? 'text-white' : 'text-gray-500'}`}>
                  ৳{minSpend}
                </span>
                <span className={`text-[10px] font-bold transition-colors ${totalPrice >= 500 ? 'text-white' : 'text-gray-500'}`}>
                  ৳500
                </span>
                <span className={`text-[10px] font-bold transition-colors ${totalPrice >= deliveryThreshold ? 'text-white' : 'text-gray-500'}`}>
                  FREE
                </span>
              </div>
            </div>
          </div> */}

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-5 py-3">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                <p className="mt-3 text-base">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map(item => (
                  <div key={item.product_id} className="bg-white rounded-lg p-3 border border-gray-100 hover:border-gray-200 transition-all shadow-sm">
                    <div className="flex gap-3">
                      <Image
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1.5">
                          <h4 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 pr-2">
                            {item.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product_id)}
                            className="text-gray-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                            </svg>
                          </button>
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <span className="text-[#FF5533] font-bold text-lg">৳{Math.round(item.price)}</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              className="w-7 h-7 rounded-full bg-white border-1 border-[#FF5533] text-[#FF5533] flex items-center justify-center hover:bg-[#FF5533] hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="5" y1="12" x2="19" y2="12"/>
                              </svg>
                            </button>
                            <span className="font-bold text-lg min-w-6 text-center text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              className="w-7 h-7 rounded-full bg-white border-1 border-[#FF5533] text-[#FF5533] flex items-center justify-center hover:bg-[#FF5533] hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coupon Section */}
          {cartItems.length > 0 && (
            <div className="px-5 py-3 bg-white border-t border-gray-100 shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your coupon code"
                  className="flex-1 px-3 py-2 dark:text-black border border-gray-300 rounded-lg focus:outline-none focus:border-[#FF5533] focus:ring-2 focus:ring-[#FF5533]/20 text-sm transition-all"
                />
                <button className="px-5 py-2 bg-[#FF5533] text-white font-bold rounded-lg hover:bg-[#e64e27] transition-all shadow-md hover:shadow-lg active:scale-95 text-sm cursor-pointer">
                  Apply coupon
                </button>
              </div>
            </div>
          )}

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="flex border-t border-gray-100 shadow-lg shrink-0 pb-16 md:pb-0">
              <div className="flex-1 bg-[#319F00] px-3 md:px-5 py-3 md:py-2 flex items-center justify-center">
                <span className="text-gray-100 font-bold text-base md:text-xl">Total: ৳{Math.round(totalPrice)}</span>
              </div>
              <button 
                onClick={handlePlaceOrder}
                className="flex-1 bg-[#FF5533] text-white px-3 md:px-5 py-3 md:py-2 font-bold text-base md:text-lg hover:bg-[#e64e27] transition-all active:scale-95 cursor-pointer"
              >
                Place order
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
});

export default FloatingCart;