-- Membership helpers (security definer to avoid RLS recursion)
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
  );
$$;

create or replace function public.has_org_role(org_id uuid, allowed_roles public.user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.status = 'active'
      and m.role = any (allowed_roles)
  );
$$;

grant execute on function public.is_org_member(uuid) to authenticated, service_role;
grant execute on function public.has_org_role(uuid, public.user_role[]) to authenticated, service_role;

-- RLS: profiles
alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- RLS: organizations
alter table public.organizations enable row level security;

create policy "organizations_select_member"
  on public.organizations for select
  to authenticated
  using (public.is_org_member(id));

create policy "organizations_insert_authenticated"
  on public.organizations for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "organizations_update_admin"
  on public.organizations for update
  to authenticated
  using (public.has_org_role(id, array['OWNER', 'ADMIN']::public.user_role[]))
  with check (public.has_org_role(id, array['OWNER', 'ADMIN']::public.user_role[]));

create policy "organizations_delete_owner"
  on public.organizations for delete
  to authenticated
  using (public.has_org_role(id, array['OWNER']::public.user_role[]));

-- RLS: organization_members
alter table public.organization_members enable row level security;

create policy "members_select_same_org"
  on public.organization_members for select
  to authenticated
  using (public.is_org_member(organization_id));

-- Allow creator to insert themselves as OWNER when creating an org
create policy "members_insert_self_owner_or_admin"
  on public.organization_members for insert
  to authenticated
  with check (
    user_id = auth.uid()
    or public.has_org_role(organization_id, array['OWNER', 'ADMIN']::public.user_role[])
  );

create policy "members_update_admin"
  on public.organization_members for update
  to authenticated
  using (public.has_org_role(organization_id, array['OWNER', 'ADMIN']::public.user_role[]))
  with check (public.has_org_role(organization_id, array['OWNER', 'ADMIN']::public.user_role[]));

create policy "members_delete_admin"
  on public.organization_members for delete
  to authenticated
  using (public.has_org_role(organization_id, array['OWNER', 'ADMIN']::public.user_role[]));

-- RLS: organization_settings
alter table public.organization_settings enable row level security;

create policy "settings_select_member"
  on public.organization_settings for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "settings_insert_member"
  on public.organization_settings for insert
  to authenticated
  with check (
    public.is_org_member(organization_id)
    or public.has_org_role(organization_id, array['OWNER', 'ADMIN']::public.user_role[])
    or exists (
      select 1 from public.organizations o
      where o.id = organization_id and o.created_by = auth.uid()
    )
  );

create policy "settings_update_admin"
  on public.organization_settings for update
  to authenticated
  using (public.has_org_role(organization_id, array['OWNER', 'ADMIN']::public.user_role[]))
  with check (public.has_org_role(organization_id, array['OWNER', 'ADMIN']::public.user_role[]));

-- RLS: locations
alter table public.locations enable row level security;

create policy "locations_select_member"
  on public.locations for select
  to authenticated
  using (public.is_org_member(organization_id));

create policy "locations_write_admin"
  on public.locations for all
  to authenticated
  using (public.has_org_role(organization_id, array['OWNER', 'ADMIN', 'MANAGER']::public.user_role[]))
  with check (public.has_org_role(organization_id, array['OWNER', 'ADMIN', 'MANAGER']::public.user_role[]));
