'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { api, getImageUrl } from '@/lib/api';

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const categoriesData = await api.categories.getAll();

      if (categoriesData.success && categoriesData.data) {
        setCategories(categoriesData.data);
      }
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Browse Categories
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin" />
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchCategories}
              className="mt-2 px-4 py-2 bg-[#FF5533] text-white rounded-lg 
                       hover:bg-[#e64e27] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Categories Grid - Responsive */}
        {!loading && !error && categories.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="bg-white rounded-sm shadow-sm hover:shadow-md 
                         transition-all duration-300 overflow-hidden 
                         flex items-center p-3 cursor-pointer"
              >
                {/* Left Image */}
                <div className="relative w-14 h-14 flex-shrink-0 mr-3">
                  <Image
                    src={getImageUrl(category.image)}
                    alt={category.category_name || 'Category'}
                    fill
                    className="object-contain rounded-lg"
                    sizes="56px"
                    quality={100}
                  />
                </div>

                {/* Right Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                    {category.category_name}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Categories */}
        {!loading && !error && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-600 text-center">
              No categories available at the moment
            </p>
          </div>
        )}

        {/* Bottom Spacing */}
        <div className="h-6" />
      </div>
    </div>
  );
}