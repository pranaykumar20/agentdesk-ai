import { upsertCallFromRetellEvent, upsertCallFromVapiEvent } from "@/modules/calls/write";
import type { JobName, JobPayload } from "./types";

export async function runJob<T extends JobName>(name: T, payload: JobPayload[T]): Promise<void> {
  switch (name) {
    case "process_retell_call_ended":
    case "process_retell_call_analyzed": {
      const p = payload as JobPayload["process_retell_call_ended"];
      await upsertCallFromRetellEvent(p.raw);
      return;
    }
    case "process_vapi_status_update":
    case "process_vapi_end_of_call": {
      const p = payload as JobPayload["process_vapi_status_update"];
      await upsertCallFromVapiEvent(p.raw);
      return;
    }
    case "process_twilio_status": {
      // Telephony status is logged via webhook_events; voice sync is provider-primary.
      return;
    }
    default:
      return;
  }
}
