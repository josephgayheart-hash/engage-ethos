

# Privacy Policy Page + Opt-in Checkboxes

## Changes

1. **Create `src/pages/PrivacyPolicyPage.tsx`** — clean, scrollable page with privacy policy content covering: data collected, how it's used, AI processing (Google Gemini & OpenAI), data retention, FERPA awareness, no sale of data, contact info. Simple prose layout with section headings, matching the app's existing public page styling.

2. **Add `/privacy` route** in `src/App.tsx` as a public route.

3. **Add opt-in checkbox to Request Access form** (`src/pages/RequestAccessPage.tsx`) — placed just above the submit button. Checkbox + label: "I agree to the [Privacy Policy](/privacy)". Submission blocked if unchecked.

4. **Add opt-in checkbox to Request Demo dialog** (`src/components/landing/RequestDemoDialog.tsx`) — same pattern, placed above the submit button.

5. **Update footer links** (`src/components/landing/LandingFooter.tsx`) — change Privacy Policy `to: '#'` → `to: '/privacy'`.

