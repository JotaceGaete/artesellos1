/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Optimizaciones para reducir el bundle size
    optimizePackageImports: ['@supabase/supabase-js', 'lucide-react'],
  },
  // Configuración para Cloudflare Pages (SIN output: export)
  images: {
    unoptimized: true,
  },
  // Reducir el bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;