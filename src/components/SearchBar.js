'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { api, getImageUrl } from '@/lib/api';

export default function SearchBar({ onMobile = false }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);
  
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Perform search with debouncing
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Don't search if query is too short
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    // Set loading state immediately for better UX
    setIsSearching(true);
    setError(null);

    // Debounce search by 500ms
    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await api.products.search(searchQuery);
        
        if (response.success && response.data) {
          const products = response.data.products?.data || [];
          setSearchResults(products);
          setShowResults(true);
        } else {
          setSearchResults([]);
          setShowResults(true);
        }
      } catch (err) {
        console.error('Search error:', err);
        setError('Failed to search. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    setError(null);
  };

  const handleResultClick = () => {
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          placeholder={onMobile ? "Search for products..." : "Search for products, brands and more..."}
          className={`w-full px-4 ${onMobile ? 'py-2' : 'py-2'} ${
            searchQuery ? 'pr-20' : 'pr-12'
          } dark:text-black border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#FF5533] transition-colors`}
        />
        
        {/* Loading Spinner or Clear Button */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <Loader2 size={18} className="text-gray-400 animate-spin" />
          ) : searchQuery ? (
            <button
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          ) : null}
        </div>

        {/* Search Button */}
        <button 
          className={`absolute right-0 top-0 h-full px-3 bg-[#FF5533] text-white ${
            onMobile ? 'rounded-r-lg' : 'rounded-r-lg'
          } hover:bg-[#e64e27] transition-colors cursor-pointer`}
          onClick={() => searchQuery.length >= 2 && setShowResults(true)}
        >
          <Search size={18} />
        </button>
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
          {error ? (
            <div className="p-4 text-center text-red-600">
              {error}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                Found {searchResults.length} product{searchResults.length !== 1 ? 's' : ''}
              </div>
              {searchResults.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer"
                >
                  {/* Product Image */}
                  <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={getImageUrl(product.image, 'thumbnail')}
                      alt={product.product_name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-800 truncate">
                      {product.product_name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {(() => {
                        const salePrice = parseFloat(product.sale_price || 0);
                        const promoPrice = parseFloat(product.promotional_price || 0);
                        const hasDiscount = promoPrice > 0 && promoPrice < salePrice;
                        const displayPrice = hasDiscount ? promoPrice : salePrice;

                        return (
                          <>
                            <span className="text-sm font-semibold text-[#FF5533]">
                              ৳{displayPrice.toFixed(0)}
                            </span>
                            {hasDiscount && (
                              <span className="text-xs text-gray-400 line-through">
                                ৳{salePrice.toFixed(0)}
                              </span>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : searchQuery.length >= 2 && !isSearching ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-1">No products found</p>
              <p className="text-sm text-gray-500">Try searching with different keywords</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}