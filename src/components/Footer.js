'use client';

import Link from 'next/link';
import { Phone, Mail, Facebook, Instagram, Youtube, ChevronRight, Info, Lock, Trash2, RotateCcw, User, LayoutDashboard, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useSyncExternalStore } from 'react';
import { storage } from '@/lib/api';
import { useState } from 'react';
import AuthenticationManager from '@/components/AuthenticationManager';


let cachedSnapshot = null;

function getAuthSnapshot() {
  const token = storage.getAuthToken();
  const customerData = storage.getCustomerData();
  const user = token && customerData ? customerData : null;

  // Return null as-is (primitive, always stable)
  if (user === null) {
    cachedSnapshot = null;
    return null;
  }

  // Only create new object if data actually changed
  const newJson = JSON.stringify(user);
  if (!cachedSnapshot || JSON.stringify(cachedSnapshot) !== newJson) {
    cachedSnapshot = user;
  }

  return cachedSnapshot;
}

function getServerSnapshot() {
  return null; 
}

function subscribeToAuth(callback) {
  window.addEventListener('authStateChanged', callback);
  return () => window.removeEventListener('authStateChanged', callback);
}

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const user = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getServerSnapshot
  );

  const [showAuthModal, setShowAuthModal] = useState(false);

  const accountLinks = [
    { name: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { name: "My Profile", url: "/profile", icon: User },
    { name: "My Orders", url: "/my-orders", icon: ShoppingBag },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">

      {/* Main Footer Content */}
      <div className="bg-linear-to-br from-gray-50 to-gray-100 py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Company Info */}
            <div>
              <Link href="/" className="inline-block">
                <Image
                  src="/assets/images/anginarbazar_logo.png"
                  alt="Anginar Bazar Logo"
                  width={160}
                  height={50}
                  priority
                  className="h-16 w-auto"
                />
              </Link>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                Your trusted online grocery store delivering fresh and quality products directly to your doorstep.
              </p>
              <div className="flex gap-3">
                {[
                  { Icon: Facebook, url: "https://www.facebook.com/anginarbazar", color: "hover:bg-blue-600" },
                  { Icon: Instagram, url: "#", color: "hover:bg-pink-600" },
                  { Icon: Youtube, url: "#", color: "hover:bg-red-600" }
                ].map(({ Icon, url, color }, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-gray-200 ${color} p-2.5 rounded-lg transition-all duration-300 hover:scale-110 cursor-pointer text-gray-700 hover:text-white`}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <ChevronRight size={20} className="text-[#FF5533]" />
                Quick Links
              </h3>
              <ul className="space-y-3">
                {[
                  { name: "About Us", url: "/about", icon: Info },
                  { name: "Contact Us", url: "/contact-us", icon: Phone },
                  { name: "Privacy Policy", url: "/privacy-policy", icon: Lock },
                  { name: "Refund Policy", url: "/refund-policy", icon: RotateCcw },
                  { name: "Delete Account", url: "/delete-account", icon: Trash2 }
                ].map((link, idx) => (
                  <li key={idx}>
                    <Link
                      href={link.url}
                      className="text-gray-600 hover:text-[#FF5533] transition-colors duration-200 flex items-center gap-2 group text-sm"
                    >
                      <link.icon size={14} className="text-[#FF5533]" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* My Account */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <ChevronRight size={20} className="text-[#FF5533]" />
                My Account
              </h3>
              <a
                href="https://wa.me/8801889093967"
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-20 mb-2 items-center gap-2 px-2 py-1.5 bg-[#25D366] text-white rounded-lg hover:bg-[#20BA5A] transition-colors cursor-pointer"
                title="Chat on WhatsApp"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span className="font-medium text-sm">Chat</span>
              </a>

              {user ? (

                <ul className="space-y-3">
                  {accountLinks.map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.url}
                        className="text-gray-600 hover:text-[#FF5533] transition-colors duration-200 flex items-center gap-2 group text-sm"
                      >
                        <link.icon size={14} className="text-[#FF5533]" />
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {link.name}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

              ) : (

                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-[#FF5533] text-white px-2 py-1 rounded-lg text-sm font-semibold hover:bg-[#e64e27] transition cursor-pointer"
                >
                  Sign in / Sign Up
                </button>

              )}
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                <ChevronRight size={20} className="text-[#FF5533]" />
                Get In Touch
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <div className="bg-[#FF5533] p-2 rounded-lg mt-0.5">
                    <Mail size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Email us</p>
                    <a href="mailto:anginarbazar@gmail.com" className="text-gray-900 hover:text-[#FF5533] transition-colors font-medium break-all">
                      anginarbazar@gmail.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-2 text-gray-600 text-sm">
                  <div className="bg-[#FF5533] p-2 rounded-lg mt-0.5">
                    <Phone size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Call us</p>
                    <a
                      href="tel:01889093967"
                      className="text-gray-900 hover:text-[#FF5533] transition-colors font-medium"
                    >
                      01889093967
                    </a>
                  </div>
                </li>
              </ul>

              <div className="mt-4">
                <Link href="/download-app" className="block">
                  <Image
                    src="/assets/images/google-play-app-store-png.png"
                    alt="Download App"
                    width={140}
                    height={42}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-900 text-gray-400 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-sm">
            <p className="text-center md:text-left">
              &copy; {currentYear}{' '}
              <span className="text-white font-medium">
                <Link href="/" className="hover:text-white transition-colors">Anginar Bazar</Link>
              </span>. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <AuthenticationManager
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={() => setShowAuthModal(false)}
      />
    </footer>
  );
}