'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/components/Footer';

export default function FooterWrapper() {
  const pathname = usePathname();

  const hideFooterRoutes = ['/cart'];
  const hideFooter = hideFooterRoutes.includes(pathname);

  if (hideFooter) return null;

  return (
    <div className="pb-16 md:pb-0">
      <Footer />
    </div>
  );
}