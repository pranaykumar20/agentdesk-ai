import Image from "next/image";

export function HeroProductDemo() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div
        className="pointer-events-none absolute -inset-4 rounded-[2rem] bg-primary/10 blur-2xl md:-inset-6"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_24px_64px_-24px_rgba(92,78,229,0.35)] ring-1 ring-black/5">
        <Image
          src="/marketing/hero-live-conversation.png"
          alt="AgentDesk AI live conversation — Ava, an AI receptionist, books a dental cleaning appointment while the call is in progress"
          width={1200}
          height={900}
          priority
          className="h-auto w-full"
          sizes="(max-width: 1024px) 100vw, 560px"
        />
      </div>
    </div>
  );
}
