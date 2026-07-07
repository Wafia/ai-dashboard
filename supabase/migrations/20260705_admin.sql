-- Admin Dashboard Schema for ai-dashboard

-- 1. Clients table
create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  created_by uuid references auth.users(id) on delete set null
);
alter table public.clients enable row level security;

-- Only admins can read/write clients
create policy "Admins can read clients"
  on public.clients for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can insert clients"
  on public.clients for insert
  with check (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can update clients"
  on public.clients for update
  using (auth.jwt() ->> 'role' = 'admin');

-- 2. Sessions table (device tracking)
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade not null,
  device_hash text not null,
  ip_address text,
  user_agent text,
  last_active timestamptz default now(),
  created_at timestamptz default now(),
  is_blocked boolean default false
);
alter table public.sessions enable row level security;

create policy "Admins can read sessions"
  on public.sessions for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can update sessions"
  on public.sessions for update
  using (auth.jwt() ->> 'role' = 'admin');

-- 3. Sharing alerts
create table if not exists public.sharing_alerts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade not null,
  session_id uuid references public.sessions(id) on delete set null,
  detected_at timestamptz default now(),
  device_1 text,
  device_2 text,
  resolved boolean default false,
  resolved_by uuid references auth.users(id) on delete set null,
  notes text
);
alter table public.sharing_alerts enable row level security;

create policy "Admins can read alerts"
  on public.sharing_alerts for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "Admins can update alerts"
  on public.sharing_alerts for update
  using (auth.jwt() ->> 'role' = 'admin');

-- 4. Usage logs (anonymous stats only)
create table if not exists public.usage_logs (
  id bigint generated always as identity primary key,
  client_id uuid references public.clients(id) on delete set null,
  tool_id text,
  provider_used text,
  created_at timestamptz default now()
);
alter table public.usage_logs enable row level security;

create policy "Service role can insert usage logs"
  on public.usage_logs for insert
  with check (true);

create policy "Admins can read usage logs"
  on public.usage_logs for select
  using (auth.jwt() ->> 'role' = 'admin');

-- 5. Function: auto-block after 3 alerts
create or replace function public.auto_block_client()
returns trigger
language plpgsql
security definer
as $$
declare
  alert_count int;
begin
  select count(*) into alert_count
  from public.sharing_alerts
  where client_id = new.client_id and resolved = false;

  if alert_count >= 3 then
    update public.clients
    set is_active = false
    where id = new.client_id;
  end if;

  return new;
end;
$$;

create trigger trg_auto_block_client
  after insert on public.sharing_alerts
  for each row
  execute function public.auto_block_client();
