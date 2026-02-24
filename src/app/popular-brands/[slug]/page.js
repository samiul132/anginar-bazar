'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronDown, SlidersHorizontal, Loader2 } from 'lucide-react';
import { api, getImageUrl } from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useParams } from 'next/navigation';

export default function BrandProductsPage() {
  const params = useParams();
  const slug = params?.slug;

  const [brandInfo, setBrandInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Sort
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Price Range
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 10000 });

  // Category Filter
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    if (slug) fetchBrandProducts();
  }, [slug]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, sortBy, priceRange, selectedCategories]);

  const getPrice = (product) =>
    parseFloat(
      product.promotional_price && parseFloat(product.promotional_price) > 0
        ? product.promotional_price
        : product.sale_price || 0
    );

  const fetchBrandProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.brands.getProducts(slug);

      if (response.success && response.data) {
        const brandData = response.data.brandInfo;
        const productsData = response.data.products?.data || [];

        setBrandInfo(brandData);
        setProducts(productsData);

        // Price range
        if (productsData.length > 0) {
          const prices = productsData.map(p => getPrice(p));
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setPriceRange({ min, max });
          setTempPriceRange({ min, max });
        }

        // Extract unique categories from products
        // product.categories[] comes from with('categories') in backend
        const uniqueCategories = [];
        const categoryIds = new Set();
        productsData.forEach(product => {
          product.categories?.forEach(cat => {
            if (cat?.id && cat?.category_name && !categoryIds.has(cat.id)) {
              categoryIds.add(cat.id);
              uniqueCategories.push({ id: cat.id, name: cat.category_name });
            }
          });
        });
        setCategories(uniqueCategories);

      } else {
        setError('Failed to load brand products');
      }
    } catch (err) {
      console.error('Error fetching brand products:', err);
      setError('Failed to load brand products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Price filter
    filtered = filtered.filter(p => {
      const price = getPrice(p);
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        product.categories?.some(cat => selectedCategories.includes(cat.id))
      );
    }

    // Sort
    switch (sortBy) {
      case 'price_low':
        filtered.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case 'price_high':
        filtered.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case 'name_az':
        filtered.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case 'name_za':
        filtered.sort((a, b) => b.product_name.localeCompare(a.product_name));
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
  };

  const toggleCategory = (id) =>
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );

  const resetFilters = () => {
    if (products.length > 0) {
      const prices = products.map(p => getPrice(p));
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setPriceRange({ min, max });
      setTempPriceRange({ min, max });
    }
    setSelectedCategories([]);
    setSortBy('default');
  };

  const sortOptions = [
    { value: 'default',    label: 'Default' },
    { value: 'price_low',  label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'name_az',    label: 'Name: A-Z' },
    { value: 'name_za',    label: 'Name: Z-A' },
    { value: 'newest',     label: 'Newest First' },
  ];

  const activeFilterCount = selectedCategories.length;

  // Shared Filter Content
  const FilterContent = () => (
    <>
      {/* Price Range */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Price Range</h4>
        <div className="space-y-3">
          <input
            type="range"
            min={tempPriceRange.min}
            max={tempPriceRange.max}
            value={priceRange.max}
            onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
            className="w-full accent-[#FF5533]"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
              className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 text-gray-800 rounded focus:outline-none focus:border-[#FF5533]"
              placeholder="Min"
            />
            <span className="text-gray-400 flex-shrink-0">-</span>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || tempPriceRange.max })}
              className="flex-1 min-w-0 px-2 py-1.5 text-sm border border-gray-300 text-gray-800 rounded focus:outline-none focus:border-[#FF5533]"
              placeholder="Max"
            />
          </div>
          <div className="text-xs text-gray-600">৳{priceRange.min} - ৳{priceRange.max}</div>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-2">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Category</h4>
          <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-hide">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => toggleCategory(cat.id)}
                  className="w-4 h-4 text-[#FF5533] border-gray-300 rounded focus:ring-[#FF5533] flex-shrink-0"
                />
                <span className="text-gray-700 text-sm leading-tight group-hover:text-[#FF5533] transition-colors">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  );

  // Loading / Error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin" />
        <p className="mt-4 text-gray-600">Loading brand products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="px-6 py-3 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] cursor-pointer inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col pb-20 md:pb-8">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 text-gray-800 rounded-full transition cursor-pointer">
              <ChevronLeft size={24} />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {brandInfo?.brand_name || 'Brand Products'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Banner */}
      {brandInfo?.banner && (
        <div className="w-full overflow-hidden">
          <div className="relative w-full flex justify-center bg-white">
            <Image
              src={getImageUrl(brandInfo.banner, 'full')}
              alt={brandInfo.brand_name}
              width={0}
              height={0}
              sizes="100vw"
              className="w-full h-auto"
              priority
              quality={100}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent" />
            {/* Content */}
            <div className="absolute inset-0 md:inset-auto md:bottom-0 md:left-0 md:right-0 p-0 px-2 md:p-2">
              <div className="max-w-7xl mx-auto h-full md:h-auto flex flex-col md:flex-row md:items-center md:justify-between">
                {/* Brand Name */}
                <h1 className="text-md md:text-4xl font-bold text-white pt-2 md:pt-0">
                  {brandInfo.brand_name}
                </h1>
                {/* Breadcrumb */}
                <div className="flex md:ml-auto mt-auto md:mt-0 mb-2 md:mb-0">
                  <div className="text-white text-xs sm:text-sm md:text-base bg-transparent md:bg-black/30 md:backdrop-blur-sm rounded px-0 md:px-3 py-1 flex items-center gap-0.5 md:gap-1">
                    <Link
                      href="/"
                      className="hover:text-orange-500 transition-colors duration-200 whitespace-nowrap"
                    >
                      Home
                    </Link>
                    <svg
                      className="w-2 h-2 md:w-3 md:h-3 text-gray-400 mx-0 md:mx-1 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <Link
                      href="/brands"
                      className="hover:text-orange-500 transition-colors duration-200 whitespace-nowrap"
                    >
                      Brands
                    </Link>
                    <svg
                      className="w-2 h-2 md:w-3 md:h-3 text-gray-400 mx-0 md:mx-1 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-semibold text-white truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">
                      {brandInfo.brand_name}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <div className="flex gap-6">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-24">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-bold text-lg text-gray-900">Filters</h3>
                <button onClick={resetFilters} className="text-[#FF5533] hover:text-[#e64e27] text-sm font-medium cursor-pointer">
                  Reset
                </button>
              </div>
              <div className="max-h-[calc(100vh-180px)] overflow-y-auto p-4 scrollbar-hide">
                <FilterContent />
              </div>
            </div>
            <style jsx>{`
              .scrollbar-hide::-webkit-scrollbar { display: none; }
              .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
          </aside>

          {/* Right Column */}
          <main className="flex-1 min-w-0">

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-[#FF5533] transition cursor-pointer"
              >
                <SlidersHorizontal size={18} />
                <span className="font-medium text-sm">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="ml-1 bg-[#FF5533] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Filter Panel */}
            {showFilters && (
              <div className="lg:hidden mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 sticky top-0 bg-white pb-2 border-b border-gray-100">
                  <h3 className="font-bold text-base text-gray-900">Filters</h3>
                  <button onClick={resetFilters} className="text-[#FF5533] hover:text-[#e64e27] text-sm font-medium cursor-pointer">
                    Reset All
                  </button>
                </div>
                <FilterContent />
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full mt-4 px-4 py-2.5 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] transition cursor-pointer font-medium"
                >
                  Apply Filters
                </button>
              </div>
            )}

            {/* Product Count + Sort By */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
              </p>

              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-[#FF5533] transition cursor-pointer text-sm"
                >
                  <span className="font-medium">
                    Sort: {sortOptions.find(o => o.value === sortBy)?.label || 'Default'}
                  </span>
                  <ChevronDown size={15} className={`transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowSortDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-40 min-w-[190px]">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer text-sm ${
                            sortBy === option.value ? 'text-[#FF5533] font-semibold' : 'text-gray-700'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-lg">
                <p className="text-gray-600 text-lg mb-4">No products found matching your filters.</p>
                <button onClick={resetFilters} className="px-6 py-3 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] cursor-pointer font-medium">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={`${product.id}-${index}`} product={product} />
                ))}
              </div>
            )}

            {/* All loaded */}
            <div className="text-center py-8 text-sm text-gray-400">
              -x-
            </div>
            
          </main>
        </div>
      </div>
    </div>
  );
}