import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';

export default function Banner({ banners, layout = 'single' }) {
  if (!banners || banners.length === 0) return null;

  if (layout === 'single') {
    const banner = banners[0];
    return (
      <div className="px-4 mb-4">
        <Link 
          href={banner.link_for_web || '#'}
          className="block w-full h-auto overflow-hidden rounded-md"
        >
          <Image
            src={getImageUrl(banner.banner_image, 'full')}
            alt="Banner"
            width={0}
            height={0}
            sizes="100vw"
            quality={100}
            className="w-full h-auto"
            priority
          />
        </Link>
      </div>
    );
  }

  if (layout === 'double') {
    return (
      <div className="px-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {banners.slice(0, 2).map((banner, index) => (
            <Link
              key={banner.id || index}
              href={banner.link_for_web || '#'}
              className="block w-full overflow-hidden rounded-md"
            >
              <Image
                src={getImageUrl(banner.banner_image, 'full')}
                alt="Banner"
                width={0}
                height={0}
                sizes="100vw"
                quality={100}
                className="w-full h-auto"
              />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return null;
}