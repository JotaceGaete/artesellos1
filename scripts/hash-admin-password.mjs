#!/usr/bin/env node
// Genera el hash PBKDF2-SHA256 de la contraseña administrativa.
// No envía nada a la red. Uso:
//   node scripts/hash-admin-password.mjs            (pide la contraseña por stdin, sin mostrarla)
//   echo -n "contraseña" | node scripts/hash-admin-password.mjs
// El resultado se guarda en admin_settings con key = 'admin_password_hash'.
import { randomBytes, pbkdf2Sync } from 'node:crypto';
import { createInterface } from 'node:readline';

const ITERATIONS = 210000;

export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(password, salt, ITERATIONS, 32, 'sha256');
  return ['pbkdf2_sha256', ITERATIONS, salt.toString('base64'), hash.toString('base64')].join('$');
}

async function readSecret() {
  if (!process.stdin.isTTY) {
    let data = '';
    for await (const chunk of process.stdin) data += chunk;
    return data.replace(/\r?\n$/, '');
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  const answer = await new Promise(resolve => {
    rl.question('Contraseña (no se muestra): ', resolve);
    rl._writeToOutput = () => {};
  });
  rl.close();
  process.stdout.write('\n');
  return answer;
}

// Ejecución directa
if (import.meta.url === `file://${process.argv[1]}`) {
  const password = (await readSecret()).trim();
  if (password.length < 12) {
    console.error('La contraseña debe tener al menos 12 caracteres.');
    process.exit(1);
  }
  console.log(hashPassword(password));
}
