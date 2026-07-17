export type FaqItem = {
  question: string;
  answer: string;
};

export const HOMEPAGE_FAQ: FaqItem[] = [
  {
    question: "What is an AI employee?",
    answer:
      "An AI employee is a configured digital teammate that handles customer conversations and business tasks—such as answering calls, qualifying leads, booking appointments, or resolving common support questions—using your knowledge, workflows, and escalation rules.",
  },
  {
    question: "Can AgentDesk AI answer my current business phone number?",
    answer:
      "Yes. You can forward or connect your existing business numbers, or provision new numbers in the platform and route traffic to the right AI employee or queue.",
  },
  {
    question: "Can it transfer calls to real employees?",
    answer:
      "Yes. Configure department routing, confidence thresholds, and escalation rules so the AI transfers or creates callbacks when a human should take over.",
  },
  {
    question: "Can it book appointments?",
    answer:
      "Yes. AI appointment setters can check availability, schedule or reschedule visits, and send confirmation follow-ups when calendar integrations are connected.",
  },
  {
    question: "Does it support multiple locations?",
    answer:
      "Yes. Multi-location businesses can assign phone numbers, hours, knowledge, and routing rules per location while managing everything from one workspace.",
  },
  {
    question: "Can it use information from my website?",
    answer:
      "You can import business knowledge from documents and supported website sources into your AI employees so answers stay consistent with your published information.",
  },
  {
    question: "Does it work with my CRM?",
    answer:
      "AgentDesk AI includes a CRM and lead pipeline, and can connect to common business tools through integrations and webhooks so conversations update the systems you already use.",
  },
  {
    question: "Can I review recordings and transcripts?",
    answer:
      "Yes. Calls and conversations can include transcripts, summaries, and recording controls so your team can review quality, coaching opportunities, and outcomes.",
  },
  {
    question: "Does it support SMS and WhatsApp?",
    answer:
      "Yes. The platform supports omnichannel conversations across phone, SMS, WhatsApp, and web chat so customers can continue in the channel they prefer.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Many teams can connect a number, add knowledge, and launch a first AI employee in minutes. Complex multi-location or contact-center setups typically take longer and can be guided through a demo.",
  },
  {
    question: "Can I test before going live?",
    answer:
      "Yes. Use simulated conversations and test calls to validate prompts, workflows, and handoff rules before publishing an AI employee to production traffic.",
  },
  {
    question: "What happens when the AI does not know the answer?",
    answer:
      "Configure escalation: transfer to a human, place the caller in a queue, create a callback, or capture a message. The goal is safe handling—not forcing an uncertain answer.",
  },
  {
    question: "Is my business data secure?",
    answer:
      "AgentDesk AI is designed with tenant isolation, role-based access, encryption in transit and at rest, and configurable retention controls. See the Security page for details on our compliance-ready architecture.",
  },
];
