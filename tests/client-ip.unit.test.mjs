// La IP de confianza sale solo de x-real-ip; x-forwarded-for se ignora por completo.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = '/tmp/artesellos-ip-' + process.pid;
let mod;
before(async () => {
  mkdirSync(OUT, { recursive: true });
  const src = readFileSync(new URL('../src/lib/clientIp.ts', import.meta.url), 'utf8');
  writeFileSync(`${OUT}/clientIp.mjs`, ts.transpileModule(src, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText);
  mod = await import(pathToFileURL(`${OUT}/clientIp.mjs`).href);
});

test('usa x-real-ip', () => {
  const req = new Request('http://x', { headers: { 'x-real-ip': ' 190.1.2.3 ' } });
  assert.equal(mod.getTrustedClientIp(req), '190.1.2.3');
});

test('ignora x-forwarded-for aunque el cliente la falsee', () => {
  const req = new Request('http://x', { headers: { 'x-forwarded-for': '1.1.1.1, 2.2.2.2' } });
  assert.equal(mod.getTrustedClientIp(req), null);
});

test('sin x-real-ip devuelve null (fail-closed)', () => {
  assert.equal(mod.getTrustedClientIp(new Request('http://x')), null);
});
