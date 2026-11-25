# Límite de intentos de login (v2, fail-closed)

## Comportamiento
- Cada `POST /api/admin/login` registra un intento **pendiente** antes de verificar la contraseña.
- Cuentan los intentos `pending` o `failed`: **5 en 15 min por IP** (HTTP 429, `Retry-After: 900`).
- **No hay límite global.** Un contador global permitiría bloquear al administrador desde cualquier IP con 50 peticiones (DoS). Se verificó en PostgreSQL real.
- Un login correcto pasa a `ok` y no cuenta.
- Un intento que queda `pending` (fallo a mitad) cuenta como fallo.
- Si la base no responde o faltan las funciones: **HTTP 503**, no se permite el intento (fail-closed). No hay fallback en memoria.
- Concurrencia: `pg_advisory_xact_lock` serializa la comprobación y el registro.
- Limpieza: cada `admin_login_begin` borra hasta 500 registros de más de 7 días.

## Pruebas realizadas (PostgreSQL 16, roles simulados de Supabase)
- `anon` y `authenticated` no pueden ejecutar las funciones ni leer/escribir la tabla (`permission denied`).
- 5 fallos bloquean la 6.ª petición por 900 s; un login correcto no cuenta.
- Intentos sin resolver cuentan como fallo.
- 30 peticiones simultáneas desde la misma IP: exactamente 5 pasan.
- `finish` es idempotente: un `ok` no pasa a `failed`.
- Registros de más de 7 días se eliminan en la siguiente llamada.
- 50 atacantes de IPs distintas no bloquean a una IP legítima.

## Hallazgo en producción (fuera de esta migración)
`admin_settings` tiene RLS activo sin políticas, pero `anon` y `authenticated` tienen `TRUNCATE`, `INSERT`, `UPDATE`, `DELETE` y `SELECT` concedidos. RLS no controla `TRUNCATE`. Recomendación: revocar esos privilegios en una migración aparte, aprobada por separado.

## Migración
Archivo: `supabase/migrations/20261125000000_admin_login_attempts.sql`. **No ejecutada.**

### Verificaciones previas (solo lectura)
```sql
-- 1. ¿Existe ya la tabla de la versión 1? (si existe, NO aplicar tal cual)
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'admin_login_attempts';
-- 2. ¿Existe la función?
select proname from pg_proc where proname like 'admin_login_%';
```
- Si la consulta 1 devuelve `succeeded` y no `status`: la tabla v1 existe. Hay que renombrarla o migrar sus datos antes (los datos son solo de intentos; se pueden descartar con `drop table`).
- Si la consulta 1 devuelve vacío: aplicar la migración sin cambios.

## Orden de despliegue (obligatorio)
1. Aprobar y aplicar la migración en Supabase.
2. Verificar con la consulta 2 que existen `admin_login_begin` y `admin_login_finish`.
3. Solo entonces publicar el código que las usa. Si se publica antes, **el login de administración responde 503 hasta aplicar la migración**.

## Reversión
Reversión de código primero, luego de base:
1. Volver a desplegar el commit anterior al de esta versión. Ese código usa el límite v1 con la columna `succeeded`, así que no es compatible con la tabla nueva: si la tabla no existe, registra error y permite el intento (estado degradado, no bloqueo). Si la tabla v2 existe, el código anterior fallará en cada consulta y también degradará.
2. Solo después, eliminar objetos (no hace falta si se quiere conservar el historial de intentos):
```sql
drop function if exists public.admin_login_begin(text);
drop function if exists public.admin_login_finish(bigint, boolean);
drop table if exists public.admin_login_attempts;
```
El orden importa: si se borran las funciones antes de revertir el código, el login responde 503.

## Qué no cambia
- La contraseña sigue siendo obligatoria.
- El formato de la cookie de sesión no cambia.
- No se usan servicios externos.
