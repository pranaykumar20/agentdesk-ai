import type { LucideIcon } from "lucide-react";
import {
  Smile,
  HeartPulse,
  Shield,
  Car,
  Wrench,
  UtensilsCrossed,
  Scale,
  Home,
  Building,
} from "lucide-react";

export type IndustryTemplate = {
  slug: string;
  name: string;
  problem: string;
  callTypes: string[];
  capabilities: string[];
  description: string;
  icon: LucideIcon;
};

export const INDUSTRIES: IndustryTemplate[] = [
  {
    slug: "dental",
    name: "Dental Offices",
    problem: "Missed calls mean empty chairs and lost new patients.",
    description: "Handle appointments, insurance & patient inquiries.",
    callTypes: ["New patient booking", "Insurance questions", "Reschedule / cancel", "Office hours"],
    capabilities: ["Appointment booking", "Insurance FAQs", "After-hours intake", "Staff transfer"],
    icon: Smile,
  },
  {
    slug: "medical",
    name: "Medical Clinics",
    problem: "Front desks are overloaded; patients abandon hold queues.",
    description: "Book appointments and follow-ups.",
    callTypes: ["Appointment requests", "Refills & follow-ups", "Directions", "Billing"],
    capabilities: ["Scheduling", "Triage routing", "Callback capture", "Multi-location"],
    icon: HeartPulse,
  },
  {
    slug: "insurance",
    name: "Insurance Agencies",
    problem: "Quote requests go unanswered after hours and leads go cold.",
    description: "Qualify prospects and book policy consultations.",
    callTypes: ["Quote requests", "Claims questions", "Policy changes", "Renewals"],
    capabilities: ["Lead qualification", "CRM sync", "Appointment booking", "SMS follow-up"],
    icon: Shield,
  },
  {
    slug: "auto-repair",
    name: "Auto Repair",
    problem: "Service advisors miss calls while working in the bay.",
    description: "Book service, check status and more.",
    callTypes: ["Service booking", "Status updates", "Estimates", "Towing / emergencies"],
    capabilities: ["Job scheduling", "Status FAQs", "Callback requests", "Department routing"],
    icon: Car,
  },
  {
    slug: "home-services",
    name: "Home Services",
    problem: "HVAC and home service leads need instant response to win the job.",
    description: "Answer questions and schedule jobs.",
    callTypes: ["Emergency service", "Estimate requests", "Scheduling", "Warranty"],
    capabilities: ["Dispatch routing", "Lead capture", "After-hours booking", "SMS confirmation"],
    icon: Wrench,
  },
  {
    slug: "restaurants",
    name: "Restaurants",
    problem: "Busy service periods mean missed reservations and takeout orders.",
    description: "Take reservations and handle specials.",
    callTypes: ["Reservations", "Hours & location", "Catering", "Order questions"],
    capabilities: ["Reservation intake", "FAQ answering", "Message taking", "Staff transfer"],
    icon: UtensilsCrossed,
  },
  {
    slug: "law",
    name: "Law Firms",
    problem: "Intake delays lose high-value clients to competitors.",
    description: "Intake new clients and route to attorneys.",
    callTypes: ["New client intake", "Case status", "Consult booking", "Referrals"],
    capabilities: ["Structured intake", "Attorney routing", "Conflict screening prompts", "Summaries"],
    icon: Scale,
  },
  {
    slug: "real-estate",
    name: "Real Estate",
    problem: "Showing requests arrive nights and weekends when agents are offline.",
    description: "Qualify leads and book property showings.",
    callTypes: ["Showing requests", "Listing questions", "Buyer qualification", "Open house"],
    capabilities: ["Lead qualification", "Calendar booking", "Agent routing", "Follow-up SMS"],
    icon: Home,
  },
  {
    slug: "property-management",
    name: "Property Management",
    problem: "Tenant maintenance calls pile up outside office hours.",
    description: "Handle tenant inquiries and maintenance requests.",
    callTypes: ["Maintenance requests", "Rent questions", "Move-in / move-out", "Emergencies"],
    capabilities: ["Ticket capture", "Emergency escalation", "FAQ policies", "Vendor routing"],
    icon: Building,
  },
];

export function getIndustryBySlug(slug: string): IndustryTemplate | undefined {
  return INDUSTRIES.find((industry) => industry.slug === slug);
}
