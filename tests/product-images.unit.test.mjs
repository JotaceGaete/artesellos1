// Normalización y protección de products.images (columna TEXT en Supabase).
// No toca la base real: las rutas se ejecutan contra un Supabase falso en memoria
// cargado con los 22 valores reales (tests/fixtures/admin-products-images.json).
import { test, before, after, beforeEach, describe } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const OUT = '/tmp/artesellos-images-' + process.pid;
const FIXTURE = JSON.parse(readFileSync(new URL('tests/fixtures/admin-products-images.json', ROOT), 'utf8'));
const ROWS = FIXTURE.rows;

// ---------------------------------------------------------------------------
// Carga de módulos TS sin dependencias nuevas: transpilar y reescribir imports.
// ---------------------------------------------------------------------------
const ALIASES = {
  'next/server': './mock-next-server.mjs',
  '@/lib/supabaseServer': './mock-supabaseServer.mjs',
  '@/lib/adminSession': './mock-adminSession.mjs',
  '@/lib/productImages': './productImages.mjs',
  '@/lib/assetUrl': './assetUrl.mjs',
};

function transpile(relPath, outName) {
  const src = readFileSync(new URL(relPath, ROOT), 'utf8');
  let js = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  for (const [from, to] of Object.entries(ALIASES)) {
    js = js.split(`'${from}'`).join(`'${to}'`).split(`"${from}"`).join(`"${to}"`);
  }
  const leftover = js.match(/from\s+['"]@\/[^'"]+['"]/);
  assert.equal(leftover, null, `import sin resolver en ${relPath}: ${leftover}`);
  writeFileSync(`${OUT}/${outName}`, js);
}

// Supabase falso: query builder encadenable que registra cada escritura.
function createFakeSupabase(initialRows) {
  const db = { products: initialRows.map(r => ({ ...r })), writes: [] };
  let seq = 1;
  class Query {
    constructor(table) { this.table = table; this.filters = []; this.op = 'select'; this.cols = '*'; this.one = false; }
    select(cols = '*') { this.cols = cols; return this; }
    eq(c, v) { this.filters.push(r => r[c] === v); return this; }
    neq(c, v) { this.filters.push(r => r[c] !== v); return this; }
    order() { return this; }
    limit() { return this; }
    single() { this.one = true; return this; }
    insert(rows) { this.op = 'insert'; this.payload = rows; return this; }
    update(obj) { this.op = 'update'; this.payload = obj; return this; }
    delete() { this.op = 'delete'; return this; }
    run() {
      const table = db[this.table] ?? (db[this.table] = []);
      let result;
      if (this.op === 'insert') {
        result = this.payload.map(p => ({ id: `new-${seq++}`, created_at: new Date().toISOString(), ...structuredClone(p) }));
        table.push(...result);
        db.writes.push({ op: 'insert', table: this.table, payload: structuredClone(this.payload) });
      } else {
        const matched = table.filter(r => this.filters.every(f => f(r)));
        if (this.op === 'update') {
          db.writes.push({ op: 'update', table: this.table, payload: structuredClone(this.payload) });
          for (const r of matched) Object.assign(r, structuredClone(this.payload));
        } else if (this.op === 'delete') {
          db[this.table] = table.filter(r => !matched.includes(r));
        }
        result = matched;
      }
      if (this.cols !== '*') {
        const keys = this.cols.split(',').map(s => s.trim());
        result = result.map(r => Object.fromEntries(keys.map(k => [k, r[k]])));
      } else {
        result = result.map(r => ({ ...r }));
      }
      if (this.one) {
        return result.length ? { data: result[0], error: null } : { data: null, error: { message: 'No rows' } };
      }
      return { data: result, error: null };
    }
    then(resolve, reject) { try { resolve(this.run()); } catch (e) { reject(e); } }
  }
  return { db, client: { from: table => new Query(table) } };
}

let lib, assetUrl, adapter, listRoute, idRoute, fake;

