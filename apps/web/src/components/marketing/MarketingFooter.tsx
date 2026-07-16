import Link from "next/link";
import { BrandMark } from "./BrandMark";

const FOOTER_COLS = [
  {
    title: "Product",
    links: [
      { href: "/features", label: "Features" },
      { href: "/industries", label: "Industries" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Start free trial" },
      { href: "/solutions", label: "Solutions" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/audit", label: "Free audit" },
      { href: "/pricing#faq", label: "Pricing FAQ" },
    ],
  },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-1">
            <BrandMark />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              AI receptionist for every business — answers calls, books appointments, and captures
              leads 24/7.
            </p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-foreground">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-12 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} AgentDesk AI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
