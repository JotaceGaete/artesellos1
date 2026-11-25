// Pruebas unitarias del motor de respuestas directas y de la validación del panel.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = '/tmp/artesellos-engine-' + process.pid;
let engine;
let fields;

function load(relPath, outName) {
  const src = readFileSync(new URL(relPath, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  writeFileSync(`${OUT}/${outName}`, outputText);
  return import(pathToFileURL(`${OUT}/${outName}`).href);
}

before(async () => {
  mkdirSync(OUT, { recursive: true });
  engine = await load('../src/lib/chatAnswerEngine.ts', 'engine.mjs');
  fields = await load('../src/lib/knowledgeFields.ts', 'fields.mjs');
});

const FAQ_ENVIO = {
  id: 1, content: 'Envíos a todo Chile.', question: '¿Cuánto cuesta el envío?',
  aliases: ['costo del envio'], sort_order: 10,
};
const FAQ_HORARIO = {
  id: 2, content: 'Lunes a viernes 9:00 a 17:00.', question: 'horario de atencion',
  aliases: null, sort_order: 20,
};

test('normalizeText: quita tildes, signos y mayúsculas', () => {
  assert.equal(engine.normalizeText('  ¿Cuánto CUESTA, el envío?! '), 'cuanto cuesta el envio');
});

test('matchFaq: coincidencia exacta con la pregunta principal', () => {
  const r = engine.matchFaq('¿Cuánto cuesta el envío?', [FAQ_ENVIO, FAQ_HORARIO]);
  assert.equal(r?.id, 1);
});

test('matchFaq: coincidencia exacta con una forma alternativa', () => {
  const r = engine.matchFaq('costo del envio', [FAQ_ENVIO, FAQ_HORARIO]);
  assert.equal(r?.id, 1);
});

test('matchFaq: coincidencia aproximada clara (mismas palabras de contenido)', () => {
  const r = engine.matchFaq('horario atencion', [FAQ_ENVIO, FAQ_HORARIO]);
  assert.equal(r?.id, 2);
});

test('matchFaq: sin coincidencia devuelve null', () => {
  assert.equal(engine.matchFaq('quiero hablar de garantía', [FAQ_ENVIO, FAQ_HORARIO]), null);
});

test('matchFaq: dos filas distintas con la misma pregunta son ambiguas y devuelven null', () => {
  const a = { id: 3, content: 'Contacto A', question: 'contacto', aliases: null, sort_order: 1 };
  const b = { id: 4, content: 'Contacto B', question: 'contacto', aliases: null, sort_order: 2 };
  assert.equal(engine.matchFaq('contacto', [a, b]), null);
});

test('matchFaq: filas sin pregunta no participan', () => {
  const rag = { id: 5, content: 'fragmento libre', question: null, aliases: null, sort_order: 1 };
  assert.equal(engine.matchFaq('fragmento libre', [rag]), null);
});

test('parseCatalogIntent: modelo solo con relleno de precio o stock', () => {
  assert.deepEqual(engine.parseCatalogIntent('shiny 722'), { brand: 'shiny', model: '722' });
  assert.deepEqual(engine.parseCatalogIntent('¿Cuánto cuesta el Trodat 4912?'), { brand: 'trodat', model: '4912' });
  assert.deepEqual(engine.parseCatalogIntent('tienen stock del traxx 9011'), { brand: 'traxx', model: '9011' });
});

test('parseCatalogIntent: si hay otro tema en la frase no responde directo', () => {
  assert.equal(engine.parseCatalogIntent('shiny 722 y cuál es la garantía'), null);
  assert.equal(engine.parseCatalogIntent('cuánto demora el envío a Temuco'), null);
});

test('parseCatalogIntent: marca desconocida o sin número de modelo', () => {
  assert.equal(engine.parseCatalogIntent('shiny'), null);
  assert.equal(engine.parseCatalogIntent('pilot 722'), null);
});

test('buildProductAnswer: fichas con medidas, precio, colores e imagen', () => {
  const ans = engine.buildProductAnswer([{
    marca: 'Shiny', modelo: '722', color: 'Negro', categoria: 'Bolsillo', ancho_mm: 14, alto_mm: 38,
    precio: 16000, stock: 3, imagen_url: 'https://ejemplo.cl/a.jpg',
  }]);
  assert.equal(ans.products.length, 1);
  const c = ans.products[0];
  assert.equal(c.medidas, '14x38mm');
  assert.equal(c.precio, 16000);
  assert.equal(c.color, 'Negro');
  assert.equal(c.imagen_url, 'https://ejemplo.cl/a.jpg');
  assert.equal(c.disponibilidad, 'disponible');
});

test('disponibilidad: con stock, sin stock o sin dato', () => {
  assert.equal(engine.availabilityOf(5), 'disponible');
  assert.equal(engine.availabilityOf(0), 'agotado');
  assert.equal(engine.availabilityOf(null), 'consultar');
});

test('fichas: nunca incluyen la cantidad de stock', () => {
  const ans = engine.buildProductAnswer([{
    marca: 'Shiny', modelo: '722', color: 'Negro', categoria: 'Bolsillo', ancho_mm: 14, alto_mm: 38,
    precio: 16000, stock: 7, imagen_url: null,
  }]);
  const json = JSON.stringify(ans);
  assert.doesNotMatch(json, /"stock"/);
  assert.doesNotMatch(json, /\b7\b/);
});

test('fichas: precio ausente se marca como nulo', () => {
  const ans = engine.buildProductAnswer([{
    marca: 'Colop', modelo: '10', color: 'Rojo', categoria: 'Timbre', ancho_mm: 10, alto_mm: 20,
    precio: 0, stock: null, imagen_url: null,
  }]);
  assert.equal(ans.products[0].precio, null);
  assert.equal(ans.products[0].disponibilidad, 'consultar');
});

test('knowledge fields: el contenido es obligatorio', () => {
  assert.equal(fields.parseKnowledgeFields({ content: '   ' }).ok, false);
  assert.equal(fields.parseKnowledgeFields({}).ok, false);
});

test('knowledge fields: valores por defecto', () => {
  const r = fields.parseKnowledgeFields({ content: 'Texto' });
  assert.equal(r.ok, true);
  assert.deepEqual(r.value, {
    content: 'Texto', question: null, category: null, aliases: [], active: true,
    sort_order: 100, generate_embedding: true,
  });
});

test('knowledge fields: alternativas por línea, en minúscula y sin duplicados', () => {
  const r = fields.parseKnowledgeFields({
    content: 'x', question: '¿Envío?', aliases: 'Costo del envio\ncosto del ENVIO\n\n  despacho  ',
  });
  assert.equal(r.ok, true);
  assert.deepEqual(r.value.aliases, ['costo del envio', 'despacho']);
});

test('knowledge fields: alternativas sin pregunta principal se rechazan', () => {
  const r = fields.parseKnowledgeFields({ content: 'x', aliases: ['algo'] });
  assert.equal(r.ok, false);
});

test('knowledge fields: orden fuera de rango o no entero se rechaza', () => {
  assert.equal(fields.parseKnowledgeFields({ content: 'x', sort_order: 10000 }).ok, false);
  assert.equal(fields.parseKnowledgeFields({ content: 'x', sort_order: 1.5 }).ok, false);
  assert.equal(fields.parseKnowledgeFields({ content: 'x', sort_order: -1 }).ok, false);
});

test('knowledge fields: texto de pregunta demasiado largo se recorta', () => {
  const r = fields.parseKnowledgeFields({ content: 'x', question: 'a'.repeat(500) });
  assert.equal(r.ok, true);
  assert.equal(r.value.question.length, 300);
});

test('knowledge fields: generate_embedding=false se respeta', () => {
  const r = fields.parseKnowledgeFields({ content: 'x', generate_embedding: false });
  assert.equal(r.value.generate_embedding, false);
});

test('toRow: alternativas vacías se guardan como null', () => {
  const r = fields.parseKnowledgeFields({ content: 'x' });
  assert.equal(fields.toRow(r.value).aliases, null);
});

test('answerCatalogIntent: encuentra marca con espacio sobrante, normaliza precio y oculta stock', async () => {
  const { answerCatalogIntent } = engine;
  const calls = [];
  const chain = {
    select() { return this; },
    ilike(col, val) { calls.push([col, val]); return this; },
    limit() { return Promise.resolve({ error: null, data: [{
      marca: 'Shiny ', modelo: '722', color: 'Dorado', categoria: 'Bolsillo',
      ancho_mm: 14, alto_mm: 38, precio: '16000.00', stock: 2, imagen_url: 'https://e.cl/x.jpg',
    }] }); },
  };
  const admin = { from() { return chain; } };
  const ans = await answerCatalogIntent(admin, { brand: 'shiny', model: '722' });
  assert.deepEqual(calls, [['marca', '%shiny%'], ['modelo', '%722%']]);
  assert.equal(ans.products[0].marca, 'Shiny');
  assert.equal(ans.products[0].precio, 16000);
  assert.equal(ans.products[0].disponibilidad, 'disponible');
  assert.doesNotMatch(JSON.stringify(ans), /"stock"/);
});

test('answerToSse / readChatStream: eventos de contenido, fichas y pie', async () => {
  const { answerToSse, readChatStream } = await load('../src/lib/chatStream.ts', 'chatStream.mjs');
  const sse = answerToSse({ content: 'Hola', products: [{ marca: 'A', modelo: '1', color: '', categoria: '', medidas: '', precio: null, imagen_url: null, disponibilidad: 'agotado' }], footer: 'Pie' });
  const events = [];
  await readChatStream(new Response(sse), ev => events.push(ev));
  assert.equal(events[0].content, 'Hola');
  assert.equal(events[1].products[0].disponibilidad, 'agotado');
  assert.equal(events[2].footer, 'Pie');
  assert.equal(events.length, 3);
});

const KB = [
  { id: 118, content: 'Los horarios de atención son: Lunes a Viernes de 9:00 a 17:00 hs', question: null, aliases: null },
  { id: 110, content: 'Artesellos realiza envíos a todo Chile. Para pedidos superiores a $15.000, el envío tiene un costo de $3.500.', question: null, aliases: null },
  { id: 119, content: 'Enviamos a todo Chile en 3 días hábiles', question: null, aliases: null },
  { id: 120, content: 'Enviamos a todo Chile en 3 días hábiles', question: null, aliases: null },
];

test('texto base: encuentra el fragmento de horarios sin IA', () => {
  const r = engine.matchKnowledgeText('¿Cuál es el horario de atención?', KB);
  assert.equal(r?.id, 118);
});

test('texto base: duplicados con el mismo texto no generan ambigüedad', () => {
  const rows = [KB[2], KB[3]];
  const r = engine.matchKnowledgeText('envios a todo chile', rows);
  assert.equal(r?.content, 'Enviamos a todo Chile en 3 días hábiles');
});

test('texto base: respuestas distintas casi empatadas no se responden', () => {
  const rows = [
    { id: 1, content: 'Enviamos a todo Chile en 3 días', question: null, aliases: null },
    { id: 2, content: 'Enviamos a todo Chile en 5 días', question: null, aliases: null },
  ];
  assert.equal(engine.matchKnowledgeText('envios a todo chile', rows), null);
});

test('texto base: consulta con poca cobertura no se responde', () => {
  assert.equal(engine.matchKnowledgeText('garantía de productos importados', KB), null);
});

test('texto base: una sola palabra útil no se responde', () => {
  assert.equal(engine.matchKnowledgeText('horario', KB), null);
});

test('saludos: respuesta local solo para mensajes cortos', () => {
  assert.match(engine.smallTalkAnswer('hola').content, /¿En qué te puedo ayudar/);
  assert.match(engine.smallTalkAnswer('Gracias').content, /wa\.me\/56922384216/);
  assert.equal(engine.smallTalkAnswer('hola quiero un shiny 722'), null);
});

test('cuota agotada: mensaje que deriva a WhatsApp sin cerrar el chat', () => {
  assert.match(engine.AI_QUOTA_MESSAGE, /wa\.me\/56922384216/);
  assert.match(engine.AI_QUOTA_MESSAGE, /seguir preguntando/);
});
