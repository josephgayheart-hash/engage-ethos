Replace the Fieldmark logo files with the newly uploaded transparent PNG.

## Steps

1. Copy `user-uploads://trans_fieldmark_new.png` → `src/assets/fieldmark-logo.png` (overwrite). This is the dark-wordmark version used on light backgrounds (in-app sidebar).

2. Generate `src/assets/fieldmark-logo-white.png` from the same source by recoloring the "Fieldmark" wordmark text to pure white (`#FFFFFF`) while keeping the blue gradient F mark and transparent background. Used on dark backgrounds (LandingPage Fieldmark slab, ForEnterprisePage hero).

3. No component code changes needed — existing imports (`fieldmarkLogo`, `fieldmarkLogoWhite`) in `AppSidebar.tsx`, `LandingPage.tsx`, and `ForEnterprisePage.tsx` already point to these files.

## QA

Visually inspect both PNGs after generation to confirm transparent background, intact gradient F mark, and correct wordmark color (dark for color version, white for white version).