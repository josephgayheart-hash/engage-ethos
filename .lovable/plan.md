

# Auto-Fill Wizard from .edu Domain

Add a "smart start" step to the Profile Setup Wizard where users type their institution's `.edu` domain (e.g., `lakewood.edu`). The system scrapes the homepage and about page, then uses AI to extract institutional details and pre-fills the wizard fields.

---

## User Experience

1. A new **Step 0** appears before the current "Institution Type" step, titled **"Quick Start"**
2. User types a `.edu` domain (e.g., `ohio.edu`) into a clean input field
3. A "Look Up" button triggers a brief loading state (~5-10 seconds) with a progress message
4. On success, the wizard auto-fills what it found and advances to the next step with a toast summarizing what was populated (e.g., "Found 8 fields - review and adjust as needed")
5. User can also click "Skip - I'll fill it manually" to bypass this step entirely

### Fields that can be auto-populated:
- Institution name, abbreviation, mascot
- Institution type (four-year, community college, etc.)
- Primary/secondary/tertiary brand colors (extracted from site CSS/meta)
- Slogans/taglines
- Email domain (from the input itself)
- Website URL
- President/Provost names and titles
- Portal/LMS names (if mentioned)
- Logo URL (from og:image or favicon)

---

## Technical Approach

### 1. New Edge Function: `lookup-institution`
- Accepts `{ domain: string }`
- Uses the existing Firecrawl scrape to fetch the homepage and `/about` page (2 calls)
- Sends the scraped content to Gemini 2.5 Flash with a structured extraction prompt
- Returns a JSON object mapping to `InstitutionalConfig` fields
- No API key needed from the user (uses Lovable AI + existing Firecrawl connector)

### 2. Frontend Changes: `ProfileSetupWizard.tsx`
- Insert a new step at index 0: "Quick Start" with a Globe icon
- Add state for `domainInput`, `isLookingUp`, and `lookupComplete`
- On lookup success, call `updateConfig(...)` with all extracted fields and auto-advance
- Show extracted results summary before advancing
- "Skip" link to go directly to the Institution Type step

### 3. STEPS array update
- Add new step: `{ id: 'quickstart', title: 'Quick Start', description: 'Enter your .edu to auto-fill', icon: Globe }`
- Adjust step indices throughout the `renderStepContent` switch cases

---

## Edge Function Detail

The `lookup-institution` function will:

1. Scrape `https://{domain}` via `firecrawl-scrape` (reuse existing function internally, or call Firecrawl API directly)
2. Scrape `https://{domain}/about` as a secondary source
3. Extract metadata (og:image, theme-color meta tags) from the HTML
4. Send combined content to **google/gemini-2.5-flash** with a prompt like:

```text
Extract the following institutional details from this university website content.
Return a JSON object with these fields:
- institutionName, institutionAbbreviation, mascot, institutionType
- primaryColor, secondaryColor, tertiaryColor
- slogans (array), presidentName, presidentTitle, provostName, provostTitle
- logoUrl, portalName, lmsName
Only include fields you can confidently extract. Use null for unknown fields.
```

5. Return the parsed JSON to the frontend

---

## What stays the same
- All existing wizard steps remain fully functional
- Users can override any auto-filled value
- The lookup step is entirely optional (skip link always visible)
- No new database tables needed
- No new secrets needed (Firecrawl key already exists, Lovable AI models are built-in)

