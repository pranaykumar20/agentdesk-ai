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
  UserPlus,
} from "lucide-react";
import { can } from "@/lib/permissions";
import type { Resource, UserRole } from "@/lib/permissions";
import type { FeatureFlagKey } from "@/lib/feature-flags";
import { DEFAULT_FEATURE_FLAGS } from "@/lib/feature-flags";
import type { PlanFeature } from "@/modules/billing/feature-access";
import { planHasFeature } from "@/modules/billing/feature-access";
import type { PlanKey } from "@/modules/billing/types";

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
  /** Tailwind text color classes for the nav icon (idle + active). */
  iconClass: string;
  group: NavGroup;
  /** Resource used for read gating in the sidebar. Null = always visible when authenticated. */
  resource: Resource | null;
  /** Optional feature flag; defaults to visible when flag unset/true. */
  flag?: FeatureFlagKey;
  /** Optional plan entitlement; when set, plan must include the feature. */
  planFeature?: PlanFeature;
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
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    iconClass: "text-sky-600",
    group: "overview",
    resource: null,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: BarChart3,
    iconClass: "text-indigo-600",
    group: "overview",
    resource: "analytics",
    planFeature: "analytics_basic",
  },
  {
    href: "/dashboard/revenue",
    label: "Revenue & ROI",
    icon: LineChart,
    iconClass: "text-emerald-600",
    group: "overview",
    resource: "roi",
    flag: "roi",
    planFeature: "roi",
    badge: "Preview",
  },
  {
    href: "/dashboard/calls",
    label: "Calls",
    icon: PhoneCall,
    iconClass: "text-blue-600",
    group: "operations",
    resource: "calls",
    planFeature: "calls",
  },
  {
    href: "/dashboard/leads",
    label: "Leads",
    icon: UserPlus,
    iconClass: "text-lime-700",
    group: "operations",
    resource: "leads",
    planFeature: "leads_basic",
  },
  {
    href: "/dashboard/appointments",
    label: "Appointments",
    icon: CalendarDays,
    iconClass: "text-teal-600",
    group: "operations",
    resource: "appointments",
    planFeature: "appointments_basic",
  },
  {
    href: "/dashboard/contact-center",
    label: "Contact Center",
    icon: Inbox,
    iconClass: "text-cyan-600",
    group: "operations",
    resource: "contact_center",
    flag: "contact_center",
    planFeature: "contact_center",
    badge: "Preview",
  },
  {
    href: "/dashboard/live-monitor",
    label: "Live Call Monitor",
    icon: Radio,
    iconClass: "text-rose-600",
    group: "operations",
    resource: "live_monitor",
    flag: "live_monitor",
    planFeature: "live_monitor",
    badge: "Preview",
  },
  {
    href: "/dashboard/call-queues",
    label: "Call Queues",
    icon: ListOrdered,
    iconClass: "text-orange-600",
    group: "operations",
    resource: "call_queues",
    flag: "call_queues",
    planFeature: "call_queues",
    badge: "Preview",
  },
  {
    href: "/dashboard/ai-employees",
    label: "AI Employees",
    icon: Bot,
    iconClass: "text-violet-600",
    group: "ai_workforce",
    resource: "agents",
    flag: "ai_employees",
    planFeature: "ai_employees",
  },
  {
    href: "/dashboard/workflows",
    label: "Workflows",
    icon: Workflow,
    iconClass: "text-fuchsia-600",
    group: "ai_workforce",
    resource: "workflows",
    flag: "workflows",
    planFeature: "workflows_basic",
    badge: "Preview",
  },
  {
    href: "/dashboard/voice-flows",
    label: "Voice Flows",
    icon: Waypoints,
    iconClass: "text-purple-600",
    group: "ai_workforce",
    resource: "voice_flows",
    flag: "voice_flows",
    planFeature: "voice_flow_templates",
    badge: "Preview",
  },
  {
    href: "/dashboard/training",
    label: "Training Center",
    icon: GraduationCap,
    iconClass: "text-amber-600",
    group: "ai_workforce",
    resource: "training",
    flag: "training",
    planFeature: "training_basic",
    badge: "Preview",
  },
  {
    href: "/dashboard/marketplace",
    label: "Marketplace",
    icon: Store,
    iconClass: "text-pink-600",
    group: "ai_workforce",
    resource: "marketplace",
    flag: "marketplace",
    planFeature: "marketplace",
    badge: "Preview",
  },
  {
    href: "/dashboard/crm",
    label: "CRM & Pipeline",
    icon: Contact,
    iconClass: "text-lime-700",
    group: "growth",
    resource: "crm",
    flag: "crm",
    planFeature: "crm",
    badge: "Preview",
  },
  {
    href: "/dashboard/sms-campaigns",
    label: "SMS Campaigns",
    icon: MessageSquare,
    iconClass: "text-sky-700",
    group: "growth",
    resource: "sms_campaigns",
    flag: "sms_campaigns",
    planFeature: "sms_campaigns",
    badge: "Preview",
  },
  {
    href: "/dashboard/whatsapp",
    label: "WhatsApp",
    icon: MessagesSquare,
    iconClass: "text-green-600",
    group: "growth",
    resource: "whatsapp",
    flag: "whatsapp",
    planFeature: "whatsapp",
    badge: "Preview",
  },
  {
    href: "/dashboard/knowledge-base",
    label: "Knowledge Base",
    icon: BookOpen,
    iconClass: "text-yellow-700",
    group: "workspace",
    resource: "knowledge",
    planFeature: "knowledge_basic",
  },
  {
    href: "/dashboard/website-importer",
    label: "Website Importer",
    icon: Globe,
    iconClass: "text-cyan-700",
    group: "workspace",
    resource: "knowledge",
    flag: "website_importer",
  },
  {
    href: "/dashboard/team",
    label: "Team",
    icon: Users,
    iconClass: "text-blue-700",
    group: "workspace",
    resource: "members",
  },
  {
    href: "/dashboard/routing-rules",
    label: "Routing Rules",
    icon: GitBranch,
    iconClass: "text-slate-600",
    group: "workspace",
    resource: "routing",
    planFeature: "routing_basic",
  },
  {
    href: "/dashboard/locations",
    label: "Locations",
    icon: MapPin,
    iconClass: "text-red-600",
    group: "workspace",
    resource: "locations",
    flag: "locations",
    planFeature: "locations_multi",
    badge: "Preview",
  },
  {
    href: "/dashboard/integrations",
    label: "Integrations",
    icon: Puzzle,
    iconClass: "text-amber-700",
    group: "workspace",
    resource: "integrations",
    planFeature: "integrations",
  },
  {
    href: "/dashboard/phone-numbers",
    label: "Phone Numbers",
    icon: Phone,
    iconClass: "text-indigo-700",
    group: "workspace",
    resource: "phone_numbers",
    planFeature: "phone_numbers",
  },
  {
    href: "/dashboard/billing",
    label: "Billing",
    icon: CreditCard,
    iconClass: "text-emerald-700",
    group: "account",
    resource: "billing",
    planFeature: "billing",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
    iconClass: "text-zinc-600",
    group: "account",
    resource: "settings",
    planFeature: "settings",
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function filterNavForRole(
  role: UserRole | string,
  flags: Partial<Record<FeatureFlagKey, boolean>> = DEFAULT_FEATURE_FLAGS,
  planKey: PlanKey = "starter",
): DashboardNavItem[] {
  return DASHBOARD_NAV.filter((item) => {
    if (item.flag && flags[item.flag] === false) return false;
    if (item.planFeature && !planHasFeature(planKey, item.planFeature)) return false;
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
