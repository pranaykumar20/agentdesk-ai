import { Industry, PlaybookType, prisma } from "./index.js";
import { ALL_PLAYBOOK_TEMPLATES } from "@ai-voice-leads/shared";

async function main() {
  const demoOrg = await prisma.organization.upsert({
    where: { slug: "demo-restaurant" },
    update: {},
    create: {
      name: "Demo Pizza House",
      slug: "demo-restaurant",
      clerkId: "demo_clerk_org",
      onboardingStep: 5,
      members: {
        create: { clerkId: "demo_clerk_user", email: "owner@demo-pizza.com", role: "owner" },
      },
      profile: {
        create: {
          industry: Industry.RESTAURANT,
          timezone: "America/New_York",
          greeting:
            "Hello, thank you for calling Demo Pizza House. This call may be recorded for quality purposes.",
          hours: {
            mon: { open: "11:00", close: "22:00" },
            tue: { open: "11:00", close: "22:00" },
            wed: { open: "11:00", close: "22:00" },
            thu: { open: "11:00", close: "22:00" },
            fri: { open: "11:00", close: "23:00" },
            sat: { open: "11:00", close: "23:00" },
            sun: { open: "12:00", close: "21:00" },
          },
          menuOrServices: [
            { name: "Margherita Pizza", price: 14 },
            { name: "Pepperoni Pizza", price: 16 },
            { name: "Caesar Salad", price: 9 },
            { name: "Garlic Bread", price: 6 },
          ],
          preferredChannels: ["voice", "sms"],
          notifyEmail: "owner@demo-pizza.com",
        },
      },
      playbooks: {
        create: ALL_PLAYBOOK_TEMPLATES.map((template) => ({
          type: template.type as PlaybookType,
          name: template.name,
          systemPrompt: template.systemPrompt,
          fieldsToCollect: template.fieldsToCollect,
          isActive: template.type === "RESTAURANT",
        })),
      },
      landingPages: {
        create: { vertical: "RESTAURANT", published: true },
      },
    },
    include: { profile: true, playbooks: true },
  });

  const existingSeq = await prisma.sequence.findFirst({
    where: { orgId: demoOrg.id, trigger: "FORM_SUBMIT" },
  });

  if (!existingSeq) {
    await prisma.sequence.create({
      data: {
        orgId: demoOrg.id,
        name: "Default form follow-up",
        trigger: "FORM_SUBMIT",
        steps: [
          { channel: "SMS", delaySec: 0, template: "lead_welcome" },
          { channel: "VOICE", delaySec: 5, template: "outbound_call" },
        ],
        isActive: true,
      },
    });
  }

  console.log("Seeded demo organization:", demoOrg.id, demoOrg.slug);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
