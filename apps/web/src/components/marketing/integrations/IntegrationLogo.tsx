import type { ReactNode } from "react";
import type { IntegrationId } from "@/content/marketing/integrations";
import { cn } from "@/lib/utils";

const BRAND_TILE: Record<IntegrationId, string> = {
  "google-calendar": "bg-[#E8F0FE] border-[#D2E3FC]",
  "microsoft-365": "bg-[#F3F2F1] border-[#E1DFDD]",
  hubspot: "bg-[#FFF0EB] border-[#FFD5C8]",
  salesforce: "bg-[#E5F5FC] border-[#BFE6F7]",
  twilio: "bg-[#FDE8EB] border-[#F9C5CC]",
  retell: "bg-[#F3E8FF] border-[#E9D5FF]",
  stripe: "bg-[#EEEDFF] border-[#D7D4FF]",
  slack: "bg-[#F5F0FF] border-[#E0D4FF]",
  zapier: "bg-[#FFF1EB] border-[#FFD7C2]",
  quickbooks: "bg-[#EAF7E8] border-[#C8EBC2]",
  mailchimp: "bg-[#FFF9D6] border-[#FFE866]",
  webhooks: "bg-[#EEF2FF] border-[#C7D2FE]",
};

/**
 * Local brand marks for marketing surfaces.
 * Trademarks belong to their respective owners; used only to identify integrations.
 */
export function IntegrationLogo({
  id,
  className,
  title,
  variant = "tile",
}: {
  id: IntegrationId;
  className?: string;
  title: string;
  variant?: "tile" | "circle" | "plain";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        variant === "tile" && "h-12 w-12 rounded-xl border shadow-sm",
        variant === "tile" && BRAND_TILE[id],
        variant === "circle" && "h-16 w-16 rounded-full border bg-white shadow-sm",
        variant === "circle" && BRAND_TILE[id],
        variant === "plain" && "h-8 w-8",
        className,
      )}
      role="img"
      aria-label={`${title} logo`}
    >
      <svg
        viewBox="0 0 48 48"
        className={cn(
          variant === "circle" && "h-10 w-10",
          variant === "tile" && "h-8 w-8",
          variant === "plain" && "h-7 w-7",
        )}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        {LOGO_PATHS[id]}
      </svg>
    </span>
  );
}

