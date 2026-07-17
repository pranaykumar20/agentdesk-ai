import { Phone, MessageSquare, MessagesSquare, Mail, Contact, type LucideIcon } from "lucide-react";
import { CHANNELS } from "@/content/marketing/homepage";
import { SectionHeader } from "@/components/marketing/shared/SectionHeader";
import { ProductScreenshotFrame } from "@/components/marketing/shared/ProductScreenshotFrame";
import { iconTone, type IconToneKey } from "@/lib/marketing/icon-tones";
import { cn } from "@/lib/utils";

/** WhatsApp brand green for channel recognition. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.6-.8-1.8-.9-.2-.1-.4-.1-.6.1-.2.3-.7.9-.8 1-.1.2-.3.2-.6.1-.3-.1-1.2-.4-2.2-1.4-.8-.8-1.4-1.7-1.5-2-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.3-.4.1-.2 0-.3 0-.4 0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.3c.1.2 1.6 2.5 3.9 3.5 2.3 1 2.3.7 2.7.6.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1z" />
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.1 4 4.1-1.1A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-2.5.7.7-2.4-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
    </svg>
  );
}

const CHANNEL_META: Record<
  string,
  { icon: LucideIcon | typeof WhatsAppIcon; tone: IconToneKey; brandClass?: string }
> = {
  Phone: { icon: Phone, tone: "violet" },
  SMS: { icon: MessageSquare, tone: "sky" },
  WhatsApp: { icon: WhatsAppIcon, tone: "emerald", brandClass: "text-[#25D366] bg-[#E8F8EF]" },
  "Web chat": { icon: MessagesSquare, tone: "indigo" },
  Email: { icon: Mail, tone: "amber" },
  CRM: { icon: Contact, tone: "blue" },
};

const INBOX = [
  { channel: "Call", subject: "Emergency tooth pain", status: "Open", time: "2m", tone: "violet" as const },
  { channel: "SMS", subject: "Insurance verification", status: "Pending", time: "5m", tone: "sky" as const },
  { channel: "WhatsApp", subject: "Billing question", status: "Open", time: "12m", tone: "emerald" as const },
  { channel: "Chat", subject: "New patient intake", status: "Resolved", time: "34m", tone: "indigo" as const },
];

export function OmnichannelSection() {
  return (
    <section id="omnichannel" className="scroll-mt-24 border-b border-border bg-card py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Omnichannel"
          title="One AI workforce across every customer channel"
          description="Conversation history and customer context stay unified—so phone, SMS, WhatsApp, and chat feel like one relationship."
        />
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <ul className="grid gap-3 sm:grid-cols-2">
            {CHANNELS.map((channel) => {
              const meta = CHANNEL_META[channel.name] ?? CHANNEL_META.Phone;
              const Icon = meta.icon;
              const tone = iconTone(meta.tone);
              return (
                <li
                  key={channel.name}
                  className="marketing-card flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-4"
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                      meta.brandClass ?? cn(tone.bg, tone.icon),
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{channel.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{channel.detail}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          <ProductScreenshotFrame title="Contact Center · Unified inbox">
            <ul className="space-y-2" aria-label="Example unified inbox">
              {INBOX.map((row) => {
                const tone = iconTone(row.tone);
                return (
                  <li
                    key={row.subject}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{row.subject}</p>
                      <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={cn("rounded px-1.5 py-0.5 font-medium", tone.bg, tone.icon)}>
                          {row.channel}
                        </span>
                        {row.status}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">{row.time}</span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs text-muted-foreground">
              Example UI preview — not live customer data.
            </p>
          </ProductScreenshotFrame>
        </div>
      </div>
    </section>
  );
}
