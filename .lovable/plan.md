

# Channel Mockup Preview for Image Generator

## Overview
After an image is generated, instead of just showing the raw image, we'll add interactive **device/channel mockup frames** that let the user toggle between viewing the raw image and seeing it placed in a realistic context for the selected channel. This gives users an instant sense of how the image will actually look in the wild.

## Channel Mockups

Each channel gets a visually distinct, CSS-built mockup frame:

| Channel | Mockup | Description |
|---------|--------|-------------|
| Social Media (1:1) | **Phone frame** with Instagram-style post UI | Profile avatar, like/comment/share icons, caption area |
| Social Ad (1:1) | **Phone frame** with sponsored ad UI | "Sponsored" label, CTA button ("Learn More"), engagement bar |
| Email (16:9) | **Desktop email client** | Inbox sidebar, email header bar, image as hero banner within email body |
| Landing Page (16:9) | **Browser window** | Chrome-style address bar, nav bar placeholder, image as full-width hero |
| Direct Mail (4:3) | **Physical mail piece** | Slight rotation/shadow to look like a printed postcard on a surface |
| News Article (16:9) | **News website** | Browser frame with article headline placeholder, byline, featured image |

## UI Interaction

- Add a **toggle bar** below the generated image with two views: **"Raw Image"** and **"In Context"**
- Default to "In Context" after generation to wow the user
- Smooth crossfade animation between views
- The mockup frames are pure CSS/JSX (no external images needed) with subtle shadows and rounded corners

## Technical Approach

1. **New Component**: `src/components/image-generator/ChannelMockup.tsx`
   - Accepts `channel`, `imageUrl`, and optional `profileName` props
   - Renders the appropriate device frame based on channel
   - Uses Tailwind for all styling (shadows, borders, gradients for status bars, etc.)
   - Each mockup is a self-contained render function within a switch/map

2. **Update `ImageGeneratorPage.tsx`**:
   - Add a `viewMode` state (`"raw"` | `"mockup"`)
   - Replace the current image result section with a tabbed view
   - Default to `"mockup"` when image first appears
   - Keep Download and Regenerate buttons accessible in both views

3. **Mockup Design Details** (all CSS-only):
   - **Phone frames**: Rounded rect with notch, status bar (time, battery icons), bottom home indicator
   - **Browser frames**: Title bar with traffic-light dots, address bar with URL text, tab strip
   - **Mail piece**: Card with slight 3D rotation via `transform: perspective(800px) rotateY(-3deg)`, drop shadow on a subtle textured background
   - All frames use `bg-gray-900` or `bg-white` depending on the context with proper contrast

## Files Changed

| File | Change |
|------|--------|
| `src/components/image-generator/ChannelMockup.tsx` | New component with all 6 channel mockup frames |
| `src/pages/ImageGeneratorPage.tsx` | Add toggle UI, integrate ChannelMockup, default to mockup view |

