import { cn } from "@/lib/utils";

export function ProductScreenshotFrame({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" aria-hidden />
        {title ? (
          <span className="ml-2 truncate text-xs font-medium text-muted-foreground">{title}</span>
        ) : null}
      </div>
      <div className="p-4 md:p-5">{children}</div>
    </div>
  );
}
