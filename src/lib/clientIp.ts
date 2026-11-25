// IP del cliente para límites de uso.
// Vercel documenta x-real-ip como la IP calculada por su proxy. x-forwarded-for NO se usa:
// el cliente puede enviar cualquier valor en ella, tanto en la primera como en la última posición.
// Si la cabecera falta (p. ej. desarrollo local sin proxy), devuelve null y el llamador falla cerrado.
export function getTrustedClientIp(req: Request): string | null {
  const ip = req.headers.get('x-real-ip')?.trim();
  return ip ? ip : null;
}
