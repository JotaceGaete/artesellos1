// Dirty state del editor de productos: normalización, detección de cambios y estados del botón.
import { test, before, describe } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const OUT = '/tmp/artesellos-dirty-' + process.pid;
let m;

before(async () => {
  mkdirSync(OUT, { recursive: true });
  const src = readFileSync(new URL('src/lib/productFormDirty.ts', ROOT), 'utf8');
  writeFileSync(`${OUT}/productFormDirty.mjs`, ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText);
  m = await import(pathToFileURL(`${OUT}/productFormDirty.mjs`).href);
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
    const okIdx = page.indexOf('setSaved(snapshot)');
    const catchIdx = page.indexOf("showToast(err.message, 'err')");
    assert.ok(okIdx > 0 && catchIdx > okIdx);
    assert.equal((page.match(/setSaved\(/g) || []).length, 2);
  });
  test('el uploader no vacía las imágenes al montarse', () => {
    const up = readFileSync(new URL('src/components/admin/ProductImageUploader.tsx', ROOT), 'utf8');
    assert.match(up, /if \(!notifiedOnce\.current\) \{\s*notifiedOnce\.current = true;\s*return;/);
  });
});
