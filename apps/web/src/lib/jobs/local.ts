import { runJob } from "./handlers";
import type { JobsProvider, JobName, JobPayload } from "./types";

/**
 * Local jobs provider — schedules work on the next tick so webhook handlers can return quickly.
 * Not durable across process restarts (Phase G). Swap for a queue later via JOBS_PROVIDER.
 */
export const localJobsProvider: JobsProvider = {
  name: "local",

  async enqueue(name, payload) {
    const jobId = `job_${crypto.randomUUID().slice(0, 12)}`;
    queueMicrotask(() => {
      void runJob(name as JobName, payload as JobPayload[JobName]).catch((err) => {
        console.error(`[jobs:local] ${name} failed`, err);
      });
    });
    return { jobId };
  },
};
