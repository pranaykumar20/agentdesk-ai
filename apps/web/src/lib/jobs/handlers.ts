import { upsertCallFromRetellEvent } from "@/modules/calls/write";
import type { JobName, JobPayload } from "./types";

export async function runJob<T extends JobName>(name: T, payload: JobPayload[T]): Promise<void> {
  switch (name) {
    case "process_retell_call_ended":
    case "process_retell_call_analyzed": {
      const p = payload as JobPayload["process_retell_call_ended"];
      await upsertCallFromRetellEvent(p.raw);
      return;
    }
    case "process_twilio_status": {
      // Telephony status is logged via webhook_events; call sync is Retell-primary in Phase G.
      return;
    }
    default:
      return;
  }
}
