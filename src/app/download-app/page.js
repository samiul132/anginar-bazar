'use client';
import { Smartphone, Download, CheckCircle, Star, Zap, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function DownloadAppPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Header */}
      <div className="bg-linear-to-r from-[#FF5533] to-[#e64e27] text-white py-4 w-full text-center">
        <div className="max-w-3xl mx-auto px-4">
            <div className="flex flex-col items-center gap-3">
            {/* App Icon */}
            <div className="bg-white w-20 h-20 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
              <Image
                src="/app_icon.png"
                alt="Anginar Bazar App Icon"
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            <h1 className="text-xl md:text-2xl font-bold">আঙ্গিনার বাজার মোবাইল অ্যাপ ডাউনলোড করুন</h1>

            {/* Download Button */}
            <div className="shrink-0">
              <a
                href="/anginar-bazar.apk"
                download
                className="inline-flex items-center gap-2 bg-[#ffffff] hover:bg-[#f7e4e0] text-[#FF5533] font-semibold px-6 py-3 rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <Download size={20} />
                ডাউনলোড
              </a>
            </div>

            {/* Notice Text */}
            <p className="bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm px-4 py-2 rounded-lg mt-2 max-w-xl">
              আমাদের অ্যাপটি খুব শীঘ্রই প্লে স্টোরে পাওয়া যাবে। ম্যানুয়ালি ইনস্টল করতে উপরের ডাউনলোড বাটনে ক্লিক করুন।
            </p>

            </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6 w-full">

        {/* Back Button */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[#FF5533] hover:text-[#e64e27] font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}