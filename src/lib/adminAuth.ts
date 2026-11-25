export const ADMIN_COOKIE = 'artesellos_admin';

export async function computeAdminToken(): Promise<string> {
  const password = process.env.ADMIN_PASSWORD ?? '';
  const data = new TextEncoder().encode(`artesellos:admin:${password}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyAdminToken(token: string | undefined): Promise<boolean> {
  if (!token || !process.env.ADMIN_PASSWORD) return false;
  const expected = await computeAdminToken();
  return token === expected;
}
