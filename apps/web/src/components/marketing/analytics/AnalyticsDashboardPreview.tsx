import Image from "next/image";
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Phone,
  Settings,
  Users,
  Plug,
  UserRound,
} from "lucide-react";

const NAV = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Calls", icon: Phone },
  { label: "Appointments", icon: CalendarDays },
  { label: "Leads", icon: Users },
  { label: "AI Employees", icon: UserRound },
  { label: "Analytics", icon: BarChart3, active: true },
  { label: "Integrations", icon: Plug },
  { label: "Settings", icon: Settings },
];

const KPIS = [
  { label: "Calls Handled", value: "2,847", change: "+24.8%", accent: "bg-violet-50 text-violet-600" },
  { label: "Appointments Booked", value: "156", change: "+32.1%", accent: "bg-indigo-50 text-indigo-600" },
  { label: "Leads Captured", value: "423", change: "+18.7%", accent: "bg-sky-50 text-sky-600" },
  { label: "Revenue Generated", value: "$28,540", change: "+27.4%", accent: "bg-emerald-50 text-emerald-600" },
];

const TOP_EMPLOYEES = [
  { name: "AI Receptionist", calls: "842 calls", avatar: "/marketing/avatars/ai-receptionist-v2.jpg" },
  { name: "AI Sales Agent", calls: "618 calls", avatar: "/marketing/avatars/ai-sales-v2.jpg" },
  { name: "AI Support Agent", calls: "497 calls", avatar: "/marketing/avatars/ai-support-v2.jpg" },
];

function Sparkline({
  color,
  points,
}: {
  color: string;
  points: string;
}) {
  return (
    <svg viewBox="0 0 160 56" className="mt-2 h-14 w-full" aria-hidden>
      <polyline
        fill="none"
        stroke="#CBD5E1"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        points="0,40 26,36 52,38 78,30 104,32 130,24 160,28"
      />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export function AnalyticsDashboardPreview() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_28px_70px_-32px_rgba(92,78,229,0.45)] ring-1 ring-black/5"
      aria-label="Example analytics dashboard preview"
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" aria-hidden />
        <span className="ml-2 truncate text-[11px] font-medium text-muted-foreground">
          app.agentdesk.ai / analytics
        </span>
      </div>

      <div className="grid min-h-[340px] grid-cols-[112px_1fr] sm:grid-cols-[132px_1fr]">
        <aside className="border-r border-border bg-slate-50/80 px-2 py-3">
          <p className="px-2 text-[11px] font-bold tracking-tight text-foreground">
            AgentDesk <span className="text-primary">AI</span>
          </p>
          <nav className="mt-3 space-y-0.5" aria-label="Preview navigation">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className={
                    item.active
                      ? "flex items-center gap-2 rounded-lg bg-primary/10 px-2 py-1.5 text-[11px] font-semibold text-primary"
                      : "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-muted-foreground"
                  }
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
          </nav>
        </aside>

        <div className="bg-background p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">Analytics Overview</p>
              <p className="text-[11px] text-muted-foreground">May 12 – May 18, 2024</p>
            </div>
            <span className="rounded-md border border-border bg-card px-2 py-1 text-[10px] font-medium text-muted-foreground">
              Filters
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 xl:grid-cols-4">
            {KPIS.map((kpi) => (
              <div key={kpi.label} className="rounded-lg border border-border bg-card px-2.5 py-2">
                <p className="truncate text-[10px] text-muted-foreground">{kpi.label}</p>
                <p className="mt-0.5 text-sm font-bold text-foreground">{kpi.value}</p>
                <p className="text-[10px] font-medium text-emerald-600">{kpi.change}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-card px-2.5 py-2">
              <p className="text-[11px] font-semibold text-foreground">Calls Handled</p>
              <Sparkline color="#5c4ee5" points="0,42 26,34 52,36 78,22 104,26 130,14 160,18" />
            </div>
            <div className="rounded-lg border border-border bg-card px-2.5 py-2">
              <p className="text-[11px] font-semibold text-foreground">Revenue Generated</p>
              <Sparkline color="#10b981" points="0,44 26,40 52,34 78,28 104,24 130,16 160,12" />
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-border bg-card px-2.5 py-2 sm:col-span-1">
              <p className="text-[11px] font-semibold text-foreground">Top AI Employees</p>
              <ul className="mt-2 space-y-1.5">
                {TOP_EMPLOYEES.map((employee) => (
                  <li key={employee.name} className="flex items-center gap-2">
                    <Image
                      src={employee.avatar}
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-medium text-foreground">
                        {employee.name}
                      </p>
                      <p className="text-[9px] text-muted-foreground">{employee.calls}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-card px-2.5 py-2">
              <p className="text-[11px] font-semibold text-foreground">Call Outcomes</p>
              <div className="mt-2 flex items-center gap-3">
                <svg viewBox="0 0 36 36" className="h-12 w-12 shrink-0" aria-hidden>
                  <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#5c4ee5"
                    strokeWidth="5"
                    strokeDasharray="55 88"
                    strokeLinecap="round"
                    transform="rotate(-90 18 18)"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="5"
                    strokeDasharray="22 88"
                    strokeDashoffset="-55"
                    transform="rotate(-90 18 18)"
                  />
                </svg>
                <ul className="space-y-0.5 text-[9px] text-muted-foreground">
                  <li>Answered 62%</li>
                  <li>Booked 25%</li>
                  <li>Other 13%</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card px-2.5 py-2">
              <p className="text-[11px] font-semibold text-foreground">ROI Summary</p>
              <dl className="mt-2 space-y-1 text-[10px]">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Time Saved</dt>
                  <dd className="font-medium text-foreground">98 hrs</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Cost Saved</dt>
                  <dd className="font-medium text-foreground">$12,850</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Revenue Impact</dt>
                  <dd className="font-medium text-foreground">$28,540</dd>
                </div>
                <div className="flex justify-between gap-2 border-t border-border pt-1">
                  <dt className="font-semibold text-foreground">ROI</dt>
                  <dd className="font-bold text-emerald-600">312%</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
