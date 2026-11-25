// Prueba de humo de autenticación de administración.
// Uso: BASE_URL=http://localhost:3100 ADMIN_SESSION_SECRET=... node --test tests/admin-auth.smoke.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';

const BASE = process.env.BASE_URL ?? 'http://localhost:3100';
const SECRET = process.env.ADMIN_SESSION_SECRET;
const COOKIE = 'admin_session';

// Mismo formato que src/lib/adminSession.ts: base64(payload) + '.' + base64(HMAC-SHA256(payload))
function signedCookie(secret, expOffsetMs = 60_000) {
  const payload = JSON.stringify({ iat: Date.now(), exp: Date.now() + expOffsetMs });
  const sig = createHmac('sha256', secret).update(payload).digest('base64');
  return `${COOKIE}=${Buffer.from(payload).toString('base64')}.${sig}`;
}

const get = (path, headers = {}) => fetch(`${BASE}${path}`, { redirect: 'manual', headers });
const send = (path, method, headers = {}) => fetch(`${BASE}${path}`, { method, redirect: 'manual', headers: { 'content-type': 'application/json', ...headers }, body: method === 'GET' ? undefined : '{}' });

const PROTECTED_API = [
  ['GET', '/api/admin/productos?action=list'],
  ['POST', '/api/admin/productos'],
  ['POST', '/api/admin/upload'],
  ['GET', '/api/admin/stock'],
  ['GET', '/api/admin/knowledge-base/test'],
  ['GET', '/api/admin/knowledge-base/debug-rag'],
  ['GET', '/api/debug-slider'],
  ['GET', '/api/check-slider-data'],
];

for (const [method, path] of PROTECTED_API) {
  test(`sin sesión ${method} ${path} responde 401`, async () => {
    const res = await send(path, method);
    assert.equal(res.status, 401);
  });
}

test('sesión falsificada es rechazada', async () => {
  const forged = `${COOKIE}=${Buffer.from(JSON.stringify({ exp: Date.now() + 60_000 })).toString('base64')}.AAAA`;
  const res = await send('/api/admin/productos?action=list', 'GET', { cookie: forged });
  assert.equal(res.status, 401);
});

test('sesión firmada con otro secreto es rechazada', async () => {
  const res = await send('/api/admin/productos?action=list', 'GET', { cookie: signedCookie('secreto-incorrecto') });
  assert.equal(res.status, 401);
});

test('sesión expirada es rechazada', async () => {
  const res = await send('/api/admin/productos?action=list', 'GET', { cookie: signedCookie(SECRET, -1000) });
  assert.equal(res.status, 401);
});

test('sesión válida pasa la barrera de autenticación', async () => {
  const res = await send('/api/admin/me', 'GET', { cookie: signedCookie(SECRET) });
  assert.equal(res.status, 200);
});

test('página /admin sin sesión redirige a /admin/login', async () => {
  const res = await get('/admin');
  assert.equal(res.status, 307);
  assert.match(res.headers.get('location') ?? '', /\/admin\/login/);
});

test('/admin/login es accesible sin sesión', async () => {
  const res = await get('/admin/login');
  assert.equal(res.status, 200);
});

test('el banner superior sigue siendo público (solo GET)', async () => {
  const res = await get('/api/admin/top-banner');
  assert.notEqual(res.status, 401);
});

test('el endpoint legado /api/admin/auth/login no es accesible sin sesión', async () => {
  const res = await send('/api/admin/auth/login', 'POST');
  assert.equal(res.status, 401);
});
