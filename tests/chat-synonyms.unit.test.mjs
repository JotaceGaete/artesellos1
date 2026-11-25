// Sinónimos, erratas, contradicciones por tema y respuestas directas con cuota agotada.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = '/tmp/artesellos-synonyms-' + process.pid;
let engine;

before(async () => {
  mkdirSync(OUT, { recursive: true });
  const src = readFileSync(new URL('../src/lib/chatAnswerEngine.ts', import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  writeFileSync(`${OUT}/engine.mjs`, outputText);
  engine = await import(pathToFileURL(`${OUT}/engine.mjs`).href);
});

const row = (id, content, question = null, aliases = null) => ({ id, content, question, aliases, sort_order: 100 });

// Fragmentos distintos tal como están hoy en knowledge_base (copias omitidas).
const KB = [
  row(109, 'Para consultas rápidas, los clientes pueden contactar vía WhatsApp. El email de contacto es contacto@artesellos.cl.'),
  row(110, 'Artesellos realiza envíos a todo Chile. Para pedidos superiores a $15.000, el envío tiene un costo de $3.500. Los pedidos superiores a $50.000 tienen envío gratis.'),
  row(118, 'Los horarios de atención son: Lunes a Viernes de 9:00 a 17:00 hs'),
  row(127, 'Artesellos es una tienda especializada en timbres personalizados ubicada en el centro de Santiago, Providencia, Chile.'),
  row(142, 'Los envíos son generalmente por Starken. El costo es uniforme a cualquier lugar de Chile y si tu compra supera los 30.000 pesos el envio es gratis.'),
  row(145, 'Trata siempre de canalizar por correo o whatsapp tu solicitud. No tenemos modelos de timbres disponibles de momento.'),
  row(147, 'Sí tenemos carrito: agrega los timbres que quieras desde el catálogo y envía tu pedido por WhatsApp. Te enviamos un enlace de pago de Mercado Pago.'),
  row(149, 'Estamos ubicados en Coronel centro - Bannen 83 Local 4'),
];

// Cliente falso: cuenta lecturas por tabla y falla si se llama a la RPC de cuota.
function fakeAdmin(calls, stockRows = [], kbRows = KB) {
  const make = (table) => {
    const b = {
      select() { return b; }, eq() { return b; }, order() { return b; }, limit() { return b; },
      not() { return b; }, ilike() { return b; },
      then(res, rej) {
        calls.push(table);
        const data = table === 'knowledge_base' ? kbRows : stockRows;
        return Promise.resolve({ data, error: null }).then(res, rej);
      },
    };
    return b;
  };
  return {
    from: make,
    rpc() { calls.push('rpc'); return Promise.resolve({ data: null, error: { message: 'no debe llamarse' } }); },
  };
}

const text = (q, rows = KB) => engine.matchKnowledgeText(q, rows)?.id ?? null;

test('sinónimos: "email" y "mail" son la palabra canónica "correo"', () => {
  assert.deepEqual(engine.canonicalWords('email', new Set()).map(x => x.w), ['correo']);
  assert.deepEqual(engine.canonicalWords('mail', new Set()).map(x => x.w), ['correo']);
});

test('sinónimos: horario coloquial sin la palabra exacta', () => {
  assert.equal(text('a que hora abren'), 118);
  assert.equal(text('horario de atencion'), 118);
});

test('erratas: palabra larga con una letra de menos se corrige al tema', () => {
  assert.equal(engine.canonicalWords('ubicacon', new Set())[0].w, 'ubicacion');
  assert.equal(engine.canonicalWords('contato', new Set())[0].w, 'contacto');
});

test('erratas: palabras cortas o comunes no se corrigen', () => {
  assert.equal(engine.canonicalWords('cosa', new Set())[0].topic, false);
});

test('acentos: la misma consulta con y sin tilde responde igual', () => {
  assert.equal(text('pagar con transferencia'), 147);
  assert.equal(text('pagár con transferéncia'), 147);
});

test('falsos positivos: palabras genéricas no son temas comerciales', () => {
  for (const word of ['queda', 'quedan', 'llega', 'llegan', 'formas', 'medios', 'tienda', 'local', 'metodos', 'deposito', 'retiro']) {
    assert.equal(engine.canonicalWords(word, new Set())[0].topic, false, `"${word}" no debe ser tema`);
  }
});

test('falsos positivos: "métodos de envío" es envío, no pago', () => {
  const topics = engine.canonicalWords('métodos de envío', new Set()).filter(x => x.topic).map(x => x.w);
  assert.deepEqual(topics, ['envio']);
});

test('falsos positivos: "mi pedido llega hoy" no es un tema comercial', () => {
  assert.equal(engine.commercialTopics('mi pedido llega hoy').size, 0);
});

const OFICIAL_HORARIO = { ...row(118, 'Los horarios de atención son: Lunes a Viernes de 9:00 a 17:00 hs', '¿Cuál es el horario de atención?'), category: 'oficial' };
const OFICIAL_ENVIO_REGIONES = { ...row(301, 'Sí, enviamos a todo Chile.', '¿Hacen envíos a regiones?'), category: 'oficial' };
const OFICIAL_COSTO_ENVIO = { ...row(302, 'El envío cuesta $3.500 en pedidos bajo $15.000.', '¿Cuánto cuesta el envío?'), category: 'oficial' };

test('tema comercial sin FAQ oficial: se deriva a confirmar, sin IA ni información complementaria', async () => {
  const rows = [row(201, 'Despachamos por Starken a todo Chile.'), row(202, 'Hacemos envíos por Chilexpress.')];
  const ans = await engine.tryDirectAnswer(fakeAdmin([], [], rows), 'envio a regiones');
  assert.equal(ans?.content, engine.CONFIRM_MESSAGE);
});

test('FAQ oficial: dos preguntas oficiales distintas sobre envío son complementarias y no bloquean', async () => {
  const ans = await engine.tryDirectAnswer(fakeAdmin([], [], [OFICIAL_ENVIO_REGIONES, OFICIAL_COSTO_ENVIO]), 'cuanto cuesta el envio');
  assert.equal(ans?.content, OFICIAL_COSTO_ENVIO.content);
});

test('FAQ oficial: dos preguntas oficiales distintas sobre envío, pregunta de regiones', async () => {
  const ans = await engine.tryDirectAnswer(fakeAdmin([], [], [OFICIAL_ENVIO_REGIONES, OFICIAL_COSTO_ENVIO]), 'hacen envios a regiones');
  assert.equal(ans?.content, OFICIAL_ENVIO_REGIONES.content);
});

test('FAQ oficial: la misma pregunta con respuestas distintas es ambigua y se deriva a confirmar', async () => {
  const a = { ...row(303, 'Costo $3.500.', '¿Cuánto cuesta el envío?'), category: 'oficial' };
  const b = { ...row(304, 'Envío gratis.', '¿Cuánto cuesta el envío?'), category: 'oficial' };
  const ans = await engine.tryDirectAnswer(fakeAdmin([], [], [a, b]), 'cuanto cuesta el envio');
  assert.equal(ans?.content, engine.CONFIRM_MESSAGE);
});

test('FAQ oficial: copias idénticas de una misma respuesta se responden sin ambigüedad', async () => {
  const a = { ...row(305, 'Envíos a todo Chile.', '¿Hacen envíos?'), category: 'oficial' };
  const b = { ...row(306, 'Envíos a todo Chile.', '¿Hacen envíos?'), category: 'oficial' };
  const ans = await engine.tryDirectAnswer(fakeAdmin([], [], [a, b]), 'hacen envios');
  assert.equal(ans?.content, 'Envíos a todo Chile.');
});

test('dirección como sinónimo de ubicación: con FAQ oficial de ubicación se responde', async () => {
  const ubicacion = { ...row(307, 'Estamos en [CONFIRMAR: dirección].', '¿Cuál es la dirección?'), category: 'oficial' };
  const ans = await engine.tryDirectAnswer(fakeAdmin([], [], [ubicacion]), 'cual es la direccion');
  assert.equal(ans?.content, ubicacion.content);
});

test('dirección como sinónimo de ubicación: sin FAQ oficial se deriva a confirmar', async () => {
  const ans = await engine.tryDirectAnswer(fakeAdmin([], [], []), 'cual es la direccion');
  assert.equal(ans?.content, engine.CONFIRM_MESSAGE);
});

test('información general sin tema comercial se responde desde la base', async () => {
  const general = row(308, 'Un timbre automático entinta al presionar y vuelve a su posición solo.');
  const ans = await engine.tryDirectAnswer(fakeAdmin([], [], [general]), 'que es un timbre automatico');
  assert.equal(ans?.content, general.content);
});

test('una sola lectura de la base por consulta general', async () => {
  const calls = [];
  const ans = await engine.tryDirectAnswer(fakeAdmin(calls, [], [OFICIAL_HORARIO]), 'horario de atencion');
  assert.equal(ans?.content, OFICIAL_HORARIO.content);
  assert.deepEqual(calls, ['knowledge_base']);
});

test('modelo de catálogo: responde desde stock_timbres sin leer la base', async () => {
  const calls = [];
  const stock = [{ marca: 'Shiny ', modelo: '722', color: 'Negro', categoria: 'Bolsillo', ancho_mm: 14, alto_mm: 38, precio: '5000', stock: 3, imagen_url: null }];
  const ans = await engine.tryDirectAnswer(fakeAdmin(calls, stock), 'Shiny 722');
  assert.equal(ans?.products?.length, 1);
  assert.deepEqual(calls, ['stock_timbres']);
});

test('modelo con palabra de costo: el catálogo responde aunque la base tenga fragmentos de envío', async () => {
  const calls = [];
  const stock = [{ marca: 'Shiny ', modelo: '722', color: 'Negro', categoria: 'Bolsillo', ancho_mm: 14, alto_mm: 38, precio: '5000', stock: 3, imagen_url: null }];
  const ans = await engine.tryDirectAnswer(fakeAdmin(calls, stock), 'cuanto cuesta el Shiny 722');
  assert.equal(ans?.products?.length, 1);
});

test('saludo: responde sin ninguna consulta a la base', async () => {
  const calls = [];
  const ans = await engine.tryDirectAnswer(fakeAdmin(calls), 'hola');
  assert.ok(ans?.content);
  assert.deepEqual(calls, []);
});

test('cuota agotada: las consultas directas y la derivación a confirmar no llaman a la RPC de cuota', async () => {
  const calls = [];
  const admin = fakeAdmin(calls, [], [OFICIAL_HORARIO]);
  assert.ok((await engine.tryDirectAnswer(fakeAdmin(calls, [], [OFICIAL_HORARIO]), 'horario de atencion'))?.content);
  assert.equal((await engine.tryDirectAnswer(admin, 'cuanto cuesta el envio'))?.content, engine.CONFIRM_MESSAGE);
  assert.ok((await engine.tryDirectAnswer(admin, 'hola'))?.content);
  assert.equal(calls.includes('rpc'), false);
});

test('cuota agotada: la ruta resuelve las consultas directas antes de exigir cuota', async () => {
  const route = readFileSync(new URL('../src/app/api/chat/route.ts', import.meta.url), 'utf8');
  const direct = route.indexOf('tryDirectAnswer(adminForDirect');
  const quota = route.indexOf('const requireAiQuota');
  assert.ok(direct > 0 && quota > 0 && direct < quota, 'tryDirectAnswer debe ir antes de la cuota');
});
