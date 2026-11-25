-- Límite persistente de intentos de login de administración.
-- PENDIENTE: no ejecutar hasta revisión. Sin esta tabla el límite queda desactivado
-- (la aplicación registra el error y permite el intento; la contraseña sigue siendo obligatoria).

create table if not exists public.admin_login_attempts (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  succeeded boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists admin_login_attempts_ip_created_idx
  on public.admin_login_attempts (ip_hash, created_at desc);

create index if not exists admin_login_attempts_created_idx
  on public.admin_login_attempts (created_at desc);

-- Solo el service role (que omite RLS) accede a esta tabla.
alter table public.admin_login_attempts enable row level security;
