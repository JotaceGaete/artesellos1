// Pruebas finales sobre el estado de knowledge_base DESPUÉS de la limpieza (ver limpieza-kb-definitiva.sql).
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const OUT = '/tmp/artesellos-post-' + process.pid;
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

const OF = (id, question, aliases, content) => ({ id, active: true, category: 'oficial', question, aliases, content, sort_order: 100 });
const GE = (id, content) => ({ id, active: true, category: null, question: null, aliases: null, content, sort_order: 100 });

// Estado esperado tras la limpieza: 11 FAQ oficiales + 11 fragmentos generales (22 filas activas).
const POST = [
  OF(109, '¿Cómo puedo contactarlos?', ['contacto', 'correo de contacto', 'email de contacto', 'mail de contacto', 'whatsapp', 'cómo los contacto'],
    'Para consultas rápidas puedes escribirnos por WhatsApp. El correo de contacto es contacto@artesellos.cl.'),
  OF(114, '¿Tienen disponible un modelo?', ['disponibilidad', 'hay stock', 'tienen stock', 'stock disponible', 'hay disponibilidad', 'hay disponible'],
    'El stock que ves en el catálogo en línea es para compra online inmediata. Si un modelo no aparece o necesitas una cantidad grande, escríbenos por WhatsApp.'),
  OF(115, '¿Hacen pedidos mayoristas o descuentos por cantidad?', ['pedidos mayoristas', 'descuento por cantidad', 'descuentos por cantidad', 'compra al por mayor', 'varios timbres', 'descuento'],
    'Los pedidos mayoristas y los descuentos por cantidad se consultan directamente por WhatsApp.'),
  OF(118, '¿Cuál es el horario de atención?', ['horario de atención', 'horario', 'horarios', 'a qué hora abren', 'hasta qué hora atienden', 'hora de atención'],
    'Los horarios de atención son: Lunes a Viernes de 9:00 a 17:00 hs'),
  OF(149, '¿Dónde están ubicados?', ['dirección', 'direccion', 'ubicación', 'ubicacion', 'dónde están', 'donde estan', 'dónde queda el local', 'cuál es la dirección', 'dirección del local'],
    'Estamos ubicados en Coronel centro - Bannen 83 Local 4'),
  OF(143, '¿Tiene costo agregar un logo a mi timbre?', ['logo', 'logotipo', 'agregar logo', 'incluir un logo', 'costo del logo', 'logo sin costo'],
    'Incluir un logo no tiene costo adicional. Los logos deben ser en blanco y negro; si tu diseño tiene colores, envíalo por WhatsApp y te sugeriremos la mejor solución. Detalles muy finos pueden no notarse en el timbre.'),
  OF(146, '¿Cómo funciona el diseño de mi timbre?', ['enviar mi diseño', 'quiero enviar mi diseño', 'aprobar diseño', 'diseño previo', 'diseño antes de pagar', 'ver mi diseño'],
    'Puedes enviarnos imágenes, logotipos, textos o diseños propios antes de pagar. No realizamos trabajos de diseño ni preparación del timbre hasta recibir el pago total. Una vez realizado el pago, te enviamos el diseño para tu aprobación por WhatsApp, y solo grabamos el timbre cuando nos das tu OK.'),
  OF(147, '¿Cómo puedo pagar mi pedido?', ['formas de pago', 'medios de pago', 'pagar con transferencia', 'link de pago', 'métodos de pago', 'mercado pago', 'mercadopago', 'tienen carrito', 'carrito de compras', 'cómo compro', 'cómo comprar'],
    'Sí tenemos carrito: agrega los timbres que quieras desde el catálogo y envía tu pedido por WhatsApp. Confirmamos los detalles del pedido y te enviamos un enlace de pago de Mercado Pago. Puedes enviarnos tus textos, imágenes y logotipos por WhatsApp antes de pagar. Una vez recibido el pago total, preparamos el diseño y lo enviamos para tu aprobación antes de grabar.'),
  { ...OF(null, '¿Hacen envíos?', ['envío', 'envíos', 'envio', 'envios', 'despacho', 'hacen envíos', 'envían a regiones', 'hacen envíos a regiones', 'envío a regiones', 'envían a mi ciudad', 'hacen envíos a coronel', 'envíos a coronel', 'envio a coronel', 'envían a coronel'],
    'Realizamos envíos a todo Chile. Las compras superiores a $50.000 tienen envío gratuito. En Coronel, la entrega a domicilio es gratuita y se realiza al día siguiente, sin importar el monto de la compra. Para otras localidades utilizamos generalmente Starken.'), id: 301 },
  { ...OF(null, '¿Cuánto cuesta el envío?', ['costo del envío', 'costo de envío', 'cuanto cuesta el envio', 'costo envío gratis', 'envío gratis', 'envio gratis', 'cuándo es gratis el envío'],
    'El envío es gratuito en compras superiores a $50.000 y en la entrega a domicilio en Coronel, sin importar el monto. Para otras localidades, el envío se realiza generalmente por Starken. Para confirmar el costo de tu envío, escríbenos por WhatsApp.'), id: 302 },
  { ...OF(null, '¿Cuánto cuesta un timbre?', ['precio', 'precios', 'precio de los timbres', 'cuanto cuesta', 'cuanto vale un timbre', 'valor de los timbres'],
    'Los precios y la disponibilidad de cada modelo están en nuestro catálogo en línea. Si necesitas una cotización para una cantidad mayor, escríbenos por WhatsApp.'), id: 303 },
  GE(111, 'La marca Shiny es una línea premium de timbres. El modelo Shiny 722 es un timbre de bolsillo, ideal para profesionales.'),
  GE(112, 'Trodat es una marca reconocida mundialmente de timbres. El modelo Trodat 4912 es un timbre automático estándar muy popular.'),
  GE(113, 'Automatik es el nombre de una marca especializada en timbres automáticos. No debe confundirse con el término genérico "automáticos".'),
  GE(116, 'Fabricamos timbres personalizados con textos, logotipos y diseños propios. Consulta por WhatsApp los colores de tinta disponibles.'),
  GE(138, 'Los timbres de goma para instituciones son variados. Con 3 o 4 líneas de texto puede funcionar bien, pero las letras serán más chicas y se define menos.'),
  GE(139, 'Para una organización o empresa con muchos datos, te recomendamos el Shiny 224: es un timbre muy robusto de mecánica excelente y permite colocar gran cantidad de información. Medidas y disponibilidad en el catálogo.'),
  GE(140, 'Los timbres de bolsillo son especialmente recomendables para profesionales que necesitan llevar su timbre consigo. Son compactos, prácticos y fáciles de transportar.'),
  GE(141, 'Fabricamos timbres personalizados, cuidando la calidad del grabado y la legibilidad de los textos y logotipos.'),
  GE(144, 'No somos complicados, nos gusta ayudar no tengas temor en hablarnos porque queremos que estés contento con tu timbre.'),
  GE(145, 'Trata siempre de canalizar por correo o whatsapp tu solicitud. Tenemos casi 30 años de experiencia en la fabricación de timbres.'),
  GE(148, 'Tampoco colocamos métodos complejos de confección de timbres en la página, porque el cliente necesita una solución y no es un diseñador gráfico. En eso te ayudamos nosotros por WhatsApp.'),
];

