'use client';

import { CartProvider } from '@/lib/cartContext';
import { FavoritesProvider } from '@/lib/favoritesContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TopBanner from '@/components/TopBanner';
import ChatInterface from '@/components/ChatInterface';
import { WholesaleLevelBanner } from '@/components/wholesale/WholesalePrice';
import FloatingWhatsApp from '@/components/seo/FloatingWhatsApp';
import GlobalConversionCta from '@/components/seo/GlobalConversionCta';
import { usePathname } from 'next/navigation';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <CartProvider>
        <FavoritesProvider>
          {children}
        </FavoritesProvider>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <FavoritesProvider>
        <div className="min-h-screen flex flex-col">
          <TopBanner />
          <Navbar />
          <WholesaleLevelBanner />
          <main className="flex-1">
            {children}
          </main>
          <GlobalConversionCta />
          <Footer />
          <FloatingWhatsApp />
          <ChatInterface />
        </div>
      </FavoritesProvider>
    </CartProvider>
  );
}

