-- Fix RLS policies to check app_metadata.role instead of JWT role
drop policy if exists "Admins can read clients" on public.clients;
drop policy if exists "Admins can insert clients" on public.clients;
drop policy if exists "Admins can update clients" on public.clients;
drop policy if exists "Admins can read sessions" on public.sessions;
drop policy if exists "Admins can update sessions" on public.sessions;
drop policy if exists "Admins can read alerts" on public.sharing_alerts;
drop policy if exists "Admins can update alerts" on public.sharing_alerts;
drop policy if exists "Admins can read usage logs" on public.usage_logs;

create policy "Admins can read clients"
  on public.clients for select
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can insert clients"
  on public.clients for insert
  with check (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can update clients"
  on public.clients for update
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can read sessions"
  on public.sessions for select
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can update sessions"
  on public.sessions for update
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can read alerts"
  on public.sharing_alerts for select
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can update alerts"
  on public.sharing_alerts for update
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');

create policy "Admins can read usage logs"
  on public.usage_logs for select
  using (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin');
