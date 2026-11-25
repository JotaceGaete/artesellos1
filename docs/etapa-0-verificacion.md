# Etapa 0: verificación de seguridad

## 1. PUT y DELETE de /api/admin/productos/[id]
Ambos exigen sesión administrativa (`requireAdminSession`). DELETE no la tenía en la versión anterior; se corrigió.
Además el middleware bloquea `/api/admin/*` sin cookie válida (defensa en profundidad).
Pruebas: `tests/admin-auth.smoke.mjs` (sin sesión → 401; cookie falsificada → 401; sesión válida → supera la autenticación).

## 2. Funcionalidades del administrador
Se comparó el conjunto de endpoints que usa la interfaz admin en cada rama. La rama integrada conserva todos:
productos (listar, crear, editar, eliminar), colores, precios (regular y oferta), categorías, stock, slider, banner superior y base de conocimiento.
La carga de imágenes apuntaba a un bucket inexistente (`images`); se cambió al bucket existente `product-images` mediante `/api/admin/upload-image`, y se eliminó el endpoint legado.
Verificación estática y de build; no se probó edición real contra la base de datos (no se modifican datos durante la etapa).

## 3. insumos-foundation
Se integró porque la instrucción fue unificar todas las ramas. Es un módulo independiente con sus propias variables (`INSUMOS_*`) y su propia base de datos.
Riesgo detectado: su migración crea tablas y disparadores con los mismos nombres que Artesellos (`products`, `categories`, `orders`, `profiles`), además de un trigger sobre `auth.users`. Si se ejecutara contra la base de Artesellos, alteraría datos y RLS.
Medida: la migración se movió fuera de `supabase/migrations/` a `insumos/supabase/migrations/`, para que ningún flujo de Supabase la aplique a Artesellos. No se ejecutó.
Sus rutas `/api/insumos/admin/*` exigen un usuario de Supabase con rol; sin esa configuración fallan cerradas.
Recomendación: si no se usará ahora, excluir ese merge antes de publicar (`git revert -m 1 <merge>`).

## 4. Límite de intentos de login
Ver `docs/limite-intentos-login.md`. Migración en `supabase/migrations/20261125000000_admin_login_attempts.sql`, no ejecutada.

## 5. Hash de la contraseña administrativa
Ver `docs/migracion-hash-admin.md`. El código ya acepta el hash; la migración de datos es manual.

## 6. Webhook de Mercado Pago
- Antes: no verificaba la firma. Consultaba el pago en la API de Mercado Pago con el ID recibido, lo que impide aceptar estados inventados, pero no autenticaba el origen.
- Ahora: si `MP_WEBHOOK_SECRET` está configurada, se valida `x-signature` (HMAC-SHA256 del manifiesto oficial). Firma inválida → 401.
- Sin `MP_WEBHOOK_SECRET` (estado actual en Vercel): el flujo comercial no cambia y queda una advertencia en logs.
- Pendiente: el webhook no compara `transaction_amount` con el total de la orden. No se cambió para no alterar el flujo comercial.

## 7. Funcionalidades que dependen de tablas o buckets inexistentes en producción
| Recurso | Dónde se usa | Efecto actual |
|---|---|---|
| `wholesale_requests` (tabla) | `createWholesaleRequest`, formulario de `/mayoristas` | **La solicitud de cuenta mayorista falla**. |
| `mail_log` (tabla) | `emailLogger` (contacto y mayoristas) | No se registran los envíos. Además, con `EMAIL_MODE` sin definir (receive_only) los correos no se envían, con o sin tabla. |
| `leads` (tabla) | `/api/lead` | Sin llamadas desde la interfaz: endpoint sin uso visible. |
| `images` (bucket) | `/cotizaciones` (adjuntar referencias) y el antiguo `/api/admin/upload` | Las referencias de cotización no se suben; el endpoint antiguo fue eliminado. |
| `art-files` (bucket), `art_files`, `custom_jobs` | Mayoristas (archivos de diseño) | Existen; sin uso de datos aún (0 filas). |

## 8. Secretos en lo que se publicará
- Se eliminaron del árbol: la contraseña de ejemplo en `admin-settings-setup.sql` y una clave anon en `CLOUDFLARE_ENV_VARS.md` (reemplazadas por marcadores).
- Verificado: `.env.example` solo contiene marcadores.
- **Pendiente crítico:** el historial público de GitHub conserva `artesellos2024` y la clave anon. La clave anon es pública por diseño; la contraseña debe considerarse expuesta (ver `docs/migracion-hash-admin.md`).