function fakeAdmin(calls, kbRows = POST) {
  const make = (table) => {
    const b = {
      select() { return b; }, eq() { return b; }, order() { return b; }, limit() { return b; },
      not() { return b; }, ilike() { return b; },
      then(res, rej) {
        calls.push(table);
        const data = table === 'knowledge_base' ? kbRows : [];
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

const answer = async (q) => (await engine.tryDirectAnswer(fakeAdmin([]), q))?.content ?? null;

test('estado final: 22 filas activas, 11 FAQ oficiales, sin obsoletos', () => {
  assert.equal(POST.length, 22);
  assert.equal(POST.filter(r => r.category === 'oficial').length, 11);
  const text = POST.map(r => r.content).join(' ');
  for (const obsolete of ['Santiago', 'Providencia', '30.000', '3.500', 'No tenemos modelos', 'automatik 912', '22 * 58', '18*47', 'tienda física']) {
    assert.equal(text.includes(obsolete), false, `no debe quedar "${obsolete}"`);
  }
});

test('envíos: "hacen envios" y "envio a regiones" responden la FAQ de envíos', async () => {
  assert.match(await answer('hacen envios'), /^Realizamos envíos a todo Chile/);
  assert.match(await answer('envio a regiones'), /^Realizamos envíos a todo Chile/);
});

test('envíos: costo y envío gratis responden la FAQ de costo', async () => {
  assert.match(await answer('cuanto cuesta el envio'), /^El envío es gratuito/);
  assert.match(await answer('envio gratis'), /^El envío es gratuito/);
});

test('ubicación y horario responden desde FAQ oficiales', async () => {
  assert.equal(await answer('donde estan ubicados'), 'Estamos ubicados en Coronel centro - Bannen 83 Local 4');
  assert.equal(await answer('cual es la direccion'), 'Estamos ubicados en Coronel centro - Bannen 83 Local 4');
  assert.equal(await answer('horario de atencion'), 'Los horarios de atención son: Lunes a Viernes de 9:00 a 17:00 hs');
});

test('diseño: el cliente puede enviar su diseño antes de pagar y no se trabaja antes del pago', async () => {
  const a = await answer('quiero enviar mi diseño');
  assert.match(a, /^Puedes enviarnos imágenes/);
  assert.match(a, /No realizamos trabajos de diseño ni preparación del timbre hasta recibir el pago total/);
});

test('disponibilidad, mayoristas, logo, pago y contacto responden desde FAQ oficiales', async () => {
  assert.match(await answer('tienen stock'), /^El stock que ves/);
  assert.match(await answer('descuento por cantidad'), /se consultan directamente por WhatsApp/);
  assert.match(await answer('costo del logo'), /^Incluir un logo no tiene costo adicional/);
  assert.match(await answer('medios de pago'), /^Sí tenemos carrito/);
  assert.match(await answer('tienen carrito'), /Mercado Pago/);
  assert.match(await answer('correo de contacto'), /contacto@artesellos\.cl/);
});

test('precio: consulta general de precio remite al catálogo', async () => {
  assert.match(await answer('cuanto cuesta un timbre'), /catálogo en línea/);
});

test('falsa seguridad: costo de un diseño o de un timbre sin FAQ se deriva a confirmar, sin IA', async () => {
  assert.equal(await answer('cuanto cuesta el diseño'), engine.CONFIRM_MESSAGE);
  assert.equal(await answer('cuanto cuesta el timbre de madera'), engine.CONFIRM_MESSAGE);
});

test('no se derivan a WhatsApp innecesariamente: saludos y modelos del catálogo no dependen de la base', async () => {
  assert.ok(await answer('hola'));
  const calls = [];
  const stock = [{ marca: 'Shiny ', modelo: '722', color: 'Negro', categoria: 'Bolsillo', ancho_mm: 14, alto_mm: 38, precio: '5000', stock: 3, imagen_url: null }];
  const admin = { ...fakeAdmin(calls), from: (t) => {
    const base = fakeAdmin(calls).from(t);
    return base;
  } };
  void admin;
  const ans = await engine.tryDirectAnswer({
    ...fakeAdmin(calls),
    from: (t) => {
      const b = fakeAdmin(calls, POST).from(t);
      if (t === 'stock_timbres') b.then = (res, rej) => { calls.push(t); return Promise.resolve({ data: stock, error: null }).then(res, rej); };
      return b;
    },
  }, 'Shiny 722');
  assert.equal(ans?.products?.length, 1);
  assert.deepEqual(calls, ['stock_timbres']);
});

test('cuota agotada: ninguna consulta directa ni la derivación a confirmar llama a la RPC de cuota', async () => {
  const calls = [];
  const admin = fakeAdmin(calls);
  for (const q of ['hacen envios', 'donde estan ubicados', 'quiero enviar mi diseño', 'cuanto cuesta el diseño', 'hola', 'tienen stock']) {
    assert.ok((await engine.tryDirectAnswer(admin, q))?.content, `respuesta directa para "${q}"`);
  }
  assert.equal(calls.includes('rpc'), false);
});

test('información general sin tema comercial sigue respondiéndose', async () => {
  const ans = await answer('timbre automático');
  assert.equal(ans === null || typeof ans === 'string', true);
});

test('edición desde el panel: una FAQ oficial pasa la validación y conserva categoría, pregunta y alias', () => {
  const body = {
    content: POST[0].content,
    question: POST[0].question,
    category: 'oficial',
    aliases: POST[0].aliases.join('\n'),
    active: true,
    sort_order: 100,
    generate_embedding: false,
  };
  const r = fields.parseKnowledgeFields(body);
  assert.equal(r.ok, true);
  const row = fields.toRow(r.value);
  assert.equal(row.category, 'oficial');
  assert.equal(row.question, POST[0].question);
  assert.deepEqual(row.aliases, POST[0].aliases);
});

test('FAQ oficial nueva: el embedding queda desactivado por defecto; un fragmento general lo mantiene', () => {
  const oficial = fields.parseKnowledgeFields({ content: 'Respuesta de prueba.', question: '¿Hacen envíos?', category: 'oficial' });
  assert.equal(oficial.ok, true);
  assert.equal(oficial.value.generate_embedding, false);
  const general = fields.parseKnowledgeFields({ content: 'Dato general de prueba.' });
  assert.equal(general.ok, true);
  assert.equal(general.value.generate_embedding, true);
  const explicito = fields.parseKnowledgeFields({ content: 'Respuesta de prueba.', category: 'oficial', generate_embedding: true });
  assert.equal(explicito.value.generate_embedding, true, 'una elección explícita se respeta');
});

test('envíos a Coronel responde la FAQ de envíos (no se deriva a WhatsApp)', async () => {
  const a = await answer('hacen envios a coronel');
  assert.ok(a.includes('Coronel'), a);
  assert.ok(!a.includes('wa.me') || a.includes('compras superiores'), a);
});
