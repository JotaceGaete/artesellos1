// Pruebas unitarias del límite de login (fail-closed) con un cliente Supabase falso.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = '/tmp/artesellos-gate-' + process.pid;
let gate;

before(async () => {
  mkdirSync(OUT, { recursive: true });
  const src = readFileSync(new URL('../src/lib/adminLoginRateLimit.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  writeFileSync(`${OUT}/gate.mjs`, outputText);
  gate = await import(pathToFileURL(`${OUT}/gate.mjs`).href);
});

function fakeClient(handler) {
  return { rpc: async (name, args) => handler(name, args) };
}

test('begin: permite y devuelve attemptId cuando la función lo indica', async () => {
  const c = fakeClient(() => ({ data: [{ allowed: true, retry_after_sec: null, attempt_id: 42 }], error: null }));
  const r = await gate.beginLoginAttempt(c, 'h');
  assert.deepEqual(r, { allowed: true, attemptId: 42 });
});

test('begin: bloquea con retryAfterSec cuando se supera el límite', async () => {
  const c = fakeClient(() => ({ data: [{ allowed: false, retry_after_sec: 900, attempt_id: null }], error: null }));
  const r = await gate.beginLoginAttempt(c, 'h');
  assert.deepEqual(r, { allowed: false, retryAfterSec: 900 });
});

test('begin: fail-closed si la función devuelve error', async () => {
  const c = fakeClient(() => ({ data: null, error: { message: 'relation does not exist' } }));
  const r = await gate.beginLoginAttempt(c, 'h');
  assert.deepEqual(r, { allowed: false, unavailable: true });
});

test('begin: fail-closed si se lanza una excepción de red', async () => {
  const c = fakeClient(() => { throw new Error('ECONNRESET'); });
  const r = await gate.beginLoginAttempt(c, 'h');
  assert.deepEqual(r, { allowed: false, unavailable: true });
});

test('begin: fail-closed si la respuesta no tiene el formato esperado', async () => {
  const c = fakeClient(() => ({ data: [{ foo: 1 }], error: null }));
  const r = await gate.beginLoginAttempt(c, 'h');
  assert.deepEqual(r, { allowed: false, unavailable: true });
});

test('finish: envía el resultado y no lanza si la función falla', async () => {
  let sent;
  const ok = fakeClient((name, args) => { sent = { name, args }; return { data: null, error: null }; });
  await gate.finishLoginAttempt(ok, 7, true);
  assert.deepEqual(sent, { name: 'admin_login_finish', args: { p_attempt_id: 7, p_succeeded: true } });

  const bad = fakeClient(() => { throw new Error('boom'); });
  await gate.finishLoginAttempt(bad, 7, false); // no debe lanzar
});

test('hashIp: produce HMAC hex estable y no contiene la IP', async () => {
  const h1 = await gate.hashIp('1.2.3.4', 'secreto');
  const h2 = await gate.hashIp('1.2.3.4', 'secreto');
  assert.equal(h1, h2);
  assert.equal(h1.length, 64);
  assert.ok(!h1.includes('1.2.3.4'));
});
