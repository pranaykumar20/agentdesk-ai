# VoiceLead Compliance Guide

This document outlines compliance requirements for inbound and outbound AI phone calls. **This is not legal advice.** Consult a telecommunications attorney before launching outbound calling at scale.

## TCPA (Telephone Consumer Protection Act) — Outbound

### Requirements

| Requirement | Implementation in VoiceLead |
|-------------|----------------------------|
| **Prior express consent** | Enquiry form includes required consent checkbox with explicit language |
| **Consent record** | `Lead.consentText` and `Lead.consentedAt` stored on every submission |
| **Opt-out (DNC)** | If caller says "don't call me again", AI marks `Lead.dnc = true` and status `DNC` |
| **Caller identification** | Outbound AI introduces itself: "automated assistant calling from [Business]" |
| **Revocation** | Honor verbal opt-out immediately during any call |

### Consent text (default)

```
I agree to receive an automated call from this business about my enquiry. Message and data rates may apply.
```

This text is defined in `packages/shared/src/index.ts` as `TCPA_CONSENT_TEXT` and used in:
- Hosted enquiry form (`/enquire/[slug]`)
- Embeddable widget (`/embed.js`)
- Lead API validation (`/api/public/leads`)

### What we do NOT allow

- Outbound calls without `consent: true` on the API
- Calling numbers marked `dnc: true`
- Auto-dialing from purchased lead lists without documented consent

## Call recording notice

Every AI greeting should include a recording notice. Default greeting template:

```
Hello, thank you for calling [Business]. This call may be recorded for quality purposes.
```

Businesses can customize this in Dashboard → Settings → Greeting.

## Business hours gating

### Inbound
When outside configured hours, the AI should inform the caller and offer to take a message. (Hours stored in `BusinessProfile.hours` JSON.)

### Outbound
**Recommended:** Queue outbound calls for the next business window rather than calling at night. MVP stores hours but does not yet enforce outbound scheduling — implement before production scale.

## Data retention

| Data | Default retention | Configurable |
|------|-------------------|--------------|
| Call transcripts | Stored indefinitely | Per-org setting (planned) |
| Structured summaries | Stored indefinitely | Per-org setting (planned) |
| Consent records | Stored indefinitely | Required for compliance |
| Audio recordings | Not stored by default | Twilio recording optional |

## Privacy

- Transcripts are stored in Postgres, scoped to the organization
- Owner notifications include transcript excerpts — configure `notifyEmail` / `notifyPhone` carefully
- API keys (`Organization.apiKey`) must be kept secret; rotate if compromised

## Audit trail

Every lead submission records:
- `consentText` — exact text shown to user
- `consentedAt` — timestamp
- `source` — `embed_form`, `hosted_form`, etc.
- `callSessions` — linked call records with full transcript

## Pre-launch checklist

- [ ] Legal review of consent language for your target markets
- [ ] Register business with Twilio Trust Hub (for US A2P if sending SMS)
- [ ] Configure recording notice in greeting
- [ ] Test opt-out flow: caller says "don't call" → lead marked DNC
- [ ] Verify outbound only fires after consent checkbox is checked
- [ ] Document data retention policy for customers
