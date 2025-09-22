export const runtime = 'edge';

import { notFound } from 'next/navigation';
import { supabaseServerUtils } from '@/lib/supabaseUtils';
import { adaptSupabaseProduct } from '@/lib/productAdapter';
import ProductPageClient from '@/components/ProductPageClient';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  console.log(`🚀 Buscando producto REAL "${slug}" en Supabase...`);
  const supabaseProduct = await supabaseServerUtils.getProductBySlug(slug);
  const product = supabaseProduct ? adaptSupabaseProduct(supabaseProduct) : null;

  if (!product) {
    notFound();
  }

  return <ProductPageClient product={product} slug={slug} />;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const supabaseProduct = await supabaseServerUtils.getProductBySlug(slug);
  const product = supabaseProduct ? adaptSupabaseProduct(supabaseProduct) : null;

  if (!product) {
    return {
      title: 'Producto no encontrado - Artesellos',
    };
  }

  return {
    title: `${product.name} - Artesellos`,
    description: product.short_description,
    openGraph: {
      title: `${product.name} - Artesellos`,
      description: product.short_description,
      images: product.images.map(img => ({ url: img.src, alt: img.alt })),
    },
  };
}
