# Procedimiento definitivo: contraseña administrativa con hash

Objetivo: reemplazar la contraseña en texto plano por un hash PBKDF2-SHA256 sin perder el acceso al panel.

## Estado del código (ya desplegado en la rama de seguridad)
- `POST /api/admin/login` prefiere `admin_password_hash`. Si existe, compara solo contra ese hash.
- Si no existe, usa `admin_password` (legado) con comparación en tiempo constante.
- No se requiere ningún cambio de código para migrar: basta con una fila nueva.

## Advertencia
La contraseña administrativa anterior está en el historial público del repositorio. Considérala comprometida y no la reutilices en ningún lugar.

## Paso 0: revisar la tabla (solo lectura)
```sql
select column_name, data_type from information_schema.columns
where table_schema = 'public' and table_name = 'admin_settings';
select key from admin_settings;
```
Confirma que existe la columna `key` con restricción única (necesaria para el `ON CONFLICT` del paso 2).

## Paso 1: generar el hash en tu computador
```bash
node scripts/hash-admin-password.mjs
```
- Escribe una contraseña nueva de al menos 12 caracteres. No se muestra en pantalla y no sale de tu equipo.
- Copia la línea que empieza por `pbkdf2_sha256$`.

## Paso 2: guardar el hash (única escritura, manual)
```sql
insert into admin_settings (key, value)
values ('admin_password_hash', '<HASH_DEL_PASO_1>')
on conflict (key) do update set value = excluded.value;
```
Desde este momento el login acepta solo la contraseña nueva. La fila `admin_password` se conserva como respaldo.

## Paso 3: verificar antes de cerrar nada
1. Abre `/admin/login` en una ventana privada.
2. Entra con la contraseña nueva. Debe funcionar.
3. Intenta la contraseña anterior. Debe fallar (esto confirma que el hash es el que manda).
4. Confirma que el panel carga productos.

No sigas al paso 4 hasta completar el 3.

## Paso 4: retirar el texto plano (después de una semana sin incidentes)
```sql
delete from admin_settings where key = 'admin_password';
```

## Reversión (en cualquier momento antes del paso 4)
Si no puedes entrar:
```sql
delete from admin_settings where key = 'admin_password_hash';
```
El login vuelve a usar `admin_password`. Si esa fila ya no existe, restablécela con una contraseña nueva por el mismo `on conflict`.

## Notas
- Las sesiones ya emitidas (cookie de 8 h) siguen válidas tras el cambio. Para cerrarlas todas, cambia `ADMIN_SESSION_SECRET` en Vercel; eso exige volver a entrar.
- Si el límite de intentos bloquea tu IP, espera 15 minutos (ver `docs/limite-intentos-login.md`).
