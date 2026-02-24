'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, SlidersHorizontal, Loader2 } from 'lucide-react';
import { api, getImageUrl } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function CategoryDetailsPage() {
  const params = useParams();
  const slug = params.slug;

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sub-categories & Brand quick filter
  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedQuickBrand, setSelectedQuickBrand] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);

  // Filter & Sort
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('default');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Price Range
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [tempPriceRange, setTempPriceRange] = useState({ min: 0, max: 10000 });

  // Brand Filter (sidebar)
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);

  useEffect(() => {
    if (slug) fetchCategoryData();
  }, [slug]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [products, sortBy, priceRange, selectedBrands, selectedSubCategory, selectedQuickBrand]);

  const getPrice = (product) =>
    parseFloat(
      product.promotional_price && parseFloat(product.promotional_price) > 0
        ? product.promotional_price
        : product.sale_price || 0
    );

  const fetchCategoryData = async () => {
    setLoading(true);
    setError(null);

    try {
      let allProducts = [];
      let categoryData = null;

      const firstResponse = await api.categories.getProducts(slug, 1);

      if (firstResponse.success && firstResponse.data) {
        categoryData = firstResponse.data.category;
        allProducts = firstResponse.data.products?.data || firstResponse.data.products || [];
        const totalPages = firstResponse.data.products?.last_page || 1;

        if (totalPages > 1) {
          const promises = [];
          for (let i = 2; i <= totalPages; i++) {
            promises.push(api.categories.getProducts(slug, i));
          }
          const responses = await Promise.all(promises);
          responses.forEach(response => {
            if (response.success && response.data) {
              const pageProducts = response.data.products?.data || response.data.products || [];
              allProducts = [...allProducts, ...pageProducts];
            }
          });
        }

        // Deduplicate
        const uniqueProducts = Array.from(
          new Map(allProducts.map(item => [item.id, item])).values()
        );

        setCategory(categoryData);
        setProducts(uniqueProducts);

        // Price range
        const prices = uniqueProducts.map(p => getPrice(p));
        if (prices.length > 0) {
          const min = Math.floor(Math.min(...prices));
          const max = Math.ceil(Math.max(...prices));
          setPriceRange({ min, max });
          setTempPriceRange({ min, max });
        }

        // Extract unique brands from products
        const uniqueBrands = [];
        const brandIds = new Set();
        uniqueProducts.forEach(product => {
          const brand = product.brand;
          if (brand?.id && brand?.brand_name && !brandIds.has(brand.id)) {
            brandIds.add(brand.id);
            uniqueBrands.push({
              id: brand.id,
              name: brand.brand_name,
              image: brand.image || brand.brand_image || brand.logo || brand.photo || null
            });
          }
        });
        setBrands(uniqueBrands);

        // Fetch sub-categories
        try {
          const allCatsResponse = await api.categories.getAll();
          const allCats = allCatsResponse?.data || allCatsResponse?.categories || [];
          if (Array.isArray(allCats) && categoryData?.id) {
            const subs = allCats.filter(c => String(c.parent_category_id) === String(categoryData.id));
            setSubCategories(subs);
            if (categoryData.parent_category_id) {
              const parent = allCats.find(c => String(c.id) === String(categoryData.parent_category_id));
              if (parent) setParentCategory(parent);
            }
          }
        } catch (e) {
          console.error('Sub-category fetch failed:', e);
        }

      } else {
        setError('Category not found');
      }
    } catch (err) {
      console.error('Error fetching category:', err);
      setError('Failed to load category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...products];

    filtered = filtered.filter(p => {
      const price = getPrice(p);
      return price >= priceRange.min && price <= priceRange.max;
    });

    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product =>
        selectedBrands.includes(product.brand?.id)
      );
    }

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

  const toggleBrand = (id) =>
    setSelectedBrands(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );

  const resetFilters = () => {
    const prices = products.map(p => getPrice(p));
    if (prices.length > 0) {
      const min = Math.floor(Math.min(...prices));
      const max = Math.ceil(Math.max(...prices));
      setPriceRange({ min, max });
      setTempPriceRange({ min, max });
    }
    setSelectedBrands([]);
    setSelectedSubCategory(null);
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

  const activeFilterCount = selectedBrands.length + (selectedSubCategory ? 1 : 0);

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

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className="mb-2">
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
    </>
  );

  // Loading / Error
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin" />
        <p className="mt-4 text-gray-600">Loading category...</p>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Category not found'}</p>
          <Link href="/" className="px-6 py-3 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] cursor-pointer inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col pb-10 md:pb-8">

      {/* Category Banner */}
      {category.banner && (
        <div className="w-full overflow-hidden">
          <div className="relative w-full flex justify-center bg-white">
            <Image
              src={getImageUrl(category.banner, 'full')}
              alt={category.category_name}
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

                {/* Category Name */}
                <h2 className="text-md md:text-4xl font-bold text-white pt-2 md:pt-0">
                  {category.category_name}
                </h2>

                {/* Breadcrumb */}
                <div className="flex md:ml-auto mt-auto md:mt-0 mb-2 md:mb-0">
                  <div className="text-white text-xs sm:text-sm md:text-base bg-transparent md:bg-black/30 md:backdrop-blur-sm rounded px-1 md:px-3 py-1 flex items-center gap-0.5 md:gap-1">
                    <Link href="/" className="hover:text-orange-500 transition-colors duration-200 whitespace-nowrap">
                      Home
                    </Link>

                    <svg className="w-2 h-2 md:w-3 md:h-3 text-gray-400 mx-0 md:mx-1 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>

                    <Link href="/categories" className="hover:text-orange-500 transition-colors duration-200 whitespace-nowrap">
                      Categories
                    </Link>

                    {parentCategory && (
                      <>
                        <svg className="w-2 h-2 md:w-3 md:h-3 text-gray-400 mx-0 md:mx-1 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>

                        <Link
                          href={`/category/${parentCategory.slug}`}
                          className="hover:text-orange-500 transition-colors duration-200 whitespace-nowrap truncate max-w-[60px] sm:max-w-[80px] md:max-w-none"
                        >
                          {parentCategory.category_name}
                        </Link>
                      </>
                    )}

                    <svg className="w-2 h-2 md:w-3 md:h-3 text-gray-400 mx-0 md:mx-1 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>

                    <span className="font-semibold text-white truncate max-w-[60px] sm:max-w-[80px] md:max-w-none">
                      {category.category_name}
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Sub-categories Strip (full width, above main content) ── */}
      {subCategories.length > 0 && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-2">
            {/* Mobile & Desktop: horizontal scroll */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {/* <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex-shrink-0 mr-1">
                Sub Categories
              </span> */}
              {subCategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.slug}`}
                  className="flex-shrink-0 flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-sm px-2 py-1 md:px-2.5 md:py-1 hover:bg-orange-50 hover:border-orange-200 hover:shadow-sm transition-all duration-200 group cursor-pointer h-9 md:h-10"
                >
                  {/* Left: Image */}
                  <div className="relative w-6 h-6 md:w-7 md:h-7 flex-shrink-0">
                    {sub.image ? (
                      <Image
                        src={getImageUrl(sub.image)}
                        alt={sub.category_name || 'Sub Category'}
                        fill
                        className="object-contain rounded"
                        sizes="(max-width: 768px) 24px, 28px"
                        quality={90}
                      />
                    ) : (
                      <div className="w-6 h-6 md:w-7 md:h-7 bg-orange-100 rounded flex items-center justify-center text-xs md:text-sm">
                        📂
                      </div>
                    )}
                  </div>
                  {/* Right: Name */}
                  <span className="text-[10px] md:text-[11px] font-semibold text-gray-700 group-hover:text-[#FF5533] transition-colors whitespace-nowrap leading-tight max-w-[60px] md:max-w-[72px] line-clamp-2">
                    {sub.category_name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ── End Sub-categories Strip ── */}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto w-full px-4 py-3">
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
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
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