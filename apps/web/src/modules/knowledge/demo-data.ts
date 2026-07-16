import type { FaqItem, KnowledgeDocument } from "./types";

const docsStore = new Map<string, KnowledgeDocument[]>();

export function buildDemoDocuments(organizationId: string): KnowledgeDocument[] {
  return [
    {
      id: "demo-doc-001",
      organizationId,
      title: "How to Book, Reschedule or Cancel an Appointment",
      status: "published",
      category: "Appointments",
      mimeType: "text/plain",
      byteSize: 4200,
      viewCount: 842,
      helpfulRate: 95,
      updatedAt: new Date(Date.now() - 2 * 86400_000).toISOString(),
    },
    {
      id: "demo-doc-002",
      organizationId,
      title: "Insurance Coverage and Verification Process",
      status: "published",
      category: "Insurance",
      mimeType: "application/pdf",
      byteSize: 128000,
      viewCount: 512,
      helpfulRate: 91,
      updatedAt: new Date(Date.now() - 5 * 86400_000).toISOString(),
    },
    {
      id: "demo-doc-003",
      organizationId,
      title: "Office Hours and Holiday Schedule",
      status: "published",
      category: "General",
      mimeType: "text/plain",
      byteSize: 1800,
      viewCount: 1204,
      helpfulRate: 97,
      updatedAt: new Date(Date.now() - 1 * 86400_000).toISOString(),
    },
    {
      id: "demo-doc-004",
      organizationId,
      title: "New Patient Intake Draft",
      status: "draft",
      category: "Policies",
      mimeType: "text/plain",
      byteSize: 2600,
      viewCount: 12,
      helpfulRate: null,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "demo-doc-005",
      organizationId,
      title: "Aftercare Instructions Upload",
      status: "processing",
      category: "Treatments",
      mimeType: "application/pdf",
      byteSize: 64000,
      viewCount: 0,
      helpfulRate: null,
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function getDemoDocuments(organizationId: string): KnowledgeDocument[] {
  const extras = docsStore.get(organizationId) ?? [];
  return [...extras, ...buildDemoDocuments(organizationId)];
}

export function addDemoDocument(doc: KnowledgeDocument): void {
  const list = docsStore.get(doc.organizationId) ?? [];
  docsStore.set(doc.organizationId, [doc, ...list]);
}

export function buildDemoFaqs(organizationId: string): FaqItem[] {
  return [
    {
      id: "demo-faq-001",
      organizationId,
      question: "What are your office hours?",
      answer: "We are open Monday–Friday 8am–5pm and Saturday 9am–1pm.",
      category: "Hours",
      status: "published",
    },
    {
      id: "demo-faq-002",
      organizationId,
      question: "Do you accept insurance?",
      answer: "Yes, we accept most major dental insurance plans.",
      category: "Insurance",
      status: "published",
    },
    {
      id: "demo-faq-003",
      organizationId,
      question: "How do I book an appointment?",
      answer: "Call us anytime — our AI receptionist can book, reschedule, or cancel.",
      category: "Appointments",
      status: "published",
    },
  ];
}
