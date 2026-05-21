const PLACEHOLDER = 'https://media.artesellos.cl/sin-image-producto-artesellos.png';

/**
 * Resolves a raw image value (full URL or R2/CDN key) to a usable src URL.
 * This is the single source of truth used by ProductCard, productAdapter, and admin.
 */
export function resolveAssetUrl(raw?: string): string {
  if (!raw || typeof raw !== 'string') return PLACEHOLDER;
  const value = raw.trim();
  if (!value) return PLACEHOLDER;

  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
    return value;
  }

  const base = (process.env.NEXT_PUBLIC_ASSETS_BASE_URL || 'https://artesellos.cl').replace(/\/+$/, '');
  let key = value.replace(/^\/+/, '').replace(/^(timbres\/)/i, '');
  const encoded = key.split('/').filter(Boolean).map(seg => encodeURIComponent(seg)).join('/');
  return `${base}/${encoded}`;
}
