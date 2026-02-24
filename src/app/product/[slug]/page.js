'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Minus, Plus, Share2, ShoppingCart } from 'lucide-react';
import { api, getImageUrl, API_BASE_URL } from '@/lib/api';
import { useCart } from '@/lib/CartContext';
import ProductCard from '@/components/ProductCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import toast, { Toaster } from 'react-hot-toast';
import 'swiper/css';
import 'swiper/css/navigation';

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;

  const { addToCart, getItemQuantity, updateQuantity } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [productCategories, setProductCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);

  const fetchProductDetails = async () => {
    setLoading(true);
    setError(null);
    setRelatedProducts([]);
    
    try {
      const response = await api.products.getDetails(slug);
      
      if (response.success && response.data?.product) {
        const productData = response.data.product;
        setProduct(productData);
        await fetchRelatedProducts(productData.id);

        // Build category chips with parent categories
        if (productData.categories?.length > 0) {
          try {
            const allCatsResponse = await api.categories.getAll();
            const allCats = allCatsResponse?.data || allCatsResponse?.categories || [];
            
            const chips = [];
            productData.categories.forEach(cat => {
              // If this category has a parent, find and add parent first
              if (cat.parent_category_id) {
                const parent = allCats.find(c => String(c.id) === String(cat.parent_category_id));
                if (parent && !chips.find(c => c.id === parent.id)) {
                  chips.push({ ...parent, isParent: true });
                }
              }
              // Add the category itself
              if (!chips.find(c => c.id === cat.id)) {
                chips.push({ ...cat, isParent: false });
              }
            });
            setProductCategories(chips);
          } catch (e) {
            // fallback: just use categories as-is
            setProductCategories(productData.categories.map(c => ({ ...c, isParent: false })));
          }
        }
      } else {
        setError('Product not found');
      }
    } catch (err) {
      console.error('Product fetch error:', err);
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (productId) => {
    try {
      const response = await api.products.getRelatedProducts(productId);
      if (response.success && response.data) {
        setRelatedProducts(response.data);
      }
    } catch (err) {
      console.error('Related products fetch error:', err);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    
    const salePrice = parseFloat(product.sale_price || '0');
    const promoPrice = parseFloat(product.promotional_price || '0');
    const finalPrice = promoPrice > 0 && promoPrice < salePrice ? promoPrice : salePrice;

    const currentQty = getItemQuantity(product.id);
    
    if (currentQty > 0) {
      updateQuantity(product.id, currentQty + 1);
    } else {
      addToCart({
        product_id: product.id,
        name: product.product_name,
        price: finalPrice,
        image: product.image,
        slug: product.slug,
      }, 1);
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  };

  const handleShareClick = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
        .then(() => toast.success('Link copied to clipboard!', { icon: '🔗', duration: 2000 }))
        .catch(() => toast.error('Failed to copy link', { duration: 2000 }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FF5533] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
        <p className="text-red-600 mb-4 text-lg">{error || 'Product not found'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-6 py-3 bg-[#FF5533] text-white rounded-lg hover:bg-[#e64e27] transition-colors cursor-pointer"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const salePrice = parseFloat(product.sale_price || '0');
  const promoPrice = parseFloat(product.promotional_price || '0');
  const hasPromotion = promoPrice > 0 && promoPrice < salePrice;
  const finalPrice = hasPromotion ? promoPrice : salePrice;
  
  const galleryImagesArray = product.gallery_images 
    ? product.gallery_images.split(',').map(img => img.trim()).filter(img => img.length > 0)
    : [];
  
  const allImagesWithDuplicates = [product.image, ...galleryImagesArray].filter(img => img && img.length > 0);
  const productImages = [...new Set(allImagesWithDuplicates)];
  
  const cartQty = getItemQuantity(product.id);

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-8">
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 2000,
          style: {
            background: '#fff',
            color: '#363636',
            fontSize: '14px',
            fontWeight: '500',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          success: {
            style: { border: '2px solid #10b981' },
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            style: { border: '2px solid #ef4444' },
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />

      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <button 
            onClick={() => router.back()} 
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors text-gray-900"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm text-gray-600 mx-4 flex-1">
            <Link href="/" className="hover:text-orange-500 transition-colors duration-200 whitespace-nowrap">
              Home
            </Link>
            <svg className="w-3 h-3 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="font-semibold text-gray-800 truncate">
              {product?.product_name}
            </span>
          </div>

          <button
            onClick={handleShareClick}
            className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors text-gray-900"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left - Images */}
          <div className="space-y-4">
            <div 
              className="bg-white rounded-xl border border-gray-200 p-4 relative aspect-square overflow-hidden cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <div className="relative w-full h-full">
                <Image
                  src={getImageUrl(productImages[selectedImage], 'full')}
                  alt={product.product_name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain transition-transform duration-300"
                  style={isZoomed ? {
                    transform: 'scale(2)',
                    transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`
                  } : {}}
                  priority
                />
              </div>
              {isZoomed && (
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-10">
                  Zoomed 2x
                </div>
              )}
            </div>

            {productImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto p-2 scrollbar-hide">
                {productImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl bg-white border-2 transition-all cursor-pointer overflow-hidden ${
                      i === selectedImage 
                        ? 'border-[#FF5533] shadow-lg scale-105' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative w-full h-full p-2">
                      <Image
                        src={getImageUrl(img, 'thumbnail')}
                        alt={`Image ${i + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                {product.product_name}
              </h1>

              {/* Price Section */}
              <div className="flex items-baseline gap-3 pb-4 border-b border-gray-100">
                <span className="text-4xl font-bold text-[#FF5533]">
                  ৳{Math.round(finalPrice)}
                </span>
                {hasPromotion && (
                  <>
                    <span className="text-2xl text-gray-400 line-through">
                      ৳{Math.round(salePrice)}
                    </span>
                    <span className="px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-full">
                      {Math.round(((salePrice - promoPrice) / salePrice) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>

              {product.short_description && (
                <div className="text-gray-600 leading-relaxed">
                  {product.short_description}
                </div>
              )}

              {/* Add to Cart */}
              <div className="pt-4">
                {cartQty === 0 ? (
                  <button
                    onClick={handleAddToCart}
                    className="w-full md:w-auto px-8 py-3 bg-[#FF5533] hover:bg-[#e64e27] text-white font-bold text-lg rounded-full transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer active:scale-95 shadow-lg hover:shadow-xl"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center w-full md:w-48 bg-[#FF5533] rounded-full overflow-hidden shadow-lg">
                    <button
                      onClick={() => updateQuantity(product.id, cartQty - 1)}
                      className="flex-1 flex justify-center items-center py-3 hover:bg-[#e64e27] transition-colors cursor-pointer"
                    >
                      <Minus size={20} className="text-white" />
                    </button>
                    <span className="flex-1 flex justify-center items-center py-3 text-white font-bold text-xl border-x border-white">
                      {cartQty}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, cartQty + 1)}
                      className="flex-1 flex justify-center items-center py-3 hover:bg-[#e64e27] transition-colors cursor-pointer"
                    >
                      <Plus size={20} className="text-white" />
                    </button>
                  </div>
                )}
              </div>

              {/* Categories and Brand */}
              {(product.brand?.brand_name || productCategories.length > 0) && (
                <div className="flex flex-col gap-1.5">
                  {/* Categories */}
                  {productCategories.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-gray-500 mr-1">Categories:</span>
                      {productCategories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${cat.slug}`}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 border text-[11px] font-medium rounded-full transition-colors ${
                            cat.isParent
                              ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                              : 'bg-gray-100 border-gray-200 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {cat.isParent ? '🗂️' : '📂'} {cat.category_name}
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Brand */}
                  {product.brand?.brand_name && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-gray-500 mr-1">Brand:</span>
                      <Link
                        href={`/popular-brands/${product.brand.slug}`}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 border border-orange-200 text-[#FF5533] text-[11px] font-semibold rounded-full hover:bg-orange-100 transition-colors"
                      >
                        🏷️ {product.brand.brand_name}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {product.description && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Product Description</h2>
                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-ul:text-gray-700 prose-li:text-gray-700"
                />
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="px-4 mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Related Products</h2>
              <span className="text-sm text-gray-500">
                {relatedProducts.length} {relatedProducts.length === 1 ? 'product' : 'products'}
              </span>
            </div>
            
            <div className="relative">
              <button className="swiper-button-prev-related absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-[#319F00] hover:bg-green-500 rounded-full p-2 shadow-md transition-all cursor-pointer">
                <ChevronLeft size={20} className="text-gray-100" />
              </button>

              <Swiper
                modules={[Navigation]}
                spaceBetween={12}
                slidesPerView={2}
                navigation={{
                  prevEl: '.swiper-button-prev-related',
                  nextEl: '.swiper-button-next-related',
                }}
                breakpoints={{
                  640: { slidesPerView: 2, spaceBetween: 12 },
                  768: { slidesPerView: 4, spaceBetween: 12 },
                  1024: { slidesPerView: 6, spaceBetween: 12 },
                }}
                className="product-slider px-8"
              >
                {relatedProducts.map((prod) => (
                  <SwiperSlide key={prod.id}>
                    <ProductCard product={prod} />
                  </SwiperSlide>
                ))}
              </Swiper>

              <button className="swiper-button-next-related absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-[#319F00] hover:bg-green-500 rounded-full p-2 shadow-md transition-all cursor-pointer">
                <ChevronRight size={20} className="text-gray-100" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}