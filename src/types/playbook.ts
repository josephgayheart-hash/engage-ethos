// Types for Playbook Kits and Brand Audit features

export interface PlaybookKit {
  id: string;
  kit_key: string;
  name: string;
  description: string | null;
  category: string;
  institution_types: string[];
  target_audiences: string[];
  target_cohorts: string[];
  journey_template: JourneyTemplate;
  message_templates: MessageTemplate[];
  best_practices: string[];
  research_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JourneyTemplate {
  phases: {
    name: string;
    duration: string;
    focus: string;
  }[];
}

export interface MessageTemplate {
  title: string;
  channel: string;
  focus: string;
}

// Brand Audit Types
export type TouchpointType = 'physical' | 'digital' | 'human';

export type TouchpointCategory = 
  // Physical
  | 'campus-signage'
  | 'building-names'
  | 'printed-materials'
  | 'event-banners'
  | 'vehicle-wraps'
  | 'uniforms'
  // Digital
  | 'website-homepage'
  | 'website-landing'
  | 'email-templates'
  | 'social-profiles'
  | 'digital-ads'
  | 'mobile-app'
  | 'portal'
  // Human
  | 'phone-scripts'
  | 'advisor-talking-points'
  | 'front-desk'
  | 'tour-guides'
  | 'executive-comms';

export interface BrandAuditTouchpoint {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  user_id: string;
  touchpoint_type: TouchpointType;
  touchpoint_category: TouchpointCategory | string | null;
  touchpoint_name: string;
  content_sample: string | null;
  brand_score: number | null;
  voice_score: number | null;
  terminology_issues: TerminologyIssue[];
  analysis_result: TouchpointAnalysisResult | null;
  status: 'pending' | 'analyzed' | 'remediated';
  remediation_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface TerminologyIssue {
  found: string;
  preferred: string;
  context?: string;
}

export interface TouchpointAnalysisResult {
  brandScore: number;
  voiceScore: number;
  terminologyIssues: TerminologyIssue[];
  brandElements: {
    promise: { present: boolean; evidence: string };
    pillars: { name: string; present: boolean; strength: string }[];
  };
  recommendations: string[];
  summary: string;
}

export interface BrandAuditReport {
  id: string;
  tenant_id: string;
  profile_id: string | null;
  user_id: string;
  report_date: string;
  overall_consistency_score: number | null;
  touchpoints_audited: number;
  top_issues: TopIssue[];
  recommendations: string[];
  touchpoint_breakdown: TouchpointBreakdown;
  created_at: string;
}

export interface TopIssue {
  category: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  affectedTouchpoints: number;
}

export interface TouchpointBreakdown {
  physical: { count: number; avgScore: number };
  digital: { count: number; avgScore: number };
  human: { count: number; avgScore: number };
}

// Touchpoint inventory checklist items
export interface TouchpointChecklistItem {
  id: string;
  type: TouchpointType;
  category: TouchpointCategory;
  name: string;
  description: string;
  examples: string[];
}

export const TOUCHPOINT_CHECKLIST: TouchpointChecklistItem[] = [
  // Physical Touchpoints
  {
    id: 'campus-signage',
    type: 'physical',
    category: 'campus-signage',
    name: 'Campus Signage',
    description: 'Wayfinding signs, building markers, and outdoor displays',
    examples: ['Main entrance sign', 'Building directories', 'Parking lot signs'],
  },
  {
    id: 'building-names',
    type: 'physical',
    category: 'building-names',
    name: 'Building Names & Dedications',
    description: 'Named buildings, dedication plaques, and donor recognition',
    examples: ['Library naming', 'Classroom dedications', 'Donor walls'],
  },
  {
    id: 'printed-materials',
    type: 'physical',
    category: 'printed-materials',
    name: 'Printed Materials',
    description: 'Brochures, flyers, postcards, and handouts',
    examples: ['Admissions viewbook', 'Program brochures', 'Event flyers'],
  },
  {
    id: 'event-banners',
    type: 'physical',
    category: 'event-banners',
    name: 'Event Banners & Displays',
    description: 'Temporary signage for events and campaigns',
    examples: ['Commencement banners', 'Open house displays', 'Homecoming signage'],
  },
  {
    id: 'uniforms',
    type: 'physical',
    category: 'uniforms',
    name: 'Uniforms & Apparel',
    description: 'Staff uniforms, branded apparel, and merchandise',
    examples: ['Staff polo shirts', 'Student ambassador gear', 'Athletic uniforms'],
  },
  // Digital Touchpoints
  {
    id: 'website-homepage',
    type: 'digital',
    category: 'website-homepage',
    name: 'Website Homepage',
    description: 'Main institutional website landing page',
    examples: ['Hero messaging', 'Featured stories', 'Navigation labels'],
  },
  {
    id: 'website-landing',
    type: 'digital',
    category: 'website-landing',
    name: 'Landing Pages',
    description: 'Program pages, campaign landing pages, and microsites',
    examples: ['Program landing pages', 'Admissions apply page', 'Giving campaign pages'],
  },
  {
    id: 'email-templates',
    type: 'digital',
    category: 'email-templates',
    name: 'Email Templates',
    description: 'Automated and manual email communications',
    examples: ['Welcome series', 'Newsletter templates', 'Transactional emails'],
  },
  {
    id: 'social-profiles',
    type: 'digital',
    category: 'social-profiles',
    name: 'Social Media Profiles',
    description: 'Institution social media presence and content',
    examples: ['Instagram bio', 'Facebook About section', 'LinkedIn company page'],
  },
  {
    id: 'digital-ads',
    type: 'digital',
    category: 'digital-ads',
    name: 'Digital Advertising',
    description: 'Search ads, display ads, and social ads',
    examples: ['Google search ads', 'Facebook/Instagram ads', 'Display banners'],
  },
  {
    id: 'portal',
    type: 'digital',
    category: 'portal',
    name: 'Student/Employee Portal',
    description: 'Authenticated portal messaging and content',
    examples: ['Portal announcements', 'Dashboard messaging', 'Notification copy'],
  },
  // Human Touchpoints
  {
    id: 'phone-scripts',
    type: 'human',
    category: 'phone-scripts',
    name: 'Phone Scripts',
    description: 'Call center and outreach phone scripts',
    examples: ['Admissions inquiry calls', 'Donor outreach calls', 'Support line scripts'],
  },
  {
    id: 'advisor-talking-points',
    type: 'human',
    category: 'advisor-talking-points',
    name: 'Advisor Talking Points',
    description: 'Guidance for student and academic advisors',
    examples: ['Enrollment conversations', 'Academic advising', 'Career counseling'],
  },
  {
    id: 'front-desk',
    type: 'human',
    category: 'front-desk',
    name: 'Front Desk & Welcome',
    description: 'In-person greeting and information desk communications',
    examples: ['Welcome center scripts', 'Information desk responses', 'Visitor check-in'],
  },
  {
    id: 'tour-guides',
    type: 'human',
    category: 'tour-guides',
    name: 'Campus Tours',
    description: 'Tour guide scripts and talking points',
    examples: ['Campus tour narratives', 'Virtual tour scripts', 'Open house presentations'],
  },
  {
    id: 'executive-comms',
    type: 'human',
    category: 'executive-comms',
    name: 'Executive Communications',
    description: 'President, dean, and leadership messaging',
    examples: ['State of the institution', 'Board presentations', 'Commencement speeches'],
  },
];
