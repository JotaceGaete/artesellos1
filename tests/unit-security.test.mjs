// Pruebas unitarias de hash de contraseña y firma de Mercado Pago.
// Transpila los módulos TypeScript a un directorio temporal para probarlos en Node.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const OUT = '/tmp/artesellos-unit-' + process.pid;
let hashMod;
let sigMod;

function transpile(relPath, rewrite = s => s) {
  const src = readFileSync(new URL(`../${relPath}`, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  const name = relPath.split('/').pop().replace('.ts', '.mjs');
  writeFileSync(`${OUT}/${name}`, rewrite(outputText));
  return name;
}

before(async () => {
  mkdirSync(OUT, { recursive: true });
  transpile('src/lib/adminPasswordHash.ts');
  transpile('src/lib/mercadopagoSignature.ts', s => s.replace(/from '\.\/adminPasswordHash'/g, "from './adminPasswordHash.mjs'"));
  hashMod = await import(pathToFileURL(`${OUT}/adminPasswordHash.mjs`).href);
  sigMod = await import(pathToFileURL(`${OUT}/mercadopagoSignature.mjs`).href);
});

test('hash PBKDF2: la contraseña correcta verifica', async () => {
  const stored = await hashMod.hashPassword('clave-de-prueba-larga');
  assert.equal(await hashMod.verifyPasswordHash('clave-de-prueba-larga', stored), true);
});

test('hash PBKDF2: contraseña incorrecta no verifica', async () => {
  const stored = await hashMod.hashPassword('clave-de-prueba-larga');
  assert.equal(await hashMod.verifyPasswordHash('clave-incorrecta-xx', stored), false);
});

test('hash PBKDF2: cada hash usa sal distinta', async () => {
  const a = await hashMod.hashPassword('misma-clave-1234');
  const b = await hashMod.hashPassword('misma-clave-1234');
  assert.notEqual(a, b);
  assert.equal(hashMod.isPasswordHash(a), true);
});

test('hash PBKDF2: formatos malformados se rechazan sin lanzar', async () => {
  assert.equal(await hashMod.verifyPasswordHash('x', 'texto-plano'), false);
  assert.equal(await hashMod.verifyPasswordHash('x', 'pbkdf2_sha256$0$AA==$AA=='), false);
  assert.equal(await hashMod.verifyPasswordHash('x', 'pbkdf2_sha256$abc$!!$!!'), false);
  assert.equal(hashMod.isPasswordHash('texto-plano-de-prueba'), false);
});

test('comparación en tiempo constante', () => {
  const enc = s => new TextEncoder().encode(s);
  assert.equal(hashMod.constantTimeEqual(enc('abc'), enc('abc')), true);
  assert.equal(hashMod.constantTimeEqual(enc('abc'), enc('abd')), false);
  assert.equal(hashMod.constantTimeEqual(enc('abc'), enc('abcd')), false);
});

function mpSignature({ dataId, requestId, ts: stamp, secret }) {
  const manifest = `id:${dataId};request-id:${requestId};ts:${stamp};`;
  const v1 = createHmac('sha256', secret).update(manifest).digest('hex');
  return `ts=${stamp},v1=${v1}`;
}

test('firma MP: firma válida se acepta', async () => {
  const header = mpSignature({ dataId: '12345', requestId: 'req-1', ts: '1700000000', secret: 's3cret' });
  const ok = await sigMod.verifyMercadoPagoSignature({ signatureHeader: header, requestId: 'req-1', dataId: '12345', secret: 's3cret' });
  assert.equal(ok, true);
});

test('firma MP: otro secreto, otro id o cabecera ausente se rechazan', async () => {
  const header = mpSignature({ dataId: '12345', requestId: 'req-1', ts: '1700000000', secret: 's3cret' });
  assert.equal(await sigMod.verifyMercadoPagoSignature({ signatureHeader: header, requestId: 'req-1', dataId: '12345', secret: 'otro' }), false);
  assert.equal(await sigMod.verifyMercadoPagoSignature({ signatureHeader: header, requestId: 'req-1', dataId: '99999', secret: 's3cret' }), false);
  assert.equal(await sigMod.verifyMercadoPagoSignature({ signatureHeader: null, requestId: 'req-1', dataId: '12345', secret: 's3cret' }), false);
  assert.equal(await sigMod.verifyMercadoPagoSignature({ signatureHeader: 'basura', requestId: null, dataId: '12345', secret: 's3cret' }), false);
});

test('firma MP: ids alfanuméricos se normalizan a minúsculas en el manifiesto', async () => {
  const header = mpSignature({ dataId: 'abc123', requestId: 'r', ts: '1', secret: 'k' });
  const ok = await sigMod.verifyMercadoPagoSignature({ signatureHeader: header, requestId: 'r', dataId: 'ABC123', secret: 'k' });
  assert.equal(ok, true);
});
