export type JobName =
  | "process_retell_call_ended"
  | "process_retell_call_analyzed"
  | "process_vapi_status_update"
  | "process_vapi_end_of_call"
  | "process_twilio_status";

export type JobPayload = {
  process_retell_call_ended: { callId: string; raw: unknown };
  process_retell_call_analyzed: { callId: string; raw: unknown };
  process_vapi_status_update: { callId: string; raw: unknown };
  process_vapi_end_of_call: { callId: string; raw: unknown };
  process_twilio_status: { callSid: string; status: string; raw: unknown };
};

export interface JobsProvider {
  readonly name: string;
  enqueue<T extends JobName>(name: T, payload: JobPayload[T]): Promise<{ jobId: string }>;
}
