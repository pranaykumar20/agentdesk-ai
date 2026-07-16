export function PhoneHeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-8 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(92,78,229,0.25),transparent_55%)]" />
      <div className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 shadow-2xl shadow-primary/20">
        <div className="flex items-center justify-between px-5 pt-5 text-xs text-slate-400">
          <span>9:41</span>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-400">Live</span>
        </div>
        <div className="px-6 pb-8 pt-6 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-violet-300">
            AI Receptionist Speaking…
          </p>
          <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-violet-500/20 ring-1 ring-violet-400/40">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-500 text-lg font-bold text-white">
              AI
            </div>
          </div>
          <div className="mx-auto mt-6 max-w-[240px] rounded-2xl bg-slate-900 px-4 py-3 text-left text-sm leading-relaxed text-slate-100 ring-1 ring-white/10">
            Hi! Thanks for calling Smile Dental Care. How can I help you today?
          </div>
          <div className="mx-auto mt-8 flex h-10 items-end justify-center gap-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className="w-1.5 rounded-full bg-violet-400"
                style={{
                  height: `${10 + ((i * 7) % 22)}px`,
                  animation: `pulse-bar 1.2s ease-in-out ${i * 0.05}s infinite`,
                }}
              />
            ))}
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="h-11 w-11 rounded-full bg-slate-800" />
            <span className="h-14 w-14 rounded-full bg-rose-500" />
            <span className="h-11 w-11 rounded-full bg-slate-800" />
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse-bar {
          0%, 100% { transform: scaleY(0.55); opacity: 0.65; }
          50% { transform: scaleY(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
