// Verificación de la firma x-signature de los webhooks de Mercado Pago.
// Manifiesto: "id:<data.id>;request-id:<x-request-id>;ts:<ts>;" firmado con HMAC-SHA256
// usando la clave secreta del webhook (MP_WEBHOOK_SECRET). Documentación de Mercado Pago.

import { constantTimeEqual } from './adminPasswordHash';

export function parseSignatureHeader(header: string): { ts: string; v1: string } | null {
  const parts = Object.fromEntries(
    header.split(',').map(p => {
      const idx = p.indexOf('=');
      return [p.slice(0, idx).trim(), p.slice(idx + 1).trim()];
    }),
  );
  if (!parts.ts || !parts.v1) return null;
  return { ts: parts.ts, v1: parts.v1 };
}

export function buildManifest(dataId: string, requestId: string | null, ts: string): string {
  // Mercado Pago indica que los ids alfanuméricos se envían en minúsculas.
  const id = /[a-zA-Z]/.test(dataId) ? dataId.toLowerCase() : dataId;
  return `id:${id};request-id:${requestId ?? ''};ts:${ts};`;
}

export async function verifyMercadoPagoSignature(input: {
  signatureHeader: string | null;
  requestId: string | null;
  dataId: string;
  secret: string;
}): Promise<boolean> {
  if (!input.signatureHeader || !input.dataId) return false;
  const parsed = parseSignatureHeader(input.signatureHeader);
  if (!parsed) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(input.secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const manifest = buildManifest(input.dataId, input.requestId, parsed.ts);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest));
  const expected = Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
  return constantTimeEqual(new TextEncoder().encode(expected), new TextEncoder().encode(parsed.v1));
}
