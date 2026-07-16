"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AddPhoneNumberButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/phone-numbers", { method: "POST" });
          router.refresh();
        });
      }}
    >
      {pending ? "Provisioning…" : "+ Add Phone Number"}
    </Button>
  );
}
