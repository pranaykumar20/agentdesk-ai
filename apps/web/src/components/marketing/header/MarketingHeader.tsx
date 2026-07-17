"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { BrandMark } from "@/components/marketing/BrandMark";
import { AnnouncementBar } from "@/components/marketing/header/AnnouncementBar";
import { NavDropdown } from "@/components/marketing/header/NavDropdown";
import { MARKETING_NAV } from "@/content/marketing/navigation";
import { track } from "@/lib/analytics/track";
import { cn } from "@/lib/utils";

export function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-50 border-b border-border/80 bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:gap-8">
          <div className="shrink-0">
            <BrandMark />
          </div>

          <nav
            className="hidden flex-1 items-center justify-center gap-1 xl:gap-2 lg:flex"
            aria-label="Primary"
          >
            {MARKETING_NAV.map((group) =>
              group.items ? (
                <NavDropdown key={group.id} label={group.label} items={group.items} />
              ) : (
                <Link
                  key={group.id}
                  href={group.href ?? "/"}
                  className={cn(
                    "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    pathname === group.href
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                  onClick={() => {
                    if (group.href?.includes("pricing")) track("navigation_pricing_clicked");
                  }}
                >
                  {group.label}
                </Link>
              ),
            )}
          </nav>

          <div className="ml-auto hidden shrink-0 items-center gap-2 lg:flex">
            <Link
              href="/login"
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg px-3 text-sm font-medium leading-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Log in
            </Link>
            <Link
              href="/audit"
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg border border-border bg-card px-3 text-sm font-medium leading-none text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Book a demo
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-lg bg-primary px-3.5 text-sm font-medium leading-none text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => track("signup_started", { source: "header" })}
            >
              Start free trial
            </Link>
          </div>

          <button
            type="button"
            className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>

        {open ? (
          <div
            id="mobile-nav"
            className="border-t border-border bg-card lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <nav
              className="mx-auto max-h-[calc(100vh-8rem)] max-w-7xl space-y-4 overflow-y-auto px-4 py-4 sm:px-6"
              aria-label="Mobile"
            >
              {MARKETING_NAV.map((group) => (
                <div key={group.id}>
                  {group.href && !group.items ? (
                    <Link
                      href={group.href}
                      className="block rounded-lg px-2 py-2 text-sm font-semibold text-foreground"
                      onClick={() => setOpen(false)}
                    >
                      {group.label}
                    </Link>
                  ) : (
                    <>
                      <p className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {group.label}
                      </p>
                      <ul className="mt-1 space-y-1">
                        {(group.items ?? []).map((item) => (
                          <li key={item.label}>
                            <Link
                              href={item.href}
                              className="block rounded-lg px-2 py-2 text-sm text-foreground hover:bg-muted"
                              onClick={() => setOpen(false)}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ))}
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                <Link
                  href="/login"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border px-4 text-sm font-medium leading-none"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/audit"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg border border-border px-4 text-sm font-medium leading-none"
                  onClick={() => setOpen(false)}
                >
                  Book a demo
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium leading-none text-primary-foreground"
                  onClick={() => setOpen(false)}
                >
                  Start free trial
                </Link>
              </div>
            </nav>
          </div>
        ) : null}
      </header>
    </>
  );
}
