'use client';

import { useState, useEffect, useRef } from 'react';
import AuthenticationManager from '@/components/AuthenticationManager';
import Image from 'next/image';
import { User, Menu, X, ChevronRight, Phone, LogOut, ShoppingBag, UserCircle, ChevronDown, LayoutDashboard  } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api, storage } from '@/lib/api';
import SearchBar from '@/components/SearchBar';

export default function Header({ cartCount = 0 }) {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const pathname = usePathname();
  const [scrollY, setScrollY] = useState(0);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState(null);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
  
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.categories.getAll();
        if (response.success && response.data) {
          const parentCategories = response.data.filter(cat => !cat.parent_category_id);
          const organizedCategories = parentCategories.map(parent => ({
            ...parent,
            subcategories: response.data.filter(cat => cat.parent_category_id === parent.id)
          }));
          setCategories(organizedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkAuth();

    const handleAuthChange = () => {
      console.log('Auth change detected - refreshing header');
      checkAuth();
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, []);

  const checkAuth = () => {
    const token = storage.getAuthToken();
    const customerData = storage.getCustomerData();
    if (token && customerData) {
      setUser(customerData);
    } else {
      setUser(null);
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    console.log('User authenticated:', userData);
  };

  const handleLogout = () => {
    storage.clearAuthData();
    setUser(null);
    setShowProfileMenu(false);
    window.dispatchEvent(new Event('authStateChanged'));
    router.push('/');
  };

  const orange = 'text-[#FF5533]';

  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const desktopMenuRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const toggleCategoryMenu = () => {
    setShowCategoriesMenu(prev => {
      if (prev) setSelectedCategory(null);
      return !prev;
    });
  };

  const closeCategoryMenu = () => {
    setShowCategoriesMenu(false);
    setSelectedCategory(null);
  };

  const toggleMobileCategory = (index) => {
    setExpandedMobileCategory(expandedMobileCategory === index ? null : index);
  };

  // Check if arrows should be visible
  const checkArrows = () => {
    if (desktopMenuRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = desktopMenuRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkArrows();
    window.addEventListener('resize', checkArrows);
    return () => window.removeEventListener('resize', checkArrows);
  }, []);

  const slideLeft = () => {
    if (desktopMenuRef.current) {
      desktopMenuRef.current.scrollBy({ left: -200, behavior: 'smooth' });
      setTimeout(checkArrows, 300);
    }
  };

  const slideRight = () => {
    if (desktopMenuRef.current) {
      desktopMenuRef.current.scrollBy({ left: 200, behavior: 'smooth' });
      setTimeout(checkArrows, 300);
    }
  };

  // Mobile quick links data
  const mobileQuickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Special Offer', href: '/special-offer' },
    { label: 'Categories', href: '/categories' },
    { label: 'Brand Store', href: '/brands' },
  ];

  return (
    <>
      <style jsx global>{`
        @keyframes slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        
        @keyframes zoom-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-zoom-in { animation: zoom-in 0.2s ease-out; }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          10%, 30% { transform: rotate(-15deg); }
          20%, 40% { transform: rotate(15deg); }
        }
        .animate-ring { animation: ring 2s ease-in-out infinite; }
      `}</style>

      {/* Combined Header and Category Bar */}
      <div className={`bg-white shadow-sm sticky top-0 z-50 transition-all duration-300`}>
        {/* Main Header */}
        <div className={`transition-all duration-300 ${isScrolled ? 'py-1' : 'py-1 md:py-1'}`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between gap-2">
              {/* Logo */}
              <Link href="/" className="shrink-0 cursor-pointer">
                <Image
                  src="/assets/images/anginarbazar_logo.png"
                  alt="Anginar Bazar"
                  width={150}
                  height={50}
                  loading="eager"
                  className={`w-auto transition-all duration-300 ${isScrolled ? 'h-8 md:h-16' : 'h-10 md:h-18'}`}
                />
              </Link>

              {/* Download App Image */}
              <Link href="/download-app" className="hidden md:block shrink-0 cursor-pointer">
                <Image
                  src="/assets/images/google-play-app-store-png.png"
                  alt="Download App"
                  width={120}
                  height={40}
                  loading="eager"
                  className="w-auto h-10 hover:opacity-80 transition-opacity"
                />
              </Link>

              {/* Search Bar - Desktop */}
              <div className="hidden md:flex flex-1 max-w-xl">
                <SearchBar />
              </div>

              {/* WhatsApp Chat Icon - Desktop */}
              <a
                href="https://wa.me/8801889093967"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-3 py-2 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors cursor-pointer"
                title="Chat on WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="font-medium text-sm">Chat</span>
              </a>

              {/* User Section - Desktop */}
              <div className="hidden md:flex items-center gap-3">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="w-9 h-9 bg-[#FF5533] rounded-full flex items-center justify-center text-white font-bold">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{user.name}</p>
                        <p className="text-xs text-gray-500">+88 {user.phone}</p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Profile Dropdown */}
                    {showProfileMenu && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowProfileMenu(false)} />
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-40 animate-zoom-in">
                          <div className="bg-gradient-to-br from-[#FF5533] to-[#e64e27] p-4 text-white">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                                <span className="text-2xl font-bold">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                              </div>
                              <div>
                                <p className="font-bold text-lg leading-tight">{user.name}</p>
                                <p className="text-sm text-white/90">+88 {user.phone}</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-2">
                            <Link
                              href="/profile"
                              className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors group"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <div className="w-10 h-10 bg-[#FF5533]/10 rounded-full flex items-center justify-center group-hover:bg-[#FF5533]/20 transition-colors">
                                <UserCircle size={20} className="text-[#FF5533]" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">My Profile</p>
                                <p className="text-xs text-gray-500">View and edit profile</p>
                              </div>
                            </Link>

                            <Link
                              href="/dashboard"
                              className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors group"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <LayoutDashboard  size={20} className="text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">Dashboard</p>
                                <p className="text-xs text-gray-500">View your dashboard</p>
                              </div>
                            </Link>

                            <Link
                              href="/my-orders"
                              className="flex items-center gap-3 px-3 py-3 hover:bg-gray-50 rounded-lg transition-colors group"
                              onClick={() => setShowProfileMenu(false)}
                            >
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <ShoppingBag size={20} className="text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-gray-800">My Orders</p>
                                <p className="text-xs text-gray-500">Track your orders</p>
                              </div>
                            </Link>

                            <div className="border-t border-gray-100 my-2"></div>

                            <button
                              onClick={handleLogout}
                              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-red-50 rounded-lg transition-colors group"
                            >
                              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                <LogOut size={20} className="text-red-600" />
                              </div>
                              <div className="flex-1 text-left">
                                <p className="font-semibold text-red-600">Logout</p>
                                <p className="text-xs text-red-500">Sign out from account</p>
                              </div>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="px-6 py-2 text-sm font-medium bg-[#FF5533] text-white rounded-md hover:bg-[#e64e27] transition-colors cursor-pointer"
                  >
                    Sign In / Sign Up
                  </button>
                )}
              </div>

              {/* Call for Order - Mobile Only */}
              <a
                href="tel:01889093967"
                className="md:hidden flex items-center gap-1.5 px-2 py-1 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] transition-colors cursor-pointer flex-shrink-0"
              >
                <span className="relative flex items-center justify-center w-6 h-6">
                  <span className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping"></span>
                  <Phone size={16} className="relative animate-ring" />
                </span>
                <span className="font-medium text-xs whitespace-nowrap leading-none">
                  For Order: 01889093967
                </span>
              </a>

              {/* Download App - Mobile */}
              <Link href="/download-app" className="md:hidden shrink-0 cursor-pointer">
                <Image
                  src="/assets/images/google-play-app-store-png.png"
                  width={80}
                  height={30}
                  alt="Download App"
                  className="w-auto h-8 hover:opacity-80 transition-opacity"
                />
              </Link>
            </div>

            {/* Mobile Search Bar */}
            <div className="md:hidden pt-3 pb-1">
              <div className="relative flex items-center gap-2">
                <button
                  className="hover:text-[#FF5533] flex-shrink-0 cursor-pointer dark:text-black"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                <div className="flex-1">
                  <SearchBar onMobile={true} />
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="relative">
                    <button
                      onClick={() => setShowMobileUserMenu(!showMobileUserMenu)}
                      className="w-9 h-9 bg-[#FF5533] rounded-full flex items-center justify-center text-white hover:bg-[#e64e27] transition-colors cursor-pointer"
                    >
                      {user ? (
                        <span className="text-white font-bold text-sm">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      ) : (
                        <svg width="4" height="16" viewBox="0 0 4 16" fill="none">
                          <circle cx="2" cy="2" r="2" fill="white"/>
                          <circle cx="2" cy="8" r="2" fill="white"/>
                          <circle cx="2" cy="14" r="2" fill="white"/>
                        </svg>
                      )}
                    </button>

                    {showMobileUserMenu && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowMobileUserMenu(false)} />
                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-40">
                          <a
                            href="https://wa.me/8801889093967"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-t"
                          >
                            <div className="w-8 h-8 bg-[#25D366] rounded-full flex items-center justify-center text-white">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">WhatsApp Chat</div>
                              <div className="text-sm font-medium text-gray-700">Start Conversation</div>
                            </div>
                          </a>

                          {user ? (
                            <>
                              <div className="bg-gradient-to-br from-[#FF5533] to-[#e64e27] p-3 text-white">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                    <span className="font-bold">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm">{user.name}</p>
                                    <p className="text-xs text-white/90">+88 {user.phone}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="p-2">
                                <Link
                                  href="/profile"
                                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded transition"
                                  onClick={() => setShowMobileUserMenu(false)}
                                >
                                  <UserCircle size={18} className="text-[#FF5533]" />
                                  <span className="text-sm text-gray-800 font-medium">My Profile</span>
                                </Link>
                                <Link
                                  href="/dashboard"
                                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded transition"
                                  onClick={() => setShowMobileUserMenu(false)}
                                >
                                  <LayoutDashboard size={18} className="text-green-600" />
                                  <span className="text-sm text-gray-800 font-medium">Dashboard</span>
                                </Link>
                                <Link
                                  href="/my-orders"
                                  className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded transition"
                                  onClick={() => setShowMobileUserMenu(false)}
                                >
                                  <ShoppingBag size={18} className="text-purple-600" />
                                  <span className="text-sm text-gray-800 font-medium">My Orders</span>
                                </Link>
                                <div className="border-t my-2"></div>
                                <button
                                  onClick={handleLogout}
                                  className="w-full flex items-center gap-3 px-3 py-2 hover:bg-red-50 rounded transition"
                                >
                                  <LogOut size={18} className="text-red-600" />
                                  <span className="text-sm font-medium text-red-600">Logout</span>
                                </button>
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="p-3">
                                <button
                                  onClick={() => { setShowMobileUserMenu(false); setShowAuthModal(true); }}
                                  className="w-full bg-[#FF5533] text-white py-2.5 rounded-lg font-semibold hover:bg-[#e64e27] transition"
                                >
                                  Sign In / Sign Up
                                </button>
                              </div>
                              <a
                                href="tel:01889093967"
                                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-t"
                              >
                                <div className="w-8 h-8 bg-[#FF5533] rounded-full flex items-center justify-center text-white">
                                  <Phone size={16} />
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">For Support</div>
                                  <div className="text-sm font-medium text-gray-700">01889093967</div>
                                </div>
                              </a>
                            </>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Scrollable Quick Links Bar */}
            <div className="md:hidden pt-1.5 -mx-4 px-4 border-t border-gray-200">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar" style={{ scrollBehavior: 'smooth' }}>
                {mobileQuickLinks.map((link, index) => (
                  <Link
                    key={index}
                    href={link.href}
                    className="flex-shrink-0 px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== Shop by Category Bar - Desktop Only ===== */}
        <div className="border-t border-gray-200 hidden md:block">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 py-1">

              {/* Shop by Category - Click to Toggle Dropdown */}
              <div className="relative px-4 flex-shrink-0">
                {/* ✅ Click করলে menu খুলবে/বন্ধ হবে */}
                <button
                  onClick={toggleCategoryMenu}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded transition-colors cursor-pointer ${
                    showCategoriesMenu ? 'bg-[#FF5533] text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Menu size={18} />
                  <span className={`font-semibold text-sm ${showCategoriesMenu ? 'text-white' : 'text-gray-800'}`}>
                    SHOP BY CATEGORY
                  </span>
                  {/* Arrow indicator */}
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${showCategoriesMenu ? 'rotate-180 text-white' : 'text-gray-600'}`}
                  />
                </button>

                {/* ✅ Overlay - বাইরে click করলে menu বন্ধ হবে */}
                {showCategoriesMenu && (
                  <div
                    className="fixed inset-0 z-40"
                    onClick={closeCategoryMenu}
                  />
                )}

                {/* Mega Menu Dropdown */}
                {showCategoriesMenu && !loadingCategories && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-lg rounded-md z-50 animate-zoom-in flex">
                    
                    {/* Parent Categories - hover এ subcategory দেখাবে */}
                    <div className="w-72 h-52 sm:h-64 md:h-72 lg:h-96 overflow-y-auto hide-scrollbar border-r border-gray-200">
                      {categories.map((category, index) => (
                        <div
                          key={category.id}
                          // ✅ Parent category তে hover করলে subcategory দেখাবে
                          onMouseEnter={() => setSelectedCategory(index)}
                        >
                          <Link
                            href={`/category/${category.slug}`}
                            onClick={closeCategoryMenu}
                            className={`flex items-center gap-2 px-3 py-2 hover:bg-[#FFF5F3] hover:text-[#FF5533] transition-colors border-b border-gray-100 cursor-pointer ${
                              selectedCategory === index ? 'bg-[#FFF5F3] text-[#FF5533]' : 'text-gray-700'
                            }`}
                          >
                            <div className="w-6 h-6 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                              {category.image && category.image !== 'null' ? (
                                <Image
                                  src={`https://app.anginarbazar.com/uploads/images/thumbnail/${category.image}`}
                                  alt={category.category_name}
                                  width={24}
                                  height={24}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <Menu size={12} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium text-sm flex-1">{category.category_name}</span>
                            {category.subcategories && category.subcategories.length > 0 && (
                              <ChevronRight size={16} className="flex-shrink-0" />
                            )}
                          </Link>
                        </div>
                      ))}
                    </div>

                    {/* ✅ Subcategories Panel - hover এ দেখাবে */}
                    {selectedCategory !== null &&
                      categories[selectedCategory]?.subcategories &&
                      categories[selectedCategory].subcategories.length > 0 && (
                      <div className="w-64 h-52 sm:h-64 md:h-72 lg:h-96 overflow-y-auto hide-scrollbar bg-gray-50">
                        <div className="sticky top-0 bg-[#FF5533] text-white px-3 py-2 font-semibold text-sm">
                          {categories[selectedCategory].category_name}
                        </div>
                        {categories[selectedCategory].subcategories.map((subcat) => (
                          <Link
                            key={subcat.id}
                            href={`/category/${subcat.slug}`}
                            onClick={closeCategoryMenu}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-white hover:text-[#FF5533] transition-colors border-b border-gray-200 cursor-pointer text-gray-700"
                          >
                            <div className="w-5 h-5 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                              {subcat.image && subcat.image !== 'null' ? (
                                <Image
                                  src={`https://app.anginarbazar.com/uploads/images/thumbnail/${subcat.image}`}
                                  alt={subcat.category_name}
                                  width={20}
                                  height={20}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200"></div>
                              )}
                            </div>
                            <span className="text-sm font-medium">{subcat.category_name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Scrollable Right Side Menu Items */}
              <div className="flex-1 min-w-0 relative">
                {/* Left Arrow */}
                {showLeftArrow && (
                  <button
                    onClick={slideLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-1.5 transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                )}
                
                {/* Right Arrow */}
                {showRightArrow && (
                  <button
                    onClick={slideRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-1.5 transition-all"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                )}

                <div 
                  ref={desktopMenuRef}
                  onScroll={checkArrows}
                  className="overflow-x-auto overflow-y-hidden hide-scrollbar w-full"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  <div className="flex items-center gap-2 py-1">
                    {/* Home Link */}
                    <div className="pr-2 pl-10 flex-shrink-0">
                      <Link href="/" className="flex items-center px-2">
                        <span className="font-semibold text-sm leading-none text-gray-600 hover:text-[#FF5533] transition-colors whitespace-nowrap">
                          HOME
                        </span>
                      </Link>
                    </div>

                    {/* Shop Link */}
                    <div className="pr-2 flex-shrink-0">
                      <a href="/shop" className="flex items-center px-2">
                        <span className="font-semibold text-sm leading-none text-gray-600 hover:text-[#FF5533] transition-colors whitespace-nowrap">
                          SHOP
                        </span>
                      </a>
                    </div>

                    {/* Special Offer Link */}
                    <div className="pr-2 flex-shrink-0">
                      <a href="/special-offer" className="flex items-center px-2">
                        <span className="font-semibold text-sm leading-none text-gray-600 hover:text-[#FF5533] transition-colors whitespace-nowrap">
                          SPECIAL OFFER
                        </span>
                      </a>
                    </div>

                    {/* Categories Link */}
                    <div className="pr-2 flex-shrink-0">
                      <a href="/categories" className="flex items-center px-2">
                        <span className="font-semibold text-sm leading-none text-gray-600 hover:text-[#FF5533] transition-colors whitespace-nowrap">
                          CATEGORIES
                        </span>
                      </a>  
                    </div>

                    {/* Brand Store Link */}
                    <div className="pr-2 flex-shrink-0">
                      <a href="/brands" className="flex items-center px-2">
                        <span className="font-semibold text-sm leading-none text-gray-600 hover:text-[#FF5533] transition-colors whitespace-nowrap">
                          BRAND STORE
                        </span>
                      </a>
                    </div>

                    
                  </div>
                </div>
              </div>

              {/* Call for Order - Desktop - Always Visible */}
              <div className="pr-4 flex-shrink-0">
                <a
                  href="tel:01889093967"
                  className="flex items-center gap-2 px-2 bg-[#FF5533] text-white rounded-md hover:bg-[#e64e27] transition-colors cursor-pointer"
                >
                  <span className="relative flex items-center justify-center w-8 h-8">
                    <span className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping"></span>
                    <Phone size={18} className="relative animate-ring" />
                  </span>
                  <span className="font-medium text-sm leading-none">
                    Call for Order: 01889093967
                  </span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu - Slide from Left */}
        {mobileMenuOpen && (
          <>
            <div
              className="md:hidden fixed inset-0 bg-white/60 backdrop-blur-sm z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="md:hidden fixed left-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in">
              <div className="p-4">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="absolute top-4 right-4 text-gray-600 hover:text-[#FF5533] cursor-pointer"
                >
                  <X size={24} />
                </button>

                <div className="mb-6 pt-2">
                  <h2 className="text-xl font-bold text-gray-800">Categories</h2>
                </div>

                <div className="mt-4">
                  {loadingCategories ? (
                    <div className="text-center py-4 text-gray-500">Loading categories...</div>
                  ) : (
                    categories.map((category, index) => (
                      <div key={category.id} className="border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <Link
                            href={`/category/${category.slug}`}
                            className="flex items-center gap-2 py-3 text-gray-700 hover:text-[#FF5533] transition-colors cursor-pointer flex-1"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <div className="w-6 h-6 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                              {category.image && category.image !== 'null' ? (
                                <Image
                                  src={`https://app.anginarbazar.com/uploads/images/thumbnail/${category.image}`}
                                  alt={category.category_name}
                                  width={24}
                                  height={24}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                  <Menu size={12} className="text-gray-400" />
                                </div>
                              )}
                            </div>
                            <span className="font-medium flex-1">{category.category_name}</span>
                          </Link>

                          {category.subcategories && category.subcategories.length > 0 && (
                            <button
                              onClick={() => toggleMobileCategory(index)}
                              className="p-2 rounded transition-colors"
                            >
                              <ChevronDown
                                size={18}
                                className={`transition-transform text-gray-900 ${expandedMobileCategory === index ? 'rotate-180' : ''}`}
                              />
                            </button>
                          )}
                        </div>

                        {expandedMobileCategory === index && category.subcategories && category.subcategories.length > 0 && (
                          <div className="pl-8 pb-2 space-y-1 bg-gray-50">
                            {category.subcategories.map((subcat) => (
                              <Link
                                key={subcat.id}
                                href={`/category/${subcat.slug}`}
                                className="flex items-center gap-2 py-2 text-gray-900 hover:text-[#FF5533] transition-colors cursor-pointer"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <div className="w-4 h-4 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                  {subcat.image && subcat.image !== 'null' ? (
                                    <Image
                                      src={`https://app.anginarbazar.com/uploads/images/thumbnail/${subcat.image}`}
                                      alt={subcat.category_name}
                                      width={16}
                                      height={16}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200"></div>
                                  )}
                                </div>
                                <span className="text-sm">{subcat.category_name}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Authentication Manager Component */}
      <AuthenticationManager
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </>
  );
}