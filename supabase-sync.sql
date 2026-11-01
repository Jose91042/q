-- Run once in your own Supabase project SQL editor.
create table if not exists public.quiniela_sync (
 id text primary key check (id = 'main'),
 version bigint not null default 0,
 payload jsonb not null default '{"records":[],"favorites":{}}'::jsonb
);
alter table public.quiniela_sync enable row level security;
revoke all on public.quiniela_sync from anon, authenticated;
grant select, update, insert on public.quiniela_sync to service_role;
insert into public.quiniela_sync(id) values ('main') on conflict do nothing;
create or replace function public.quiniela_sync_cas(expected_version bigint,new_payload jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
 update public.quiniela_sync set payload=new_payload,version=version+1
 where id='main' and version=expected_version;
 return found;
end; $$;
revoke all on function public.quiniela_sync_cas(bigint,jsonb) from public, anon, authenticated;
grant execute on function public.quiniela_sync_cas(bigint,jsonb) to service_role;
