

## Plan: Enterprise Brand Control Landing Page (`/for-enterprise`)

### Concept

A dedicated marketing page targeting **distributed brands** — franchises, global companies with regional affiliates, nonprofits with chapters, and any organization where HQ needs to control messaging across decentralized teams. The Valvoline use case is the perfect anchor: a global brand with resellers/affiliates in dozens of countries who go off-brand with local campaigns, imagery, and tone.

### Positioning

**Headline direction:** "One Brand. Every Market. Always On-Voice."

**Core pain point:** When you have 500+ affiliates, resellers, chapters, or regional offices creating their own content, brand drift isn't a risk — it's a certainty. CampusVoice becomes the **brand command center** that ensures every piece of content, in every market, sounds like it came from HQ.

### Target Industries (shown as use-case cards)

| Industry | Pain Point | Example |
|----------|-----------|---------|
| **Franchise / Reseller Networks** | Local dealers creating off-brand ads, translating taglines incorrectly | Valvoline, automotive, retail franchises |
| **Global Enterprises** | Regional offices in 40+ countries adapting campaigns without brand guardrails | CPG, tech, manufacturing |
| **Nonprofits & NGOs** | Chapters and affiliates diluting the mission message | United Way, Red Cross, advocacy orgs |
| **Healthcare Systems** | Individual hospitals/clinics creating inconsistent patient comms | Hospital networks, insurance |
| **Financial Services** | Branch offices and advisors going rogue on messaging | Banks, insurance, wealth management |

### Page Sections

1. **Hero** — Dark gradient (matching existing landing aesthetic). Headline + rotating industry icons. Primary CTA: "Request a Demo." Secondary: "See How It Works."

2. **The Problem** — Visual showing brand message degrading as it flows from HQ → Region → Local. A "telephone game" diagram showing how "Precision-engineered protection" becomes "Good oil, cheap price!" at the local level.

3. **How It Works** — 3-step flow reframed for enterprise:
   - **Define Your Brand DNA** — Upload brand guidelines, voice samples, approved messaging. AI learns your brand.
   - **Distribute & Govern** — Regional teams generate content within your guardrails. Every output is scored against your brand standard.
   - **Monitor & Enforce** — Dashboard showing brand adherence scores across all regions/affiliates. Flag off-brand content before it goes live.

4. **Industry Use Cases** — Tabbed or card-based section with the 5 industries above, each showing a specific scenario and how the platform solves it.

5. **Enterprise Features Grid** — Highlights features reframed for enterprise:
   - Multi-tenant brand hierarchies (HQ → Region → Local)
   - Brand adherence scoring on every asset
   - Approval workflows before publish
   - Content DNA that enforces voice across languages
   - AI Image Studio with locked brand overlays
   - Audit dashboard for brand compliance

6. **Social Proof / Stats Strip** — Platform capability stats (e.g., "19 channel formats", "Brand scoring on every output", "Multi-level governance")

7. **CTA Section** — "See CampusVoice in action for your industry" → Request Demo dialog

### Technical Implementation

**New files:**
- `src/pages/ForEnterprisePage.tsx` — Main page component
- Route added to `App.tsx` as `/for-enterprise` (public route)

**Reused components:**
- `LandingNav` (add "For Enterprise" link alongside "For Universities" and "For Agencies")
- `LandingFooter`, `SEOHead`, `WaveBackground`, `GlowOrbs`
- `RequestDemoDialog` for CTA
- `FeatureNavigation` pattern for cross-linking

**Nav updates:**
- `LandingNav.tsx` — Add "For Enterprise" link
- `FeaturesDropdown.tsx` — Optionally add enterprise entry

### Design Notes

- Reuses the same dark-gradient aesthetic as the existing landing and agency pages for brand consistency
- Industry-specific iconography (Factory, Globe, Heart, Building2, Landmark from lucide-react)
- The "brand degradation" diagram is the emotional hook — visually showing what happens without governance
- No higher-ed terminology on this page; reframe everything as "affiliates," "regions," "chapters," "dealers"

