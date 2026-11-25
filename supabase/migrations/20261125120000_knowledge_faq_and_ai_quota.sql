-- Migración aditiva: preguntas frecuentes en knowledge_base y cuota persistente de consultas IA.
-- NO EJECUTAR hasta aprobación. No modifica, borra ni reindexa filas existentes.
-- Orden: 1) esta migración, 2) desplegar el código que la usa.

-- 1. Columnas nuevas. Los 38 fragmentos actuales quedan con question = null (RAG puro) y active = true.
alter table public.knowledge_base
  add column if not exists category text,
  add column if not exists question text,
  add column if not exists aliases text[],
  add column if not exists active boolean not null default true,
  add column if not exists sort_order integer not null default 100;

create index if not exists knowledge_base_faq_idx
  on public.knowledge_base (active, sort_order)
  where question is not null;

-- 2. Búsqueda RAG: misma firma y tipo de retorno; solo excluye filas inactivas o sin embedding.
-- Las preguntas frecuentes sin embedding nunca aparecen en la búsqueda vectorial.
create or replace function public.match_knowledge_base(
  query_embedding vector,
  match_threshold double precision default 0.7,
  match_count integer default 5
)
returns table (id integer, content text, similarity double precision)
language plpgsql
as $$
begin
  return query
  select kb.id, kb.content, 1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where kb.active
    and kb.embedding is not null
    and 1 - (kb.embedding <=> query_embedding) > match_threshold
  order by kb.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- 3. Cuota de consultas IA: una fila por clave (IP con HMAC + día UTC). Solo service_role.
create table if not exists public.chat_ai_usage (
  usage_key text primary key,
  used integer not null default 0 check (used >= 0),
  updated_at timestamptz not null default now()
);

alter table public.chat_ai_usage enable row level security;
revoke all on public.chat_ai_usage from anon, authenticated;

-- Consume una unidad de cuota de forma atómica. Devuelve true solo si había cuota.
-- ON CONFLICT ... WHERE bloquea la fila: dos peticiones simultáneas no pueden superar el límite.
create or replace function public.chat_ai_consume(p_key text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used integer;
begin
  if p_limit < 1 then
    return false;
  end if;

  delete from public.chat_ai_usage
  where usage_key in (
    select usage_key from public.chat_ai_usage
    where updated_at < now() - interval '2 days'
    limit 500
  );

  insert into public.chat_ai_usage as u (usage_key, used)
  values (p_key, 1)
  on conflict (usage_key) do update
    set used = u.used + 1, updated_at = now()
    where u.used < p_limit
  returning used into v_used;

  return v_used is not null;
end;
$$;

revoke all on function public.chat_ai_consume(text, integer) from public, anon, authenticated;
grant execute on function public.chat_ai_consume(text, integer) to service_role;
