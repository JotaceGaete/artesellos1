// Dirty state del editor de productos: normalización, detección de cambios y estados del botón.
import { test, before, describe } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const OUT = '/tmp/artesellos-dirty-' + process.pid;
let m;

let v;
const ALIASES = { '@/lib/productVariants': './productVariants.mjs', '@/lib/categories': './categories.mjs', '@/lib/catalogCategories': './catalogCategories.mjs' };
function transpile(rel, out) {
  let js = ts.transpileModule(readFileSync(new URL(rel, ROOT), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  for (const [from, to] of Object.entries(ALIASES)) js = js.split(`'${from}'`).join(`'${to}'`);
  writeFileSync(`${OUT}/${out}`, js);
}

before(async () => {
  mkdirSync(OUT, { recursive: true });
  transpile('src/lib/catalogCategories.ts', 'catalogCategories.mjs');
  transpile('src/lib/categories.ts', 'categories.mjs');
  transpile('src/lib/productVariants.ts', 'productVariants.mjs');
  transpile('src/lib/productFormDirty.ts', 'productFormDirty.mjs');
  m = await import(pathToFileURL(`${OUT}/productFormDirty.mjs`).href);
  v = await import(pathToFileURL(`${OUT}/productVariants.mjs`).href);
});

// Forma en que el editor carga un producto real (traxx-9130).
const loaded = () => ({
  name: 'Traxx 9130  ',
  slug: 'traxx-9130',
  price: '19000',
  regular_price: '19000',
  short_description: 'Timbre automático',
  description: 'Descripción larga',
  categories: ['automaticos'],
  tags: 'traxx, automatico',
  images: ['https://media.artesellos.cl/9130_BLACK.jpg', 'https://media.artesellos.cl/TRAXX-9130.jpg'],
  featured: false,
  stock_status: 'instock',
  stock_quantity: '10',
});

const savedOf = f => m.normalizeProductForm(f);

describe('carga inicial', () => {
  test('el formulario recién cargado no tiene cambios', () => {
    const f = loaded();
    assert.equal(m.isProductFormDirty(f, savedOf(f)), false);
  });
  test('sin copia guardada todavía (cargando) no hay cambios', () => {
    assert.equal(m.isProductFormDirty(loaded(), null), false);
  });
});

describe('cada campo cuenta como cambio', () => {
  const cases = {
    name: f => ({ ...f, name: 'Traxx 9130 nuevo' }),
    slug: f => ({ ...f, slug: 'traxx-9130-b' }),
    price: f => ({ ...f, price: '19500' }),
    regular_price: f => ({ ...f, regular_price: '25000' }),
    short_description: f => ({ ...f, short_description: 'Otro texto' }),
    description: f => ({ ...f, description: 'Otra descripción' }),
    'categoría agregada': f => ({ ...f, categories: [...f.categories, 'bolsillo'] }),
    'categoría quitada': f => ({ ...f, categories: [] }),
    'etiqueta nueva': f => ({ ...f, tags: f.tags + ', nueva' }),
    'imagen agregada': f => ({ ...f, images: [...f.images, 'https://media.artesellos.cl/x.jpg'] }),
    'imagen quitada': f => ({ ...f, images: f.images.slice(1) }),
    'orden de imágenes': f => ({ ...f, images: [...f.images].reverse() }),
    stock_quantity: f => ({ ...f, stock_quantity: '9' }),
    'publicación': f => ({ ...f, stock_status: 'outofstock' }),
    destacado: f => ({ ...f, featured: true }),
  };
  for (const [name, change] of Object.entries(cases)) {
    test(name, () => {
      const f = loaded();
      assert.equal(m.isProductFormDirty(change(f), savedOf(f)), true);
    });
  }
});

describe('deshacer vuelve a «Sin cambios»', () => {
  test('editar y restaurar el valor original', () => {
    const f = loaded();
    const saved = savedOf(f);
    const edited = { ...f, price: '20000', featured: true, images: [...f.images].reverse() };
    assert.equal(m.isProductFormDirty(edited, saved), true);
    const restored = { ...edited, price: '19000', featured: false, images: f.images };
    assert.equal(m.isProductFormDirty(restored, saved), false);
  });
  test('desmarcar y volver a marcar categorías en otro orden', () => {
    const f = { ...loaded(), categories: ['automaticos', 'fechadores'] };
    assert.equal(m.isProductFormDirty({ ...f, categories: ['fechadores', 'automaticos'] }, savedOf(f)), false);
  });
  test('diferencias que no cambian lo que se envía no cuentan', () => {
    const f = loaded();
    const same = {
      ...f,
      name: 'Traxx 9130',
      description: 'Descripción larga   ',
      tags: ' traxx ,automatico, ',
      price: '19.000',
      stock_quantity: '10',
    };
    assert.equal(m.isProductFormDirty(same, savedOf(f)), false);
  });
  test('precio normal vacío equivale al precio de venta, como en el PUT', () => {
    const f = loaded();
    assert.equal(m.isProductFormDirty({ ...f, regular_price: '' }, savedOf(f)), false);
  });
});

describe('guardado y error', () => {
  test('tras guardar, lo enviado es la nueva referencia', () => {
    const f = loaded();
    const edited = { ...f, price: '21000' };
    const saved = savedOf(edited);
    assert.equal(m.isProductFormDirty(edited, saved), false);
    assert.equal(m.isProductFormDirty(f, saved), true, 'volver al valor anterior ya es un cambio');
  });
  test('una edición hecha durante el guardado sigue pendiente', () => {
    const f = loaded();
    const sent = { ...f, price: '21000' };
    const whileSaving = { ...sent, name: 'Otro' };
    assert.equal(m.isProductFormDirty(whileSaving, savedOf(sent)), true);
  });
  test('si falla, la referencia no cambia y la edición sigue pendiente', () => {
    const f = loaded();
    const saved = savedOf(f);
    const edited = { ...f, price: '21000' };
    assert.equal(m.isProductFormDirty(edited, saved), true);
  });
});

describe('estados del botón', () => {
  const st = o => m.saveButtonState({ dirty: false, submitting: false, imagesBusy: false, justSaved: false, ...o });
  test('sin cambios: deshabilitado y gris', () => {
    assert.deepEqual(st({}), { label: 'Sin cambios', disabled: true, tone: 'idle' });
    assert.match(m.SAVE_BUTTON_TONE_CLASSES.idle, /bg-gray/);
  });
  test('con cambios: habilitado con el color actual', () => {
    assert.deepEqual(st({ dirty: true }), { label: 'Guardar cambios', disabled: false, tone: 'active' });
    assert.match(m.SAVE_BUTTON_TONE_CLASSES.active, /bg-indigo-600/);
  });
  test('guardando: deshabilitado', () => {
    assert.deepEqual(st({ dirty: true, submitting: true }), { label: 'Guardando...', disabled: true, tone: 'busy' });
  });
  test('guardado: verde y deshabilitado', () => {
    assert.deepEqual(st({ justSaved: true }), { label: '✓ Guardado', disabled: true, tone: 'saved' });
    assert.match(m.SAVE_BUTTON_TONE_CLASSES.saved, /bg-emerald/);
  });
  test('si se edita mientras se muestra «✓ Guardado», vuelve a «Guardar cambios»', () => {
    assert.equal(st({ justSaved: true, dirty: true }).label, 'Guardar cambios');
  });
  test('subiendo imágenes: deshabilitado', () => {
    assert.equal(st({ dirty: true, imagesBusy: true }).disabled, true);
  });
  test('tras un error: vuelve a habilitarse para reintentar', () => {
    assert.deepEqual(st({ dirty: true, submitting: false }), { label: 'Guardar cambios', disabled: false, tone: 'active' });
  });
});

describe('integración con el editor', () => {
  const page = readFileSync(new URL('src/app/admin/productos/[id]/page.tsx', ROOT), 'utf8');
  test('evita envíos duplicados y sin cambios', () => {
    assert.match(page, /if \(savingRef\.current \|\| !dirty \|\| imagesBusy\) return;/);
  });
  test('la carga inicial fija la copia guardada', () => {
    assert.match(page, /setForm\(loaded\);\s*\n\s*setSaved\(normalizeProductForm\(loaded\)\);/);
  });
  test('solo un guardado correcto actualiza la copia guardada', () => {
    const okIdx = page.indexOf('setSaved({ ...snapshot');
    const catchIdx = page.indexOf("showToast(err.message, 'err')");
    assert.ok(okIdx > 0 && catchIdx > okIdx);
    assert.equal((page.match(/setSaved\(/g) || []).length, 2);
  });
  test('el uploader no vacía las imágenes al montarse', () => {
    const up = readFileSync(new URL('src/components/admin/ProductImageUploader.tsx', ROOT), 'utf8');
    assert.match(up, /if \(!notifiedOnce\.current\) \{\s*notifiedOnce\.current = true;\s*return;/);
  });
});

// ---------------------------------------------------------------------------
// Entrega 2a: colores de carcasa.
const row = (o = {}) => ({ key: 'k' + Math.random(), id: 'c1', color_name: 'Lila', color_slug: 'lila', hex: '#c8a2c8', image_url: '', sku: '', stock_quantity: '3', active: true, ...o });
const withColors = () => ({ ...loaded(), stock_quantity: '9', variants: [row(), row({ id: 'c2', color_name: 'Dorado', color_slug: 'dorado', hex: '' })] });

describe('colores en el dirty state', () => {
  test('producto con colores recién cargado: sin cambios', () => {
    const f = withColors();
    assert.equal(m.isProductFormDirty(f, savedOf(f)), false);
    assert.equal(m.variantsDirty(f, savedOf(f)), false);
  });
  test('la clave interna de la fila no cuenta como cambio', () => {
    const f = withColors();
    const g = { ...f, variants: f.variants.map(r => ({ ...r, key: 'otra' })) };
    assert.equal(m.isProductFormDirty(g, savedOf(f)), false);
  });
  const cases = {
    nombre: r => ({ ...r, color_name: 'Lila claro' }),
    hex: r => ({ ...r, hex: '#000000' }),
    foto: r => ({ ...r, image_url: 'https://media.artesellos.cl/lila.jpg' }),
    sku: r => ({ ...r, sku: 'S722-LIL' }),
    stock: r => ({ ...r, stock_quantity: '5' }),
    ocultar: r => ({ ...r, active: false }),
  };
  for (const [name, mut] of Object.entries(cases)) {
    test(`cambio de ${name} en un color cuenta`, () => {
      const f = withColors();
      const g = { ...f, variants: [mut(f.variants[0]), f.variants[1]] };
      assert.equal(m.isProductFormDirty(g, savedOf(f)), true);
      assert.equal(m.variantsDirty(g, savedOf(f)), true);
    });
  }
  test('reordenar, agregar y quitar cuentan', () => {
    const f = withColors();
    const s = savedOf(f);
    assert.equal(m.variantsDirty({ ...f, variants: [f.variants[1], f.variants[0]] }, s), true);
    assert.equal(m.variantsDirty({ ...f, variants: [...f.variants, v.emptyVariantRow()] }, s), true);
    assert.equal(m.variantsDirty({ ...f, variants: [f.variants[0]] }, s), true);
  });
  test('editar solo el producto no marca los colores', () => {
    const f = withColors();
    assert.equal(m.variantsDirty({ ...f, name: 'Otro' }, savedOf(f)), false);
  });
  test('formulario sin campo variants equivale a sin colores', () => {
    const f = loaded();
    assert.equal(m.isProductFormDirty({ ...f, variants: [] }, savedOf(f)), false);
  });
});

describe('validación de colores (parseVariantsInput)', () => {
  const ok = (o = {}) => ({ color_name: 'Rosa', color_slug: 'Rosa', hex: null, image_url: null, sku: null, stock_quantity: 3, active: true, ...o });
  test('acepta los colores reales (incluido el slug «Rosa»)', () => {
    const r = v.parseVariantsInput([ok(), ok({ color_name: 'Rojo transparente', color_slug: 'rojo-transparente', hex: '#FF0000' })]);
    assert.equal(r.ok, true);
    assert.equal(r.variants[1].hex, '#ff0000');
  });
  test('lista vacía es válida (vuelve a stock simple)', () => {
    assert.deepEqual(v.parseVariantsInput([]), { ok: true, variants: [] });
  });
  for (const [label, input] of [
    ['no es lista', {}],
    ['nombre vacío', [ok({ color_name: '' })]],
    ['slug con espacios', [ok({ color_slug: 'rosa claro' })]],
    ['slug repetido sin distinguir mayúsculas', [ok(), ok({ color_slug: 'rosa' })]],
    ['hex inválido', [ok({ hex: '#12' })]],
    ['foto no es URL', [ok({ image_url: 'foto.jpg' })]],
    ['SKU repetido', [ok({ sku: 'A' }), ok({ color_slug: 'b', sku: 'A' })]],
    ['stock decimal', [ok({ stock_quantity: 1.5 })]],
    ['stock negativo', [ok({ stock_quantity: -2 })]],
    ['active no booleano', [ok({ active: 'si' })]],
    ['id no uuid', [ok({ id: '1' })]],
  ]) {
    test(`rechaza: ${label}`, () => assert.equal(v.parseVariantsInput(input).ok, false));
  }
  test('más de 50 colores se rechaza', () => {
    const many = Array.from({ length: 51 }, (_, i) => ok({ color_slug: `c${i}` }));
    assert.equal(v.parseVariantsInput(many).ok, false);
  });
  test('el total suma todos los colores, también los ocultos', () => {
    assert.equal(v.totalVariantStock([row(), row({ active: false, stock_quantity: '4' }), row({ stock_quantity: '' })]), 7);
  });
  test('normaliza filas del formulario: slug desde el nombre si falta', () => {
    const [n] = v.normalizeVariantRows([row({ id: undefined, color_name: ' Azul Marino ', color_slug: '', hex: '#ABCDEF', sku: ' ' })]);
    assert.equal(n.color_name, 'Azul Marino');
    assert.equal(n.color_slug, 'azul-marino');
    assert.equal(n.hex, '#abcdef');
    assert.equal(n.sku, null);
    assert.equal(n.stock_quantity, 3);
  });
});