const LOGO_PATHS: Record<IntegrationId, ReactNode> = {
  "google-calendar": (
    <>
      <rect x="8" y="10" width="32" height="30" rx="4" fill="#FFFFFF" stroke="#DADCE0" strokeWidth="1.5" />
      <rect x="8" y="10" width="32" height="10" rx="4" fill="#4285F4" />
      <rect x="8" y="16" width="32" height="4" fill="#4285F4" />
      <circle cx="18" cy="14" r="1.5" fill="#FFFFFF" />
      <circle cx="30" cy="14" r="1.5" fill="#FFFFFF" />
      <text
        x="24"
        y="34"
        textAnchor="middle"
        fontSize="14"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
        fill="#1967D2"
      >
        31
      </text>
    </>
  ),
  "microsoft-365": (
    <>
      <rect x="8" y="8" width="14" height="14" fill="#F25022" />
      <rect x="26" y="8" width="14" height="14" fill="#7FBA00" />
      <rect x="8" y="26" width="14" height="14" fill="#00A4EF" />
      <rect x="26" y="26" width="14" height="14" fill="#FFB900" />
    </>
  ),
  hubspot: (
    <>
      <circle cx="33" cy="12" r="3.5" fill="#FF7A59" />
      <path
        fill="#FF7A59"
        d="M29.5 18.2c-1.7-1.5-3.9-2.4-6.3-2.4-5.3 0-9.6 4.3-9.6 9.6 0 1.1.2 2.2.6 3.2L9 33.8l2.2 2.2 5.1-5.1c1.2.7 2.6 1.1 4.1 1.1 5.3 0 9.6-4.3 9.6-9.6 0-2.2-.8-4.3-2.1-5.9l3.6-3.6-1.9-1.9-1.1 1.2zM23.2 34c-4.5 0-8.2-3.7-8.2-8.2s3.7-8.2 8.2-8.2 8.2 3.7 8.2 8.2-3.7 8.2-8.2 8.2zm0-12.4c-2.3 0-4.2 1.9-4.2 4.2s1.9 4.2 4.2 4.2 4.2-1.9 4.2-4.2-1.9-4.2-4.2-4.2z"
      />
    </>
  ),
  salesforce: (
    <path
      fill="#00A1E0"
      d="M19.6 16.8c1.1-1.1 2.6-1.8 4.3-1.8 1.2 0 2.3.3 3.3.9 1.2-2.3 3.6-3.8 6.4-3.8 3.2 0 5.9 2.1 6.9 5 .7-.2 1.4-.4 2.2-.4 3.2 0 5.8 2.6 5.8 5.8S45.9 28.3 42.7 28.3H15.2c-3.5 0-6.4-2.9-6.4-6.4 0-2.9 1.9-5.3 4.6-6.1.8-1.3 2.1-2.3 3.7-2.7.8 1.4 1.7 2.6 2.5 3.7z"
    />
  ),
  twilio: (
    <>
      <circle cx="24" cy="24" r="16" fill="#F22F46" />
      <circle cx="18" cy="18" r="3.2" fill="#FFFFFF" />
      <circle cx="30" cy="18" r="3.2" fill="#FFFFFF" />
      <circle cx="18" cy="30" r="3.2" fill="#FFFFFF" />
      <circle cx="30" cy="30" r="3.2" fill="#FFFFFF" />
    </>
  ),
  retell: (
    <>
      <rect x="8" y="8" width="32" height="32" rx="8" fill="#111827" />
      <path
        d="M16 28c2-4 4-6 8-6s6 2 8 6"
        stroke="#A78BFA"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M14 22c3-5 6-8 10-8s7 3 10 8"
        stroke="#C4B5FD"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.85"
      />
      <circle cx="24" cy="30" r="2" fill="#FFFFFF" />
    </>
  ),
  stripe: (
    <>
      <rect x="8" y="8" width="32" height="32" rx="7" fill="#635BFF" />
      <path
        fill="#FFFFFF"
        d="M24.2 31.2c0-1.2 1-1.7 2.6-1.7 2.3 0 5.2.7 7.5 2v-5.1c-2.2-.9-4.3-1.4-7.5-1.4-6.2 0-10.3 3.2-10.3 8.6 0 8.4 11.6 7.1 11.6 10.7 0 1.4-1.2 1.9-3 1.9-2.6 0-5.9-1-8.4-2.5v5.1c2.6 1.1 5.3 1.6 8.4 1.6 6.4 0 10.8-3.2 10.8-8.7.1-9.1-11.7-7.7-11.7-10.5z"
      />
    </>
  ),
  slack: (
    <>
      <path fill="#E01E5A" d="M18.5 28.5a3 3 0 1 1-3-3h3v3zm1.5 0a3 3 0 1 1 6 0v7.5a3 3 0 1 1-6 0V28.5z" />
      <path fill="#36C5F0" d="M19.5 18.5a3 3 0 1 1 3-3v3h-3zm0 1.5a3 3 0 1 1 0 6H12a3 3 0 1 1 0-6h7.5z" />
      <path fill="#2EB67D" d="M29.5 19.5a3 3 0 1 1 3 3h-3v-3zm-1.5 0a3 3 0 1 1-6 0V12a3 3 0 1 1 6 0v7.5z" />
      <path fill="#ECB22E" d="M28.5 29.5a3 3 0 1 1-3 3v-3h3zm0-1.5a3 3 0 1 1 0-6H36a3 3 0 1 1 0 6h-7.5z" />
    </>
  ),
  zapier: (
    <>
      <rect x="8" y="8" width="32" height="32" rx="8" fill="#FF4A00" />
      <path
        fill="#FFFFFF"
        d="M25.8 14h-3.6l-1.8 6.2H15v3.2h4.5l-1.3 4.4H14v3.2h3.4L15.8 34h3.6l1.6-3h5.4l1.6 3h3.6l-1.8-3H36v-3.2h-4.2l-1.3-4.4H36v-3.2h-5.4L25.8 14zm-1.2 9.4h-3.2l1.2-4h.8l1.2 4zm1.1 3.2 1.2 4h-3.4l1.2-4h1z"
      />
    </>
  ),
  quickbooks: (
    <>
      <circle cx="24" cy="24" r="16" fill="#2CA01C" />
      <path
        fill="#FFFFFF"
        d="M18.5 30.5V17.5h4.2c3.4 0 5.5 1.8 5.5 4.6 0 1.9-1.1 3.4-2.9 4l3.5 4.4h-3.6l-3-3.9h-1.1v3.9h-2.6zm2.6-6.3h1.5c1.5 0 2.4-.7 2.4-1.9s-.9-1.9-2.4-1.9h-1.5v3.8z"
      />
    </>
  ),
  mailchimp: (
    <>
      <rect x="8" y="8" width="32" height="32" rx="8" fill="#FFE01B" />
      <ellipse cx="24" cy="27" rx="10" ry="8" fill="#241C15" />
      <circle cx="20" cy="25" r="1.4" fill="#FFE01B" />
      <circle cx="28" cy="25" r="1.4" fill="#FFE01B" />
      <path d="M20 29c1.2 1.2 6.8 1.2 8 0" stroke="#FFE01B" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      <ellipse cx="24" cy="16" rx="7" ry="5.5" fill="#241C15" />
      <path d="M18.5 15.5c2-3 9-3 11 0" stroke="#FFE01B" strokeWidth="1.2" fill="none" />
    </>
  ),
  webhooks: (
    <>
      <rect x="8" y="8" width="32" height="32" rx="8" fill="#5C4EE5" />
      <path
        d="M18 20a4 4 0 1 1 3.5 6.5L20 30h-2.5l1.4-3.2A4 4 0 0 1 18 20zm12 0a4 4 0 1 0-3.5 6.5L28 30h2.5l-1.4-3.2A4 4 0 0 0 30 20z"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="24" cy="30" r="2.2" fill="#FFFFFF" />
    </>
  ),
};
