'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { contact } from '@/lib/api';
import {
  ChevronLeft,
  Send,
  Phone,
  Facebook, 
  Mail,
  MapPin,
  MessageSquare,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';
import Swal from 'sweetalert2';

export default function ContactPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    number: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.message.trim()) {
      await Swal.fire({
        title: 'Missing Fields',
        text: 'Please fill in your name and message.',
        icon: 'warning',
        confirmButtonColor: '#FF5533',
      });
      return;
    }

    setSubmitting(true);

    try {
      const data = await contact.send({
        name: form.name,
        number: form.number,
        email: form.email,
        message: form.message,
      });

      if (!data.success) throw new Error(data.message || 'Failed to send message');

      setSubmitted(true);
      await Swal.fire({
        title: 'Message Sent!',
        text: 'Thank you for contacting us. We will get back to you soon.',
        icon: 'success',
        confirmButtonColor: '#FF5533',
        confirmButtonText: 'OK',
      });

      setForm({ name: '', number: '', email: '', message: '' });
      setSubmitted(false);

    } catch (error) {
      await Swal.fire({
        title: 'Error!',
        text: error.message || 'Something went wrong. Please try again.',
        icon: 'error',
        confirmButtonColor: '#FF5533',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      label: 'Phone, WhatsApp, IMO',
      value: '+880 1889093967',
      href: 'tel:+8801889093967',
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      icon: Facebook,
      label: 'Facebook',
      value: 'আঙ্গিনার বাজার - Anginar Bazar',
      href: 'https://www.facebook.com/anginarbazar',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'anginarbazar@gmail.com',
      href: 'mailto:anginarbazar@gmail.com',
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      icon: MapPin,
      label: 'Address',
      value: 'Chengarchar Bazar, Matlab Uttar, Chandpur, Bangladesh',
      href: '#',
      color: 'text-red-600',
      bg: 'bg-red-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Contact Us
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── LEFT SIDE ── */}
          <div className="space-y-6">
            {/* Logo + Brand */}
            <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col items-center text-center">
              <div className="relative w-38 h-auto mb-2">
                <Image
                  src="/assets/images/anginarbazar_logo.png"
                  alt="Anginar Bazar Logo"
                  fill
                  className="object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                {/* Fallback if no logo image */}
                <div className="w-28 h-28 bg-gradient-to-br rounded-2xl flex items-center justify-center text-white text-4xl font-black">
                  A
                </div>
              </div>

              <h2 className="text-2xl font-black text-gray-900 mb-1">
                Anginar Bazar
              </h2>
              <p className="text-[#FF5533] font-semibold text-sm mb-3">
                আপনার বিশ্বস্ত অনলাইন শপ
              </p>
              <p className="text-gray-500 text-sm leading-relaxed">
                We are here to help you with anything you need. Reach out to us
                through any of the channels below and our team will respond
                promptly.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-3">
              {contactInfo.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    target={item.href.startsWith('http') ? '_blank' : '_self'}
                    rel="noreferrer"
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-3 flex items-center gap-2 group"
                  >
                    <div
                      className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                        {item.label}
                      </p>
                      <p className="text-gray-800 font-semibold text-sm">
                        {item.value}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>

          </div>

          {/* ── RIGHT SIDE — Form ── */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              Send us a Message
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              Fill out the form below and we&apos;ll get back to you as soon as
              possible.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-gray-200 text-gray-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF5533] focus:border-transparent transition bg-gray-50"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone Number
                </label>

                <div className="flex items-center w-full border border-gray-200 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-[#FF5533] focus-within:border-transparent bg-gray-50">

                  {/* Flag + Code */}
                  <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-3 bg-gray-100 border-r border-gray-200 flex-shrink-0">

                    <Image
                      src="/assets/images/bd-flag.png"
                      alt="BD"
                      width={24}
                      height={18}
                      className="rounded-sm w-5 sm:w-6 h-auto"
                    />

                    <span className="text-xs sm:text-sm font-medium text-gray-700">
                      +88
                    </span>

                  </div>

                  {/* Input */}
                  <input
                    type="tel"
                    name="number"
                    value={form.number}
                    onChange={handleChange}
                    placeholder="01XXXXXXXXX"
                    className="flex-1 min-w-0 px-2 sm:px-4 py-3 text-gray-800 text-sm sm:text-base bg-transparent focus:outline-none"
                  />

                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-gray-200 text-gray-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF5533] focus:border-transparent transition bg-gray-50"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-3 border border-gray-200 text-gray-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FF5533] focus:border-transparent transition bg-gray-50"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#FF5533] hover:bg-[#e64e27] text-white py-4 rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : submitted ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Sent!
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}