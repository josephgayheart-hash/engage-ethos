import type { Channel, AudienceType, MessageDomain, CommunicationMoment, PrimaryGoal, TonePreference, CohortContext, ChannelDrafts } from './campusvoice';

export type LibraryEntryStatus = 'draft' | 'submitted' | 'approved' | 'published';

// Source of where the message/template was created
export type LibrarySource = 'builder' | 'journey' | 'copywriter' | 'byoc' | 'evaluate' | 'import' | 'analyzer' | 'other';

export interface SavedMessage {
  id: string;
  title: string;
  content: string;
  channel?: Channel;
  channels?: Channel[];
  channelDrafts?: ChannelDrafts;
  audience?: AudienceType;
  cohort?: CohortContext[];
  domain?: MessageDomain;
  moment?: CommunicationMoment;
  goal?: PrimaryGoal;
  tone?: TonePreference;
  senderRecommendation?: string;
  createdAt: string;
  updatedAt: string;
  versions: MessageVersion[];
  notes?: string;
  approved: boolean;
  mode: 'evaluated' | 'generated' | 'kit';
  institutionalProfileId?: string;
  institutionalProfileName?: string;
  // Source of where the message was created
  source?: LibrarySource;
  // Track if this was remixed from another journey
  remixedFrom?: {
    title: string;
    id?: string;
    source: 'personal' | 'university';
  };
  // Track if submitted to university library
  submittedToLibrary?: boolean;
  submittedAt?: string;
  // Creator information
  createdByUserId?: string;
  createdByName?: string;
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
  collegeName?: string;
  departmentName?: string;
  status: LibraryEntryStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
  approvalNotes?: string;
  changeHistory: TemplateChange[];
  playbook?: string;
  institutionalProfileId?: string;
  institutionalProfileName?: string;
  // Source of where the template was created
  source?: LibrarySource;
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
