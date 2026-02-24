'use client';

import { Home, ShoppingCart, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/CartContext';
import { storage } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function BottomNavigation({ onCartClick, onLoginClick }) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();
  
  // Initialize auth state from storage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false;
    const token = storage.getAuthToken();
    const customer = storage.getCustomerData();
    return !!(token && customer);
  });
  useEffect(() => {
    const id = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(id); 
  }, []);


  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      const token = storage.getAuthToken();
      const customer = storage.getCustomerData();
      setIsAuthenticated(!!(token && customer));
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  // Check if current route is profile
  const isProfileActive = pathname === '/profile';
  
  const handleUserIconClick = () => {
    if (isAuthenticated) {
      // If authenticated, navigate to profile
      // This shouldn't happen as we render Link, but as a fallback
      return;
    } else {
      // If not authenticated, open login modal
      if (onLoginClick) {
        onLoginClick();
      }
    }
  };
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-60">
      <div className="max-w-7xl mx-auto flex justify-around items-center py-3">
        {/* Home Link */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-all ${
            pathname === '/' ? 'text-[#FF5533]' : 'text-gray-500'
          }`}
        >
          <Home className="w-6 h-6" />
        </Link>
        
        {/* Cart Button - Middle */}
        <button
          onClick={onCartClick}
          className="flex flex-col items-center gap-1 transition-all text-gray-500"
        >
          <div className="relative -mt-6">
            {/* Cart circle */}
            <div className="w-14 h-14 bg-[#FF5533] rounded-full flex items-center justify-center text-white shadow-lg">
              <ShoppingCart className="w-7 h-7" strokeWidth={2.5} />
            </div>
            {/* Badge — Top-Right */}
            {cartCount > 0 && (
              <span
                className="
                  absolute
                  -top-1
                  -right-2
                  bg-white
                  text-[#FF5533]
                  text-[11px]
                  font-bold
                  min-w-[22px]
                  h-[22px]
                  rounded-full
                  flex
                  items-center
                  justify-center
                  border-2
                  border-[#FF5533]
                  z-50
                "
              >
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
        </button>
        
        {/* Profile/Login Icon */}
        {mounted && (  
          isAuthenticated ? (
            <Link
              href="/profile"
              className={`flex flex-col items-center gap-1 transition-all ${
                isProfileActive ? 'text-[#FF5533]' : 'text-gray-500'
              }`}
            >
              <User className="w-6 h-6" />
            </Link>
          ) : (
            <button
              onClick={handleUserIconClick}
              className="flex flex-col items-center gap-1 transition-all text-gray-500 hover:text-[#FF5533]"
            >
              <User className="w-6 h-6" />
            </button>
          )
        )}

      </div>
    </nav>
  );
}