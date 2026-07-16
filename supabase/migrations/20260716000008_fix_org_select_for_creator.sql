-- Allow creators to read the org they just created (needed for insert().select())
drop policy if exists "organizations_select_member" on public.organizations;
drop policy if exists "organizations_select_member_or_creator" on public.organizations;

create policy "organizations_select_member_or_creator"
  on public.organizations for select
  to authenticated
  using (
    public.is_org_member(id)
    or created_by = auth.uid()
  );

drop policy if exists "profiles_insert_own" on public.profiles;

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());
