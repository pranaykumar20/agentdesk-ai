"use client";

import { WIZARD_STEPS } from "./types";

export function WizardSteps({
  step,
  maxReachable,
  onSelect,
}: {
  step: number;
  /** Highest step the user may jump to (usually completed+1 or current). */
  maxReachable: number;
  onSelect?: (step: number) => void;
}) {
  return (
    <ol className="mb-6 flex flex-wrap gap-2">
      {WIZARD_STEPS.map((s) => {
        const active = step === s.id;
        const done = step > s.id;
        const reachable = s.id <= maxReachable;
        const clickable = Boolean(onSelect) && reachable && !active;
        return (
          <li key={s.id}>
            <button
              type="button"
              disabled={!clickable}
              onClick={() => onSelect?.(s.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : done
                    ? "bg-muted text-foreground hover:bg-muted/80"
                    : reachable
                      ? "bg-muted/70 text-muted-foreground hover:bg-muted"
                      : "cursor-not-allowed bg-muted/40 text-muted-foreground/70"
              }`}
            >
              {s.id}. {s.label}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
