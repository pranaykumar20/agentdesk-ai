-- Scope knowledge documents and FAQs to a specific AI employee, or leave NULL for all agents.
alter table public.knowledge_documents
  add column if not exists agent_id uuid references public.ai_agents (id) on delete set null;

alter table public.faq_items
  add column if not exists agent_id uuid references public.ai_agents (id) on delete set null;

create index if not exists knowledge_documents_org_agent_idx
  on public.knowledge_documents (organization_id, agent_id);

create index if not exists faq_items_org_agent_idx
  on public.faq_items (organization_id, agent_id);
