

# Advancement & Giving Day Calendar Concepts

## What You Already Have
- **CommunicationCalendar** page with month view, channel filtering, audience filtering
- **CampaignDashboard** with campaign CRUD (currently localStorage-based)
- **Journey Designer** that generates multi-week touchpoint sequences with cadence controls
- **Message Builder** with advancement-specific audiences (`donors`, `alumni`) and moments (`giving-day`, `annual-fund`, `capital-campaign`, `stewardship`, `impact-report`, `alumni-giving-day`)
- **Story Bank** with donor story types
- **Content DNA** for voice consistency
- **Playbook Kits** framework for pre-configured journey templates

## Concepts Worth Building

### 1. Giving Day Countdown Calendar
A dedicated calendar view purpose-built for Giving Day campaigns. Instead of a generic month view, it shows a **countdown timeline** (T-minus 30, 14, 7, 3, 1, Day-of, +1, +3, +7) with pre-mapped touchpoints across channels. Each slot shows the message type (teaser, urgency, live update, thank-you), target segment (lapsed donors, first-time, major gift prospects), and channel. Users click a slot to generate copy directly via the existing Message Builder infrastructure.

**Leverages:** Journey Designer cadence logic, channel/audience types, Message Builder generation

### 2. Advancement Campaign Playbook Kit
A new Playbook Kit specifically for advancement that pre-loads a journey template with phases like "Cultivation → Solicitation → Giving Day → Stewardship." It auto-selects donor/alumni audiences, locks relevant channels (email, social, phone, landing page), and sets escalating cadence. The kit includes pre-mapped `CommunicationMoment` values (`annual-fund`, `giving-day`, `stewardship`, `impact-report`).

**Leverages:** Existing PlaybookKit type system, CadenceSelector escalation patterns, StrategyJourney generation

### 3. Multi-Channel Drip Sequence Builder (Advancement Mode)
Extend the Journey Designer with an "Advancement" mode that understands donor lifecycle stages. Instead of enrollment funnel phases, it uses: Awareness → Cultivation → Solicitation → Conversion → Stewardship → Renewal. Each phase maps to specific channel mixes and tone shifts. The sequence auto-generates a visual timeline that can be exported as a stakeholder-facing campaign plan PDF.

**Leverages:** StrategyPage phase logic, PDF export, channel selection, tone preferences

### 4. Saturation Heatmap & Fatigue Detector
Overlay the existing calendar with a heatmap showing communication density per audience segment per week. Flag when donors are receiving more than N touches in a window, or when there's a gap longer than M days. This directly addresses the "prevent audience fatigue" positioning already in the calendar subtitle. Could pull from both the message library and any active journey touchpoints.

**Leverages:** CommunicationCalendar grid, useMessageLibrary data, journey touchpoint dates

### 5. Stewardship Impact Report Generator
After a giving day or campaign concludes, generate a branded impact report that pulls from the Fact Book (dollars raised, donor counts, participation rates) and Story Bank (donor testimonials). Output as a multi-channel package: email version, landing page copy, social posts, and a PDF. This closes the loop on the donor lifecycle.

**Leverages:** Fact Book data, Story Bank stories, Message Builder multi-channel generation, PDF export

## Recommended Starting Point

**Concept 1 (Giving Day Countdown Calendar)** is the highest-impact, most differentiated feature. It's visually compelling for demos, directly serves advancement offices, and reuses the most existing infrastructure (calendar UI, message generation, channel system). It could be built as a new route `/giving-day-planner` that composes the calendar grid with the journey touchpoint generation.

## Implementation Approach
- Persist campaigns in a new `advancement_campaigns` database table (not localStorage)
- Reuse `generate-message` edge function with advancement-specific prompt context
- Use the existing `CommunicationMoment` advancement values as the backbone
- Filter by institutional profile so each partner institution gets their own campaign calendar

