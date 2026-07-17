/** Shared accent tones for marketing feature / industry icons. */
export type IconTone = {
  icon: string;
  bg: string;
};

export const ICON_TONES = {
  violet: { icon: "text-violet-600", bg: "bg-violet-50" },
  indigo: { icon: "text-indigo-600", bg: "bg-indigo-50" },
  sky: { icon: "text-sky-600", bg: "bg-sky-50" },
  teal: { icon: "text-teal-600", bg: "bg-teal-50" },
  emerald: { icon: "text-emerald-600", bg: "bg-emerald-50" },
  amber: { icon: "text-amber-600", bg: "bg-amber-50" },
  orange: { icon: "text-orange-600", bg: "bg-orange-50" },
  rose: { icon: "text-rose-600", bg: "bg-rose-50" },
  pink: { icon: "text-pink-600", bg: "bg-pink-50" },
  blue: { icon: "text-blue-600", bg: "bg-blue-50" },
  cyan: { icon: "text-cyan-600", bg: "bg-cyan-50" },
  slate: { icon: "text-slate-600", bg: "bg-slate-100" },
} as const satisfies Record<string, IconTone>;

export type IconToneKey = keyof typeof ICON_TONES;

export function iconTone(key: IconToneKey): IconTone {
  return ICON_TONES[key];
}
