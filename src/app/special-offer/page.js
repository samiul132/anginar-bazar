'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Tag, Loader2, SlidersHorizontal, ChevronDown, Flame, Zap } from 'lucide-react';
import { apiRequest, getImageUrl } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function SpecialOfferPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Categories
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filter & Sort
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Price Range
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 10000 });

  // Brand Filter
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, sortBy, priceRange, selectedBrands, selectedCategory]);

  const getPrice = (product) =>
    parseFloat(
      product.promotional_price && parseFloat(product.promotional_price) > 0
        ? product.promotional_price
        : product.sale_price || 0
    );

  const getDiscount = (product) => {
    const sale = parseFloat(product.sale_price || 0);
    const promo = parseFloat(product.promotional_price || 0);
    if (sale > 0 && promo > 0 && sale > promo) {
      return Math.round(((sale - promo) / sale) * 100);
    }
    return 0;
  };

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest('/get_all_products');
      if (response.success && response.data) {
        const promoData = response.data.get_all_promotional_products;
        let allProds = promoData?.data || [];

        // Fetch remaining pages
        const totalPages = promoData?.last_page || 1;
        if (totalPages > 1) {
          const promises = [];
          for (let i = 2; i <= totalPages; i++) {
            promises.push(
              apiRequest(`/get_all_products?page=${i}`)
                .then(d => d?.data?.get_all_promotional_products?.data || [])
                .catch(() => [])
            );
          }
          const pages = await Promise.all(promises);
          pages.forEach(p => { allProds = [...allProds, ...p]; });
        }

        // Deduplicate
        const unique = Array.from(new Map(allProds.map(p => [p.id, p])).values());
        setProducts(unique);

        // Full category list from API (for sub-cat lookup)
        const fullCats = response.data.get_all_categories || [];
        setAllCategories(fullCats);

        // Extract unique categories from products
        const catMap = new Map();
        unique.forEach(product => {
          (product.categories || []).forEach(cat => {
            if (!catMap.has(cat.id)) catMap.set(cat.id, cat);
          });
        });
        setCategories(Array.from(catMap.values()));

        // Price range
        const prices = unique.map(p => getPrice(p));
        if (prices.length > 0) {
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setPriceRange({ min, max });
          setTempPriceRange({ min, max });
        }

        // Extract brands
        const uniqueBrands = [];
        const brandIds = new Set();
        unique.forEach(product => {
          const brand = product.brand;
          if (brand?.id && brand?.brand_name && !brandIds.has(brand.id)) {
            brandIds.add(brand.id);
            uniqueBrands.push({ id: brand.id, name: brand.brand_name, image: brand.image || null });
          }
        });
        setBrands(uniqueBrands);

      } else {
        setError('Failed to load special offers.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load special offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    // Category filter — include sub-categories too
    if (selectedCategory) {
      const subCatIds = allCategories
        .filter(c => String(c.parent_category_id) === String(selectedCategory.id))
        .map(c => c.id);
      const validIds = new Set([selectedCategory.id, ...subCatIds]);
      filtered = filtered.filter(p =>
        (p.categories || []).some(c => validIds.has(c.id))
      );
    }

    filtered = filtered.filter(p => {
      const price = getPrice(p);
      return price >= priceRange.min && price <= priceRange.max;
    });

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand?.id));
    }

    switch (sortBy) {
      case 'price_low':    filtered.sort((a, b) => getPrice(a) - getPrice(b)); break;
      case 'price_high':   filtered.sort((a, b) => getPrice(b) - getPrice(a)); break;
      case 'discount_high':filtered.sort((a, b) => getDiscount(b) - getDiscount(a)); break;
      case 'name_az':      filtered.sort((a, b) => a.product_name.localeCompare(b.product_name)); break;
      case 'newest':       filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)); break;
      default: break;
    }

    setFilteredProducts(filtered);
  };

  const toggleBrand = (id) =>
    setSelectedBrands(prev => prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]);

  const resetFilters = () => {
    const prices = products.map(p => getPrice(p));
    if (prices.length > 0) {
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setPriceRange({ min, max });
      setTempPriceRange({ min, max });
    }
    setSelectedBrands([]);
    setSelectedCategory(null);
    setSortBy('default');
  };

  const sortOptions = [
    { value: 'default',        label: 'Default' },
    { value: 'discount_high',  label: 'Biggest Discount' },
    { value: 'price_low',      label: 'Price: Low to High' },
    { value: 'price_high',     label: 'Price: High to Low' },
    { value: 'name_az',        label: 'Name: A-Z' },
    { value: 'newest',         label: 'Newest First' },
  ];

  const activeFilterCount = selectedBrands.length + (selectedCategory ? 1 : 0);

  // Sub-categories of the selected category
  const subCategories = selectedCategory
    ? allCategories.filter(c => String(c.parent_category_id) === String(selectedCategory.id))
    : [];

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

      {/* Brand */}
      {brands.length > 0 && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Brand</h4>
          <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-hide">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand.id)}
                  onChange={() => toggleBrand(brand.id)}
                  className="w-4 h-4 text-[#FF5533] border-gray-300 rounded focus:ring-[#FF5533] flex-shrink-0"
                />
                <span className="text-gray-700 text-sm leading-tight group-hover:text-[#FF5533] transition-colors">
                  {brand.name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Category */}
      {categories.length > 0 && (
        <div className="mb-2">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Category</h4>
          <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-hide">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedCategory?.id === cat.id}
                  onChange={() => setSelectedCategory(selectedCategory?.id === cat.id ? null : cat)}
                  className="w-4 h-4 text-[#FF5533] border-gray-300 rounded focus:ring-[#FF5533] flex-shrink-0"
                />
                <span className="text-gray-700 text-sm leading-tight group-hover:text-[#FF5533] transition-colors">
                  {cat.category_name}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin" />
        <p className="mt-4 text-gray-600">Loading special offers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchOffers} className="px-6 py-3 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] cursor-pointer">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col pb-10 md:pb-8">

      {/* Hero Banner */}
      <div className="w-full bg-gradient-to-r from-[#FF5533] via-[#ff6b4a] to-[#ff8c00] relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-white/10 rounded-full" />
        <div className="absolute -bottom-16 -right-8 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute top-4 right-20 w-20 h-20 bg-white/10 rounded-full" />
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2.5">
                <Flame className="w-7 h-7 md:w-9 md:h-9 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    Special Offers
                  </h1>
                  <span className="hidden md:flex items-center gap-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">
                    <Zap className="w-3 h-3" /> HOT DEALS
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-white/80 text-sm bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1.5 w-fit">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <svg className="w-3 h-3 text-white/50 mx-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="font-semibold text-white">Special Offers</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Strip ── */}
      {categories.length > 0 && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-2">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">

              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 md:px-2.5 hover:bg-orange-50 hover:border-orange-200 hover:shadow-sm transition-all duration-200 group cursor-pointer h-9 md:h-10"
                >
                  <div className="relative w-6 h-6 md:w-7 md:h-7 flex-shrink-0">
                    {cat.image ? (
                      <Image
                        src={getImageUrl(cat.image)}
                        alt={cat.category_name || 'Category'}
                        fill
                        className="object-contain rounded"
                        sizes="(max-width: 768px) 24px, 28px"
                        quality={90}
                      />
                    ) : (
                      <div className="w-6 h-6 md:w-7 md:h-7 bg-orange-100 rounded flex items-center justify-center text-xs">🛒</div>
                    )}
                  </div>
                  <span className="text-[10px] md:text-[11px] font-semibold text-gray-700 group-hover:text-[#FF5533] transition-colors whitespace-nowrap leading-tight max-w-[60px] md:max-w-[72px] line-clamp-2">
                    {cat.category_name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}



      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full px-4 py-4">
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
            <style jsx global>{`
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
                  <button onClick={resetFilters} className="text-[#FF5533] hover:text-[#e64e27] text-sm font-medium cursor-pointer">Reset All</button>
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

            {/* Active category badge */}
            {selectedCategory && (
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">Filtering by:</span>
                <span className="flex items-center gap-1 bg-orange-100 text-[#FF5533] text-xs font-semibold px-2.5 py-1 rounded-full">
                  {selectedCategory.category_name}
                  <button onClick={() => setSelectedCategory(null)} className="ml-1 hover:text-red-600 cursor-pointer">✕</button>
                </span>
              </div>
            )}

            {/* Count + Sort */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> offers
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:border-[#FF5533] transition cursor-pointer text-sm"
                >
                  <span className="font-medium">Sort: {sortOptions.find(o => o.value === sortBy)?.label || 'Default'}</span>
                  <ChevronDown size={15} className={`transition-transform duration-200 ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setShowSortDropdown(false)} />
                    <div className="absolute right-0 top-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-40 min-w-[200px]">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => { setSortBy(option.value); setShowSortDropdown(false); }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer text-sm ${sortBy === option.value ? 'text-[#FF5533] font-semibold' : 'text-gray-700'}`}
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
                <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg mb-4">No special offers found matching your filters.</p>
                <button onClick={resetFilters} className="px-6 py-3 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] cursor-pointer font-medium">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            <div className="text-center py-8 text-sm text-gray-400">-x-</div>
          </main>
        </div>
      </div>
    </div>
  );
}