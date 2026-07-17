const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"] as const;

/**
 * Append known campaign params from the current URL onto a destination path.
 * Safe on the server (returns path unchanged).
 */
export function withUtm(path: string, search?: string | URLSearchParams | null): string {
  if (!search) {
    if (typeof window === "undefined") return path;
    search = window.location.search;
  }

  const params = typeof search === "string" ? new URLSearchParams(search) : search;
  const next = new URLSearchParams();
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) next.set(key, value);
  }
  if ([...next.keys()].length === 0) return path;

  const [base, hash] = path.split("#");
  const joiner = base.includes("?") ? "&" : "?";
  const withQuery = `${base}${joiner}${next.toString()}`;
  return hash ? `${withQuery}#${hash}` : withQuery;
}
