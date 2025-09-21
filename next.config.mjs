import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'artesellos.cl',
      'media.artesellos.cl',
      'i.postimg.cc',
      'ueannxyewstuptivnzjf.supabase.co',
      'df2db09c7e5c3e81be99a6984812ac80.r2.cloudflarestorage.com',
    ],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'i.postimg.cc', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'ueannxyewstuptivnzjf.supabase.co', port: '', pathname: '/storage/v1/object/**' },
      { protocol: 'https', hostname: '**.r2.dev', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'df2db09c7e5c3e81be99a6984812ac80.r2.cloudflarestorage.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'artesellos.cl', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'media.artesellos.cl', port: '', pathname: '/**' },
    ],
  },
};

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

export default nextConfig;
