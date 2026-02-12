
# Add All Campus Communication Channels to Image Generator

## Overview
Add 13 new channel/format options to the Image Generator, covering every common campus communication scenario. Each new channel gets proper specs in the backend prompt, a frontend selector entry, and an "In Context" mockup preview.

## New Channels

| Channel | Aspect Ratio | Dimensions | Mockup Style |
|---------|-------------|------------|--------------|
| Instagram/Facebook Story | 9:16 | 1080x1920 | Phone frame, vertical story UI with progress dots |
| Digital Signage | 16:9 | 1920x1080 | Wall-mounted display frame with time/date overlay |
| Event Flyer / Poster | 4:5 | 1080x1350 | Phone frame with event details below image |
| Presentation Slide | 16:9 | 1920x1080 | Browser frame styled as slide deck (PowerPoint/Google Slides) |
| Web Banner | 3:1 | 1500x500 | Browser frame, thin banner at top of a page |
| MMS / Text Message | 1:1 | 640x640 | Phone frame with iMessage-style chat bubble |
| LinkedIn Banner | 4:1 | 1584x396 | Browser frame showing LinkedIn profile header |
| Facebook Cover | 2.63:1 | 820x312 | Browser frame showing Facebook page header |
| YouTube Thumbnail | 16:9 | 1280x720 | Browser frame with YouTube player chrome, play button overlay |
| Print Ad | 8.5:11 | 1275x1650 | Magazine page with slight perspective tilt |
| Viewbook / Brochure | 4:3 | 1200x900 | Two-page spread with fold line |
| Donor Report | 8.5:11 | 1275x1650 | Clean report cover with title and year |
| Portal / App Banner | 3:1 | 1200x400 | Browser frame showing student portal header |

## Files Changed

### 1. `supabase/functions/generate-channel-image/index.ts`
- Add all 13 new entries to the `channelSpecs` object with proper `aspect`, `width`, `height`, `style`, and `description` fields
- The existing prompt logic already uses these specs dynamically, so no other changes needed in the function

### 2. `src/pages/ImageGeneratorPage.tsx`
- Add all 13 new entries to the `channelOptions` array
- Group them by category with visual separators for easier scanning:
  - **Social** (existing + Stories)
  - **Digital** (Email, Landing Page, Ads, Banners, Signage, YouTube)
  - **Print** (Direct Mail, Event Flyer, Print Ad, Viewbook, Donor Report)
  - **Messaging** (MMS)
  - **Portal** (Portal Banner, Presentation Slide)

### 3. `src/components/image-generator/ChannelMockup.tsx`
- Add 13 new mockup renderers to the `mockupMap`:
  - **StoryMockup**: Tall phone frame (9:16) with story progress dots at top, swipe-up CTA at bottom
  - **DigitalSignageMockup**: Wide display with thin bezel, time/weather strip overlay
  - **EventFlyerMockup**: Phone frame showing an event card with date/location/RSVP below the image
  - **PresentationSlideMockup**: Browser frame with slide controls (prev/next arrows, slide counter)
  - **WebBannerMockup**: Browser frame with thin banner across top of a skeleton page
  - **MMSMockup**: Phone frame with iMessage-style chat bubble containing the image
  - **LinkedInBannerMockup**: Browser frame with LinkedIn profile header (avatar circle overlapping banner)
  - **FacebookCoverMockup**: Browser frame with Facebook page header (page name, tabs)
  - **YouTubeThumbnailMockup**: Browser frame with YouTube player, play button overlay, video info below
  - **PrintAdMockup**: Magazine page with slight 3D tilt, publication name at top
  - **ViewbookMockup**: Open brochure spread with fold line down the center
  - **DonorReportMockup**: Clean report cover with title, institution name, year
  - **PortalBannerMockup**: Browser frame showing a student portal dashboard with the banner at top

All mockups are pure CSS/Tailwind -- no external images or assets needed. They reuse the existing `PhoneFrame` and `BrowserFrame` wrapper components.

## Technical Details

- The `channelOptions` dropdown will grow from 6 to 19 items. Adding group labels (disabled items acting as headers) keeps it scannable.
- The edge function's prompt construction already dynamically reads from `channelSpecs`, so adding entries there is all that's needed for proper generation.
- Each mockup component follows the same `{ imageUrl: string; profileName?: string }` prop interface used by the existing six.
