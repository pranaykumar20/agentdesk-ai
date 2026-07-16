import Link from "next/link";
import { PageHeader } from "./PageHeader";
import { EmptyState } from "./EmptyState";

export function ComingSoonPage({
  title,
  description,
  phaseHint,
}: {
  title: string;
  description: string;
  phaseHint: string;
}) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState
        title={`${title} is next`}
        description={`${phaseHint} This shell is ready — data views land in the upcoming implementation phases.`}
        action={
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted"
          >
            Back to dashboard
          </Link>
        }
      />
    </div>
  );
}
