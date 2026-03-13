

# Terms of Service Page

## What We're Building
A `/terms` page matching the style of the existing Privacy Policy page, with content tailored to CampusVoice.AI as a higher-ed SaaS platform that uses AI (Google Gemini & OpenAI).

## Sections
1. **Acceptance of Terms** — using the platform = agreement
2. **Description of Service** — AI-powered messaging platform for higher education, beta status
3. **Account Responsibilities** — user maintains credentials, accurate info
4. **Acceptable Use** — no uploading PII/FERPA-protected records, no misuse of AI outputs
5. **AI-Generated Content** — outputs are suggestions, must be reviewed, no guarantee of accuracy or compliance
6. **Intellectual Property** — institution owns its content; CampusVoice owns platform IP; license to process content for service delivery
7. **Data Handling** — references Privacy Policy, no sale of data
8. **Third-Party Services** — disclosure of Google Gemini & OpenAI usage
9. **Service Availability** — beta, no uptime guarantee, may change features
10. **Limitation of Liability** — standard SaaS disclaimers
11. **Termination** — either party can terminate; data export/deletion on request
12. **Governing Law** — placeholder jurisdiction
13. **Contact** — sales@campusvoice.ai

## Code Changes
1. **Create `src/pages/TermsOfServicePage.tsx`** — styled like the existing `PrivacyPolicyPage.tsx` with header, logo, back link, and prose content
2. **Update `src/App.tsx`** — add `/terms` as a public route
3. **Update `src/components/landing/LandingFooter.tsx`** — change `to: '#'` → `to: '/terms'`

