'use client';

import { RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">


      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF5533] to-[#e64e27] text-white py-10 w-full text-center">

        <div className="max-w-3xl mx-auto px-4">

          <div className="flex flex-col items-center gap-3">

            <RotateCcw size={40} />

            <h1 className="text-3xl md:text-4xl font-bold">
              Refund Policy
            </h1>

            <p className="text-white/90 text-sm">
              Anginar Bazar Refund & Return Policy
            </p>

          </div>

        </div>

      </div>



      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-10">

        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 space-y-5 text-gray-700 text-sm leading-relaxed">


          <p>

            Thank you for shopping with <strong>Anginar Bazar</strong>. 
            We are committed to providing quality products and the best service.

          </p>



          {/* Section */}
          <div>

            <h2 className="font-semibold text-lg mb-2 text-black">
              1. Refund Eligibility
            </h2>

            <p>

              You may request a refund if:

            </p>

            <ul className="list-disc pl-5 mt-2 space-y-1">

              <li>Product is damaged</li>

              <li>Wrong product delivered</li>

              <li>Product is expired</li>

              <li>Product is missing from your order</li>

            </ul>

          </div>



          {/* Section */}
          <div>

            <h2 className="font-semibold text-lg mb-2 text-black">
              2. Refund Request Time
            </h2>

            <p>

              Refund must be requested within <strong>24 hours</strong> after delivery.

            </p>

          </div>



          {/* Section */}
          <div>

            <h2 className="font-semibold text-lg mb-2 text-black">
              3. Refund Process
            </h2>

            <p>

              After verification, refund will be processed within 
              <strong> 1-2 working days</strong>.

            </p>

          </div>



          {/* Section */}
          <div>

            <h2 className="font-semibold text-lg mb-2 text-black">
              4. Non-Refundable Cases
            </h2>

            <ul className="list-disc pl-5 mt-2 space-y-1">

              <li>Change of mind after delivery</li>

              <li>Product used or damaged by customer</li>

              <li>Request made after 24 hours</li>

            </ul>

          </div>



          {/* Section */}
          <div>

            <h2 className="font-semibold text-lg mb-2 text-black">
              5. Contact Us
            </h2>

            <p>

              For refund requests, please contact us via phone, whatsapp, imo or Facebook page.

            </p>

          </div>



          <p className="text-xs text-gray-500 pt-4">

            Last updated: February 2026

          </p>



        </div>



        {/* Back */}
        <div className="text-center mt-6">

          <Link
            href="/"
            className="text-[#FF5533] hover:text-[#e64e27] font-medium"
          >
            ← Back to Home
          </Link>

        </div>



      </div>



    </div>
  );
}
