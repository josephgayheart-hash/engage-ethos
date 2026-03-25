export type BrandMode = "campusvoice" | "fieldmark";

export const brandConfig = {
  campusvoice: {
    name: "CampusVoice",
    wordmark: "CampusVoice",
    registeredMark: true,
    tagline: "AI-powered messaging for higher education",
    // HSL values matching existing CSS vars
    primaryColor: "222 47% 14%",
    accentColor: "173 58% 39%",
    navItems: {
      messageBuilder: "Message Builder",
      brandVoice: "Brand Voice Scorer",
      regionAdapter: "Region & Tone Adapter",
      playground: "AI Copywriter",
      campaignBrief: "Campaign Brief",
      regionalPlaybook: "Regional Playbook",
      socialPosts: "Social Posts",
    },
    heroHeadline: "Find your voice. Reach every student.",
    heroSub: "AI-powered messaging built for higher education teams.",
    emptyState:
      "Set up your Brand DNA to get started — define your institution's voice and invite your team.",
  },
  fieldmark: {
    name: "Fieldmark",
    wordmark: "Fieldmark",
    registeredMark: false,
    tagline: "Brand Governance for Distributed Networks",
    // #1a1a2e ≈ hsl(235 33% 14%), #0082cb ≈ hsl(202 100% 40%)
    primaryColor: "235 33% 14%",
    accentColor: "202 100% 40%",
    navItems: {
      messageBuilder: "Content Builder",
      brandVoice: "Brand Compliance Scorer",
      regionAdapter: "Market Adapter",
      playground: "Brand Sandbox",
      campaignBrief: "Channel Brief Generator",
      regionalPlaybook: "Field Manager Playbook",
      socialPosts: "Social Content Queue",
    },
    heroHeadline: "One Brand. Every Location. Every Time.",
    heroSub:
      "Fieldmark gives distributed teams the guardrails to stay on-brand — without the bottlenecks.",
    emptyState:
      "Set up your Brand DNA to get started — define your voice, upload your guidelines, and invite your field teams.",
  },
} as const;

export type BrandConfig = (typeof brandConfig)[BrandMode];
