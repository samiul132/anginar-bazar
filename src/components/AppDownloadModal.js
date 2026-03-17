'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Image from 'next/image';

function getMobilePlatform() {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  if (/android/i.test(ua)) return 'android';
  return null;
}

export default function AppDownloadModal() {
  const [platform, setPlatform] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const dismissed = sessionStorage.getItem('app-modal-dismissed');
      if (dismissed) return;
      const detected = getMobilePlatform();
      if (!detected) return;
      setPlatform(detected);
      setVisible(true);
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  const handleClose = () => {
    setVisible(false);
    sessionStorage.setItem('app-modal-dismissed', '1');
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}
      onClick={handleClose}
    >
      <div
        className="relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ maxWidth: '360px', animation: 'popIn 0.3s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 hover:bg-gray-200 rounded-full p-1"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="px-5 py-8 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-900 text-center">
            Download the Anginar Bazar App
          </h2>

          {/* App Store */}
          {/* <a
            href="/anginar-bazar.apk"
            download
            onClick={handleClose}
            className="block"
          >
            <div className="relative w-full h-14">
              <Image
                src="/assets/images/app-store-download-on-the-app-store.png"
                alt="Download on the App Store"
                fill
                className="object-contain"
              />
            </div>
          </a> */}

          {/* Google Play */}
          <a
            href="https://play.google.com/store/apps/details?id=com.designcodeit.anginarbazar"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClose}
            className="block"
          >
            <div className="relative w-full h-14">
              <Image
                src="/assets/images/google-play-app-store-png.png"
                alt="Get it on Google Play"
                fill
                className="object-contain"
              />
            </div>
          </a>

        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0.85); opacity: 0; }
          to   { transform: scale(1);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}