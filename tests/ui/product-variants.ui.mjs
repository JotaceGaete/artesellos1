// Prueba visual del editor de colores (Playwright, API simulada). Requiere `next start -p 3100` y ADMIN_SESSION_SECRET.
import { createRequire } from 'node:module'; const { chromium } = createRequire(import.meta.url)('playwright');
import { webcrypto as crypto } from 'node:crypto';
const BASE = 'http://localhost:3100';
const SECRET = process.env.ADMIN_SESSION_SECRET;
async function token() {
  const now = Date.now(); const payload = JSON.stringify({ iat: now, exp: now + 3600e3 });
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return `${btoa(payload)}.${btoa(String.fromCharCode(...new Uint8Array(sig)))}`;
}
const mk = (id, name, slug, hex) => ({ id, product_id: 'p722', color_name: name, color_slug: slug, hex, image_url: null, sku: null, stock_quantity: 3, active: true, sort_order: 0 });
let product = {
  id: 'p722', name: 'Shiny S-722', slug: 'shiny-s-722', price: 15000, regular_price: 15000,
  short_description: 'x', description: 'y', categories: ['automaticos'], tags: [],
  images: ['https://media.artesellos.cl/722-a.jpg', 'https://media.artesellos.cl/722-b.jpg'],
  featured: false, stock_status: 'instock', stock_quantity: 9, updated_at: '2026-11-27T10:00:00.123+00:00',
  variants: [mk('00000000-0000-0000-0000-000000000001','Lila','lila','#c8a2c8'), mk('00000000-0000-0000-0000-000000000002','Dorado','dorado','#d4af37'), mk('00000000-0000-0000-0000-000000000003','Rosa','Rosa',null), mk('00000000-0000-0000-0000-000000000004','Rojo transparente','rojo-transparente',null)],
};
const results = []; const check = (n, c, extra='') => results.push(`${c ? 'OK ' : 'FAIL'} ${n}${extra ? ' — ' + extra : ''}`);
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1300, height: 900 } });
await ctx.addCookies([{ name: 'admin_session', value: await token(), url: BASE }]);
const page = await ctx.newPage();
const bodies = []; let mode = 'ok';
await page.route('**/api/admin/productos/p722', async r => {
  const req = r.request();
  if (req.method() === 'GET') return r.fulfill({ json: product });
  if (req.method() === 'PUT') {
    const body = JSON.parse(req.postData()); bodies.push(body);
    if (mode === 'conflict') return r.fulfill({ status: 409, json: { error: 'El producto fue modificado por otra persona. Recarga para ver los cambios.', conflict: true } });
    let variants = product.variants;
    if (body.variants) variants = body.variants.map((v, i) => ({ id: v.id ?? `00000000-0000-0000-0000-00000000010${i}`, product_id: 'p722', ...v, sort_order: i * 10 }));
    const stock = variants.length ? (body.variants ? variants.reduce((a, v) => a + v.stock_quantity, 0) : product.stock_quantity) : body.stock_quantity;
    const { variants: _v, expected_updated_at, ...rest } = body;
    product = { ...product, ...rest, stock_quantity: stock, variants, updated_at: '2026-11-27T10:05:00.456+00:00' };
    return r.fulfill({ json: { success: true, product: { ...product, variants: undefined }, variants } });
  }
  return r.continue();
});
await page.route('**/api/admin/me', r => r.fulfill({ json: { ok: true } }));
await page.route('**/api/categorias**', r => r.fulfill({ json: { categories: [{ id: 'c', name: 'Automáticos', slug: 'automaticos', parent_id: null, sort_order: 10, is_active: true }] } }));
await page.route(/media\.artesellos\.cl/, r => r.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64') }));
page.on('dialog', d => d.accept());
await page.goto(`${BASE}/admin/productos/p722`, { waitUntil: 'networkidle' });
const btn = page.locator('button[type=submit]');
const clean = async () => ['Sin cambios', '✓ Guardado'].includes((await btn.textContent()).trim()) && await btn.isDisabled(); await btn.waitFor(); await page.waitForTimeout(400);
const rows = page.getByTestId('variant-row');
check('carga los 4 colores', await rows.count() === 4);
check('sin cambios al abrir', (await btn.textContent()).trim() === 'Sin cambios');
check('total mostrado 12', /Stock total: 12/.test(await page.getByTestId('variants-total').textContent()));
check('aviso 9 vs 12', /guardado del producto es 9.*suma de los colores es 12/.test(await page.getByTestId('variants-mismatch').textContent()));
const stockInput = page.locator('input[aria-readonly="true"]');
check('stock general de solo lectura', await stockInput.count() === 1 && (await stockInput.inputValue()) === '9');
await page.screenshot({ path: '/tmp/variants-open.png', fullPage: true });

// Guardar solo el producto: no envía colores
await page.locator('input[value="Shiny S-722"]').fill('Shiny S-722 b');
await btn.click(); await page.waitForTimeout(600);
check('guardar solo el producto no envía variants', bodies.length === 1 && !('variants' in bodies[0]));
check('envía expected_updated_at', bodies[0].expected_updated_at === '2026-11-27T10:00:00.123+00:00');
check('stock se mantiene 9', (await stockInput.inputValue()) === '9');

// Cambiar stock de un color
const firstStock = rows.nth(0).locator('input[aria-label="Stock del color"]');
await firstStock.fill('5');
check('cambiar stock de color activa guardar', (await btn.textContent()).trim() === 'Guardar cambios');
check('aviso de nuevo total 9→14', /pasará de 9 a 14/.test(await page.getByTestId('variants-new-total').textContent()));
await firstStock.fill('3');
check('restaurar vuelve a sin cambios', await clean(), (await btn.textContent()).trim() + ' val=' + await firstStock.inputValue());
await page.screenshot({ path: '/tmp/variants-dbg.png', fullPage: true });

// Ocultar uno, reordenar, agregar uno y guardar
await rows.nth(1).getByRole('button', { name: 'Visible' }).click();
await rows.nth(2).getByRole('button', { name: /Subir/ }).click();
await page.getByRole('button', { name: '+ Agregar color' }).click();
const nr = rows.nth(4);
await nr.locator('input[aria-label="Nombre del color"]').fill('Azul Marino');
await nr.locator('input[aria-label="Código de color"]').fill('#1f2a44');
await nr.locator('input[aria-label="Stock del color"]').fill('2');
await nr.locator('select[aria-label="Foto del color"]').selectOption({ index: 2 });
check('total incluye ocultos (14)', /Stock total: 14.*incluye 3 en colores ocultos/.test(await page.getByTestId('variants-total').textContent()));
await btn.click(); await page.waitForTimeout(700);
const vb = bodies.at(-1).variants;
check('envía la lista completa de 5 colores', Array.isArray(vb) && vb.length === 5);
check('orden: Lila, Rosa, Dorado, Rojo, Azul', vb && vb.map(v => v.color_slug).join(',') === 'lila,Rosa,dorado,rojo-transparente,azul-marino');
check('Dorado oculto', vb && vb.find(v => v.color_slug === 'dorado').active === false);
check('nuevo sin id, foto de galería, stock numérico', vb && !vb[4].id && vb[4].image_url === 'https://media.artesellos.cl/722-b.jpg' && vb[4].stock_quantity === 2);
check('tras guardar: sin cambios y total 14', await clean() && (await stockInput.inputValue()) === '14');
check('sin aviso de diferencia', await page.getByTestId('variants-mismatch').count() === 0);

// Validación del lado del cliente pasa al servidor; conflicto conserva cambios
mode = 'conflict';
await rows.nth(0).locator('input[aria-label="Stock del color"]').fill('7');
await btn.click(); await page.waitForTimeout(700);
check('conflicto: muestra mensaje', await page.getByText('modificado por otra persona').count() > 0);
check('conflicto: conserva el cambio', (await rows.nth(0).locator('input[aria-label="Stock del color"]').inputValue()) === '7' && (await btn.textContent()).trim() === 'Guardar cambios');
mode = 'ok';

// Quitar todos los colores -> stock editable
for (let i = 4; i >= 0; i--) await rows.nth(i).getByRole('button', { name: /Quitar/ }).click();
check('sin colores: stock editable', await page.locator('input[aria-readonly="true"]').count() === 0);
await page.screenshot({ path: '/tmp/variants-empty.png', fullPage: true });
console.log(results.join('\n'));
await b.close();
