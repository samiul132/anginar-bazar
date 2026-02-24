'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { api, getImageUrl } from '@/lib/api';

export default function FeaturedCategory() {
  const [parentCategories, setparentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchparentCategories();
  }, []);

  const fetchparentCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const homeData = await api.home.getData();
      
      if (homeData.success && homeData.data) {
        const parentCats = homeData.data.parentCategories || [];
        setparentCategories(parentCats);
      }
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 text-[#FF5533] animate-spin" />
      </div>
    );
  }

  if (error || parentCategories.length === 0) {
    return null;
  }

  return (
    <div className="mx-4 py-3 mb-4">
      {/* Header */}
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-3">
        Shop by Category
      </h3>
      {/* Categories Grid - Horizontal Layout */}
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {parentCategories.map((category) => (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="bg-white rounded-sm shadow-sm hover:shadow-md 
                     transition-all duration-300 overflow-hidden 
                     flex items-center p-2 cursor-pointer"
          >
            {/* Left Image */}
            <div className="relative w-8 h-8 md:w-12 md:h-12 flex-shrink-0 mr-2">
              <Image
                src={getImageUrl(category.image)}
                alt={category.category_name || 'Category'}
                fill
                className="object-contain rounded-lg"
                sizes="48px"
              />
            </div>

            {/* Right Text */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
                {category.category_name}
              </h4>
            </div>
          </Link>
        ))}
      </div>

      {/* "View More" Link */}
      <div className="flex justify-center mt-4">
        <Link
          href="/categories"
          className="text-[#319F00] font-semibold text-sm hover:underline"
        >
          View More...
        </Link>
      </div>
    </div>
  );
}