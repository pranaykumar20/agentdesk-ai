import { describe, expect, it } from "vitest";
import {
  buildRoleSystemPrompt,
  defaultGreetingForRole,
  KNOWLEDGE_SECTION_MARKER,
} from "./role-templates";

describe("role templates", () => {
  it("builds a Receptionist training prompt with identity and Knowledge Base section", () => {
    const prompt = buildRoleSystemPrompt({
      agentName: "Ava",
      businessName: "Tikka House",
      roleTitle: "Receptionist",
      tone: "Friendly professional",
    });
    expect(prompt).toContain("You are Ava");
    expect(prompt).toContain("Tikka House");
    expect(prompt).toContain("## Guardrails");
    expect(prompt).toContain(KNOWLEDGE_SECTION_MARKER);
  });

  it("uses appointment-style greeting for Appointment Setter", () => {
    const greeting = defaultGreetingForRole({
      agentName: "Riley",
      businessName: "Wellness Partners",
      roleTitle: "Appointment Setter",
    });
    expect(greeting).toContain("scheduling assistant");
    expect(greeting).toContain("Riley");
  });
});
