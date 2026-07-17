import { FEATURED_INTEGRATIONS } from "@/content/marketing/integrations";
import { IntegrationLogo } from "@/components/marketing/integrations/IntegrationLogo";

function MarqueeRow({ suffix }: { suffix: string }) {
  return (
    <>
      {FEATURED_INTEGRATIONS.map((item) => (
        <li
          key={`${suffix}-${item.id}`}
          className="mx-5 flex shrink-0 items-center gap-2.5 whitespace-nowrap sm:mx-8"
        >
          <IntegrationLogo id={item.id} title={item.name} variant="plain" />
          <span className="text-sm font-semibold tracking-tight text-foreground/80">
            {item.name}
          </span>
        </li>
      ))}
    </>
  );
}

export function IntegrationsMarquee() {
  return (
    <div
      className="relative overflow-hidden border-y border-border/70 bg-background/60 py-4"
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent sm:w-20" />
      <ul className="integrations-marquee flex w-max items-center">
        <MarqueeRow suffix="a" />
        <MarqueeRow suffix="b" />
      </ul>
    </div>
  );
}
