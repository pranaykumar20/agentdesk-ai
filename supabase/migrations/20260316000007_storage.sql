-- Private knowledge documents bucket (policies assume bucket exists)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'knowledge-documents',
  'knowledge-documents',
  false,
  10485760,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown'
  ]
)
on conflict (id) do nothing;

-- Path convention: {organization_id}/{document_id}/{filename}
create policy "knowledge_docs_select_member"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'knowledge-documents'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy "knowledge_docs_insert_member"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'knowledge-documents'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy "knowledge_docs_update_member"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'knowledge-documents'
    and public.is_org_member((storage.foldername(name))[1]::uuid)
  );

create policy "knowledge_docs_delete_admin"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'knowledge-documents'
    and public.has_org_role((storage.foldername(name))[1]::uuid, array['OWNER', 'ADMIN', 'MANAGER']::public.user_role[])
  );
