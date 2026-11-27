// Categorías dinámicas (Fase 1): lógica pura y rutas de API contra un Supabase falso.
import { test, before, beforeEach, describe } from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const ROOT = new URL('../', import.meta.url);
const OUT = '/tmp/artesellos-cat-' + process.pid;
const ALIASES = {
  'next/server': './mock-next-server.mjs',
  '@/lib/supabaseServer': './mock-supabaseServer.mjs',
  '@/lib/adminSession': './mock-adminSession.mjs',
  '@/lib/catalogCategories': './catalogCategories.mjs',
  '@/lib/categories': './categories.mjs',
  '@/lib/categoriesServer': './categoriesServer.mjs',
  '@/lib/productImages': './productImages.mjs',
};
function transpile(rel, out) {
  let js = ts.transpileModule(readFileSync(new URL(rel, ROOT), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  for (const [a, b] of Object.entries(ALIASES)) js = js.split(`'${a}'`).join(`'${b}'`).split(`"${a}"`).join(`"${b}"`);
  assert.equal(js.match(/from\s+['"]@\/[^'"]+['"]/), null, `import sin resolver en ${rel}`);
  writeFileSync(`${OUT}/${out}`, js);
}

// ── Supabase falso con errores de base simulados ───────────────────────────────
function createFake({ categories = [], products = [], migrated = true } = {}) {
  const db = { categories: structuredClone(categories), products: structuredClone(products), writes: [] };
  let seq = 1;
  class Q {
    constructor(t) { this.t = t; this.f = []; this.op = 'select'; this.cols = '*'; this.one = false; }
    select(c = '*') { this.cols = c; return this; }
    eq(c, v) { this.f.push(r => r[c] === v); return this; }
    neq(c, v) { this.f.push(r => r[c] !== v); return this; }
    order() { return this; } limit() { return this; } range() { return this; }
    single() { this.one = true; return this; } maybeSingle() { this.one = true; this.maybe = true; return this; }
    insert(rows) { this.op = 'insert'; this.p = rows; return this; }
    update(o) { this.op = 'update'; this.p = o; return this; }
    delete() { this.op = 'delete'; return this; }
    run() {
      if (this.t === 'categories' && !migrated && /sort_order|is_active/.test(this.cols + JSON.stringify(this.p ?? {}))) {
        return { data: null, error: { code: '42703', message: 'column categories.sort_order does not exist' } };
      }
      const table = db[this.t] ?? (db[this.t] = []);
      let rows;
      if (this.op === 'insert') {
        for (const r of this.p) if (this.t === 'categories' && table.some(x => x.slug === r.slug)) return { data: null, error: { code: '23505', message: 'duplicate key' } };
        rows = this.p.map(r => ({ id: `new-${seq++}`, ...structuredClone(r) }));
        table.push(...rows);
        db.writes.push({ t: this.t, op: 'insert', p: structuredClone(this.p) });
      } else {
        rows = table.filter(r => this.f.every(f => f(r)));
        if (this.op === 'update') { rows.forEach(r => Object.assign(r, structuredClone(this.p))); db.writes.push({ t: this.t, op: 'update', p: structuredClone(this.p) }); }
        if (this.op === 'delete') { db[this.t] = table.filter(r => !rows.includes(r)); db.writes.push({ t: this.t, op: 'delete' }); }
      }
      if (this.cols !== '*') {
        const keys = this.cols.split(',').map(s => s.trim());
        rows = rows.map(r => Object.fromEntries(keys.map(k => [k, r[k]])));
      } else rows = rows.map(r => ({ ...r }));
      if (this.one) return rows.length ? { data: rows[0], error: null } : { data: null, error: this.maybe ? null : { message: 'No rows' } };
      return { data: rows, error: null };
    }
    then(res, rej) { try { res(this.run()); } catch (e) { rej(e); } }
  }
  return { db, client: { from: t => new Q(t) } };
}

const CATS = [
  { id: 'c-auto', name: 'Automáticos', slug: 'automaticos', description: null, parent_id: null, sort_order: 10, is_active: true },
  { id: 'c-bol', name: 'De bolsillo', slug: 'bolsillo', description: null, parent_id: null, sort_order: 20, is_active: true },
  { id: 'c-fech', name: 'Fechadores', slug: 'fechadores', description: null, parent_id: null, sort_order: 30, is_active: true },
  { id: 'c-red', name: 'Redondos', slug: 'redondos', description: null, parent_id: null, sort_order: 40, is_active: true },
  { id: 'c-bodas', name: 'Bodas', slug: 'bodas', description: 'antigua', parent_id: null, sort_order: 0, is_active: false },
];
const PRODS = [
  { id: 'p1', slug: 'shiny-832', categories: ['automaticos'] },
  { id: 'p2', slug: 'foliador-f-65', categories: ['automaticos', 'fechadores'] },
  { id: 'p3', slug: 'traxx-9045', categories: ['redondos'] },
];

let lib, server, adminList, adminId, pub, fake;
before(async () => {
  mkdirSync(OUT, { recursive: true });
  writeFileSync(`${OUT}/mock-next-server.mjs`, `export class NextResponse { static json(b, i = {}) { return new Response(JSON.stringify(b), { status: i.status ?? 200, headers: { 'content-type': 'application/json', ...(i.headers || {}) } }); } } export const NextRequest = Request;`);
  writeFileSync(`${OUT}/mock-supabaseServer.mjs`, `export function createSupabaseAdmin() { return globalThis.__fake; }`);
  writeFileSync(`${OUT}/mock-adminSession.mjs`, `export async function requireAdminSession() { return globalThis.__denyAdmin ? new Response('{}', { status: 401 }) : null; }`);
  transpile('src/lib/catalogCategories.ts', 'catalogCategories.mjs');
  transpile('src/lib/categories.ts', 'categories.mjs');
  transpile('src/lib/categoriesServer.ts', 'categoriesServer.mjs');
  transpile('src/app/api/admin/categorias/route.ts', 'admin-list.mjs');
  transpile('src/app/api/admin/categorias/[id]/route.ts', 'admin-id.mjs');
  transpile('src/app/api/categorias/route.ts', 'public.mjs');
  const imp = f => import(pathToFileURL(`${OUT}/${f}`).href);
  [lib, server, adminList, adminId, pub] = await Promise.all(['categories.mjs', 'categoriesServer.mjs', 'admin-list.mjs', 'admin-id.mjs', 'public.mjs'].map(imp));
});
beforeEach(() => { fake = createFake({ categories: CATS, products: PRODS }); globalThis.__fake = fake.client; globalThis.__denyAdmin = false; });

const req = (method, body) => new Request('http://x/api', { method, headers: { 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
const ctx = id => ({ params: Promise.resolve({ id }) });
const cat = slug => fake.db.categories.find(c => c.slug === slug);

// ── Lógica pura ───────────────────────────────────────────────────────────────
describe('lógica de categorías', () => {
  test('árbol de un nivel ordenado y huérfanas a la raíz', () => {
    const list = [...CATS, { id: 'c-s', name: 'Shiny', slug: 'automaticos-shiny', parent_id: 'c-auto', sort_order: 10, is_active: true },
      { id: 'c-o', name: 'Huérfana', slug: 'huerfana', parent_id: 'no-existe', sort_order: 5, is_active: true }];
    const tree = lib.buildCategoryTree(list);
    assert.deepEqual(tree.map(t => t.slug), ['bodas', 'huerfana', 'automaticos', 'bolsillo', 'fechadores', 'redondos']);
    assert.deepEqual(tree.find(t => t.slug === 'automaticos').children.map(c => c.slug), ['automaticos-shiny']);
  });
  test('visibles: activas y con padre activo', () => {
    const list = [...CATS, { id: 'c-h', name: 'Hija de oculta', slug: 'hija', parent_id: 'c-bodas', sort_order: 0, is_active: true }];
    assert.deepEqual(lib.visibleCategories(list).map(c => c.slug).sort(), ['automaticos', 'bolsillo', 'fechadores', 'redondos']);
  });
  test('filtrar por la principal incluye sus subcategorías', () => {
    const list = [...CATS, { id: 'c-s', name: 'Shiny', slug: 'automaticos-shiny', parent_id: 'c-auto', sort_order: 0, is_active: true }];
    const set = lib.expandCategorySlugs(list, ['automaticos']);
    assert.deepEqual([...set].sort(), ['automaticos', 'automaticos-shiny']);
    assert.equal(lib.productMatchesCategories(['automaticos-shiny'], set), true);
    assert.equal(lib.productMatchesCategories(['redondos'], set), false);
    assert.equal(lib.productMatchesCategories(['Automáticos'], set), true, 'tolera mayúsculas y tildes');
  });
  test('validación: nombre, slug, duplicados y slug en uso', () => {
    assert.equal(lib.validateCategoryInput({ name: '  ' }, { all: CATS }).ok, false);
    assert.equal(lib.validateCategoryInput({ name: 'X', slug: 'Con Mayús' }, { all: CATS }).ok, false);
    assert.equal(lib.validateCategoryInput({ name: 'Otra', slug: 'redondos' }, { all: CATS }).ok, false);
    const ok = lib.validateCategoryInput({ name: 'Timbres de Madera' }, { all: CATS });
    assert.deepEqual(ok, { ok: true, value: { name: 'Timbres de Madera', slug: 'timbres-de-madera' } });
    const red = CATS.find(c => c.slug === 'redondos');
    assert.match(lib.validateCategoryInput({ slug: 'redondo' }, { all: CATS, current: red, productCount: 1 }).error, /No se puede cambiar el slug/);
    assert.equal(lib.validateCategoryInput({ name: 'Circulares' }, { all: CATS, current: red, productCount: 1 }).ok, true);
  });
  test('ciclos y profundidad: un solo nivel', () => {
    const all = [...CATS, { id: 'c-s', name: 'Shiny', slug: 'automaticos-shiny', parent_id: 'c-auto', sort_order: 0, is_active: true }];
    const auto = all.find(c => c.id === 'c-auto');
    const shiny = all.find(c => c.id === 'c-s');
    assert.match(lib.validateCategoryInput({ parent_id: 'c-auto' }, { all, current: auto }).error, /propia/);
    assert.match(lib.validateCategoryInput({ parent_id: 'c-s' }, { all, current: CATS[1] }).error, /un nivel/);
    assert.match(lib.validateCategoryInput({ parent_id: 'c-bol' }, { all, current: auto }).error, /con subcategorías/);
    assert.match(lib.validateCategoryInput({ parent_id: 'nada' }, { all, current: shiny }).error, /no existe/);
    assert.equal(lib.validateCategoryInput({ parent_id: null }, { all, current: shiny }).ok, true);
  });
  test('motivo de bloqueo al borrar', () => {
    assert.match(lib.deleteBlockReason(CATS[0], CATS, 2), /2 producto/);
    const all = [...CATS, { id: 'c-s', parent_id: 'c-auto', slug: 's', name: 's', sort_order: 0, is_active: true }];
    assert.match(lib.deleteBlockReason(CATS[0], all, 0), /subcategorías/);
    assert.equal(lib.deleteBlockReason(CATS[4], CATS, 0), null);
  });
  test('mover entre hermanas renumera de 10 en 10', () => {
    assert.deepEqual(lib.moveCategory(CATS, 'c-fech', -1).map(x => `${x.id}:${x.sort_order}`), ['c-bodas:10', 'c-auto:20', 'c-fech:30', 'c-bol:40', 'c-red:50']);
    assert.deepEqual(lib.moveCategory(CATS, 'c-red', 1), [], 'la última no baja');
  });
  test('conteo por slug', () => {
    const m = lib.countProductsBySlug(PRODS);
    assert.equal(m.get('automaticos'), 2); assert.equal(m.get('fechadores'), 1); assert.equal(m.get('redondos'), 1);
  });
  test('respaldo: las 4 categorías del código', () => {
    assert.deepEqual(lib.FALLBACK_CATEGORIES.map(c => `${c.slug}:${c.name}`), ['automaticos:Automáticos', 'bolsillo:De bolsillo', 'fechadores:Fechadores', 'redondos:Redondos']);
  });
});

// ── API pública ───────────────────────────────────────────────────────────────
describe('GET /api/categorias', () => {
  test('solo visibles, con caché corta', async () => {
    const res = await pub.GET();
    const body = await res.json();
    assert.deepEqual(body.categories.map(c => c.slug), ['automaticos', 'bolsillo', 'fechadores', 'redondos']);
    assert.equal(body.source, 'db');
    assert.match(res.headers.get('cache-control'), /s-maxage=60/);
  });
  test('sin la migración aplicada responde con el respaldo del código', async () => {
    fake = createFake({ categories: CATS, products: PRODS, migrated: false }); globalThis.__fake = fake.client;
    const body = await (await pub.GET()).json();
    assert.equal(body.source, 'fallback');
    assert.deepEqual(body.categories.map(c => c.slug), ['automaticos', 'bolsillo', 'fechadores', 'redondos']);
  });
});

// ── API admin ─────────────────────────────────────────────────────────────────
describe('API admin de categorías', () => {
  test('requiere sesión', async () => {
    globalThis.__denyAdmin = true;
    assert.equal((await adminList.GET(req('GET'))).status, 401);
    assert.equal((await adminList.POST(req('POST', { name: 'X' }))).status, 401);
    assert.equal((await adminId.DELETE(req('DELETE'), ctx('c-bodas'))).status, 401);
  });
  test('GET incluye ocultas y conteos', async () => {
    const body = await (await adminList.GET(req('GET'))).json();
    const by = Object.fromEntries(body.categories.map(c => [c.slug, c]));
    assert.equal(by.automaticos.product_count, 2);
    assert.equal(by.bodas.is_active, false);
    assert.equal(by.bodas.product_count, 0);
  });
  test('crear categoría y subcategoría', async () => {
    let res = await adminList.POST(req('POST', { name: 'Timbres de Madera' }));
    assert.equal(res.status, 201);
    assert.equal(cat('timbres-de-madera').sort_order, 50, 'se agrega al final de sus hermanas');
    res = await adminList.POST(req('POST', { name: 'Shiny', slug: 'automaticos-shiny', parent_id: 'c-auto' }));
    assert.equal(res.status, 201);
    assert.equal(cat('automaticos-shiny').parent_id, 'c-auto');
  });
  test('crear rechaza slug duplicado y nieta', async () => {
    assert.equal((await adminList.POST(req('POST', { name: 'X', slug: 'redondos' }))).status, 400);
    await adminList.POST(req('POST', { name: 'Shiny', slug: 'automaticos-shiny', parent_id: 'c-auto' }));
    const sub = cat('automaticos-shiny');
    const res = await adminList.POST(req('POST', { name: 'Nieta', parent_id: sub.id }));
    assert.equal(res.status, 400);
    assert.match((await res.json()).message, /un nivel/);
  });
  test('editar nombre de categoría con productos sí; slug no', async () => {
    assert.equal((await adminId.PUT(req('PUT', { name: 'Redondos grandes' }), ctx('c-red'))).status, 200);
    assert.equal(cat('redondos').name, 'Redondos grandes');
    const res = await adminId.PUT(req('PUT', { slug: 'redondo' }), ctx('c-red'));
    assert.equal(res.status, 400);
    assert.equal(cat('redondos').slug, 'redondos');
  });
  test('ocultar y mostrar', async () => {
    await adminId.PUT(req('PUT', { is_active: false }), ctx('c-red'));
    assert.equal(cat('redondos').is_active, false);
    const pubBody = await (await pub.GET()).json();
    assert.ok(!pubBody.categories.some(c => c.slug === 'redondos'), 'desaparece del catálogo');
    await adminId.PUT(req('PUT', { is_active: true }), ctx('c-red'));
    assert.equal(cat('redondos').is_active, true);
    assert.equal((await adminId.PUT(req('PUT', { is_active: 'no' }), ctx('c-red'))).status, 400);
  });
  test('reordenar', async () => {
    const items = lib.moveCategory(fake.db.categories, 'c-red', -1);
    assert.equal((await adminList.PATCH(req('PATCH', { items }))).status, 200);
    assert.ok(cat('redondos').sort_order < cat('fechadores').sort_order);
    assert.equal((await adminList.PATCH(req('PATCH', { items: [{ id: 'nada', sort_order: 1 }] }))).status, 400);
    assert.equal((await adminList.PATCH(req('PATCH', { items: [{ id: 'c-red', sort_order: 'x' }] }))).status, 400);
  });
  test('no se elimina una categoría con productos', async () => {
    const res = await adminId.DELETE(req('DELETE'), ctx('c-auto'));
    assert.equal(res.status, 409);
    assert.match((await res.json()).message, /2 producto/);
    assert.ok(cat('automaticos'));
    assert.equal(fake.db.writes.filter(w => w.op === 'delete').length, 0);
  });
  test('no se elimina una categoría con subcategorías', async () => {
    await adminList.POST(req('POST', { name: 'Hija', slug: 'bodas-hija', parent_id: 'c-bodas' }));
    assert.equal((await adminId.DELETE(req('DELETE'), ctx('c-bodas'))).status, 409);
  });
  test('se elimina una categoría sin productos ni subcategorías', async () => {
    assert.equal((await adminId.DELETE(req('DELETE'), ctx('c-bodas'))).status, 200);
    assert.equal(cat('bodas'), undefined);
  });
  test('sin la migración aplicada, el admin queda en solo lectura (503)', async () => {
    fake = createFake({ categories: CATS, products: PRODS, migrated: false }); globalThis.__fake = fake.client;
    assert.equal((await adminList.GET(req('GET'))).status, 200);
    assert.equal((await adminList.POST(req('POST', { name: 'X' }))).status, 503);
    assert.equal((await adminId.PUT(req('PUT', { name: 'X' }), ctx('fallback-redondos'))).status, 503);
    assert.equal((await adminId.DELETE(req('DELETE'), ctx('fallback-redondos'))).status, 503);
    assert.equal(fake.db.writes.length, 0);
  });
  test('la API traduce el rechazo de la base (trigger) en 409', async () => {
    const f = server.friendlyDbError({ code: '23503', message: 'La categoría "x" tiene 1 producto(s) asociado(s)' });
    assert.deepEqual(f, { status: 409, message: 'La categoría "x" tiene 1 producto(s) asociado(s)' });
  });
});

describe('integración en el código', () => {
  const read = p => readFileSync(new URL(p, ROOT), 'utf8');
  test('ninguna página usa la lista fija de categorías', () => {
    for (const p of ['src/app/productos/page.tsx', 'src/app/admin/productos/page.tsx', 'src/app/admin/productos/[id]/page.tsx', 'src/app/admin/productos/nuevo/page.tsx']) {
      assert.doesNotMatch(read(p), /CATALOG_CATEGORIES/, p);
    }
  });
  test('las API de productos validan los slugs de categoría', () => {
    for (const p of ['src/app/api/admin/productos/route.ts', 'src/app/api/admin/productos/[id]/route.ts', 'src/app/api/admin/productos/categorias/route.ts']) {
      assert.match(read(p), /unknownCategorySlugs/, p);
    }
  });
  test('el menú del admin enlaza Categorías', () => {
    assert.match(read('src/components/admin/AdminSidebar.tsx'), /\/admin\/categorias/);
  });
});
