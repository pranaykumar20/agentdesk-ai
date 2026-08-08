"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { OnboardingProgress } from "@/modules/onboarding/data";

export function GoLiveWizard({
  initialProgress,
  organizationName,
}: {
  initialProgress: OnboardingProgress;
  organizationName: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(Math.max(2, initialProgress.currentStep));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hours, setHours] = useState(
    "Mon–Fri 9am–9pm\nSat 10am–8pm\nSun closed",
  );
  const [faqQ, setFaqQ] = useState("What are your hours?");
  const [faqA, setFaqA] = useState("We're open Monday through Saturday; closed Sunday.");
  const [agentName, setAgentName] = useState("Ava Receptionist");
  const [roleTitle, setRoleTitle] = useState("Receptionist");
  const [areaCode, setAreaCode] = useState("513");
  const [phoneE164, setPhoneE164] = useState<string | null>(
    typeof initialProgress.data.e164 === "string" ? initialProgress.data.e164 : null,
  );
  const [testPhone, setTestPhone] = useState("");

  async function postStep(payload: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/onboarding/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as {
        error?: string;
        number?: { e164?: string };
        done?: boolean;
      };
      if (!res.ok) throw new Error(data.error ?? "Request failed");
      if (data.number?.e164) setPhoneE164(data.number.e164);
      if (data.done) {
        router.push("/dashboard");
        router.refresh();
        return;
      }
      setStep((s) => Math.min(5, s + 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Step {step} of 5 · {organizationName}
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">Launch your AI receptionist</h1>
      </div>

      {step === 2 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hours">Business hours</Label>
            <Textarea
              id="hours"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faqQ">Sample FAQ question</Label>
            <Input id="faqQ" value={faqQ} onChange={(e) => setFaqQ(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="faqA">Sample FAQ answer</Label>
            <Textarea id="faqA" value={faqA} onChange={(e) => setFaqA(e.target.value)} rows={3} />
          </div>
          <Button
            disabled={busy}
            onClick={() =>
              void postStep({
                step: 2,
                hours,
                faqs: [{ question: faqQ, answer: faqA }],
              })
            }
          >
            Continue
          </Button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="agentName">AI employee name</Label>
            <Input
              id="agentName"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roleTitle">Role</Label>
            <Input
              id="roleTitle"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
            />
          </div>
          <Button
            disabled={busy}
            onClick={() =>
              void postStep({
                step: 3,
                name: agentName,
                roleTitle,
              })
            }
          >
            Create & publish
          </Button>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Provision a Retell phone number bound to your AI employee. Callers who dial this number
            reach your AI receptionist.
          </p>
          <div className="space-y-2">
            <Label htmlFor="areaCode">Preferred area code</Label>
            <Input
              id="areaCode"
              value={areaCode}
              onChange={(e) => setAreaCode(e.target.value)}
            />
          </div>
          <Button
            disabled={busy}
            onClick={() => void postStep({ step: 4, areaCode })}
          >
            Provision number
          </Button>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-4">
          {phoneE164 ? (
            <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
              Your AI number: <span className="font-semibold">{phoneE164}</span>
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Optionally place a test call to your phone, or finish and call the number yourself.
          </p>
          <div className="space-y-2">
            <Label htmlFor="testPhone">Your mobile (E.164)</Label>
            <Input
              id="testPhone"
              placeholder="+15551234567"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={busy || !testPhone.trim()}
              onClick={() =>
                void postStep({
                  step: 5,
                  testPhone: testPhone.trim(),
                  skipTestCall: false,
                })
              }
            >
              Place test call & finish
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() => void postStep({ step: 5, skipTestCall: true })}
            >
              Finish without test call
            </Button>
          </div>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
