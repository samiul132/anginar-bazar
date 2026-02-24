import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';
import { getImageUrl } from '@/lib/api';

export default function ProductCard({ product }) {
  const { addToCart, getItemQuantity, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  
  const salePrice = parseFloat(product.sale_price || '0');
  const promotionalPrice = parseFloat(product.promotional_price || '0');
  const hasPromotion = promotionalPrice > 0 && promotionalPrice < salePrice;
  const finalPrice = hasPromotion ? promotionalPrice : salePrice;
  const discountPercent = hasPromotion ? Math.round(((salePrice - promotionalPrice) / salePrice) * 100) : 0;

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.product_name,
      price: finalPrice,
      image: product.image,
      slug: product.slug || ''
    }, 1);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      {/* IMAGE LINK */}
      <Link href={`/product/${product.slug}`} className="relative aspect-square block">
        <Image 
          src={getImageUrl(product.image)}
          alt={product.product_name || 'Product'}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
        />

        {hasPromotion && (
          <div className="absolute top-2 left-2 z-10">
            <svg width="40" height="56" viewBox="0 0 48 56" xmlns="http://www.w3.org/2000/svg">
              {/* Main ribbon rectangle */}
              <rect x="0" y="0" width="48" height="48" fill="#DC2626"/>
              
              {/* Zigzag bottom - seamlessly connected */}
              <path 
                d="M 0 48 L 4 56 L 8 48 L 12 56 L 16 48 L 20 56 L 24 48 L 28 56 L 32 48 L 36 56 L 40 48 L 44 56 L 48 48 Z" 
                fill="#DC2626"
              />
              
              {/* Text */}
              <text x="24" y="20" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">
                {discountPercent}%
              </text>
              <text x="24" y="36" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial, sans-serif">
                OFF
              </text>
            </svg>
          </div>
        )}

        {/* <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-700 shadow-sm z-10">
          Delivery 1-2 hours
        </div> */}
      </Link>

      {/* DETAILS & ADD TO CART - Fixed Structure */}
      <div className="p-3 flex flex-col flex-1">
        {/* Product Name - Fixed Height with Line Clamp */}
        <Link 
          href={`/product/${product.slug}`} 
          className="font-medium text-sm text-gray-900 mb-2 block h-[40px] overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {product.product_name}
        </Link>
        
        {/* Price Section - Fixed Height */}
        <div className="flex items-center gap-2 mb-3 min-h-[28px]">
          {hasPromotion && (
            <span className="text-gray-400 line-through text-sm">৳{Math.round(salePrice)}</span>
          )}
          <span className="text-gray-900 font-bold text-lg">৳{Math.round(finalPrice)}</span>
        </div>

        {/* Spacer - Pushes button to bottom */}
        <div className="flex-grow"></div>

        {/* Add to Cart Button - py-2 height */}
        {quantity === 0 ? (
          <button 
            onClick={handleAddToCart}
            className="w-full bg-[#FF5533] hover:bg-[#e64e27] text-white font-bold py-2 px-3 rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-95 text-sm whitespace-nowrap"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add to Cart</span>
          </button>
        ) : (
          <div className="flex items-center w-full bg-[#FF5533] rounded-full overflow-hidden text-white text-sm font-bold">
            {/* Minus Button */}
            <button 
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="flex-1 flex justify-center items-center hover:bg-[#e64e27] transition-colors cursor-pointer py-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>

            {/* Quantity Display */}
            <span className="flex-1 flex justify-center items-center border-x border-white py-2">
              {quantity}
            </span>

            {/* Plus Button */}
            <button 
              onClick={() => updateQuantity(product.id, quantity + 1)}
              className="flex-1 flex justify-center items-center hover:bg-[#e64e27] transition-colors cursor-pointer py-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}