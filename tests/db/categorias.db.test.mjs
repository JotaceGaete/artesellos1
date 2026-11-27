// Prueba de la migración de categorías contra PostgreSQL real (réplica local).
// Requiere PG_TEST_URL (p. ej. postgresql://postgres@/postgres?host=/tmp/pgtest&port=55432).
// Sin esa variable, las pruebas se omiten.
import { test, describe, before } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const URL_ = process.env.PG_TEST_URL;
const root = fileURLToPath(new URL('../../', import.meta.url));
const MIG = root + 'supabase/migrations/20261128100000_categorias_dinamicas.sql';
const RB = root + 'supabase/rollback/20261128100000_categorias_dinamicas_rollback.sql';
const REPLICA = root + 'tests/db/categorias-replica.sql';

const psqlFile = f => execFileSync('psql', [URL_, '-v', 'ON_ERROR_STOP=1', '-q', '-f', f], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
const q = sql => execFileSync('psql', [URL_, '-v', 'ON_ERROR_STOP=1', '-qAt', '-c', sql], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
const fails = (sql, re) => {
  try { q(sql); } catch (e) { assert.match(String(e.stderr || e.message), re); return; }
  assert.fail(`debió fallar: ${sql}`);
};

describe('migración de categorías (PostgreSQL)', { skip: !URL_ && 'PG_TEST_URL no definido' }, () => {
  before(() => { psqlFile(REPLICA); psqlFile(MIG); });

  test('las 4 categorías en uso existen, activas y con el orden del sitio', () => {
    assert.equal(q(`select string_agg(slug||':'||name||':'||sort_order||':'||is_active, ',' order by sort_order) from categories where is_active`),
      'automaticos:Automáticos:10:true,bolsillo:De bolsillo:20:true,fechadores:Fechadores:30:true,redondos:Redondos:40:true');
  });
  test('las 7 antiguas quedan ocultas y no se borran', () => {
    assert.equal(q(`select count(*) from categories where not is_active`), '7');
    assert.equal(q(`select count(*) from categories`), '11');
  });
  test('los productos no cambian y los conteos coinciden', () => {
    assert.equal(q(`select count(*) from products`), '27');
    assert.equal(q(`select string_agg(c||'='||n, ',' order by c) from (select c, count(*) n from products, jsonb_array_elements_text(categories) c group by c) x`),
      'automaticos=19,bolsillo=3,fechadores=4,redondos=2');
  });
  test('la migración es idempotente', () => {
    psqlFile(MIG);
    assert.equal(q(`select count(*) from categories`), '11');
  });
  test('no se borra una categoría con productos', () => {
    fails(`delete from categories where slug='redondos'`, /tiene 2 producto/);
  });
  test('no se cambia el slug de una categoría con productos', () => {
    fails(`update categories set slug='redondo' where slug='redondos'`, /No se puede cambiar el slug/);
  });
  test('sí se cambia el nombre de una categoría con productos', () => {
    q(`update categories set name='Redondos' where slug='redondos'`);
  });
  test('subcategoría válida y protección de jerarquía', () => {
    q(`insert into categories (name, slug, parent_id) select 'Shiny', 'automaticos-shiny', id from categories where slug='automaticos'`);
    fails(`insert into categories (name, slug, parent_id) select 'Nieta', 'nieta', id from categories where slug='automaticos-shiny'`, /un nivel/);
    fails(`update categories set parent_id = id where slug='bolsillo'`, /propia categoría padre|categories_parent_not_self/);
    fails(`update categories set parent_id = (select id from categories where slug='bolsillo') where slug='automaticos'`, /con subcategorías no puede ser subcategoría/);
    fails(`delete from categories where slug='automaticos'`, /producto/);
  });
  test('no se borra una categoría con subcategorías aunque no tenga productos', () => {
    q(`insert into categories (name, slug) values ('Vacía','vacia')`);
    q(`insert into categories (name, slug, parent_id) select 'Hija','vacia-hija', id from categories where slug='vacia'`);
    fails(`delete from categories where slug='vacia'`, /subcategorías/);
    q(`delete from categories where slug='vacia-hija'`);
    q(`delete from categories where slug='vacia'`);
  });
  test('slug con formato inválido se rechaza', () => {
    fails(`insert into categories (name, slug) values ('X','Con Mayús')`, /categories_slug_format/);
  });
  test('rollback sin pérdida de datos posteriores y re-aplicación', () => {
    q(`insert into categories (name, slug, sort_order, is_active) values ('Nueva tras publicar','nueva-tras-publicar', 50, false)`);
    q(`update products set categories='["automaticos","automaticos-shiny"]' where slug='shiny-832'`);
    psqlFile(RB);
    // Datos intactos
    assert.equal(q(`select name||':'||sort_order||':'||is_active from categories where slug='nueva-tras-publicar'`), 'Nueva tras publicar:50:false');
    assert.equal(q(`select categories::text from products where slug='shiny-832'`), '["automaticos", "automaticos-shiny"]');
    assert.equal(q(`select count(*) from categories`), '13');
    // Lógica retirada
    assert.equal(q(`select count(*) from pg_trigger where tgname like 'categories_guard%'`), '0');
    // Volver a aplicar
    psqlFile(MIG);
    assert.equal(q(`select count(*) from pg_trigger where tgname like 'categories_guard%'`), '2');
    assert.equal(q(`select count(*) from categories`), '13');
    fails(`delete from categories where slug='automaticos-shiny'`, /producto/);
  });
});
