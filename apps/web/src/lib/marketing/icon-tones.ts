/** Shared accent tones for marketing feature / industry icons. */
export type IconTone = {
  icon: string;
  bg: string;
  border: string;
  softBorder: string;
  softBg: string;
};

export const ICON_TONES = {
  violet: {
    icon: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    softBorder: "hover:border-violet-300",
    softBg: "bg-violet-50/80",
  },
  indigo: {
    icon: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    softBorder: "hover:border-indigo-300",
    softBg: "bg-indigo-50/80",
  },
  sky: {
    icon: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
    softBorder: "hover:border-sky-300",
    softBg: "bg-sky-50/80",
  },
  teal: {
    icon: "text-teal-600",
    bg: "bg-teal-50",
    border: "border-teal-200",
    softBorder: "hover:border-teal-300",
    softBg: "bg-teal-50/80",
  },
  emerald: {
    icon: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    softBorder: "hover:border-emerald-300",
    softBg: "bg-emerald-50/80",
  },
  amber: {
    icon: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    softBorder: "hover:border-amber-300",
    softBg: "bg-amber-50/80",
  },
  orange: {
    icon: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    softBorder: "hover:border-orange-300",
    softBg: "bg-orange-50/80",
  },
  rose: {
    icon: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    softBorder: "hover:border-rose-300",
    softBg: "bg-rose-50/80",
  },
  pink: {
    icon: "text-pink-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    softBorder: "hover:border-pink-300",
    softBg: "bg-pink-50/80",
  },
  blue: {
    icon: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    softBorder: "hover:border-blue-300",
    softBg: "bg-blue-50/80",
  },
  cyan: {
    icon: "text-cyan-600",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    softBorder: "hover:border-cyan-300",
    softBg: "bg-cyan-50/80",
  },
  slate: {
    icon: "text-slate-600",
    bg: "bg-slate-100",
    border: "border-slate-200",
    softBorder: "hover:border-slate-300",
    softBg: "bg-slate-50",
  },
} as const satisfies Record<string, IconTone>;

export type IconToneKey = keyof typeof ICON_TONES;

export function iconTone(key: IconToneKey): IconTone {
  return ICON_TONES[key];
}
