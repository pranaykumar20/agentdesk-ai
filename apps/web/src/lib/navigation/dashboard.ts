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
  Workflow,
  Waypoints,
  Store,
  Contact,
  MapPin,
  Inbox,
  ListOrdered,
  MessageSquare,
  MessagesSquare,
  Radio,
  GraduationCap,
  Globe,
  LineChart,
} from "lucide-react";
import { can } from "@/lib/permissions";
import type { Resource, UserRole } from "@/lib/permissions";
import type { FeatureFlagKey } from "@/lib/feature-flags";
import { DEFAULT_FEATURE_FLAGS } from "@/lib/feature-flags";

export type NavGroup =
  | "overview"
  | "operations"
  | "ai_workforce"
  | "growth"
  | "workspace"
  | "account";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  group: NavGroup;
  /** Resource used for read gating in the sidebar. Null = always visible when authenticated. */
  resource: Resource | null;
  /** Optional feature flag; defaults to visible when flag unset/true. */
  flag?: FeatureFlagKey;
  badge?: string;
};

export const NAV_GROUP_LABELS: Record<NavGroup, string> = {
  overview: "Overview",
  operations: "Operations",
  ai_workforce: "AI Workforce",
  growth: "Growth",
  workspace: "Workspace",
  account: "Account",
};

export const NAV_GROUP_ORDER: NavGroup[] = [
  "overview",
  "operations",
  "ai_workforce",
  "growth",
  "workspace",
  "account",
];

export const DASHBOARD_NAV: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "overview", resource: null },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    group: "overview",
    resource: "analytics",
  },
  {
    href: "/dashboard/revenue",
    label: "Revenue & ROI",
    icon: LineChart,
    group: "overview",
    resource: "roi",
    flag: "roi",
  },
  { href: "/dashboard/calls", label: "Calls", icon: PhoneCall, group: "operations", resource: "calls" },
  {
    href: "/dashboard/appointments",
    label: "Appointments",
    icon: CalendarDays,
    group: "operations",
    resource: "appointments",
  },
  {
    href: "/dashboard/contact-center",
    label: "Contact Center",
    icon: Inbox,
    group: "operations",
    resource: "contact_center",
    flag: "contact_center",
  },
  {
    href: "/dashboard/live-monitor",
    label: "Live Call Monitor",
    icon: Radio,
    group: "operations",
    resource: "live_monitor",
    flag: "live_monitor",
  },
  {
    href: "/dashboard/call-queues",
    label: "Call Queues",
    icon: ListOrdered,
    group: "operations",
    resource: "call_queues",
    flag: "call_queues",
  },
  {
    href: "/dashboard/ai-employees",
    label: "AI Employees",
    icon: Bot,
    group: "ai_workforce",
    resource: "agents",
    flag: "ai_employees",
  },
  {
    href: "/dashboard/workflows",
    label: "Workflows",
    icon: Workflow,
    group: "ai_workforce",
    resource: "workflows",
    flag: "workflows",
  },
  {
    href: "/dashboard/voice-flows",
    label: "Voice Flows",
    icon: Waypoints,
    group: "ai_workforce",
    resource: "voice_flows",
    flag: "voice_flows",
  },
  {
    href: "/dashboard/training",
    label: "Training Center",
    icon: GraduationCap,
    group: "ai_workforce",
    resource: "training",
    flag: "training",
  },
  {
    href: "/dashboard/marketplace",
    label: "Marketplace",
    icon: Store,
    group: "ai_workforce",
    resource: "marketplace",
    flag: "marketplace",
  },
  {
    href: "/dashboard/crm",
    label: "CRM & Pipeline",
    icon: Contact,
    group: "growth",
    resource: "crm",
    flag: "crm",
  },
  {
    href: "/dashboard/sms-campaigns",
    label: "SMS Campaigns",
    icon: MessageSquare,
    group: "growth",
    resource: "sms_campaigns",
    flag: "sms_campaigns",
  },
  {
    href: "/dashboard/whatsapp",
    label: "WhatsApp",
    icon: MessagesSquare,
    group: "growth",
    resource: "whatsapp",
    flag: "whatsapp",
  },
  {
    href: "/dashboard/knowledge-base",
    label: "Knowledge Base",
    icon: BookOpen,
    group: "workspace",
    resource: "knowledge",
  },
  {
    href: "/dashboard/website-importer",
    label: "Website Importer",
    icon: Globe,
    group: "workspace",
    resource: "knowledge",
    flag: "website_importer",
  },
  { href: "/dashboard/team", label: "Team", icon: Users, group: "workspace", resource: "members" },
  {
    href: "/dashboard/routing-rules",
    label: "Routing Rules",
    icon: GitBranch,
    group: "workspace",
    resource: "routing",
  },
  {
    href: "/dashboard/locations",
    label: "Locations",
    icon: MapPin,
    group: "workspace",
    resource: "locations",
    flag: "locations",
  },
  {
    href: "/dashboard/integrations",
    label: "Integrations",
    icon: Puzzle,
    group: "workspace",
    resource: "integrations",
  },
  {
    href: "/dashboard/phone-numbers",
    label: "Phone Numbers",
    icon: Phone,
    group: "workspace",
    resource: "phone_numbers",
  },
  {
    href: "/dashboard/billing",
    label: "Billing",
    icon: CreditCard,
    group: "account",
    resource: "billing",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    group: "account",
    resource: "settings",
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function filterNavForRole(
  role: UserRole | string,
  flags: Partial<Record<FeatureFlagKey, boolean>> = DEFAULT_FEATURE_FLAGS,
): DashboardNavItem[] {
  return DASHBOARD_NAV.filter((item) => {
    if (item.flag && flags[item.flag] === false) return false;
    if (!item.resource) return true;
    return can(role as UserRole, "read", item.resource);
  });
}

export function groupNavItems(
  items: DashboardNavItem[],
): Array<{ group: NavGroup; label: string; items: DashboardNavItem[] }> {
  return NAV_GROUP_ORDER.map((group) => ({
    group,
    label: NAV_GROUP_LABELS[group],
    items: items.filter((item) => item.group === group),
  })).filter((section) => section.items.length > 0);
}
