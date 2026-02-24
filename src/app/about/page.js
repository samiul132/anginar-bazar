'use client';

import { Store, Truck, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">

      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF5533] to-[#e64e27] text-white py-10 w-full text-center">
        <div className="max-w-3xl mx-auto px-4">

          <div className="flex flex-col items-center gap-3">
            <Store size={40} />
            <h1 className="text-3xl md:text-4xl font-bold">
              About Anginar Bazar
            </h1>

            <p className="text-white/90 text-sm md:text-base max-w-xl">
              Your trusted online grocery shop delivering fresh products to your doorstep.
            </p>

          </div>

        </div>
      </div>


      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">


        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 text-center">

          <p className="text-gray-700 text-lg leading-relaxed">

            <strong>Anginar Bazar</strong> is a trusted online grocery platform 
            based in Chengarchar Bazar, Matlab Uttar, Chandpur. We provide fresh groceries, 
            daily essentials, and household products at affordable prices.

          </p>

          <p className="text-gray-600 mt-4">

            Our goal is to make shopping easier, faster, and more convenient 
            for everyone by delivering quality products directly to your home.

          </p>

        </div>



        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">


          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">

            <Truck className="mx-auto text-[#FF5533]" size={35} />

            <h3 className="font-semibold text-lg mt-3">
              Fast Delivery
            </h3>

            <p className="text-gray-600 text-sm mt-2">
              Quick and reliable delivery to your doorstep.
            </p>

          </div>



          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">

            <ShieldCheck className="mx-auto text-[#FF5533]" size={35} />

            <h3 className="font-semibold text-lg mt-3">
              Trusted Service
            </h3>

            <p className="text-gray-600 text-sm mt-2">
              100% genuine and quality products.
            </p>

          </div>



          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">

            <Users className="mx-auto text-[#FF5533]" size={35} />

            <h3 className="font-semibold text-lg mt-3">
              Customer First
            </h3>

            <p className="text-gray-600 text-sm mt-2">
              Customer satisfaction is our top priority.
            </p>

          </div>



        </div>



        {/* Back Button */}
        <div className="text-center pt-4">

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
