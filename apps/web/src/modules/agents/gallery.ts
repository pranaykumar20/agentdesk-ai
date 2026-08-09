export type EmployeeTemplateCard = {
  id: string;
  title: string;
  description: string;
  roleTitle: string;
  industry: string;
  tone: string;
  language: string;
  department: string;
};

export const EMPLOYEE_TEMPLATE_GALLERY: EmployeeTemplateCard[] = [
  {
    id: "receptionist-restaurant",
    title: "Restaurant receptionist",
    description: "Reservations, hours, menu questions, and callbacks for restaurants.",
    roleTitle: "Receptionist",
    industry: "restaurant",
    tone: "Warm and conversational",
    language: "en-US",
    department: "Front Office",
  },
  {
    id: "receptionist-restaurant-te",
    title: "Telugu restaurant receptionist",
    description: "Same as restaurant receptionist with Telugu voice and spoken-language guidance.",
    roleTitle: "Receptionist",
    industry: "restaurant",
    tone: "Warm and conversational",
    language: "te-IN",
    department: "Front Office",
  },
  {
    id: "appointment-clinic",
    title: "Clinic appointment setter",
    description: "Schedule, reschedule, and confirm medical/clinic appointments.",
    roleTitle: "Appointment Setter",
    industry: "clinic",
    tone: "Calm and reassuring",
    language: "en-US",
    department: "Scheduling",
  },
  {
    id: "appointment-dental",
    title: "Dental appointment setter",
    description: "Dental office scheduling with prep reminders and callbacks.",
    roleTitle: "Appointment Setter",
    industry: "dental",
    tone: "Friendly professional",
    language: "en-US",
    department: "Scheduling",
  },
  {
    id: "support-general",
    title: "Customer support",
    description: "Answer FAQs, capture issues, and escalate to a human.",
    roleTitle: "Customer Support",
    industry: "general",
    tone: "Calm and reassuring",
    language: "en-US",
    department: "Support",
  },
  {
    id: "sales-general",
    title: "Sales rep",
    description: "Qualify interest, explain offerings, and book follow-ups.",
    roleTitle: "Sales Rep",
    industry: "general",
    tone: "Upbeat and energetic",
    language: "en-US",
    department: "Sales",
  },
  {
    id: "billing-general",
    title: "Billing agent",
    description: "Handle billing questions carefully without taking unsafe card data.",
    roleTitle: "Billing Agent",
    industry: "general",
    tone: "Formal and polished",
    language: "en-US",
    department: "Billing",
  },
  {
    id: "sdr-general",
    title: "SDR",
    description: "Qualify inbound interest and book discovery callbacks.",
    roleTitle: "SDR",
    industry: "general",
    tone: "Concise and efficient",
    language: "en-US",
    department: "Sales",
  },
];
