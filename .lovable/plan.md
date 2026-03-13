

# Restructure About Page — Vision-First with Founder Story

## Current State
The page is structured as a "meet the founder" bio page. The user wants it restructured to lead with CampusVoice's **mission, vision, and an emotional opening** about *why* it was built, then transition into the founder's background as the story behind the platform.

## New Page Structure

1. **Emotional Opening / "Why CampusVoice Exists"** — A heartstrings paragraph about how higher ed communicators are stretched thin, how messages shape student futures, and how words matter. Why Tyler built this.

2. **Mission & Vision** — Clear, concise mission and vision statements for CampusVoice.AI as a platform.

3. **Values** — 3-4 core values (e.g., Research-Grounded, Human-First AI, Built for Higher Ed, Ethical Persuasion).

4. **The Story Behind It — Dr. Tyler Gayheart** — Condensed founder section: photo placeholder, LinkedIn link, PhD credentials, dissertation summary with DOI link, and how his background in communication science / psychometrics / persuasion / higher ed marketing led to building CampusVoice.

5. **CTA** — Keep the existing "Interested?" section.

## What Changes
- **Rewrite `src/pages/AboutPage.tsx`** — Restructure from bio-first to vision-first. Same styling conventions (header, max-w-4xl, prose). Remove the current hero layout that leads with the photo. Add mission/vision/values sections above the founder section. Keep dissertation, DOI, LinkedIn, expertise grid, and CTA.

## Files
- `src/pages/AboutPage.tsx` — rewrite

