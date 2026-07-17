import { INTEGRATIONS } from "@/content/marketing/integrations";
import { IntegrationLogo } from "@/components/marketing/integrations/IntegrationLogo";
import { cn } from "@/lib/utils";

export function IntegrationsGrid({
  className,
  columns = "home",
}: {
  className?: string;
  columns?: "home" | "page";
}) {
  return (
    <ul
      className={cn(
        "grid gap-3",
        columns === "home" && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4",
        columns === "page" && "sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {INTEGRATIONS.map((item) => (
        <li
          key={item.id}
          className="marketing-card flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-4 shadow-sm"
        >
          <IntegrationLogo id={item.id} title={item.name} />
          <div className="min-w-0 text-left">
            <p className="truncate text-sm font-semibold text-foreground">{item.name}</p>
            <p className="text-xs text-muted-foreground">{item.category}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
