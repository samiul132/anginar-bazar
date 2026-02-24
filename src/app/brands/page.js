'use client';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { api, getImageUrl } from '@/lib/api';

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const brandsData = await api.brands.getAll();
      if (brandsData.success && brandsData.data) {
        setBrands(brandsData.data);
      }
    } catch (err) {
      setError('Failed to load brands');
      console.error('Error fetching brands:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Browse Brands
        </h1>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin" />
            <p className="mt-4 text-gray-600">Loading brands...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchBrands}
              className="mt-2 px-4 py-2 bg-[#FF5533] text-white rounded-lg 
                       hover:bg-[#e64e27] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Brands Grid */}
        {!loading && !error && brands.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/popular-brands/${brand.slug}`}
                className="bg-white rounded-sm shadow-sm hover:shadow-md 
                         transition-all duration-300 overflow-hidden 
                         flex items-center p-3 cursor-pointer"
              >
                {/* Left Image */}
                <div className="relative w-14 h-14 flex-shrink-0 mr-3">
                  <Image
                    src={getImageUrl(brand.image, 'full')}
                    alt={brand.brand_name || 'Brand'}
                    fill
                    className="object-contain rounded-lg"
                    sizes="56px"
                    quality={100}
                  />
                </div>

                {/* Right Content */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                    {brand.brand_name}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* No Brands */}
        {!loading && !error && brands.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-600 text-center">
              No brands available at the moment
            </p>
          </div>
        )}

      </div>
    </div>
  );
}