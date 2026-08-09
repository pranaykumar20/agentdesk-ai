import { WIZARD_STEPS } from "./types";

export function WizardSteps({ step }: { step: number }) {
  return (
    <ol className="mb-6 flex flex-wrap gap-2">
      {WIZARD_STEPS.map((s) => {
        const active = step === s.id;
        const done = step > s.id;
        return (
          <li
            key={s.id}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              active
                ? "bg-primary text-primary-foreground"
                : done
                  ? "bg-muted text-foreground"
                  : "bg-muted/50 text-muted-foreground"
            }`}
          >
            {s.id}. {s.label}
          </li>
        );
      })}
    </ol>
  );
}
