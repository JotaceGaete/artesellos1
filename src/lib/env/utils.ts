export function readRequiredEnv(name: string): string {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return raw.trim();
}

/**
 * Como readRequiredEnv, pero recibe el valor ya resuelto en vez de buscarlo
 * por nombre. Necesario para NEXT_PUBLIC_*: Next.js solo inlinea en el bundle
 * cliente referencias estáticas literales (process.env.NEXT_PUBLIC_X), no
 * accesos dinámicos (process.env[name]). El caller debe pasar
 * process.env.NEXT_PUBLIC_X tal cual, sin indirección.
 */
export function requirePublicEnv(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return value.trim();
}
