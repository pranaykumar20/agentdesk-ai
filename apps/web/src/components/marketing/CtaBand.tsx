import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaBand({
  title = "Ready to transform how your business handles calls?",
  description = "Join thousands of businesses using AgentDesk AI.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="border-t border-border bg-[linear-gradient(180deg,#eef2ff_0%,#f9fafb_100%)]">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start Free Trial
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/audit"
            className="inline-flex h-11 items-center rounded-lg border border-border bg-card px-6 text-sm font-medium text-foreground hover:bg-muted"
          >
            Book a Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
