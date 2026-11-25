// Consultas con varios temas: cada parte se responde con su FAQ oficial, sin repetir oraciones,
// y solo la parte sin FAQ se deriva a WhatsApp. Sin IA y sin consumo de cuota.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = '/tmp/artesellos-comb-' + process.pid;
let engine;

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
});

const STARKEN = 'Para otras localidades, el envío se realiza generalmente por Starken.';
const ENVIO = `El envío es gratuito en compras superiores a $50.000 y en la entrega a domicilio en Coronel, sin importar el monto. ${STARKEN} Para confirmar el costo de tu envío, escríbenos por WhatsApp.`;
const PRECIO = 'Los precios y la disponibilidad de cada modelo están en nuestro catálogo en línea. Si necesitas una cotización para una cantidad mayor, escríbenos por WhatsApp.';
const OF = (id, question, aliases, content) => ({ id, active: true, category: 'oficial', question, aliases, content, sort_order: 100 });
const GE = (id, content) => ({ id, active: true, category: null, question: null, aliases: null, content, sort_order: 100 });

const GENERAL = GE(111, 'La marca Shiny es una línea premium de timbres. El precio del Shiny 722 depende del envío y de la promoción vigente.');
const ROWS = [
  OF(301, '¿Hacen envíos?', ['envío', 'envíos', 'envio', 'envios', 'despacho', 'hacen envíos'],
    `Realizamos envíos a todo Chile. ${STARKEN}`),
  OF(302, '¿Cuánto cuesta el envío?', ['costo del envío', 'costo de envío', 'cuanto cuesta el envio', 'envío gratis', 'envio gratis'], ENVIO),
  OF(303, '¿Cuánto cuesta un timbre?', ['precio', 'precios', 'cuanto cuesta', 'cuanto vale un timbre'], PRECIO),
  GENERAL,
];

function fakeAdmin() {
  const make = () => {
    const b = {
      select() { return b; }, eq() { return b; }, order() { return b; }, limit() { return b; },
      not() { return b; }, ilike() { return b; },
      then(res, rej) { return Promise.resolve({ data: ROWS, error: null }).then(res, rej); },
    };
    return b;
  };
  return { from: make, rpc() { return Promise.resolve({ data: null, error: { message: 'no debe llamarse' } }); } };
}

const answer = async (q) => (await engine.tryDirectAnswer(fakeAdmin(), q))?.content ?? null;

test('tema único con sinónimo: "precio del envio" responde la FAQ de costo de envío', async () => {
  assert.equal(await answer('precio del envio'), ENVIO);
});

test('tema único: "precio del timbre" responde la FAQ de precios, no el fragmento general', async () => {
  assert.equal(await answer('precio del timbre'), PRECIO);
});

test('dos temas: responde ambas FAQ oficiales y no sale el fragmento general', async () => {
  const a = await answer('cuanto cuesta el envio y el precio del timbre');
  assert.ok(a.includes('compras superiores a $50.000'), a);
  assert.ok(a.includes('catálogo en línea'), a);
  assert.ok(!a.includes('Shiny'), a);
  assert.ok(!a.includes('wa.me'), 'no debe derivar nada si ambos temas tienen FAQ');
});

test('no duplica oraciones equivalentes entre FAQ distintas', async () => {
  const a = await answer('hacen envios y cuanto cuesta el envio');
  const veces = a.split(STARKEN).length - 1;
  assert.equal(veces, 1, `la oración debe aparecer una vez: ${a}`);
});

test('respuesta parcial: entrega la parte con FAQ y deriva solo la pendiente a WhatsApp', async () => {
  const a = await answer('cuanto cuesta el envio y el diseno del timbre');
  assert.ok(a.includes('compras superiores a $50.000'), a);
  assert.ok(a.includes('diseno del timbre') || a.includes('diseño del timbre'), a);
  assert.ok(a.includes('wa.me/56922384216'), a);
  assert.ok(!a.includes('Shiny'), a);
});

test('dos temas sin FAQ oficial: confirmar, no inventar ni usar el general', async () => {
  const a = await answer('diseno del timbre y mayoristas');
  assert.ok(a.includes('wa.me/56922384216'), a);
  assert.ok(!a.includes('Shiny'), a);
});

test('palabras reales parecidas a un tema no se corrigen: "diseño previo" no es costo', async () => {
  // Sin FAQ de diseño en este fixture, lo correcto es derivar. Lo que no debe pasar es responder precios.
  const a = await answer('diseño previo');
  assert.notEqual(a, PRECIO, 'previo no debe leerse como precio');
  assert.ok(a.includes('wa.me'), a);
});
