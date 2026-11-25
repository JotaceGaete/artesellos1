# Límite persistente de intentos de login

## Comportamiento

- Se cuentan solo los intentos **fallidos** de `POST /api/admin/login`.
- Por IP (guardada como HMAC, no en claro): **5 fallos en 15 minutos** bloquean el intento con HTTP 429 y `Retry-After: 900`.
- Global: **50 fallos en 1 hora** bloquean todos los intentos con `Retry-After: 3600`. Protege contra rotación de IP.
- Los registros de fallos anteriores a 7 días se eliminan automáticamente.
- El intento correcto se registra, pero no reinicia el contador.

## Migración pendiente (NO ejecutada)

Archivo: `supabase/migrations/20261125000000_admin_login_attempts.sql`
Crea la tabla `admin_login_attempts` con RLS activado y sin políticas (solo accede el service role).

Mientras la migración no esté aplicada:
- La aplicación registra en logs que el límite no está disponible y **permite el intento**.
- La contraseña sigue siendo obligatoria. Es un estado degradado, no un bypass.

Recomendación: revisar y aplicar la migración antes de publicar en producción.

## Limitaciones conocidas

- Se usa `x-real-ip` (o el primer valor de `x-forwarded-for`). Un cliente puede falsear `x-forwarded-for`; el límite global mitiga ese caso.
- No protege contra ataques distribuidos lentos más allá del límite global.
