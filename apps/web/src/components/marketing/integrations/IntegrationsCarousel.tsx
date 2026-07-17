"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FEATURED_INTEGRATIONS } from "@/content/marketing/integrations";
import { IntegrationLogo } from "@/components/marketing/integrations/IntegrationLogo";
import { cn } from "@/lib/utils";

export function IntegrationsCarousel() {
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateNav = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateNav();
    el.addEventListener("scroll", updateNav, { passive: true });
    window.addEventListener("resize", updateNav);
    return () => {
      el.removeEventListener("scroll", updateNav);
      window.removeEventListener("resize", updateNav);
    };
  }, [updateNav]);

  const scrollByCard = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const amount = card ? card.getBoundingClientRect().width + 16 : 200;
    el.scrollBy({ left: direction * amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Previous integrations"
        onClick={() => scrollByCard(-1)}
        disabled={!canPrev}
        className={cn(
          "absolute -left-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-opacity md:flex lg:-left-4",
          !canPrev && "pointer-events-none opacity-40",
        )}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Next integrations"
        onClick={() => scrollByCard(1)}
        disabled={!canNext}
        className={cn(
          "absolute -right-2 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-opacity md:flex lg:-right-4",
          !canNext && "pointer-events-none opacity-40",
        )}
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>

      <ul
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="Featured integrations"
      >
        {FEATURED_INTEGRATIONS.map((item) => (
          <li
            key={item.id}
            className="w-[168px] shrink-0 snap-start sm:w-[180px]"
          >
            <article className="marketing-card flex h-full flex-col items-center rounded-2xl border border-border/80 bg-card px-4 py-6 text-center shadow-[0_8px_30px_-18px_rgba(15,23,42,0.25)]">
              <IntegrationLogo id={item.id} title={item.name} variant="circle" />
              <h3 className="mt-4 text-base font-semibold text-foreground">{item.name}</h3>
              <p className="mt-1.5 text-sm leading-snug text-muted-foreground">
                {item.description}
              </p>
            </article>
          </li>
        ))}
      </ul>
    </div>
  );
}
