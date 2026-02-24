'use client';

import { Shield, Bell, Lock, Eye, UserCheck, Database, Cookie, Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 2026";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#FF5533] to-[#e64e27] text-white py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={40} />
            <h1 className="text-3xl md:text-4xl font-bold">Privacy Policy</h1>
          </div>
          <p className="text-white/90 text-lg">
            Your privacy and data security are our top priorities
          </p>
          <p className="text-white/70 text-sm mt-2">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <p className="text-gray-700 leading-relaxed">
            Welcome to <span className="font-bold text-[#FF5533]">Anginar Bazar</span>. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and mobile application.
          </p>
        </div>

        {/* Notification Permissions */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FF5533] p-3 rounded-lg">
              <Bell size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Notification Permissions</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              We request notification permissions to enhance your shopping experience and keep you informed about:
            </p>
            
            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Order Updates:</strong> Real-time notifications about your order status, including confirmation, processing, shipping, and delivery updates.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Special Offers:</strong> Exclusive deals, discounts, and promotional offers tailored to your preferences.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Product Availability:</strong> Alerts when out-of-stock items you&apos;re interested in become available again.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Important Announcements:</strong> Service updates, policy changes, and other important information.</span>
              </li>
            </ul>

            <div className="bg-orange-50 border-l-4 border-[#FF5533] p-4 mt-6">
              <p className="text-sm font-medium text-gray-800">
                <strong>Your Control:</strong> You can enable or disable notifications at any time through your device settings or app preferences. We respect your choice and will not send notifications without your explicit permission.
              </p>
            </div>
          </div>
        </div>

        {/* Data Safety & Security */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FF5533] p-3 rounded-lg">
              <Lock size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Data Safety & Security</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              We take the security of your personal data very seriously and implement multiple layers of protection:
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Database size={20} className="text-[#FF5533]" />
                  <h3 className="font-bold text-gray-900">Secure Storage</h3>
                </div>
                <p className="text-sm">All your data is stored on encrypted servers with industry-standard security protocols.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={20} className="text-[#FF5533]" />
                  <h3 className="font-bold text-gray-900">SSL Encryption</h3>
                </div>
                <p className="text-sm">We use SSL/TLS encryption to protect data transmitted between your device and our servers.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={20} className="text-[#FF5533]" />
                  <h3 className="font-bold text-gray-900">Limited Access</h3>
                </div>
                <p className="text-sm">Only authorized personnel have access to your personal information, and only when necessary.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Cookie size={20} className="text-[#FF5533]" />
                  <h3 className="font-bold text-gray-900">No Data Selling</h3>
                </div>
                <p className="text-sm">We never sell, rent, or share your personal information with third parties for marketing purposes.</p>
              </div>
            </div>

            <h3 className="font-bold text-gray-900 mt-6 mb-3">Information We Collect:</h3>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Account Information:</strong> Name, phone number, email address</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Delivery Information:</strong> Shipping addresses, delivery preferences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Order History:</strong> Purchase records and transaction details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Device Information:</strong> Device type, browser type, IP address for security purposes</span>
              </li>
            </ul>

            <h3 className="font-bold text-gray-900 mt-6 mb-3">How We Use Your Data:</h3>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span>Process and deliver your orders</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span>Provide customer support and respond to inquiries</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span>Improve our services and user experience</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span>Send order updates and important notifications (with your permission)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span>Prevent fraud and maintain platform security</span>
              </li>
            </ul>
          </div>
        </div>

        {/* User Behavior & Community Standards */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-[#FF5533] p-3 rounded-lg">
              <UserCheck size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">User Behavior & Community Standards</h2>
          </div>
          
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">
              At Anginar Bazar, we believe in maintaining a respectful and safe environment for all users. We expect all our customers to:
            </p>

            <div className="bg-green-50 border-l-4 border-green-500 p-4">
              <h3 className="font-bold text-green-900 mb-2">Expected Behavior:</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Treat our staff and delivery personnel with respect and courtesy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Provide accurate information during account creation and checkout</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Use the platform for legitimate shopping purposes only</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Report any issues or concerns through proper channels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Respect our refund and return policies</span>
                </li>
              </ul>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
              <h3 className="font-bold text-red-900 mb-2">Prohibited Activities:</h3>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Harassment or abuse of staff, delivery personnel, or other users</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Creating fake accounts or providing false information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Attempting to exploit bugs, vulnerabilities, or promotional codes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Fraudulent transactions or payment chargebacks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-1">✗</span>
                  <span>Violating any applicable laws or regulations</span>
                </li>
              </ul>
            </div>

            <p className="mt-4 text-sm bg-gray-50 p-4 rounded-lg">
              <strong>Note:</strong> Violation of these standards may result in account suspension or termination. We reserve the right to refuse service to anyone who engages in prohibited activities.
            </p>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Privacy Rights</h2>
          
          <div className="space-y-4 text-gray-700">
            <p className="leading-relaxed">You have the right to:</p>
            
            <ul className="space-y-3 ml-6">
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Access your data:</strong> Request a copy of all personal information we hold about you</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Update your information:</strong> Correct or update any inaccurate data in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Delete your account:</strong> Request deletion of your account and associated data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Opt-out:</strong> Unsubscribe from marketing communications at any time</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#FF5533] mt-1">•</span>
                <span><strong>Data portability:</strong> Request your data in a portable format</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions About Privacy?</h2>
          <p className="text-gray-700 mb-6">
            If you have any questions, concerns, or requests regarding this Privacy Policy or your personal data, please don&apos;t hesitate to contact us:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <a 
              href="mailto:anginarbazar@gmail.com"
              className="flex items-center gap-3 bg-white p-4 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="bg-[#FF5533] p-3 rounded-lg">
                <Mail size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email Us</p>
                <p className="font-medium text-gray-900">anginarbazar@gmail.com</p>
              </div>
            </a>

            <a 
              href="tel:+8801889093967"
              className="flex items-center gap-3 bg-white p-4 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="bg-[#FF5533] p-3 rounded-lg">
                <Phone size={20} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Call Us</p>
                <p className="font-medium text-gray-900">+88 01889093967</p>
              </div>
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-[#FF5533] hover:text-[#e64e27] font-medium transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}