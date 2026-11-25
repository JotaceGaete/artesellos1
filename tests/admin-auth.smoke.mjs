import { createHmac } from 'node:crypto';
// Prueba de humo de autenticación de administración.
// Uso: BASE_URL=http://localhost:3100 ADMIN_SESSION_SECRET=... node --test tests/admin-auth.smoke.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';


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

// --- PUT y DELETE de /api/admin/productos/[id] ---
const PRODUCT_ID = '00000000-0000-0000-0000-000000000000';
test('PUT /api/admin/productos/[id] sin sesión responde 401', async () => {
  const res = await send(`/api/admin/productos/${PRODUCT_ID}`, 'PUT');
  assert.equal(res.status, 401);
});
test('DELETE /api/admin/productos/[id] sin sesión responde 401', async () => {
  const res = await send(`/api/admin/productos/${PRODUCT_ID}`, 'DELETE');
  assert.equal(res.status, 401);
});
test('PUT con sesión válida supera la autenticación (no 401)', async () => {
  const res = await send(`/api/admin/productos/${PRODUCT_ID}`, 'PUT', { cookie: signedCookie(SECRET) });
  assert.notEqual(res.status, 401);
});
test('DELETE con sesión válida supera la autenticación (no 401)', async () => {
  const res = await send(`/api/admin/productos/${PRODUCT_ID}`, 'DELETE', { cookie: signedCookie(SECRET) });
  assert.notEqual(res.status, 401);
});
test('DELETE con sesión falsificada responde 401', async () => {
  const forged = `${COOKIE}=${Buffer.from(JSON.stringify({ exp: Date.now() + 60_000 })).toString('base64')}.AAAA`;
  const res = await send(`/api/admin/productos/${PRODUCT_ID}`, 'DELETE', { cookie: forged });
  assert.equal(res.status, 401);
});

// --- Webhook de Mercado Pago (requiere MP_WEBHOOK_SECRET en el servidor) ---
const MP_SECRET = process.env.MP_WEBHOOK_SECRET;
function mpHeaders(dataId, secret) {
  const ts = String(Math.floor(Date.now() / 1000));
  const requestId = 'test-request-id';
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  const v1 = createHmac('sha256', secret).update(manifest).digest('hex');
  return { 'x-signature': `ts=${ts},v1=${v1}`, 'x-request-id': requestId };
}
const postWebhook = (headers, body) => fetch(`${BASE}/api/checkout/mp/webhook`, {
  method: 'POST', redirect: 'manual',
  headers: { 'content-type': 'application/json', ...headers },
  body: JSON.stringify(body),
});
if (MP_SECRET) {
  test('webhook MP sin firma responde 401', async () => {
    const res = await postWebhook({}, { type: 'payment', data: { id: '1' } });
    assert.equal(res.status, 401);
  });
  test('webhook MP con firma de otro secreto responde 401', async () => {
    const res = await postWebhook(mpHeaders('1', 'otro-secreto'), { type: 'payment', data: { id: '1' } });
    assert.equal(res.status, 401);
  });
  test('webhook MP con firma válida supera la verificación (no 401)', async () => {
    const res = await postWebhook(mpHeaders('1', MP_SECRET), { type: 'payment', data: { id: '1' } });
    assert.notEqual(res.status, 401);
  });
}
