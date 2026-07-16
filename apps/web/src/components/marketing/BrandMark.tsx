import Link from "next/link";
import { AudioLines } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-bold tracking-tight", className)}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <AudioLines className="h-4 w-4" aria-hidden />
      </span>
      <span className="text-foreground">
        AgentDesk <span className="text-primary">AI</span>
      </span>
    </Link>
  );
}
