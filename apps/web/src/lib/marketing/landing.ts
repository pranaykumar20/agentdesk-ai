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
import type { IconToneKey } from "./icon-tones";

export const HERO_CALLOUTS: Array<{
  title: string;
  description: string;
  icon: LucideIcon;
  tone: IconToneKey;
}> = [
  {
    title: "24/7 Availability",
    description: "Always on, never misses a call.",
    icon: Clock,
    tone: "emerald",
  },
  {
    title: "Smart Call Routing",
    description: "Routes calls to the right person or department.",
    icon: GitBranch,
    tone: "indigo",
  },
  {
    title: "Appointments & Booking",
    description: "Books, reschedules, and cancels automatically.",
    icon: CalendarPlus,
    tone: "amber",
  },
  {
    title: "Call Summaries",
    description: "AI summaries and transcripts for every call.",
    icon: FileText,
    tone: "sky",
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
  tone: IconToneKey;
}> = [
  {
    title: "AI Phone Answering",
    description: "Natural conversations that sound human.",
    icon: Phone,
    tone: "violet",
  },
  {
    title: "Lead Qualification",
    description: "Qualifies and captures high-quality leads.",
    icon: UserPlus,
    tone: "sky",
  },
  {
    title: "Appointment Booking",
    description: "Books appointments and sends reminders.",
    icon: Calendar,
    tone: "amber",
  },
  {
    title: "Smart Routing",
    description: "Routes calls based on rules and availability.",
    icon: Share2,
    tone: "indigo",
  },
  {
    title: "Analytics & Reports",
    description: "Track performance and measure results.",
    icon: BarChart3,
    tone: "teal",
  },
  {
    title: "Easy Integrations",
    description: "Works with your favorite tools and CRM.",
    icon: Puzzle,
    tone: "orange",
  },
];

export const LANDING_STATS = [
  { value: "98%", label: "Calls answered" },
  { value: "3x", label: "More leads captured" },
  { value: "24/7", label: "Always available" },
  { value: "10,000+", label: "Happy businesses" },
] as const;