before(async () => {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/mock-next-server.mjs`, `
    export class NextResponse {
      static json(body, init = {}) {
        return new Response(JSON.stringify(body), { status: init.status ?? 200, headers: { 'content-type': 'application/json' } });
      }
    }
    export const NextRequest = Request;
  `);
  writeFileSync(`${OUT}/mock-supabaseServer.mjs`, `export function createSupabaseAdmin() { return globalThis.__fakeSupabase; }`);
  writeFileSync(`${OUT}/mock-adminSession.mjs`, `export async function requireAdminSession() { return null; }`);

  transpile('src/lib/productImages.ts', 'productImages.mjs');
  transpile('src/lib/assetUrl.ts', 'assetUrl.mjs');
  transpile('src/lib/productAdapter.ts', 'productAdapter.mjs');
  transpile('src/app/api/admin/productos/route.ts', 'route-list.mjs');
  transpile('src/app/api/admin/productos/[id]/route.ts', 'route-id.mjs');

  lib = await import(pathToFileURL(`${OUT}/productImages.mjs`).href);
  assetUrl = await import(pathToFileURL(`${OUT}/assetUrl.mjs`).href);
  adapter = await import(pathToFileURL(`${OUT}/productAdapter.mjs`).href);
  listRoute = await import(pathToFileURL(`${OUT}/route-list.mjs`).href);
  idRoute = await import(pathToFileURL(`${OUT}/route-id.mjs`).href);
});

function seedRows() {
  return ROWS.map((r, i) => ({
    id: `id-${r.slug}`,
    name: `Producto ${r.slug}`,
    slug: r.slug,
    price: 10000 + i,
    regular_price: 10000 + i,
    description: 'desc',
    short_description: 'corta',
    images: r.images, // texto crudo, exactamente como en la base
    categories: ['timbres-automaticos'],
    tags: [],
    featured: false,
    stock_status: r.stock_status,
    stock_quantity: 10,
    attributes: [],
    created_at: new Date(2026, 0, 1 + i).toISOString(),
  }));
}

beforeEach(() => {
  fake = createFakeSupabase(seedRows());
  globalThis.__fakeSupabase = fake.client;
});

const ctx = id => ({ params: Promise.resolve({ id }) });
const jsonReq = (method, body, url = 'http://x/api/admin/productos') =>
  new Request(url, { method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body)) });
const row = slug => fake.db.products.find(r => r.slug === slug);
const original = slug => ROWS.find(r => r.slug === slug);

// Lo que el cliente de edición envía hoy (sin `images` si no cambiaron).
function editPayload(p, overrides = {}) {
  return {
    name: p.name, slug: p.slug, price: p.price, regular_price: p.regular_price,
    description: p.description, short_description: p.short_description,
    categories: p.categories, tags: p.tags, featured: p.featured,
    stock_status: p.stock_status, stock_quantity: p.stock_quantity,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
describe('parseImages: formatos reales de los 22 productos', () => {
  test('la fixture tiene los 22 productos', () => {
    assert.equal(ROWS.length, 22);
    assert.ok(ROWS.every(r => typeof r.images === 'string'), 'en la base todos son texto');
  });

  for (const r of ROWS) {
    test(`normaliza ${r.slug}`, () => {
      assert.deepEqual(lib.parseImages(r.images), r.expected);
    });
  }

  test('cubre los tres formatos encontrados', () => {
    const kinds = new Set(ROWS.map(r => {
      const s = r.images.trim();
      if (r.slug === 'shiny-842') return 'doble';
      return s.startsWith('[') ? 'json-texto' : 'url-directa';
    }));
    assert.deepEqual([...kinds].sort(), ['doble', 'json-texto', 'url-directa']);
  });
});

describe('parseImages: JSON doblemente serializado', () => {
  test('shiny-842 devuelve las 7 URLs limpias, sin comillas ni corchetes', () => {
    const out = lib.parseImages(original('shiny-842').images);
    assert.equal(out.length, 7);
    for (const u of out) {
      assert.match(u, /^https:\/\/media\.artesellos\.cl\/Shiny%20842\/shiny-842-[a-z-]+\.jpg$/);
    }
  });

  test('string JSON dentro de string JSON', () => {
    const doble = JSON.stringify(JSON.stringify(['https://a.cl/x.jpg', 'https://a.cl/y.png']));
    assert.deepEqual(lib.parseImages(doble), ['https://a.cl/x.jpg', 'https://a.cl/y.png']);
  });

  test('array con un único string que es un array JSON', () => {
    assert.deepEqual(lib.parseImages(['["https://a.cl/x.jpg"]']), ['https://a.cl/x.jpg']);
  });
});

describe('parseImages: otros formatos y valores inválidos', () => {
  test('arrays, URL directa, objetos src/url, espacios y saltos de línea', () => {
    assert.deepEqual(lib.parseImages(['https://a.cl/1.jpg', ' https://a.cl/2.jpg \n']), ['https://a.cl/1.jpg', 'https://a.cl/2.jpg']);
    assert.deepEqual(lib.parseImages('  https://a.cl/1.jpg\r\n'), ['https://a.cl/1.jpg']);
    assert.deepEqual(lib.parseImages({ src: 'https://a.cl/s.jpg' }), ['https://a.cl/s.jpg']);
    assert.deepEqual(lib.parseImages([{ url: 'https://a.cl/u.jpg' }, { src: 'https://a.cl/s.jpg' }]), ['https://a.cl/u.jpg', 'https://a.cl/s.jpg']);
    assert.deepEqual(lib.parseImages('[{"src":"https://a.cl/s.jpg"}]'), ['https://a.cl/s.jpg']);
    assert.deepEqual(lib.parseImages('\r\n [ \r\n "https://a.cl/1.jpg" ,\r\n\t"https://a.cl/2.jpg" ] \n'), ['https://a.cl/1.jpg', 'https://a.cl/2.jpg']);
  });

  test('claves relativas de R2 y rutas del sitio se conservan', () => {
    assert.deepEqual(lib.parseImages('["modelos/915.png","/img/a.webp"]'), ['modelos/915.png', '/img/a.webp']);
  });

  test('nulos, vacíos e inválidos devuelven []', () => {
    for (const v of [null, undefined, '', '   ', '\r\n', '[]', 'null', '{}', '""', '[broken', 'hola mundo', 42, true, {}, [], [null, 3, {}], { foo: 'https://a.cl/x.jpg' }, 'javascript:alert(1)']) {
      assert.deepEqual(lib.parseImages(v), [], `valor: ${JSON.stringify(v)}`);
    }
  });

  test('descarta elementos inválidos pero conserva los válidos al leer', () => {
    assert.deepEqual(lib.parseImages(['https://a.cl/1.jpg', 7, null, '', 'basura sin extension']), ['https://a.cl/1.jpg']);
  });
});

describe('parseImagesInput / resolveImagesUpdate (escrituras)', () => {
  test('rechaza valores inválidos en vez de convertirlos en []', () => {
    for (const v of ['hola', 42, {}, { src: 'x' }, ['https://a.cl/1.jpg', 42], ['javascript:alert(1)'], '[malformado', ['ok sin url'], null]) {
      const r = lib.parseImagesInput(v);
      assert.equal(r.ok, false, `debió rechazar ${JSON.stringify(v)}`);
    }
  });

  test('acepta array, array JSON en texto y URL directa', () => {
    assert.deepEqual(lib.parseImagesInput(['https://a.cl/1.jpg']), { ok: true, images: ['https://a.cl/1.jpg'] });
    assert.deepEqual(lib.parseImagesInput('["https://a.cl/1.jpg"]'), { ok: true, images: ['https://a.cl/1.jpg'] });
    assert.deepEqual(lib.parseImagesInput('https://a.cl/1.jpg'), { ok: true, images: ['https://a.cl/1.jpg'] });
  });

  test('campo ausente = conservar; [] solo con clear_images === true', () => {
    assert.deepEqual(lib.resolveImagesUpdate({ name: 'x' }), { ok: true, action: 'keep' });
    assert.deepEqual(lib.resolveImagesUpdate({ images: undefined }), { ok: true, action: 'keep' });
    assert.equal(lib.resolveImagesUpdate({ images: [] }).ok, false);
    assert.equal(lib.resolveImagesUpdate({ images: [], clear_images: 'true' }).ok, false);
    assert.deepEqual(lib.resolveImagesUpdate({ images: [], clear_images: true }), { ok: true, action: 'set', value: '[]' });
  });

  test('serializa como texto JSON compatible con la columna TEXT', () => {
    const v = lib.serializeImagesForDb(['https://a.cl/1.jpg']);
    assert.equal(typeof v, 'string');
    assert.equal(v, '["https://a.cl/1.jpg"]');
  });
});

// ---------------------------------------------------------------------------
describe('API admin: lectura', () => {
  test('GET list entrega images como string[] en los 22 productos', async () => {
    const res = await listRoute.GET(new Request('http://x/api/admin/productos?action=list'));
    assert.equal(res.status, 200);
    const { products } = await res.json();
    assert.equal(products.length, 22);
    for (const p of products) {
      assert.ok(Array.isArray(p.images), `${p.slug} debe ser array`);
      assert.deepEqual(p.images, original(p.slug).expected);
      // Condición que usa la tarjeta del admin para mostrar la foto
      assert.ok(Array.isArray(p.images) && p.images.length > 0, `${p.slug} mostraría foto`);
    }
    assert.equal(fake.db.writes.length, 0, 'leer no escribe');
  });

  test('GET [id] entrega images normalizado', async () => {
    const res = await idRoute.GET(new Request('http://x'), ctx('id-shiny-842'));
    const p = await res.json();
    assert.deepEqual(p.images, original('shiny-842').expected);
  });
});

describe('API admin: edición sin perder imágenes', () => {
  for (const slug of ['automatik-913', 'traxx-9045', 'trodat-9511', 'shiny-842']) {
    test(`PUT sin campo images conserva el valor original de ${slug}`, async () => {
      const before = row(slug).images;
      const res = await idRoute.PUT(jsonReq('PUT', editPayload(row(slug), { name: 'Nombre editado' })), ctx(`id-${slug}`));
      assert.equal(res.status, 200);
      assert.equal(row(slug).name, 'Nombre editado');
      assert.equal(row(slug).images, before, 'el texto en la base queda idéntico');
      assert.ok(!('images' in fake.db.writes.at(-1).payload), 'el UPDATE no incluye images');
      const body = await res.json();
      assert.deepEqual(body.product.images, original(slug).expected);
    });
  }

  test('PUT con imágenes modificadas guarda texto JSON', async () => {
    const nuevas = [...original('traxx-9130').expected, 'https://media.artesellos.cl/nueva.webp'];
    const res = await idRoute.PUT(jsonReq('PUT', editPayload(row('traxx-9130'), { images: nuevas })), ctx('id-traxx-9130'));
    assert.equal(res.status, 200);
    assert.equal(typeof row('traxx-9130').images, 'string');
    assert.deepEqual(JSON.parse(row('traxx-9130').images), nuevas);
  });

  test('flujo cliente: GET [id] → PUT con las mismas imágenes no las altera', async () => {
    const p = await (await idRoute.GET(new Request('http://x'), ctx('id-trodat-4912'))).json();
    const res = await idRoute.PUT(jsonReq('PUT', editPayload(p, { images: p.images })), ctx('id-trodat-4912'));
    assert.equal(res.status, 200);
    assert.deepEqual(lib.parseImages(row('trodat-4912').images), original('trodat-4912').expected);
  });
});

describe('API admin: eliminación intencional y rechazo de inválidos', () => {
  test('PUT con images [] sin confirmación → 400 y no toca la base', async () => {
    const before = row('shiny-833').images;
    const res = await idRoute.PUT(jsonReq('PUT', editPayload(row('shiny-833'), { images: [] })), ctx('id-shiny-833'));
    assert.equal(res.status, 400);
    assert.equal(row('shiny-833').images, before);
    assert.equal(fake.db.writes.length, 0);
  });

  test('PUT con images [] y clear_images: true → guarda "[]"', async () => {
    const res = await idRoute.PUT(jsonReq('PUT', editPayload(row('shiny-833'), { images: [], clear_images: true })), ctx('id-shiny-833'));
    assert.equal(res.status, 200);
    assert.equal(row('shiny-833').images, '[]');
  });

  for (const invalid of ['hola', 123, { src: 1 }, ['https://a.cl/1.jpg', 99], '[roto']) {
    test(`PUT con images inválido (${JSON.stringify(invalid)}) → 400 sin escribir`, async () => {
      const before = row('traxx-9011').images;
      const res = await idRoute.PUT(jsonReq('PUT', editPayload(row('traxx-9011'), { images: invalid })), ctx('id-traxx-9011'));
      assert.equal(res.status, 400);
      assert.equal(row('traxx-9011').images, before);
      assert.equal(fake.db.writes.length, 0);
    });
  }

  test('PUT con cuerpo no JSON → 400', async () => {
    const res = await idRoute.PUT(jsonReq('PUT', 'no-json'), ctx('id-traxx-9011'));
    assert.equal(res.status, 400);
    assert.equal(fake.db.writes.length, 0);
  });
});

describe('API admin: cambio de visibilidad', () => {
  test('PATCH solo escribe stock_status y updated_at; images idéntico', async () => {
    const before = { ...row('shiny-s-722') };
    const res = await idRoute.PATCH(jsonReq('PATCH', { stock_status: 'outofstock' }), ctx('id-shiny-s-722'));
    assert.equal(res.status, 200);
    const write = fake.db.writes.at(-1);
    assert.deepEqual(Object.keys(write.payload).sort(), ['stock_status', 'updated_at']);
    const after = row('shiny-s-722');
    assert.equal(after.stock_status, 'outofstock');
    assert.equal(after.images, before.images);
    for (const k of ['name', 'slug', 'price', 'description', 'categories', 'tags', 'featured', 'stock_quantity']) {
      assert.deepEqual(after[k], before[k], `campo ${k} intacto`);
    }
  });

  test('PATCH ignora images u otros campos enviados', async () => {
    const before = row('automatik-945').images;
    const res = await idRoute.PATCH(jsonReq('PATCH', { stock_status: 'outofstock', images: [], name: 'x' }), ctx('id-automatik-945'));
    assert.equal(res.status, 200);
    assert.equal(row('automatik-945').images, before);
    assert.notEqual(row('automatik-945').name, 'x');
  });

  test('PATCH con estado inválido → 400', async () => {
    const res = await idRoute.PATCH(jsonReq('PATCH', { stock_status: 'borrado' }), ctx('id-automatik-945'));
    assert.equal(res.status, 400);
    assert.equal(fake.db.writes.length, 0);
  });

  test('el listado del admin usa PATCH con { stock_status } solamente', () => {
    const page = readFileSync(new URL('src/app/admin/productos/page.tsx', ROOT), 'utf8');
    const fn = page.slice(page.indexOf('const handleToggleVisibility'), page.indexOf('const handleDuplicate'));
    assert.match(fn, /method:\s*'PATCH'/);
    assert.match(fn, /JSON\.stringify\(\{\s*stock_status:\s*newStatus\s*\}\)/);
    assert.doesNotMatch(fn, /images/);
  });
});

describe('API admin: creación y duplicación', () => {
  for (const slug of ['automatik-913', 'traxx-9045', 'trodat-4915', 'shiny-842']) {
    test(`duplicar ${slug} conserva sus imágenes`, async () => {
      // Igual que el cliente: datos del listado normalizado → POST
      const { products } = await (await listRoute.GET(new Request('http://x/api/admin/productos?action=list'))).json();
      const p = products.find(x => x.slug === slug);
      const res = await listRoute.POST(jsonReq('POST', {
        name: `${p.name} (copia)`, slug: `${p.slug}-copia-test`, price: p.price, regular_price: p.regular_price,
        description: p.description, short_description: p.short_description,
        images: p.images, categories: p.categories, tags: p.tags ?? [],
      }));
      assert.equal(res.status, 200);
      const body = await res.json();
      const created = fake.db.products.find(r => r.id === body.product.id);
      assert.equal(typeof created.images, 'string', 'se guarda como texto');
      assert.deepEqual(JSON.parse(created.images), original(slug).expected);
      assert.deepEqual(body.product.images, original(slug).expected);
      assert.equal(row(slug).images, original(slug).images, 'el original no cambia');
    });
  }

  test('POST sin images crea el producto con "[]"', async () => {
    const res = await listRoute.POST(jsonReq('POST', { name: 'Nuevo', slug: 'nuevo-x', price: 1000 }));
    assert.equal(res.status, 200);
    assert.equal(fake.db.products.at(-1).images, '[]');
  });

  test('POST con images inválido → 400 sin insertar', async () => {
    const n = fake.db.products.length;
    const res = await listRoute.POST(jsonReq('POST', { name: 'Nuevo', slug: 'nuevo-y', price: 1000, images: 'no es url' }));
    assert.equal(res.status, 400);
    assert.equal(fake.db.products.length, n);
    assert.equal(fake.db.writes.length, 0);
  });
});

describe('Compatibilidad con el catálogo público (productAdapter sin cambios)', () => {
  let log;
  before(() => { log = console.log; console.log = () => {}; });
  after(() => { console.log = log; });

  test('adapta los 22 valores reales igual que antes', () => {
    for (const r of seedRows()) {
      const srcs = adapter.adaptSupabaseProduct(r).images.map(i => i.src);
      const expected = original(r.slug).expected.map(u => assetUrl.resolveAssetUrl(u));
      if (r.slug === 'shiny-842') {
        // El adaptador público ya no resolvía bien este valor corrupto; se documenta y no se cambia.
        assert.ok(srcs.length >= 1);
        continue;
      }
      assert.deepEqual(srcs, expected, r.slug);
    }
  });

  test('lo que escribe el admin nuevo lo sigue leyendo el catálogo público', () => {
    const urls = original('trodat-4912').expected;
    const stored = lib.serializeImagesForDb(urls);
    const srcs = adapter.adaptSupabaseProduct({ ...seedRows()[0], images: stored }).images.map(i => i.src);
    assert.deepEqual(srcs, urls);
    const vacio = adapter.adaptSupabaseProduct({ ...seedRows()[0], images: '[]' }).images.map(i => i.src);
    assert.equal(vacio.length, 1, 'producto sin imágenes muestra el placeholder');
  });
});
