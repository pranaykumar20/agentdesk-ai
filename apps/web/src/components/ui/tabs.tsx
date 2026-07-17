import Link from "next/link";
import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
  href: string;
  count?: number | string;
};

export function Tabs({
  items,
  activeId,
  className,
}: {
  items: TabItem[];
  activeId: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-1 rounded-xl border border-border bg-card p-1 shadow-sm",
        className,
      )}
      role="tablist"
    >
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <Link
            key={item.id}
            href={item.href}
            role="tab"
            aria-selected={active}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
            {item.count != null ? (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
                  active ? "bg-white/20 text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}
