import { localJobsProvider } from "./local";
import type { JobsProvider } from "./types";

export type * from "./types";
export { runJob } from "./handlers";

export function getJobsProvider(): JobsProvider {
  const mode = process.env.JOBS_PROVIDER?.trim() || "local";
  if (mode === "local") return localJobsProvider;
  return localJobsProvider;
}
