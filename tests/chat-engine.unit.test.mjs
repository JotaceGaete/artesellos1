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

test('formatProductResults: conserva encabezado, medidas, precio, disponibilidad e imagen', () => {
  const out = engine.formatProductResults([{
    marca: 'Shiny', modelo: '722', color: 'Negro', categoria: 'Timbre', ancho_mm: 14, alto_mm: 38,
    precio: 16000, stock: 3, imagen_url: 'https://ejemplo.cl/a.jpg',
  }]);
  assert.match(out, /Encontré estos productos/);
  assert.match(out, /### \*\*Shiny 722\*\* - Negro/);
  assert.match(out, /Medidas:\*\* 14x38mm/);
  assert.match(out, /Precio:\*\* \$16.?000/);
  assert.match(out, /3 unidades/);
  assert.match(out, /!\[Shiny 722 Negro\]\(https:\/\/ejemplo\.cl\/a\.jpg\)/);
});

test('formatProductResults: sin precio ni stock muestra consulta de disponibilidad', () => {
  const out = engine.formatProductResults([{
    marca: 'Colop', modelo: '10', color: 'Rojo', categoria: 'Timbre', ancho_mm: 10, alto_mm: 20,
    precio: 0, stock: 0, imagen_url: null,
  }]);
  assert.doesNotMatch(out, /Precio:/);
  assert.match(out, /Consultar disponibilidad/);
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

test('answerCatalogIntent: encuentra marca con espacio sobrante y normaliza precio', async () => {
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
  const out = await answerCatalogIntent(admin, { brand: 'shiny', model: '722' });
  assert.deepEqual(calls, [['marca', '%shiny%'], ['modelo', '%722%']]);
  assert.match(out, /### \*\*Shiny 722\*\* - Dorado/);
  assert.match(out, /Precio:\*\* \$16.?000/);
  assert.match(out, /!\[Shiny 722 Dorado\]\(https:\/\/e\.cl\/x\.jpg\)/);
});
