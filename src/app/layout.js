import './globals.css';
import ClientLayout from '@/components/ClientLayout';

export const metadata = {
  title: 'Anginar Bazar - Matlab Uttar, Chandpur\'s Trusted Online Grocery Shop',
  description: 'Anginar Bazar is a trusted online grocery shop in Matlab Uttar, Chandpur, offering fresh food and daily essentials at affordable prices. Get fast 1-hour home delivery and enjoy free delivery on your first order!',
  keywords: [
    'Anginar Bazar',
    'online grocery shop',
    'Matlab Uttar grocery',
    'Chandpur grocery shop',
    'fresh food delivery',
    'daily essentials',
    'home delivery Chandpur',
    'অনলাইন মুদি দোকান',
    'মতলব উত্তর অনলাইন বাজার',
  ],
  icons: {
    icon: '/favicon.png',
    apple: '/apple-icon-180x180.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn">
      <body className="antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}