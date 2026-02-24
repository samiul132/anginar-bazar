'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown, Loader2, Tag, Layers, DollarSign, RotateCcw } from 'lucide-react';
import { API_BASE_URL, getImageUrl, storage } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

const SORT_OPTIONS = [
  { label: 'Default',            value: 'default'   },
  { label: 'Price: Low to High', value: 'price_asc'  },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name: A to Z',       value: 'name_asc'   },
  { label: 'Name: Z to A',       value: 'name_desc'  },
];

export default function ShopPage() {
  // ── Data state 
  const [products, setProducts]             = useState([]);
  const [page, setPage]                     = useState(1);
  const [lastPage, setLastPage]             = useState(1);
  const [total, setTotal]                   = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore]       = useState(false);
  const [error, setError]                   = useState(null);

  // ── Categories & Brands 
  const [categories, setCategories]         = useState([]);
  const [brands, setBrands]                 = useState([]);
  const [metaLoading, setMetaLoading]       = useState(true);

  // ── Filter state ─
  const [searchQuery, setSearchQuery]           = useState('');
  const [sortBy, setSortBy]                     = useState('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Price Range Filter - EXACT SAME AS CATEGORY DETAILS
  const [priceRange, setPriceRange]             = useState({ min: 0, max: 10000 });
  const [tempPriceRange, setTempPriceRange]     = useState({ min: 0, max: 10000 });
  
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands]     = useState([]);

  // ── Accordion open state 
  const [openSections, setOpenSections] = useState({
    categories: true,
    brands: true,
    price: true,
  });

  // ── Search mode (backend search) 
  const [isSearchMode, setIsSearchMode]     = useState(false);
  const [searchResults, setSearchResults]   = useState([]);
  const [searchLoading, setSearchLoading]   = useState(false);

  // ── Intersection observer ref ───
  const sentinelRef    = useRef(null);
  const isFetchingRef  = useRef(false);

  // ── Fetch categories, brands, and calculate max price 
  useEffect(() => {
    const fetchMeta = async () => {
      setMetaLoading(true);
      try {
        const token = storage.getAuthToken();
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };

        // Fetch from shop endpoint
        const res  = await fetch(`${API_BASE_URL}/get_all_products?page=1`, { headers });
        const json = await res.json();

        if (json.success && json.data) {
          // Get categories
          if (Array.isArray(json.data.get_all_categories)) {
            setCategories(json.data.get_all_categories);
          }
          
          // Get max_price from database
          if (json.data.max_price) {
            const maxPrice = Math.ceil(parseFloat(json.data.max_price));
            setPriceRange({ min: 0, max: maxPrice });
            setTempPriceRange({ min: 0, max: maxPrice });
          }
        }
        
        // Fetch brands from home data
        const homeRes = await fetch(`${API_BASE_URL}/get-home-data`, { headers });
        const homeJson = await homeRes.json();
        
        if (homeJson.success && homeJson.data) {
          if (Array.isArray(homeJson.data.brands)) {
            setBrands(homeJson.data.brands);
          }
        }
      } catch (err) {
        console.error('Meta fetch error:', err);
      } finally {
        setMetaLoading(false);
      }
    };
    fetchMeta();
  }, []);

  // ── Fetch a single page of all products ──────────────
  const fetchPage = useCallback(async (pageNum) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (pageNum === 1) setInitialLoading(true);
    else setLoadingMore(true);

    setError(null);

    try {
      const token = storage.getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      };

      const res  = await fetch(`${API_BASE_URL}/get_all_products?page=${pageNum}`, { headers });
      const text = await res.text();

      let json;
      try { json = JSON.parse(text); }
      catch {
        setError('Server returned an unexpected response.');
        return;
      }

      if (json.success && json.data?.get_all_products) {
        const paginated = json.data.get_all_products;
        const newItems  = paginated.data      || [];
        const lp        = paginated.last_page || 1;
        const tot       = paginated.total     || 0;

        setProducts((prev) => pageNum === 1 ? newItems : [...prev, ...newItems]);
        setLastPage(lp);
        setTotal(tot);
        setPage(pageNum);
      } else {
        if (pageNum === 1) setError('Failed to load products');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      if (pageNum === 1) setError('Failed to load products. Please try again.');
    } finally {
      if (pageNum === 1) setInitialLoading(false);
      else setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, []);

  // ── Initial load ─
  useEffect(() => { fetchPage(1); }, [fetchPage]);

  // ── Infinite scroll sentinel ─────
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingRef.current && page < lastPage && !isSearchMode) {
          fetchPage(page + 1);
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [page, lastPage, fetchPage, isSearchMode]);

  // ── Backend search (debounced) ──
  useEffect(() => {
    if (!searchQuery.trim()) {
      setIsSearchMode(false);
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchMode(true);
      setSearchLoading(true);
      try {
        const token = storage.getAuthToken();
        const headers = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        };
        const res  = await fetch(
          `${API_BASE_URL}/search?keywords=${encodeURIComponent(searchQuery.trim())}`,
          { headers }
        );
        const json = await res.json();
        if (json.success && json.data?.products?.data) {
          setSearchResults(json.data.products.data);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Client-side filter + sort - EXACT SAME AS CATEGORY DETAILS ──────────────
  const getFilteredProducts = () => {
    let result = isSearchMode ? [...searchResults] : [...products];

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) => {
        if (Array.isArray(p.categories) && p.categories.length > 0) {
          return p.categories.some((c) => selectedCategories.includes(c.id));
        }
        if (p.category_id) {
          return selectedCategories.includes(p.category_id);
        }
        return false;
      });
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand_id));
    }

    // Apply price filter - EXACT SAME LOGIC AS CATEGORY DETAILS
    result = result.filter(product => {
      const price = parseFloat(product.promotional_price && parseFloat(product.promotional_price) > 0 
        ? product.promotional_price 
        : product.sale_price || 0);
      return price >= priceRange.min && price <= priceRange.max;
    });

    // Apply sorting - EXACT SAME LOGIC AS CATEGORY DETAILS
    switch (sortBy) {
      case 'price_asc':
      case 'price_low':
        result.sort((a, b) => {
          const priceA = parseFloat(a.promotional_price && parseFloat(a.promotional_price) > 0 ? a.promotional_price : a.sale_price || 0);
          const priceB = parseFloat(b.promotional_price && parseFloat(b.promotional_price) > 0 ? b.promotional_price : b.sale_price || 0);
          return priceA - priceB;
        });
        break;
      case 'price_desc':
      case 'price_high':
        result.sort((a, b) => {
          const priceA = parseFloat(a.promotional_price && parseFloat(a.promotional_price) > 0 ? a.promotional_price : a.sale_price || 0);
          const priceB = parseFloat(b.promotional_price && parseFloat(b.promotional_price) > 0 ? b.promotional_price : b.sale_price || 0);
          return priceB - priceA;
        });
        break;
      case 'name_asc':
      case 'name_az':
        result.sort((a, b) => a.product_name.localeCompare(b.product_name));
        break;
      case 'name_desc':
      case 'name_za':
        result.sort((a, b) => b.product_name.localeCompare(a.product_name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default:
        break;
    }

    return result;
  };

  const toggleCategory = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const toggleBrand = (id) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Reset filters - EXACT SAME AS CATEGORY DETAILS
  const resetFilters = () => {
    const prices = products.map(p => 
      parseFloat(p.promotional_price && parseFloat(p.promotional_price) > 0 
        ? p.promotional_price 
        : p.sale_price || 0)
    );
    
    if (prices.length > 0) {
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setPriceRange({ min, max });
      setTempPriceRange({ min, max });
    }
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSortBy('default');
  };

  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    (priceRange.min !== tempPriceRange.min || priceRange.max !== tempPriceRange.max ? 1 : 0) +
    (sortBy !== 'default' ? 1 : 0);

  const hasActiveFilters = activeFilterCount > 0 || searchQuery;
  const filteredProducts = getFilteredProducts();
  const hasMore = page < lastPage && !isSearchMode;

  // ── Sidebar component - EXACT SAME UI AS CATEGORY DETAILS ──────────────────
  const SidebarContent = () => (
    <div className="space-y-1">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#FF5533]" />
          <span className="font-semibold text-gray-800 text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <span className="bg-[#FF5533] text-white text-xs rounded-full px-1.5 py-0.5 font-bold leading-none">
              {activeFilterCount}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="text-[#FF5533] hover:text-[#e64e27] text-sm font-medium cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Price Range Filter - EXACT SAME AS CATEGORY DETAILS */}
      <div className="mb-6 pb-6 border-b border-gray-200 px-4 pt-4">
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
              className="flex-1 min-w-0 px-2 py-1.5 text-sm border text-gray-800 border-gray-300 rounded focus:outline-none focus:border-[#FF5533]"
              placeholder="Min"
            />
            <span className="text-gray-400 flex-shrink-0">-</span>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || tempPriceRange.max })}
              className="flex-1 min-w-0 px-2 py-1.5 text-sm border text-gray-800 border-gray-300 rounded focus:outline-none focus:border-[#FF5533]"
              placeholder="Max"
            />
          </div>
          <div className="text-xs text-gray-600">
            ৳{priceRange.min} - ৳{priceRange.max}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => toggleSection('categories')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-[#FF5533]" />
            <span className="text-sm font-semibold text-gray-700">Categories</span>
            {selectedCategories.length > 0 && (
              <span className="bg-red-100 text-[#FF5533] text-xs rounded-full px-1.5 font-bold">
                {selectedCategories.length}
              </span>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform duration-200 ${openSections.categories ? 'rotate-180' : ''}`}
          />
        </button>

        {openSections.categories && (
          <div className="px-4 pb-3 space-y-1.5">
            {metaLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 size={14} className="animate-spin text-gray-400" />
                <span className="text-xs text-gray-400">Loading...</span>
              </div>
            ) : categories.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No categories found</p>
            ) : (
              categories.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2.5 py-1 cursor-pointer group"
                >
                  <div
                    onClick={() => toggleCategory(cat.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                      selectedCategories.includes(cat.id)
                        ? 'bg-[#FF5533] border-[#FF5533]'
                        : 'border-gray-300 group-hover:border-[#FF5533]'
                    }`}
                  >
                    {selectedCategories.includes(cat.id) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    onClick={() => toggleCategory(cat.id)}
                    className={`text-xs leading-tight transition-colors ${
                      selectedCategories.includes(cat.id) ? 'text-[#FF5533] font-semibold' : 'text-gray-600 group-hover:text-gray-900'
                    }`}
                  >
                    {cat.category_name}
                  </span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="border-b border-gray-100">
        <button
          onClick={() => toggleSection('brands')}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Tag size={14} className="text-[#FF5533]" />
            <span className="text-sm font-semibold text-gray-700">Brands</span>
            {selectedBrands.length > 0 && (
              <span className="bg-red-100 text-[#FF5533] text-xs rounded-full px-1.5 font-bold">
                {selectedBrands.length}
              </span>
            )}
          </div>
          <ChevronDown
            size={14}
            className={`text-gray-400 transition-transform duration-200 ${openSections.brands ? 'rotate-180' : ''}`}
          />
        </button>

        {openSections.brands && (
          <div className="px-4 pb-3 space-y-1.5">
            {metaLoading ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 size={14} className="animate-spin text-gray-400" />
                <span className="text-xs text-gray-400">Loading...</span>
              </div>
            ) : brands.length === 0 ? (
              <p className="text-xs text-gray-400 py-2">No brands found</p>
            ) : (
              brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center gap-2.5 py-1 cursor-pointer group"
                >
                  <div
                    onClick={() => toggleBrand(brand.id)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
                      selectedBrands.includes(brand.id)
                        ? 'bg-[#FF5533] border-[#FF5533]'
                        : 'border-gray-300 group-hover:border-[#FF5533]'
                    }`}
                  >
                    {selectedBrands.includes(brand.id) && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span
                    onClick={() => toggleBrand(brand.id)}
                    className={`text-xs leading-tight transition-colors ${
                      selectedBrands.includes(brand.id) ? 'text-[#FF5533] font-semibold' : 'text-gray-600 group-hover:text-gray-900'
                    }`}
                  >
                    {brand.brand_name}
                  </span>
                </label>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );

  // ── Loading screen 
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF5533] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50 gap-4">
        <p className="text-red-600 text-lg">{error}</p>
        <button
          onClick={() => fetchPage(1)}
          className="px-6 py-3 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  // ── Main render ───
  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-10">

      {/* Mobile sidebar overlay */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-50 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 md:hidden overflow-y-auto ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b sticky top-0 z-10">
          <span className="font-bold text-gray-800">Filters</span>
          <button
            onClick={() => setShowMobileSidebar(false)}
            className="p-1.5 hover:bg-gray-100 rounded-full cursor-pointer text-gray-900"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* Sticky top toolbar */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">

            <h1 className="text-xl font-bold text-gray-900 shrink-0 hidden sm:block">All Products</h1>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setShowMobileSidebar(true)}
              className={`md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors cursor-pointer shrink-0 ${activeFilterCount > 0 ? 'border-[#FF5533] bg-red-50 text-[#FF5533]' : 'border-gray-200 text-gray-700'}`}
            >
              <SlidersHorizontal size={16} />
              {activeFilterCount > 0 && (
                <span className="bg-[#FF5533] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Search */}
            <div className="flex-1 relative justify-center">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-900 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-auto pl-9 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:border-[#FF5533] focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer">
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Sort */}
            <div className="relative shrink-0">
              {showSortDropdown && (
                <div className="absolute right-0 top-20 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors cursor-pointer ${sortBy === opt.value ? 'text-[#FF5533] font-semibold' : 'text-gray-700'}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Body: sidebar + products */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex gap-5">

        {/* Left Sidebar (desktop) */}
        <aside className="hidden md:block w-56 shrink-0">
          <div
            className="bg-white rounded-xl border border-gray-200 overflow-y-auto sticky top-[65px] scrollbar-hide"
            style={{ maxHeight: 'calc(100vh - 80px)' }}
          >
            <SidebarContent />
          </div>
          
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
        </aside>

        {/* Right: results + grid */}
        <div className="flex-1 min-w-0">

          {/* Results info */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {isSearchMode ? (
                searchLoading ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin text-[#FF5533]" />
                    Searching...
                  </span>
                ) : (
                  <>Found <span className="font-semibold text-gray-800">{filteredProducts.length}</span> results for <span className="font-semibold text-gray-800">&quot;{searchQuery}&quot;</span></>
                )
              ) : (
                <>
                  Showing <span className="font-semibold text-gray-800">{filteredProducts.length}</span>
                  {total > 0 && <> of <span className="font-semibold text-gray-800">{total}</span></>} products
                  {hasMore && <span className="text-[#FF5533] ml-1">(scroll for more)</span>}
                </>
              )}
            </p>
            
            <button
              onClick={() => setShowSortDropdown((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <span className="hidden sm:inline">{SORT_OPTIONS.find((o) => o.value === sortBy)?.label}</span>
              <span className="sm:hidden text-gray-900">Sort</span>
              <ChevronDown className='text-gray-800' size={14} />
            </button>

            {/* Active filter chips */}
            {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
              <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                {selectedCategories.map((id) => {
                  const cat = categories.find((c) => c.id === id);
                  return cat ? (
                    <span key={id} className="flex items-center gap-1 px-2 py-0.5 bg-red-50 text-[#FF5533] text-xs rounded-full border border-red-200 font-medium">
                      {cat.category_name}
                      <button onClick={() => toggleCategory(id)} className="cursor-pointer hover:text-red-700">
                        <X size={10} />
                      </button>
                    </span>
                  ) : null;
                })}
                {selectedBrands.map((id) => {
                  const brand = brands.find((b) => b.id === id);
                  return brand ? (
                    <span key={id} className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-600 text-xs rounded-full border border-orange-200 font-medium">
                      {brand.brand_name}
                      <button onClick={() => toggleBrand(id)} className="cursor-pointer hover:text-orange-800">
                        <X size={10} />
                      </button>
                    </span>
                  ) : null;
                })}
              </div>
            )}
          </div>

          {/* Products grid */}
          {filteredProducts.length === 0 && !searchLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
              <p className="text-gray-400 mb-6 max-w-xs">Try adjusting your search or filters.</p>
              {hasActiveFilters && (
                <button onClick={resetFilters} className="px-6 py-2.5 bg-[#FF5533] text-white rounded-full font-medium hover:bg-[#e64e27] transition-colors cursor-pointer">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map((product) => (
                <ProductCard key={`${product.id}-${product.slug}`} product={product} />
              ))}
            </div>
          )}

          {/* Sentinel */}
          <div ref={sentinelRef} className="h-10" />

          {/* Loading more */}
          {loadingMore && (
            <div className="flex justify-center items-center gap-2 py-8">
              <Loader2 size={24} className="animate-spin text-[#FF5533]" />
              <span className="text-sm text-gray-500">Loading more products...</span>
            </div>
          )}

          {/* All loaded */}
          {!hasMore && !isSearchMode && filteredProducts.length > 0 && (
            <div className="text-center py-8 text-sm text-gray-400">
              -x-
            </div>
          )}
        </div>
      </div>
    </div>
  );
}