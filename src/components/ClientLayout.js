'use client';

import { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import FooterWrapper from '@/components/FooterWrapper';
import BottomNavigation from '@/components/BottomNavigation';
import FloatingCart from '@/components/FloatingCart';
import AuthenticationManager from '@/components/AuthenticationManager'; 
import { CartProvider } from '@/lib/CartContext';

export default function ClientLayout({ children }) {
  const floatingCartRef = useRef(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleCartClick = () => {
    if (floatingCartRef.current) {
      floatingCartRef.current.toggle();
    }
  };

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleAuthSuccess = (userData) => {
    console.log('User authenticated:', userData);
    setIsLoginModalOpen(false);
    
    // Dispatch auth change event
    window.dispatchEvent(new Event('authStateChanged'));
  };

  // Listen for custom event to open login modal from delete account page or other pages
  useEffect(() => {
    const handleOpenLoginModal = () => {
      setIsLoginModalOpen(true);
    };

    window.addEventListener('openLoginModal', handleOpenLoginModal);
    
    return () => {
      window.removeEventListener('openLoginModal', handleOpenLoginModal);
    };
  }, []);

  return (
    <CartProvider>
      <Header />
      <main className="min-h-screen">
        {children}
      </main>
      <FooterWrapper />
      
      {/* Common Components */}
      <FloatingCart ref={floatingCartRef} />
      <BottomNavigation 
        onCartClick={handleCartClick} 
        onLoginClick={handleLoginClick}
      />
      
      {/* Authentication Manager - OTP Success Message */}
      <AuthenticationManager
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </CartProvider>
  );
}