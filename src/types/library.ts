export type LibraryEntryStatus = 'draft' | 'submitted' | 'approved' | 'published';

export interface SavedMessage {
  id: string;
  title: string;
  content: string;
  channel: 'email' | 'sms' | 'portal' | 'landing-page';
  audience: 'prospective' | 'first-year' | 'continuing' | 'at-risk' | 'graduate';
  cohort?: string[];
  domain?: string;
  moment: string;
  goal?: string;
  tone?: string;
  senderRecommendation?: string;
  createdAt: string;
  updatedAt: string;
  versions: MessageVersion[];
  notes?: string;
  approved: boolean;
  mode: 'evaluated' | 'generated';
}

export interface MessageVersion {
  id: string;
  content: string;
  createdAt: string;
  changeNotes?: string;
}

export interface SharedTemplate {
  id: string;
  title: string;
  intentStatement: string;
  useCases: {
    whenToUse: string[];
    whenNotToUse: string[];
  };
  content: string;
  placeholders: TemplatePlaceholder[];
  requiredFields: {
    audience: string[];
    moment: string[];
    channel: string[];
  };
  variants?: TemplateVariant[];
  ethicalGuardrails: string[];
  owner: string;
  maintainer: string;
  status: LibraryEntryStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
  approvalNotes?: string;
  changeHistory: TemplateChange[];
  playbook?: string;
}

export interface TemplatePlaceholder {
  key: string;
  label: string;
  description: string;
  defaultValue?: string;
  required: boolean;
}

export interface TemplateVariant {
  id: string;
  name: string;
  description: string;
  content: string;
}

export interface TemplateChange {
  id: string;
  date: string;
  author: string;
  description: string;
  previousVersion: string;
}

export interface LibraryFilters {
  search: string;
  channel?: string;
  audience?: string;
  domain?: string;
  moment?: string;
  status?: LibraryEntryStatus;
  playbook?: string;
}

export type SortOption = 'newest' | 'oldest' | 'most-used' | 'recently-viewed';
