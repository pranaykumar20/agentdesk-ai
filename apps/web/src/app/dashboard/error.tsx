"use client";

import { ErrorState } from "@/components/layout/ErrorState";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Dashboard error"
      description="Something went wrong while loading this section."
      onRetry={reset}
    />
  );
}
