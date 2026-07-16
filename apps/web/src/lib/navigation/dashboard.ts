import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  PhoneCall,
  CalendarDays,
  BookOpen,
  Users,
  GitBranch,
  Puzzle,
  Bot,
  Phone,
  BarChart3,
  CreditCard,
  Settings,
} from "lucide-react";
import { can } from "@/lib/permissions";
import type { Resource, UserRole } from "@/lib/permissions";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Resource used for read gating in the sidebar. Null = always visible when authenticated. */
  resource: Resource | null;
};

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, resource: null },
  { href: "/dashboard/calls", label: "Calls", icon: PhoneCall, resource: "calls" },
  { href: "/dashboard/appointments", label: "Appointments", icon: CalendarDays, resource: "appointments" },
  { href: "/dashboard/knowledge-base", label: "Knowledge Base", icon: BookOpen, resource: "knowledge" },
  { href: "/dashboard/team", label: "Team", icon: Users, resource: "members" },
  { href: "/dashboard/routing-rules", label: "Routing Rules", icon: GitBranch, resource: "routing" },
  { href: "/dashboard/integrations", label: "Integrations", icon: Puzzle, resource: "integrations" },
  { href: "/dashboard/ai-agent", label: "AI Agent", icon: Bot, resource: "agents" },
  { href: "/dashboard/phone-numbers", label: "Phone Numbers", icon: Phone, resource: "phone_numbers" },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, resource: "analytics" },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard, resource: "billing" },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, resource: "settings" },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function filterNavForRole(role: UserRole | string): DashboardNavItem[] {
  return DASHBOARD_NAV.filter((item) => {
    if (!item.resource) return true;
    return can(role as UserRole, "read", item.resource);
  });
}
