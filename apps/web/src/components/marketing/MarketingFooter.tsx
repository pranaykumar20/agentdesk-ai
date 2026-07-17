import Link from "next/link";
import { BrandMark } from "./BrandMark";
import { FOOTER_COLUMNS } from "@/content/marketing/navigation";

export function MarketingFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(5,1fr)]">
          <div>
            <BrandMark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AgentDesk AI is an AI Workforce Operating System for businesses—create, train, deploy,
              and manage AI employees across phone, SMS, WhatsApp, chat, and CRM.
            </p>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-success" aria-hidden />
              All systems operational
            </p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-foreground">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={`${col.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} AgentDesk AI. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/security#privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/security#terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/security" className="hover:text-foreground">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
