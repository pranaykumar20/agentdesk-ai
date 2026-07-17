import type { AvaCitation } from "./types";

export type { AvaCitation };

export function mergeCitations(list: AvaCitation[]): AvaCitation[] {
  const seen = new Set<string>();
  const out: AvaCitation[] = [];
  for (const item of list) {
    const key = `${item.path}::${item.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function citationsForPathname(pathname: string | null | undefined): AvaCitation[] {
  if (!pathname?.startsWith("/dashboard")) return [];
  const label =
    pathname === "/dashboard"
      ? "Dashboard"
      : pathname
          .replace("/dashboard/", "")
          .split("/")[0]
          ?.replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()) || "Dashboard";
  return [{ label, path: pathname }];
}
