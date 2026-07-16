import { getTelephonyProvider } from "@/lib/providers";
import { addDemoNumber, getDemoNumbers, setDemoNumbers } from "./demo-data";
import type { PhoneNumberItem, PhoneNumberStatus } from "./types";

export async function listPhoneNumbers(organizationId: string): Promise<PhoneNumberItem[]> {
  return getDemoNumbers(organizationId);
}

export async function getPhoneMetrics(organizationId: string) {
  const numbers = await listPhoneNumbers(organizationId);
  return {
    total: numbers.length,
    active: numbers.filter((n) => n.status === "active").length,
    inUse: numbers.filter((n) => n.status === "in_use").length,
    forwarding: numbers.filter((n) => n.status === "forwarding").length,
    unavailable: numbers.filter((n) => n.status === "unavailable").length,
  };
}

export async function provisionPhoneNumber(organizationId: string): Promise<PhoneNumberItem> {
  const telephony = getTelephonyProvider();
  const provisioned = await telephony.provisionNumber({ organizationId, areaCode: "513" });
  const item: PhoneNumberItem = {
    id: `pn-${crypto.randomUUID().slice(0, 8)}`,
    organizationId,
    e164: provisioned.e164,
    friendlyName: "New Number",
    numberType: "local",
    provider: telephony.name,
    assignedTo: "Smile Assistant (AI Agent)",
    location: "Cincinnati, OH",
    status: "active",
    callsLast30Days: 0,
    callsTrendPct: 0,
    lastActivityAt: new Date().toISOString(),
  };
  addDemoNumber(item);
  return item;
}

export async function updatePhoneNumber(
  organizationId: string,
  id: string,
  patch: { friendlyName?: string; status?: PhoneNumberStatus; assignedTo?: string },
): Promise<PhoneNumberItem | null> {
  const numbers = await listPhoneNumbers(organizationId);
  const next = numbers.map((n) => (n.id === id ? { ...n, ...patch } : n));
  setDemoNumbers(organizationId, next);
  return next.find((n) => n.id === id) ?? null;
}
