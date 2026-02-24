import { Suspense } from 'react';
import OrderSuccessClient from './OrderSuccessClient';

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <OrderSuccessClient />
    </Suspense>
  );
}
