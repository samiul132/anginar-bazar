'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSliderImage, api } from '@/lib/api';
import { Menu, ChevronRight } from 'lucide-react';

export default function HeroSlider({ sliders }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [hasDragged, setHasDragged] = useState(false);

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await api.categories.getAll();
        if (response.success && response.data) {
          const parentCategories = response.data.filter(cat => !cat.parent_category_id);
          const organizedCategories = parentCategories.map(parent => ({
            ...parent,
            subcategories: response.data.filter(cat => cat.parent_category_id === parent.id)
          }));
          setCategories(organizedCategories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (sliders.length === 0) return;
    const interval = setInterval(() => {
      if (!isDragging) {
        setActiveSlide((prev) => (prev + 1) % sliders.length);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isDragging, sliders.length]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % sliders.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + sliders.length) % sliders.length);
  const goToSlide = (index) => setActiveSlide(index);

  const handleTouchStart = (e) => { 
    setTouchStart(e.targetTouches[0].clientX); 
    setIsDragging(true);
    setHasDragged(false);
  };
  
  const handleTouchMove = (e) => { 
    setTouchEnd(e.targetTouches[0].clientX); 
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 50) {
      nextSlide();
      setHasDragged(true);
    }
    if (touchStart - touchEnd < -50) {
      prevSlide();
      setHasDragged(true);
    }
    setIsDragging(false);
  };
  
  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragStart(e.clientX); 
    setIsDragging(true);
    setHasDragged(false);
  };
  
  const handleMouseMove = (e) => { 
    if (!isDragging) return;
    const currentX = e.clientX;
    const diff = Math.abs(currentX - dragStart);
    if (diff > 5) {
      setHasDragged(true);
    }
  };
  
  const handleMouseUp = (e) => {
    if (!isDragging) return;
    const dragEnd = e.clientX;
    const dragDistance = dragStart - dragEnd;
    
    if (Math.abs(dragDistance) > 30) {
      if (dragDistance > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setIsDragging(false);
    
    // Reset hasDragged after a short delay
    setTimeout(() => setHasDragged(false), 100);
  };
  
  const handleMouseLeave = () => {
    setIsDragging(false);
    setTimeout(() => setHasDragged(false), 100);
  };

  const handleSlideClick = (e, link) => {
    // Prevent navigation if user was dragging
    if (hasDragged) {
      e.preventDefault();
    }
  };

  if (sliders.length === 0) return null;

  const sliderHeight = 'h-48 sm:h-48 md:h-72 lg:h-113';

  return (
    <div className="relative mt-3 flex gap-3">

      {/* ===== Category Sidebar (Left) - Desktop Only ===== */}
      <div className={`hidden md:block w-[23%] flex-shrink-0 relative ${sliderHeight}`}>

        {/* Scrollable parent category list */}
        <div className={`absolute inset-0 overflow-y-auto hide-scrollbar border border-gray-200 rounded-l-md bg-white rounded-md ml-4`}>
          {loadingCategories ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Loading...
            </div>
          ) : (
            categories.map((category, index) => (
              <div
                key={category.id}
                onMouseEnter={() => setSelectedCategory(index)}
                onMouseLeave={() => {
                  if (!category.subcategories || category.subcategories.length === 0) {
                    setSelectedCategory(null);
                  }
                }}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className={`flex items-center gap-2 px-3 py-2 border-b border-gray-100 transition-colors cursor-pointer ${
                    selectedCategory === index
                      ? 'bg-[#FFF5F3] text-[#FF5533]'
                      : 'text-gray-700 hover:bg-[#FFF5F3] hover:text-[#FF5533]'
                  }`}
                >
                  <div className="w-6 h-6 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                    {category.image && category.image !== 'null' ? (
                      <Image
                        src={`https://app.anginarbazar.com/uploads/images/thumbnail/${category.image}`}
                        alt={category.category_name}
                        width={24}
                        height={24}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Menu size={12} className="text-gray-400" />
                      </div>
                    )}
                  </div>
                  <span className="font-medium text-sm flex-1 truncate">{category.category_name}</span>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <ChevronRight size={14} className="flex-shrink-0" />
                  )}
                </Link>
              </div>
            ))
          )}
        </div>

        {/* Subcategory flyout — outside the scroll div, so NOT clipped */}
        {selectedCategory !== null &&
          categories[selectedCategory]?.subcategories &&
          categories[selectedCategory].subcategories.length > 0 && (
          <div
            className={`absolute left-full top-0 w-60 ${sliderHeight} bg-white border border-gray-200 shadow-lg z-40 flex flex-col rounded-sm`}
            onMouseEnter={() => setSelectedCategory(selectedCategory)}
            onMouseLeave={() => setSelectedCategory(null)}
          >
            <div className="bg-[#FF5533] text-white px-3 py-2 font-semibold text-sm flex-shrink-0 rounded-sm">
              {categories[selectedCategory].category_name}
            </div>
            <div className="overflow-y-auto hide-scrollbar flex-1">
              {categories[selectedCategory].subcategories.map((subcat) => (
                <Link
                  key={subcat.id}
                  href={`/category/${subcat.slug}`}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-[#FFF5F3] hover:text-[#FF5533] transition-colors border-b border-gray-100 cursor-pointer text-gray-700"
                >
                  <div className="w-5 h-5 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                    {subcat.image && subcat.image !== 'null' ? (
                      <Image
                        src={`https://app.anginarbazar.com/uploads/images/thumbnail/${subcat.image}`}
                        alt={subcat.category_name}
                        width={20}
                        height={20}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200"></div>
                    )}
                  </div>
                  <span className="text-sm font-medium">{subcat.category_name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== Slider (Right) ===== */}
      <div className="flex-1 px-4 md:px-0 md:pr-4">
        <div
          className={`relative ${sliderHeight} overflow-hidden select-none rounded-md ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {sliders.map((slider, index) => (
            <div
              key={slider.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                activeSlide === index
                  ? 'opacity-100 translate-x-0'
                  : index < activeSlide
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
              }`}
            >
              <Link
                href={slider.butten_link || '#'}
                onClick={(e) => handleSlideClick(e, slider.butten_link)}
                className="block h-full relative overflow-hidden"
              >
                <Image
                  src={getSliderImage(slider.background_image)}
                  alt={slider.title || 'Slider'}
                  fill
                  className="object-cover pointer-events-none"
                  draggable="false"
                  priority={index === 0}
                  sizes="100vw"
                  quality={100}
                />
              </Link>
            </div>
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevSlide(); }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 py-3 rounded-md shadow-lg transition-all duration-300 z-30 cursor-pointer hover:scale-110 active:scale-95"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextSlide(); }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 py-3 rounded-md shadow-lg transition-all duration-300 z-30 cursor-pointer hover:scale-110 active:scale-95"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-30">
            {sliders.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToSlide(index); }}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  activeSlide === index ? 'bg-[#FF5533] w-8' : 'bg-white/70 w-2 hover:bg-white'
                }`}
              />
            ))}
          </div>

        </div>
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}