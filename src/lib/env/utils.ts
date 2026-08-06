export function readRequiredEnv(name: string): string {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }
  return raw.trim();
}
