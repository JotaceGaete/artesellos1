-- Límite persistente de intentos de login de administración (v2).
-- NO EJECUTAR hasta aprobación. Requiere desplegar el código que usa estas funciones.
--
-- Diseño:
-- * Cada intento se registra ANTES de verificar la contraseña ('pending').
--   Así, peticiones concurrentes se cuentan aunque ninguna haya terminado todavía.
-- * Un intento que nunca se resuelve (fallo del servidor a mitad) cuenta como fallo:
--   el sesgo es hacia bloquear, no hacia permitir.
-- * Un login correcto pasa a 'ok' y deja de contar.
-- * Sin límite global: un contador global permitiría a un atacante bloquear al
--   administrador desde cualquier IP (DoS). Solo se limita por IP.
-- * Serialización: pg_advisory_xact_lock sobre una clave fija durante begin.
-- * Limpieza: en cada begin se borran hasta 500 registros de más de 7 días.

create table if not exists public.admin_login_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  status text not null default 'pending' check (status in ('pending', 'failed', 'ok')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists admin_login_attempts_ip_created_idx
  on public.admin_login_attempts (ip_hash, created_at desc);

create index if not exists admin_login_attempts_created_idx
  on public.admin_login_attempts (created_at desc);

alter table public.admin_login_attempts enable row level security;
revoke all on public.admin_login_attempts from anon, authenticated;

-- Comprueba el límite y registra el intento como 'pending'.
-- Devuelve allowed=false con retry_after_sec si el límite está alcanzado.
create or replace function public.admin_login_begin(p_ip_hash text)
returns table (allowed boolean, retry_after_sec integer, attempt_id bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip_count integer;
  v_id bigint;
begin
  perform pg_advisory_xact_lock(hashtext('admin_login_gate'));

  delete from public.admin_login_attempts
  where id in (
    select id from public.admin_login_attempts
    where created_at < now() - interval '7 days'
    limit 500
  );

  select count(*) into v_ip_count
  from public.admin_login_attempts
  where ip_hash = p_ip_hash
    and status in ('pending', 'failed')
    and created_at >= now() - interval '15 minutes';

  if v_ip_count >= 5 then
    return query select false, 900, null::bigint;
    return;
  end if;

  insert into public.admin_login_attempts (ip_hash)
  values (p_ip_hash)
  returning id into v_id;

  return query select true, null::integer, v_id;
end;
$$;

-- Resuelve un intento: 'ok' si la contraseña fue correcta, 'failed' en otro caso.
create or replace function public.admin_login_finish(p_attempt_id bigint, p_succeeded boolean)
returns void
language sql
security definer
set search_path = public
as $$
  update public.admin_login_attempts
  set status = case when p_succeeded then 'ok' else 'failed' end,
      resolved_at = now()
  where id = p_attempt_id
    and status = 'pending';
$$;

-- Solo el service role puede ejecutar estas funciones.
revoke all on function public.admin_login_begin(text) from public, anon, authenticated;
revoke all on function public.admin_login_finish(bigint, boolean) from public, anon, authenticated;
grant execute on function public.admin_login_begin(text) to service_role;
grant execute on function public.admin_login_finish(bigint, boolean) to service_role;
