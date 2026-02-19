import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Channel-specific image specs
const channelSpecs: Record<string, { aspect: string; width: number; height: number; style: string; description: string; bestPractices: string }> = {
  "social-media": {
    aspect: "1:1",
    width: 1080,
    height: 1080,
    style: "social media post graphic",
    description: "Square social media post image (Instagram, Facebook, LinkedIn)",
    bestPractices: `- Single clear focal point — one person, one moment, one emotion. Feeds are cluttered; simplicity wins.
- Faces perform 38% better than landscapes on Instagram. Show a real, expressive human face when possible.
- Leave ~20% negative space at top and bottom for profile overlays and caption text on mobile.
- Bright, high-saturation images get 24% more engagement. Avoid dark, moody tones unless the brand demands it.
- Thumb-stopping contrast: the subject should pop against the background within the first 0.3 seconds of scrolling.
- Warm color temperature (golden hour, soft afternoon light) outperforms cool/blue tones on social.
- Avoid busy backgrounds — bokeh, solid color walls, or open sky keep focus on the subject.`
  },
  "digital-ad-social": {
    aspect: "1:1",
    width: 1080,
    height: 1080,
    style: "paid social media advertisement visual",
    description: "Social ad creative (Meta, LinkedIn) — eye-catching, conversion-focused",
    bestPractices: `- Hero the outcome, not the institution: show the student succeeding, not the campus building.
- Clear visual hierarchy — the eye should land on the subject first, then move to any branded element.
- Meta's own research: ads with people outperform product-only ads by 2–3×. Feature a real person.
- High-contrast subject against a clean or blurred background for thumb-stopping power.
- Leave clean space at bottom-right for the CTA button overlay (Learn More / Apply Now).
- Avoid anything that looks "stock" — candid, imperfect, mid-action shots feel more authentic and get higher CTR.
- Emotional resonance matters: joy, pride, curiosity, and belonging drive higher conversion than generic "campus beauty."`
  },
  "email": {
    aspect: "16:9",
    width: 1200,
    height: 675,
    style: "email header banner",
    description: "Wide email hero banner — clean, branded, professional",
    bestPractices: `- Email images must communicate instantly — recipients spend ~11 seconds on an email. One clear message per image.
- Keep the visual simple and uncluttered. Complex images render poorly on small mobile screens.
- Leave the center-bottom area clean — many email clients crop the bottom edge or overlay a "view in browser" link.
- High contrast is critical: many recipients view in dark mode or with images partially loaded.
- Avoid relying on text in the image — ALT text is the backup when images are blocked (40%+ of email clients).
- Horizontal compositions work best. The hero banner sits above the fold; vertical subjects get cropped.
- Brand colors should appear but subtly (clothing, background accents) — the image supports the copy, not replaces it.`
  },
  "landing-page": {
    aspect: "16:9",
    width: 1920,
    height: 1080,
    style: "landing page hero image",
    description: "Full-width hero image for a landing page — immersive, aspirational",
    bestPractices: `- The hero image IS the first impression. It must instantly communicate the page's value proposition visually.
- Leave generous negative space in the center-left for overlay headline text (white or dark text needs contrast).
- Avoid busy, detailed scenes — the image is a backdrop for copy, not a standalone artwork.
- Depth of field: sharp foreground subject with soft background creates cinematic, professional feel.
- The subject should face or gesture toward the content area (right side) to guide the viewer's eye.
- Aspirational but believable: show a moment the visitor can imagine themselves in.
- Consider the gradient overlay — images should work well with a dark-to-transparent gradient at the bottom.`
  },
  "direct-mail": {
    aspect: "4:3",
    width: 1200,
    height: 900,
    style: "direct mail piece image",
    description: "Print-quality image for a direct mail piece",
    bestPractices: `- Print demands higher image fidelity than digital — sharp details, no compression artifacts, rich color depth.
- Physical mail is tangible; the image should feel warm, personal, and inviting — not corporate or sterile.
- Recipient is a parent, alum, or donor holding this in their hands — evoke emotion, nostalgia, or aspiration.
- Leave clean edges — bleeds, crops, and trim marks mean the outer 1/8" may be cut off in print production.
- Colors appear darker in print than on screen. Lean slightly brighter and more saturated in the source image.
- One dominant subject with clear separation from background. Small details are lost at postcard scale.
- Avoid fine text or patterns that could moiré in print.`
  },
  "news-article": {
    aspect: "16:9",
    width: 1200,
    height: 675,
    style: "news article featured image",
    description: "Editorial-style featured image for a news/press article",
    bestPractices: `- Editorial photography feels objective and documentary — avoid anything that looks staged or "marketing."
- Show the subject in their natural environment doing something real: teaching, researching, presenting, building.
- Rule of thirds composition with the subject off-center feels more journalistic and less promotional.
- Natural, ambient lighting — fluorescent lab light, lecture hall light, outdoor overcast — not glamorous studio light.
- Include contextual details that tell the story: lab equipment, whiteboards with writing, architectural details.
- The image should make sense alongside a news headline without any additional explanation.
- Photojournalistic crop: slightly tight framing that puts the viewer "in the scene."`
  },
  "story": {
    aspect: "9:16",
    width: 1080,
    height: 1920,
    style: "Instagram/Facebook Story image",
    description: "Vertical story image (9:16) for Instagram Stories, Facebook Stories, or Snapchat",
    bestPractices: `- Stories are VERTICAL and full-screen — compose for 9:16 with the subject centered vertically.
- Top 15% and bottom 20% are covered by UI (profile bar, reply bar) — keep the key subject in the safe middle zone.
- Stories are ephemeral and casual — the image should feel spontaneous, not overly polished or produced.
- Close-up faces and tight crops work best — stories are intimate, personal, and viewed at arm's length on a phone.
- Bold, saturated colors pop on mobile OLED screens. Use vibrant tones.
- One clear moment or emotion per story frame. Don't try to communicate multiple ideas.
- Vertical leading lines (walkways, tall buildings, trees) naturally complement the 9:16 format.`
  },
  "digital-signage": {
    aspect: "16:9",
    width: 1920,
    height: 1080,
    style: "digital signage display image",
    description: "Full-screen image for a campus digital sign or kiosk display",
    bestPractices: `- Digital signs are viewed from 6–20 feet away — large, bold subjects with extreme clarity.
- Viewers glance for 2–3 seconds max. One unmistakable visual message.
- High contrast is essential — signs are in lobbies, hallways, and outdoors where ambient light competes.
- Avoid fine details, small elements, or subtle gradients — they're invisible at viewing distance.
- The image must work WITHOUT text — signage systems overlay dynamic text, dates, and announcements.
- Full-bleed composition: the image fills the entire screen edge-to-edge with no letterboxing.
- Bright, welcoming, and energetic — these displays set the mood for campus visitors and students.`
  },
  "event-flyer": {
    aspect: "4:5",
    width: 1080,
    height: 1350,
    style: "event flyer or poster image",
    description: "Portrait-oriented image for an event flyer, poster, or campus bulletin",
    bestPractices: `- Event imagery should capture the ENERGY and EMOTION of the event, not just the setting.
- Leave the bottom 30% relatively clean or dark — this is where event details (date, time, location) are overlaid.
- Bold, dynamic compositions — diagonals, action shots, and movement convey excitement and urgency.
- The image should answer "what will this feel like to attend?" — show the experience, not the logistics.
- Portrait orientation (4:5) means vertical subjects (standing people, tall architecture) work naturally.
- High saturation and warmth drive more RSVPs than muted, editorial tones.
- Campus context matters: the setting should feel recognizable to someone who knows the campus.`
  },
  "presentation-slide": {
    aspect: "16:9",
    width: 1920,
    height: 1080,
    style: "presentation slide background image",
    description: "Widescreen image for a PowerPoint or Google Slides presentation background",
    bestPractices: `- This image is a BACKGROUND — it will have text, charts, and bullet points overlaid on top.
- Heavy blur, low opacity, and desaturation make better slide backgrounds than sharp, detailed photos.
- Leave the center and right side clean/dark/simple — that's where slide content goes.
- A subtle gradient or vignette (darker edges, lighter center) improves text readability.
- Avoid busy scenes with many subjects — a single atmospheric element (building, sky, quad) works best.
- The image should evoke the institution without distracting from the presenter's content.
- Muted, sophisticated color palette — not bold or saturated. The content is the star, not the background.`
  },
  "web-banner": {
    aspect: "3:1",
    width: 1500,
    height: 500,
    style: "website banner image",
    description: "Wide, thin banner for a website header or announcement strip",
    bestPractices: `- Extremely wide and short (3:1) — compose with a strong horizontal subject line.
- The subject must work in a narrow horizontal strip. Tall subjects (standing people) get severely cropped.
- Panoramic campus views, wide architectural facades, or horizon-line landscapes fit this format naturally.
- Keep the focal point in the center third — left and right edges are often cropped on mobile viewports.
- This banner often sits above page content, so the bottom edge should have a clean transition.
- Avoid faces at the edges — they get cropped uncomfortably on responsive layouts.
- Subtle, atmospheric quality works well — this is an ambient element, not the main content.`
  },
  "mms": {
    aspect: "1:1",
    width: 640,
    height: 640,
    style: "MMS text message image",
    description: "Square image optimized for MMS / text message delivery",
    bestPractices: `- MMS images are viewed SMALL (200–300px on screen) — extreme simplicity and bold subjects only.
- One person, one object, one clear moment. At this size, complexity becomes visual noise.
- File size matters for delivery — simple compositions with fewer colors compress better.
- The recipient sees this in a chat bubble. It should feel personal, warm, and direct — not corporate.
- High contrast between subject and background is critical at small viewing sizes.
- Bright, clean images. Dark or moody images look muddy on small phone screens.
- The image should pair with a short text message — it complements, not replaces, the written word.`
  },
  "linkedin-banner": {
    aspect: "4:1",
    width: 1584,
    height: 396,
    style: "LinkedIn profile or company page banner",
    description: "Ultra-wide banner for a LinkedIn profile or company page header",
    bestPractices: `- Ultra-wide 4:1 ratio — the image is a thin horizontal strip. Vertical subjects don't work.
- The left side is partially covered by the profile photo circle — keep key content center and right.
- LinkedIn is professional: the image should convey credibility, prestige, and institutional excellence.
- Architectural shots (campus facades, modern buildings, iconic landmarks) work better than people at this ratio.
- Subtle, sophisticated color palette. LinkedIn's UI is neutral blue/white — the banner should complement, not clash.
- Avoid busy compositions. At this extreme aspect ratio, simplicity reads better.
- This banner represents the institutional brand 24/7 — it should be timeless, not tied to a season or event.`
  },
  "facebook-cover": {
    aspect: "2.63:1",
    width: 820,
    height: 312,
    style: "Facebook page cover photo",
    description: "Wide cover photo for a Facebook page or group",
    bestPractices: `- Facebook cover photos are cropped differently on desktop vs mobile — keep the subject in the center 60%.
- The profile photo overlaps the bottom-left corner — avoid placing important content there.
- Warmer, more community-focused imagery works for Facebook (vs LinkedIn's corporate tone).
- Show campus community: groups of people, events, traditions, campus life moments.
- The cover photo auto-plays as a slow pan on some devices — centered, balanced compositions work best.
- Facebook compresses images aggressively — use high-contrast, simple compositions that survive compression.
- Seasonal updates are common for Facebook covers — the image can be more time-specific than LinkedIn.`
  },
  "youtube-thumbnail": {
    aspect: "16:9",
    width: 1280,
    height: 720,
    style: "YouTube video thumbnail",
    description: "Eye-catching thumbnail for a YouTube video — bold, high-contrast",
    bestPractices: `- YouTube thumbnails are THE most important factor for click-through rate (CTR). This is pure visual marketing.
- Close-up faces with expressive emotions (surprise, joy, curiosity) get 2–3× higher CTR than landscape shots.
- EXTREME contrast and saturation — thumbnails compete against dozens of others in a grid at ~200px wide.
- The subject should fill at least 60% of the frame. Small subjects are invisible in thumbnail grids.
- Bright backgrounds (yellow, orange, teal) outperform dark backgrounds in click-through testing.
- Avoid the bottom-right corner — YouTube overlays the video duration timestamp there.
- The image should create curiosity or emotion that makes someone WANT to click. Think "What's happening here?"
- Bold, graphic, almost poster-like composition. Subtlety is the enemy of YouTube thumbnails.`
  },
  "print-ad": {
    aspect: "8.5:11",
    width: 1275,
    height: 1650,
    style: "print advertisement image",
    description: "Portrait image for a print magazine or newspaper advertisement",
    bestPractices: `- Print ads compete with editorial content — the image must stop the page-flip in 1–2 seconds.
- Full-page portrait format: compose vertically with a strong top-to-bottom visual flow.
- Leave the bottom 25% clean for copy block (headline, body copy, logo, URL).
- Higher education print ads should feel premium — rich color, sharp detail, aspirational subjects.
- The image should work at full-page AND half-page sizes (it may be resized for different publications).
- Print color gamut differs from RGB screens — avoid neon or hyper-saturated colors that can't be reproduced.
- Show ONE compelling moment that tells the institutional story: a breakthrough, a connection, a tradition.`
  },
  "viewbook": {
    aspect: "4:3",
    width: 1200,
    height: 900,
    style: "viewbook or brochure spread image",
    description: "Landscape image for a university viewbook, brochure, or admissions piece",
    bestPractices: `- Viewbook imagery is the most carefully curated photography in higher ed — it must feel PREMIUM.
- This image may span a full spread — compose so the image works both full-width and with a vertical fold line.
- Prospective students and parents will study this image closely — details matter more here than in any digital format.
- Show authentic campus life moments that answer "Can I see myself here?" for the prospective student.
- Environmental context is key: recognizable campus architecture, iconic spaces, seasonal beauty.
- Warmer, more saturated images convey energy and belonging. Cool/muted tones feel detached.
- Professional editorial quality — this is the institution's most important print collateral for enrollment.`
  },
  "donor-report": {
    aspect: "8.5:11",
    width: 1275,
    height: 1650,
    style: "donor report or annual report cover image",
    description: "Portrait image for a donor report, annual report, or stewardship publication cover",
    bestPractices: `- Annual/donor report covers communicate IMPACT and GRATITUDE — show the human outcome of giving.
- Sophisticated, premium aesthetic — this goes to major donors, board members, and institutional leaders.
- A single compelling subject (student, researcher, faculty) whose story represents institutional impact.
- Darker, more dramatic lighting (golden hour, dramatic shadows) conveys gravitas and prestige.
- Leave upper 20% clean for the report title and lower 20% for institution name and fiscal year.
- The mood should be reflective, proud, and forward-looking — not casual or playful.
- Portrait orientation means vertical subjects (standing person, tall building, tree) work naturally.`
  },
  "portal-banner": {
    aspect: "3:1",
    width: 1200,
    height: 400,
    style: "student portal or app banner image",
    description: "Wide banner for a student portal dashboard, app home screen, or intranet header",
    bestPractices: `- Portal banners are seen daily by students — the image should feel welcoming, energizing, and current.
- Seasonal relevance matters: show the right season, weather, and campus energy for the current term.
- Keep it simple — this is a functional interface element, not a marketing showcase. It should complement, not distract.
- Avoid faces and specific people — the portal serves thousands of students; generic campus beauty is safer.
- Wide, atmospheric campus views work best: quad at golden hour, library at night, autumn trees, spring blossoms.
- The image will be overlaid with dashboard widgets and navigation — keep contrast low and details minimal.
- Calming, positive mood — students open this when stressed about registration, grades, and deadlines.`
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { channel, contentSummary, audience, tenantId, profileId, messageId, goal, tone, moment, cohort, domain, engine, imageStyle } = await req.json();

    if (!channel || !contentSummary) {
      return new Response(JSON.stringify({ error: "Missing channel or contentSummary" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch institutional branding — build strict color palette
    // Filter out app default colors that leak into profile configs
    const APP_DEFAULT_COLORS = ["#1f2a44", "#2c7a7b"];
    const addColor = (colors: string[], c: string) => {
      const normalized = c.trim().toLowerCase();
      if (c && !APP_DEFAULT_COLORS.includes(normalized) && !colors.some(x => x.toLowerCase() === normalized)) {
        colors.push(c.trim().toUpperCase());
      }
    };

    let brandContext = "";
    let campusContext = "";
    let tenantInstitutionName = ""; // fallback only — profile institutionName takes priority
    const brandColors: string[] = [];
    try {
      if (tenantId) {
        const { data: tenant } = await supabaseAdmin
          .from("tenants")
          .select("institution_name, primary_color, accent_color, logo_url, tenant_type")
          .eq("id", tenantId)
          .single();

        if (tenant) {
          // For agency tenants, institution_name is the agency name — don't use it for campus context
          if (tenant.tenant_type !== "agency") {
            tenantInstitutionName = tenant.institution_name;
            brandContext += `Institution: ${tenant.institution_name}.`;
          }
          if (tenant.primary_color) addColor(brandColors, tenant.primary_color);
          if (tenant.accent_color) addColor(brandColors, tenant.accent_color);
        }
      }

      // Fetch both the selected profile AND the master university profile for full color palette
      const queries: Promise<any>[] = [];
      if (profileId) {
        queries.push(supabaseAdmin.from("institutional_profiles").select("name, config, parent_profile_id, profile_type").eq("id", profileId).single());
      }
      if (tenantId) {
        queries.push(supabaseAdmin.from("institutional_profiles").select("name, config, parent_profile_id, profile_type").eq("tenant_id", tenantId).eq("profile_type", "university").limit(1).single());
      }

      const results = await Promise.all(queries);
      let unitName = "";
      let universityName = "";
      for (const { data: profile } of results) {
        if (profile?.config) {
          const cfg = profile.config as Record<string, any>;
          // Do NOT include mascot in image prompts — AI can't reliably depict specific mascots
          if (cfg.slogans?.length && !brandContext.includes("Slogan")) brandContext += ` Slogan: "${cfg.slogans[0]}".`;
          if (cfg.institutionName && !brandContext.includes("Full name")) {
            brandContext += ` Full name: ${cfg.institutionName}.`;
            universityName = cfg.institutionName;
          }
          if (cfg.unitName) unitName = cfg.unitName;
          if (cfg.unitWebsite) brandContext += ` Unit website: ${cfg.unitWebsite}.`;
          if (cfg.primaryColor) addColor(brandColors, cfg.primaryColor);
          if (cfg.secondaryColor) addColor(brandColors, cfg.secondaryColor);
          if (cfg.accentColor) addColor(brandColors, cfg.accentColor);
          if (cfg.tertiaryColor) addColor(brandColors, cfg.tertiaryColor);
        }
        // Use profile name as unit context if it's a sub-unit
        if (profile && profile.profile_type !== "university" && profile.name) {
          unitName = unitName || profile.name;
        }
      }

      // Build campus-specific imagery instruction using profile institutionName (not agency tenant name)
      const schoolName = universityName || tenantInstitutionName;
      if (schoolName) {
        campusContext = `CAMPUS SETTING: This image should look like it was taken on the campus of ${schoolName}.`;
        campusContext += ` Use your knowledge of ${schoolName}'s real campus to depict recognizable architectural styles, building materials, landscaping, and iconic landmarks or gathering spots that are characteristic of that institution.`;
        campusContext += ` Think about what makes ${schoolName}'s campus visually distinctive — the types of buildings (Gothic, Brutalist, modern glass, red brick, limestone), signature quads, arches, clock towers, stadiums, or natural features.`;
        if (unitName) {
          campusContext += ` This content is specifically for the ${unitName}, so if that college/department has its own building or area on campus, reference that environment.`;
        }
      }
    } catch (e) {
      console.warn("Could not fetch branding:", e);
    }

    console.log("Resolved brand color palette:", brandColors);
    console.log("Campus context:", campusContext);

    const colorPaletteInstruction = brandColors.length > 0
      ? `STRICT COLOR PALETTE — you MUST use ONLY these exact hex colors for ALL branded visual elements. The institution's official colors are: ${brandColors.join(", ")}. 
Rules:
- Clothing (t-shirts, hoodies, jerseys, scarves, hats): MUST be one of these exact hex colors
- Campus banners, flags, pennants, signage: MUST use these exact hex colors
- Architectural accents, awnings, umbrellas: MUST use these exact hex colors
- Do NOT use maroon, burgundy, crimson, navy, teal, or ANY other color unless it exactly matches one of the hex values above
- Do NOT approximate or substitute similar-looking colors — use the exact hex values provided
- White and neutral grays are acceptable for non-branded elements like buildings, sidewalks, sky`
      : "Use neutral, warm tones appropriate for higher education marketing.";

    const spec = channelSpecs[channel] || channelSpecs["social-media"];
    const audienceContext = audience ? `Target audience: ${audience}.` : "";
    const goalContext = goal ? `Communication goal: ${goal}.` : "";
    const toneContext = tone ? `Desired tone: ${tone}.` : "";
    const momentContext = moment ? `Communication moment: ${moment}.` : "";
    const cohortContext = cohort && cohort !== 'none' ? `Student cohort: ${cohort}.` : "";
    const domainContext = domain ? `Content domain: ${domain}.` : "";

    // Style modifiers based on user selection
    const styleDirections: Record<string, string> = {
      photorealistic: "Photorealistic editorial campus photography — looks indistinguishable from a real photo taken by a professional university photographer.",
      cinematic: "Cinematic film-like quality — dramatic lighting, shallow depth of field, anamorphic lens flare, color-graded like a movie still. Think widescreen film grain and moody atmosphere.",
      illustrated: "Stylized digital illustration — clean vector-inspired lines, bold color blocking, modern graphic design aesthetic. NOT a photograph.",
      watercolor: "Soft watercolor painting style — gentle washes of color, visible brush strokes, organic bleeding edges, artistic and dreamy. NOT a photograph.",
      minimal: "Clean flat design illustration — minimal detail, geometric shapes, limited color palette, modern and sleek. Think tech company marketing aesthetic. NOT a photograph.",
    };
    const selectedStyle = styleDirections[imageStyle || "photorealistic"] || styleDirections.photorealistic;

    const prompt = `Generate a professional ${spec.style} for a higher education institution.

Context: ${contentSummary}
${audienceContext}
${goalContext}
${toneContext}
${momentContext}
${cohortContext}
${domainContext}
${brandContext}

${campusContext}

${colorPaletteInstruction}

VISUAL STYLE: ${selectedStyle}

CHANNEL-SPECIFIC BEST PRACTICES for ${spec.description}:
${spec.bestPractices}

Photography/art direction — follow the style of real university marketing imagery:
- Capture candid, in-the-moment scenes: a student laughing mid-conversation on a quad, a professor gesturing at a whiteboard with 2-3 engaged students, a lone student studying under a tree, a small group collaborating around a laptop in a modern library
- NEVER show people standing in a line, holding hands, linking arms, or posing symmetrically — these look artificial
- NEVER generate twins, duplicates, or people who look identical — every person should be visually distinct in appearance, hairstyle, and clothing
- Vary body language, posture, and gaze direction — people should look naturally occupied, not aware of the camera
- CLOTHING VARIETY IS CRITICAL: Each person MUST wear a distinctly different outfit — vary garment types (t-shirt vs hoodie vs button-down vs jacket vs sweater), colors, layers, and styles. Never put multiple people in the same type and color of clothing. Mix brand-colored items with neutral everyday clothing so it looks like a real campus, not a uniform. EXCEPTION: If the scene explicitly depicts a sports team, athletic squad, marching band, or other organized team concept, matching uniforms/jerseys are appropriate and expected.
- Use natural light — golden hour warmth, dappled shade under trees, soft overcast — avoid flat studio lighting
- Include environmental storytelling: backpacks, laptops, coffee cups, notebooks, lab equipment, sports gear
- People should be diverse in a way that feels organic to a real campus — different backgrounds, ages, body types, clothing styles — without appearing curated or posed as a diversity photo
- Brand colors MUST appear on clothing items (t-shirts, hoodies, scarves), campus banners, pennants, or architectural details — use ONLY the exact hex values from the palette above, never approximate or invent new colors

SETTING & ENVIRONMENT RULES — READ CAREFULLY:
- If the scene description mentions "at home", "in their home", "living room", "kitchen", "apartment", "dorm room", or any domestic setting, depict a REAL HOME or RESIDENTIAL INTERIOR — do NOT add campus buildings visible through windows, do NOT place institutional architecture in the background, do NOT make it look like a campus building. It should look like someone's actual living space.
- If the scene is in a "lab", "classroom", "office", "studio", or other INTERIOR workspace, focus on the INTERIOR environment only — do NOT force a campus building to be visible through windows or glass walls unless the description explicitly requests a campus view.
- Only show recognizable campus architecture and exterior buildings when the scene NATURALLY takes place OUTDOORS on campus (walking across a quad, sitting on campus steps, etc.) or when the description explicitly mentions a campus exterior.
- Show authentic environments that match what was described: brick pathways, green lawns, modern labs, lecture halls, coffee shops, residence halls, athletic facilities — but ONLY when contextually appropriate to the scene description.

- Composition: use shallow depth of field, leading lines, rule of thirds — the hallmarks of editorial campus photography
- CRITICAL — Aspect ratio and dimensions: This image MUST be exactly ${spec.aspect} aspect ratio (${spec.width}x${spec.height} pixels). ${spec.aspect === "1:1" ? "The image must be perfectly SQUARE — equal width and height." : spec.aspect === "16:9" ? "The image must be a WIDE horizontal rectangle — significantly wider than it is tall." : `The image must match ${spec.aspect} proportions exactly.`} Do NOT generate an image with the wrong aspect ratio.

CRITICAL TEXT & LOGO RULES — READ CAREFULLY:
- ABSOLUTELY NO TEXT of any kind in the image. No words, letters, numbers, symbols, abbreviations, or university names.
- Do NOT put text on clothing — no "University", no school names, no abbreviations, no letters. Show PLAIN solid-color clothing in the brand palette instead.
- Do NOT put text on banners, signs, buildings, flags, or any surface. All signage and banners should be BLANK or show only solid brand colors / abstract patterns.
- Do NOT render any logos, crests, seals, emblems, or wordmarks. AI cannot accurately reproduce institutional logos — any attempt will look wrong and damage the brand.
- Do NOT render any mascot, mascot costume, cartoon character, or animal figure.
- If you feel the urge to add text anywhere — DON'T. A plain scarlet hoodie is better than one with garbled "Uhiversity" on it.
- The institution's identity should come through via COLORS, ARCHITECTURE, and ENVIRONMENT — never through rendered text or logos.
- Professional quality: sharp focus on subject, creamy bokeh backgrounds, rich color depth
- Feel warm, authentic, and aspirational — like a spread in a top university's viewbook
- Match the tone and energy of the communication moment${toneContext ? ` — the visual should feel ${tone}` : ''}
- Imagery should resonate with the target audience${audienceContext ? ` (${audience})` : ''} and reflect their lived experience`;

    console.log("Generating channel image for:", channel, "content:", contentSummary.substring(0, 100));

    // Fetch campus reference photos for visual training
    let campusPhotoUrls: string[] = [];
    try {
      const photoQuery = supabaseAdmin
        .from("campus_photo_samples")
        .select("file_url, photo_category")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (profileId) {
        photoQuery.eq("profile_id", profileId);
      } else if (tenantId) {
        photoQuery.eq("tenant_id", tenantId);
      }

      const { data: campusPhotos } = await photoQuery.limit(8);

      if (campusPhotos && campusPhotos.length > 0) {
        // Smart selection: prefer photos matching prompt context
        const lowerPrompt = (contentSummary + " " + (audience || "") + " " + (moment || "")).toLowerCase();
        const categoryPriority: Record<string, string[]> = {
          "architecture": ["architecture", "building", "campus", "hall", "center", "library"],
          "campus-life": ["student", "campus life", "community", "event", "club"],
          "landscape": ["outdoor", "quad", "garden", "nature", "scenic"],
          "athletics": ["athletic", "sport", "game", "team", "stadium"],
          "traditions": ["tradition", "ceremony", "homecoming", "commencement", "graduation"],
          "aerial": ["aerial", "overview", "campus view", "panoramic"],
        };

        // Score each photo by relevance
        const scored = campusPhotos.map(p => {
          const keywords = categoryPriority[p.photo_category] || [];
          const score = keywords.some(kw => lowerPrompt.includes(kw)) ? 2 : 1;
          return { ...p, score };
        });

        scored.sort((a, b) => b.score - a.score);
        campusPhotoUrls = scored.slice(0, 3).map(p => p.file_url);
        console.log(`Using ${campusPhotoUrls.length} campus reference photos`);
      }
    } catch (e) {
      console.warn("Could not fetch campus photos:", e);
    }

    // Build message content - either simple string or multimodal array
    let messageContent: any;
    if (campusPhotoUrls.length > 0) {
      messageContent = [
        { type: "text", text: prompt },
        { type: "text", text: "REFERENCE CAMPUS PHOTOGRAPHY — match the architectural style, lighting, environment, and photographic tone of these real campus images:" },
        ...campusPhotoUrls.map(url => ({ type: "image_url", image_url: { url } })),
      ];
    } else {
      messageContent = prompt;
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [{ role: "user", content: messageContent }],
        modalities: ["image", "text"],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI image generation failed:", aiResponse.status, errText);

      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Failed to generate image" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResponse.json();
    const imageDataUrl = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const finishReason = aiData.choices?.[0]?.finish_reason;
    const refusalMessage = aiData.choices?.[0]?.message?.refusal;

    if (!imageDataUrl) {
      const responseContent = (aiData.choices?.[0]?.message?.content || "").toLowerCase();
      console.error("No image in AI response. finish_reason:", finishReason, "refusal:", refusalMessage, "content:", aiData.choices?.[0]?.message?.content);

      // Detect content policy / safety filter blocks — broad detection
      const contentFilterPhrases = [
        "i can't", "i cannot", "i'm not able", "i am not able",
        "not able to generate", "against my policy", "unable to generate",
        "inappropriate", "violates", "safety", "harmful", "offensive",
        "not appropriate", "can not create", "can't create", "cannot create",
        "not permitted", "policy", "guidelines", "content policy",
      ];
      const isContentFiltered = finishReason === "content_filter" 
        || finishReason === "safety"
        || refusalMessage
        || contentFilterPhrases.some(phrase => responseContent.includes(phrase));

      if (isContentFiltered) {
        console.warn("Image generation blocked by content policy");
        return new Response(JSON.stringify({ 
          error: "Your prompt was flagged by our content safety filters. Please revise your description to remove inappropriate, offensive, or explicit content and try again." 
        }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // If no image and no clear reason, still give a helpful message
      return new Response(JSON.stringify({ 
        error: "The image could not be generated. This may be due to content restrictions or a temporary issue. Try rephrasing your description and ensure it describes an appropriate campus scene." 
      }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract base64 and upload to storage
    const base64Match = imageDataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!base64Match) {
      return new Response(JSON.stringify({ error: "Invalid image data format" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const imageFormat = base64Match[1];
    const base64Data = base64Match[2];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

    // Store in collection-assets bucket under channel-images/
    const fileId = messageId || crypto.randomUUID();
    const filePath = `channel-images/${fileId}/${channel}.${imageFormat}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("collection-assets")
      .upload(filePath, binaryData, {
        contentType: `image/${imageFormat}`,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ error: "Failed to upload image" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: publicUrl } = supabaseAdmin.storage
      .from("collection-assets")
      .getPublicUrl(filePath);

    console.log("Channel image generated successfully:", publicUrl.publicUrl);

    return new Response(
      JSON.stringify({ imageUrl: publicUrl.publicUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-channel-image error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
