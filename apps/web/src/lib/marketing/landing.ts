import type { LucideIcon } from "lucide-react";
import {
  Clock,
  GitBranch,
  CalendarPlus,
  FileText,
  Phone,
  UserPlus,
  Calendar,
  Share2,
  BarChart3,
  Puzzle,
} from "lucide-react";

export const HERO_CALLOUTS: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: "24/7 Availability",
    description: "Always on, never misses a call.",
    icon: Clock,
  },
  {
    title: "Smart Call Routing",
    description: "Routes calls to the right person or department.",
    icon: GitBranch,
  },
  {
    title: "Appointments & Booking",
    description: "Books, reschedules, and cancels automatically.",
    icon: CalendarPlus,
  },
  {
    title: "Call Summaries",
    description: "AI summaries and transcripts for every call.",
    icon: FileText,
  },
];

export const TRUST_LOGOS = [
  { name: "Dental Care", label: "Dental" },
  { name: "AutoFix", label: "Auto" },
  { name: "HomePro", label: "Home" },
  { name: "LegalAssist", label: "Legal" },
  { name: "Elite Realty", label: "Realty" },
  { name: "HVAC Experts", label: "HVAC" },
  { name: "Bright Insurance", label: "Insurance" },
] as const;

export const LANDING_FEATURES: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    title: "AI Phone Answering",
    description: "Natural conversations that sound human.",
    icon: Phone,
  },
  {
    title: "Lead Qualification",
    description: "Qualifies and captures high-quality leads.",
    icon: UserPlus,
  },
  {
    title: "Appointment Booking",
    description: "Books appointments and sends reminders.",
    icon: Calendar,
  },
  {
    title: "Smart Routing",
    description: "Routes calls based on rules and availability.",
    icon: Share2,
  },
  {
    title: "Analytics & Reports",
    description: "Track performance and measure results.",
    icon: BarChart3,
  },
  {
    title: "Easy Integrations",
    description: "Works with your favorite tools and CRM.",
    icon: Puzzle,
  },
];

export const LANDING_STATS = [
  { value: "98%", label: "Calls answered" },
  { value: "3x", label: "More leads captured" },
  { value: "24/7", label: "Always available" },
  { value: "10,000+", label: "Happy businesses" },
] as const;
