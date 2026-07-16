import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AnalyticsRange } from "@/modules/analytics/types";

export function ExportAnalyticsButton({ range }: { range: AnalyticsRange }) {
  return (
    <a
      href={`/api/analytics/export?range=${range}`}
      className={cn(buttonVariants({ variant: "outline" }))}
    >
      Export CSV
    </a>
  );
}
