# Migración de la contraseña administrativa a hash

Objetivo: dejar de guardar la contraseña en texto plano en `admin_settings`, sin perder el acceso.

## Estado actual del código

- `POST /api/admin/login` lee `admin_password_hash` y `admin_password` de `admin_settings`.
- Si existe `admin_password_hash`, se usa **solo** ese hash (PBKDF2-SHA256, 210.000 iteraciones, sal aleatoria).
- Si no existe, se usa el texto plano `admin_password` con comparación en tiempo constante (comportamiento legado).
- No hace falta ningún cambio de código ni de esquema para migrar: solo se agrega una fila.

## Advertencia previa

La contraseña `artesellos2024` aparece en el historial **público** del repositorio (commits antiguos).
Si alguna vez fue la contraseña real, debe considerarse comprometida. Usa una contraseña nueva de al menos 12 caracteres.

## Pasos

1. **Generar el hash en tu computador** (no se envía a la red, la contraseña no queda en el historial del shell si la escribes en el prompt):
   ```bash
   node scripts/hash-admin-password.mjs
   ```
   Escribe la nueva contraseña cuando lo pida. Copia la línea que imprime (`pbkdf2_sha256$...`).

2. **Insertar el hash** en el SQL editor de Supabase. Esta es la única escritura en la base de datos y se hace manualmente:
   ```sql
   INSERT INTO admin_settings (key, value)
   VALUES ('admin_password_hash', '<HASH>')
   ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
   ```
   Desde este momento el login usa solo el hash. **La contraseña antigua deja de funcionar**; la nueva es la del paso 1.

3. **Verificar** en `/admin/login`: entra con la nueva contraseña. Prueba también que la antigua ya no entra.

4. **Mantener la fila `admin_password` durante una semana** como respaldo (no se usa mientras exista el hash).

5. **Eliminar el texto plano** cuando lo consideres estable:
   ```sql
   DELETE FROM admin_settings WHERE key = 'admin_password';
   ```

## Reversión

Si no puedes entrar después del paso 2:
```sql
DELETE FROM admin_settings WHERE key = 'admin_password_hash';
```
El login vuelve a usar `admin_password`. Por eso no se borra en el paso 5 hasta verificar el acceso.
Si `admin_password` ya fue eliminada, restablécela con:
```sql
INSERT INTO admin_settings (key, value) VALUES ('admin_password', '<nueva contraseña>')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
```

## Riesgos controlados

- **Bloqueo por límite de intentos:** si fallas 5 veces en 15 minutos, el acceso se bloquea 15 minutos (por IP). Espera o usa otra red. Ver `docs/limite-intentos-login.md`.
- **Sesiones activas:** al cambiar la contraseña, las cookies ya emitidas siguen válidas hasta su expiración (8 horas). Para invalidarlas, cambia `ADMIN_SESSION_SECRET` en Vercel (cierra todas las sesiones).
