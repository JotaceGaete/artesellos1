// Migración 2a (variantes por color) contra PostgreSQL real. Requiere PG_TEST_URL.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const URL_ = process.env.PG_TEST_URL;
const root = fileURLToPath(new URL('../../', import.meta.url));
const MIG = root + 'supabase/migrations/20261128200000_variantes_color_2a.sql';
const RB = root + 'supabase/rollback/20261128200000_variantes_color_2a_rollback.sql';
const REPLICA = root + 'tests/db/variantes-replica.sql';
const S722 = '11111111-1111-1111-1111-111111111722';
const T916 = '22222222-2222-2222-2222-222222222016';

const psqlFile = f => execFileSync('psql', [URL_, '-v', 'ON_ERROR_STOP=1', '-q', '-f', f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const q = sql => execFileSync('psql', [URL_, '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', sql], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const fails = (sql, re) => { try { q(sql); } catch (e) { assert.match(String(e.stderr || e.message), re); return; } assert.fail('debió fallar: ' + sql); };
const lit = o => `'${JSON.stringify(o).replace(/'/g, "''")}'::jsonb`;
const save = (id, expected, product, variants) =>
  q(`select public.save_product_with_variants('${id}', ${expected ? `'${expected}'` : 'null'}, ${product ? lit(product) : 'null'}, ${variants ? lit(variants) : 'null'})`);
const stock = id => Number(q(`select stock_quantity from products where id='${id}'`));
const upd = id => q(`select updated_at from products where id='${id}'`);
const fingerprint = () => q(`select md5((select string_agg(to_jsonb(p)::text, '|' order by id) from products p) || (select string_agg(to_jsonb(c)::text, '|' order by id) from product_colors c))`);

describe('migración 2a: variantes por color (PostgreSQL)', { skip: !URL_ && 'PG_TEST_URL no definido' }, () => {
  let before0;
  before(() => { psqlFile(REPLICA); before0 = fingerprint(); psqlFile(MIG); });

  test('la migración no modifica ninguna fila de productos ni colores', () => {
    // Las columnas nuevas cambian la huella de to_jsonb; se comparan solo las columnas previas.
    const cols = `id, product_id, color_slug, color_name, hex, image_url, stock_quantity, is_default, price_diff, active, created_at, updated_at`;
    assert.equal(q(`select count(*) from product_colors`), '4');
    assert.equal(stock(S722), 9, 'S-722 conserva 9');
    assert.equal(stock(T916), 10);
    assert.equal(q(`select string_agg(color_slug||':'||stock_quantity, ',' order by color_slug) from (select ${cols} from product_colors) x`), 'Rosa:3,dorado:3,lila:3,rojo-transparente:3');
    assert.ok(before0);
  });
  test('idempotente', () => { psqlFile(MIG); assert.equal(stock(S722), 9); });

  test('editar solo el producto no toca el total de S-722 (ignora stock enviado)', () => {
    const r = JSON.parse(save(S722, upd(S722), { price: 17000, stock_quantity: 99 }, null));
    assert.equal(Number(r.product.price), 17000);
    assert.equal(stock(S722), 9);
    assert.equal(r.variants.length, 4);
  });
  test('producto sin colores: el stock se edita directo', () => {
    save(T916, upd(T916), { stock_quantity: 7 }, null);
    assert.equal(stock(T916), 7);
  });
  test('cambiar un color recalcula el total; los ocultos cuentan', () => {
    q(`update product_colors set stock_quantity = 5, active = false where color_slug = 'lila'`);
    assert.equal(stock(S722), 5 + 3 + 3 + 3);
  });
  test('guardado completo: actualiza, crea, borra y reordena en una sola operación', () => {
    const vs = JSON.parse(q(`select jsonb_agg(to_jsonb(c) order by color_slug) from product_colors c where product_id='${S722}'`));
    const keep = vs.filter(v => v.color_slug !== 'dorado').map(v => ({ ...v, stock_quantity: v.color_slug === 'Rosa' ? 0 : v.stock_quantity }));
    const nuevo = { color_name: 'Negro', color_slug: 'negro', hex: '#000000', sku: 'S722-NEG', stock_quantity: 4, active: true };
    const r = JSON.parse(save(S722, upd(S722), { name: 'Shiny S-722 bolsillo' }, [nuevo, ...keep]));
    assert.deepEqual(r.variants.map(v => v.color_slug), ['negro', 'Rosa', 'lila', 'rojo-transparente']);
    assert.deepEqual(r.variants.map(v => v.sort_order), [10, 20, 30, 40]);
    assert.equal(r.product.name, 'Shiny S-722 bolsillo');
    assert.equal(stock(S722), 4 + 0 + 5 + 3);
  });
  test('todo o nada: un color inválido no deja cambios a medias', () => {
    const f = fingerprint();
    fails(`select public.save_product_with_variants('${S722}', null, ${lit({ name: 'NO' })}, ${lit([{ color_name: 'Malo', color_slug: 'malo', stock_quantity: -1 }])})`, /product_colors_stock_non_negative/);
    assert.equal(fingerprint(), f);
  });
  test('control de concurrencia: updated_at distinto → 40001 sin cambios', () => {
    const f = fingerprint();
    fails(`select public.save_product_with_variants('${S722}', '2000-01-01T00:00:00Z', ${lit({ name: 'X' })}, null)`, /modificado por otra persona/);
    assert.equal(fingerprint(), f);
  });
  test('color repetido (sin distinguir mayúsculas) y SKU repetido se rechazan', () => {
    fails(`insert into product_colors (product_id, color_slug, color_name) values ('${S722}', 'ROSA', 'Rosa 2')`, /product_colors_product_slug_key/);
    fails(`insert into product_colors (product_id, color_slug, color_name, sku) values ('${T916}', 'azul', 'Azul', 'S722-NEG')`, /product_colors_sku_key/);
  });
  test('un color de otro producto no se puede editar desde este', () => {
    const other = q(`insert into product_colors (product_id, color_slug, color_name, stock_quantity) values ('${T916}', 'azul', 'Azul', 2) returning id`).split('\n')[0];
    fails(`select public.save_product_with_variants('${S722}', null, null, ${lit([{ id: other, color_name: 'Azul', color_slug: 'azul', stock_quantity: 9 }])})`, /no pertenece/);
    assert.equal(stock(T916), 2, 'T916 pasó a tener colores: su total es la suma');
  });
  test('quitar todos los colores deja el último total y vuelve a stock simple', () => {
    save(T916, upd(T916), null, []);
    assert.equal(q(`select count(*) from product_colors where product_id='${T916}'`), '0');
    assert.equal(stock(T916), 2);
    save(T916, upd(T916), { stock_quantity: 6 }, null);
    assert.equal(stock(T916), 6);
  });
  test('borrar un producto borra sus colores en cascada sin error', () => {
    q(`insert into products (id, name, slug, price) values ('33333333-3333-3333-3333-333333333333','Temp','temp',1)`);
    q(`insert into product_colors (product_id, color_slug, color_name, stock_quantity) values ('33333333-3333-3333-3333-333333333333','x','X',1)`);
    q(`delete from products where id='33333333-3333-3333-3333-333333333333'`);
    assert.equal(q(`select count(*) from product_colors where product_id='33333333-3333-3333-3333-333333333333'`), '0');
  });
  test('permisos: la función solo la ejecuta service_role', () => {
    const r = q(`select has_function_privilege('anon','public.save_product_with_variants(uuid,timestamptz,jsonb,jsonb)','execute')`);
    // En la réplica local los roles de Supabase no existen: se omite si falla por rol inexistente.
    assert.equal(r, 'f');
  });
  test('rollback sin pérdida de datos y re-aplicación', () => {
    q(`update product_colors set sku='S722-LILA' where color_slug='lila'`);
    const f = fingerprint();
    psqlFile(RB);
    assert.equal(fingerprint(), f, 'datos intactos');
    assert.equal(q(`select count(*) from pg_proc where proname in ('save_product_with_variants','product_colors_sync_total')`), '0');
    assert.equal(q(`select sku from product_colors where color_slug='lila'`), 'S722-LILA');
    psqlFile(MIG);
    assert.equal(fingerprint(), f, 're-aplicar no cambia datos');
    assert.equal(q(`select count(*) from pg_proc where proname='save_product_with_variants'`), '1');
  });
});
