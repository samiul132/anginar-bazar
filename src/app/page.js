'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { api, getImageUrl } from '@/lib/api';
import HeroSlider from '@/components/HeroSlider';
import ProductCard from '@/components/ProductCard'; 
import Message from '@/components/Message'; 
import FeaturedCategory from '@/components/FeaturedCategory'; 
import Banner from '@/components/Banner';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Grid } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/grid';

export default function HomePage() {
  const [popularItems, setPopularItems] = useState([]);
  const [brands, setBrands] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [banners, setBanners] = useState([]);
  const [categoriesWithProducts, setCategoriesWithProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const homeData = await api.home.getData();
      if (homeData.success && homeData.data) {
        setSliders(homeData.data.sliders || []);
        setPopularItems(homeData.data.popularItems || []);
        setBrands(homeData.data.brands || []);
        setBanners(homeData.data.banners || []);

        const featuredCats = homeData.data.featuredCategories || [];

        const categoriesWithProductsData = featuredCats
          .filter(cat => cat.products && cat.products.length > 0)
          .map(cat => ({ ...cat, products: cat.products.slice(0, 20) }));

        setCategoriesWithProducts(categoriesWithProductsData);
      }
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <main className="flex-1 max-w-7xl w-full mx-auto pb-4 md:pb-8">
        <div>
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-[#FF5533] animate-spin" />
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          )}

          {error && (
            <div className="mx-4 my-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchAllData}
                className="mt-2 px-4 py-2 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Hero Slider Component */}
              <HeroSlider sliders={sliders} />

              <Message />

              {/* Banner Section */}
              {banners.length >= 2 && (
                <Banner banners={banners.slice(0, 2)} layout="double" />
              )}

              <FeaturedCategory />

              {/* Banner Section */}
              {banners.length >= 3 && (
                <Banner banners={[banners[2]]} layout="single" />
              )}

              {/* Popular Products */}
              {popularItems.length > 0 && (
                <div className="px-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                      Popular Items 🔥
                    </h3>
                    <Link
                      href="/popular-items"
                      className="text-[#319F00] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      View More
                      <ChevronRight size={16} />
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {popularItems.slice(0, 12).map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  <div className="flex justify-center mt-6">
                    <Link
                      href="/popular-items"
                      className="inline-flex items-center gap-2 px-6 py-2 rounded-full 
                                bg-[#319F00] text-white font-semibold text-sm
                                hover:bg-[#287F00] transition-all"
                    >
                      View More
                      <ChevronRight size={18} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Banner Section */}
              {banners.length >= 5 && (
                <Banner banners={banners.slice(3, 5)} layout="double" />
              )}

              {/* All Category Sections with Slider */}
              {categoriesWithProducts.length > 0 && categoriesWithProducts.map((category) => (
                <div key={category.id} className="px-4 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                      {category.category_name}
                    </h3>
                    <Link 
                      href={`/category/${category.slug}`}
                      className="text-[#319F00] font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      View More <ChevronRight size={16} />
                    </Link>
                  </div>
                  
                  <div className="relative">
                    <button className={`swiper-button-prev-${category.id} absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#319F00] hover:bg-green-500 rounded-full p-2 shadow-md`}>
                      <ChevronLeft size={20} className="text-white" />
                    </button>

                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={12}
                      navigation={{
                        prevEl: `.swiper-button-prev-${category.id}`,
                        nextEl: `.swiper-button-next-${category.id}`,
                      }}
                      breakpoints={{
                        0:    { slidesPerView: 2 },
                        640:  { slidesPerView: 3 },
                        768:  { slidesPerView: 4 },
                        1024: { slidesPerView: 6 },
                      }}
                      className="px-8"
                    >
                      {category.products.map((product) => (
                        <SwiperSlide key={product.id}>
                          <ProductCard product={product} />
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <button className={`swiper-button-next-${category.id} absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#319F00] hover:bg-green-500 rounded-full p-2 shadow-md`}>
                      <ChevronRight size={20} className="text-white" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Banner Section */}
              {banners.length >= 7 && (
                <Banner banners={banners.slice(5, 7)} layout="double" />
              )}

              {/* Brands Section - Double Line Slider */}
              {brands.length > 0 && (
                <div className="px-4 mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Popular Brands</h3>
                  
                  <div className="relative">
                    <button 
                      className="swiper-button-prev-brands absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#319F00] hover:bg-green-500 rounded-full p-2 shadow-md transition-all"
                    >
                      <ChevronLeft size={20} className="text-gray-100" />
                    </button>

                    <Swiper
                      modules={[Navigation, Grid]}
                      spaceBetween={12}
                      slidesPerView={4}
                      grid={{ rows: 2, fill: 'row' }}
                      navigation={{
                        prevEl: '.swiper-button-prev-brands',
                        nextEl: '.swiper-button-next-brands',
                      }}
                      breakpoints={{
                        640: { slidesPerView: 4, spaceBetween: 12, grid: { rows: 2, fill: 'row' } },
                        768: { slidesPerView: 6, spaceBetween: 12, grid: { rows: 2, fill: 'row' } },
                        1024: { slidesPerView: 8, spaceBetween: 12, grid: { rows: 2, fill: 'row' } },
                      }}
                      className="brands-slider px-8"
                      style={{ paddingBottom: '10px' }}
                    >
                      {brands.map((brand) => (
                        <SwiperSlide key={brand.id}>
                          <Link
                            href={`/popular-brands/${brand.slug}`}
                            className="bg-white rounded shadow-sm hover:shadow-md transition-all duration-300 active:scale-95 aspect-square flex items-center justify-center p-2 cursor-pointer relative block"
                          >
                            <Image 
                              src={getImageUrl(brand.image)}
                              alt={brand.brand_name || 'Brand'}
                              fill
                              className="object-contain p-2"
                              sizes="(max-width: 640px) 25vw, (max-width: 1024px) 12vw, 10vw"
                            />
                          </Link>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    <button 
                      className="swiper-button-next-brands absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#319F00] hover:bg-green-500 rounded-full p-2 shadow-md transition-all"
                    >
                      <ChevronRight size={20} className="text-gray-100" />
                    </button>
                  </div>
                </div>
              )}

              {/* Banner Section */}
              {banners.length >= 8 && (
                <Banner banners={[banners[7]]} layout="single" />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}