import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopBanner from "@/components/TopBanner";
import { CartProvider } from "@/lib/cartContext";
import { FavoritesProvider } from "@/lib/favoritesContext";
import { WholesaleLevelBanner } from "@/components/wholesale/WholesalePrice";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Artesellos - Timbres Personalizados",
  description: "Tienda online de timbres personalizados para todas tus ocasiones especiales. Diseños únicos y de calidad para regalos, invitaciones y celebraciones.",
  keywords: "timbres personalizados, sellos personalizados, regalos personalizados, artesellos",
  authors: [{ name: "Artesellos" }],
  icons: {
    icon: "/favicon.svg", // Favicon personalizado de Artesellos
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "Artesellos - Timbres Personalizados",
    description: "Tienda online de timbres personalizados para todas tus ocasiones especiales.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} font-sans antialiased bg-gray-50`}
      >
        <CartProvider>
          <FavoritesProvider>
            <div className="min-h-screen flex flex-col">
              <TopBanner />
              <Navbar />
              <WholesaleLevelBanner />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </FavoritesProvider>
        </CartProvider>
      </body>
    </html>
  );
}
