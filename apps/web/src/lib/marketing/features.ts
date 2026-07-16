import type { LucideIcon } from "lucide-react";
import {
  Phone,
  GitBranch,
  Clock,
  CalendarPlus,
  UserCheck,
  FileText,
  MessageSquare,
  BarChart3,
  Puzzle,
  Building2,
  Languages,
  ShieldCheck,
} from "lucide-react";

export type FeatureItem = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export const FEATURES: FeatureItem[] = [
  {
    title: "AI Call Answering",
    description: "Human-like AI answers every call naturally, 24/7.",
    href: "/features#ai-call-answering",
    icon: Phone,
  },
  {
    title: "Smart Call Routing",
    description: "Routes calls to the best person or department.",
    href: "/features#smart-call-routing",
    icon: GitBranch,
  },
  {
    title: "24/7 Availability",
    description: "Never miss a call. AI works 24/7, even after hours.",
    href: "/features#availability",
    icon: Clock,
  },
  {
    title: "Appointments & Booking",
    description: "Books, reschedules and cancels appointments automatically.",
    href: "/features#appointments",
    icon: CalendarPlus,
  },
  {
    title: "Lead Qualification",
    description: "Qualifies leads and captures important details.",
    href: "/features#lead-qualification",
    icon: UserCheck,
  },
  {
    title: "Call Summaries",
    description: "AI summaries and transcripts for every call.",
    href: "/features#call-summaries",
    icon: FileText,
  },
  {
    title: "Follow-ups & Reminders",
    description: "Automated SMS and email follow-ups that convert.",
    href: "/features#follow-ups",
    icon: MessageSquare,
  },
  {
    title: "Analytics & Reports",
    description: "Track calls, conversions and team performance.",
    href: "/features#analytics",
    icon: BarChart3,
  },
  {
    title: "Integrations",
    description: "Connect with your favorite tools and CRM.",
    href: "/features#integrations",
    icon: Puzzle,
  },
  {
    title: "Multi-Location Support",
    description: "Manage multiple locations and numbers from one dashboard.",
    href: "/features#multi-location",
    icon: Building2,
  },
  {
    title: "Multi-Language Support",
    description: "Communicate with customers in 20+ languages.",
    href: "/features#multi-language",
    icon: Languages,
  },
  {
    title: "Secure & Reliable",
    description: "Enterprise-grade security and 99.99% uptime.",
    href: "/features#security",
    icon: ShieldCheck,
  },
];

export const HOW_IT_WORKS = [
  {
    step: 1,
    title: "Call Comes In",
    description: "Customers dial your business number as usual.",
  },
  {
    step: 2,
    title: "AI Answers Instantly",
    description: "Your receptionist greets callers with a natural voice.",
  },
  {
    step: 3,
    title: "Routes or Takes Action",
    description: "Books appointments, captures leads, or transfers to your team.",
  },
  {
    step: 4,
    title: "You Get Notified",
    description: "Summaries, transcripts, and alerts land in your inbox and dashboard.",
  },
] as const;
