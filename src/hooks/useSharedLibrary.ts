import { useState, useEffect, useCallback } from 'react';
import type { SharedTemplate, LibraryFilters, LibraryEntryStatus } from '@/types/library';

const STORAGE_KEY = 'persist_shared_library';

// Default templates for demonstration
const DEFAULT_TEMPLATES: SharedTemplate[] = [
  {
    id: '1',
    title: 'Midterm Academic Support Outreach',
    intentStatement: 'Proactively connect struggling students with support resources before academic difficulty escalates.',
    useCases: {
      whenToUse: ['Early grade concerns', 'Missing assignments', 'Attendance flags'],
      whenNotToUse: ['Already connected with advisor', 'End of semester'],
    },
    content: 'Hi {{student_name}},\n\nI noticed you may be facing some challenges in {{course_name}}. This is a normal part of the college experience, and {{institution_name}} has resources designed specifically to help.\n\nThe {{tutoring_center}} offers free drop-in support, and I\'m available to meet if you\'d like to discuss strategies.\n\nYour next step: Reply to this email or stop by {{office_location}} this week.\n\nBest,\n{{sender_name}}\n{{sender_title}}',
    placeholders: [
      { key: 'student_name', label: 'Student Name', description: 'First name of the student', required: true },
      { key: 'course_name', label: 'Course Name', description: 'Name of the course', required: true },
      { key: 'institution_name', label: 'Institution', description: 'Your institution name', required: true },
      { key: 'tutoring_center', label: 'Tutoring Center', description: 'Name of tutoring center', required: true },
      { key: 'office_location', label: 'Office Location', description: 'Where to find help', required: false },
      { key: 'sender_name', label: 'Sender Name', description: 'Your name', required: true },
      { key: 'sender_title', label: 'Sender Title', description: 'Your title', required: true },
    ],
    requiredFields: {
      audience: ['first-year', 'continuing', 'at-risk'],
      moment: ['midterm', 'early-term'],
      channel: ['email'],
    },
    variants: [
      {
        id: 'v1',
        name: 'Authority-Forward',
        description: 'Emphasizes institutional authority and expertise',
        content: 'Dear {{student_name}},\n\nAs your {{sender_title}}, I want to personally reach out regarding your progress in {{course_name}}. Our academic support team has identified that you may benefit from additional resources.\n\n{{institution_name}}\'s {{tutoring_center}} has a proven track record of helping students improve their academic standing.\n\nPlease schedule a meeting with me this week at {{office_location}}.\n\nSincerely,\n{{sender_name}}\n{{sender_title}}',
      },
      {
        id: 'v2',
        name: 'Lower Cognitive Load',
        description: 'Simplified message with clear single action',
        content: 'Hi {{student_name}},\n\nNeed help with {{course_name}}? The {{tutoring_center}} is here for you.\n\n→ Drop in anytime this week, no appointment needed.\n\n{{sender_name}}',
      },
    ],
    ethicalGuardrails: [
      'Do not reference specific grades in initial outreach',
      'Avoid shame-based language',
      'Preserve student autonomy in seeking help',
      'Do not CC parents or other parties without consent',
    ],
    owner: 'Academic Affairs',
    maintainer: 'Student Success Office',
    status: 'published',
    version: '2.1',
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-03-01T00:00:00Z',
    changeHistory: [
      { id: 'c1', date: '2024-03-01', author: 'Student Success', description: 'Updated tutoring center language', previousVersion: '2.0' },
    ],
    playbook: 'Midterm Academic Support',
  },
  {
    id: '2',
    title: 'FAFSA Completion Reminder',
    intentStatement: 'Encourage timely FAFSA completion to maximize financial aid eligibility.',
    useCases: {
      whenToUse: ['FAFSA deadline approaching', 'Incomplete applications', 'Renewal period'],
      whenNotToUse: ['Student has completed FAFSA', 'International students'],
    },
    content: 'Hi {{student_name}},\n\nThe FAFSA deadline for {{academic_year}} is {{deadline_date}}. Completing your FAFSA ensures you\'re considered for all available aid at {{institution_name}}.\n\nNeed help? The {{financial_aid_office}} offers free FAFSA completion workshops every {{workshop_day}}.\n\nComplete your FAFSA: studentaid.gov\n\n{{sender_name}}\n{{financial_aid_office}}',
    placeholders: [
      { key: 'student_name', label: 'Student Name', description: 'First name', required: true },
      { key: 'academic_year', label: 'Academic Year', description: 'e.g., 2024-25', required: true },
      { key: 'deadline_date', label: 'Deadline', description: 'Priority deadline date', required: true },
      { key: 'institution_name', label: 'Institution', description: 'Your institution', required: true },
      { key: 'financial_aid_office', label: 'FA Office', description: 'Office name', required: true },
      { key: 'workshop_day', label: 'Workshop Day', description: 'Day of workshops', required: false },
      { key: 'sender_name', label: 'Sender', description: 'Sender name', required: true },
    ],
    requiredFields: {
      audience: ['prospective', 'first-year', 'continuing'],
      moment: ['seasonal', 'registration'],
      channel: ['email', 'sms'],
    },
    ethicalGuardrails: [
      'Do not imply loss of all aid if deadline missed',
      'Acknowledge varying financial situations',
      'Provide clear help resources',
    ],
    owner: 'Financial Aid',
    maintainer: 'Enrollment Services',
    status: 'published',
    version: '1.3',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-02-15T00:00:00Z',
    changeHistory: [],
    playbook: 'FAFSA Completion',
  },
  {
    id: '3',
    title: 'Wellbeing Check-in',
    intentStatement: 'Provide supportive outreach to students showing signs of disengagement or stress.',
    useCases: {
      whenToUse: ['Behavioral flags', 'Attendance drops', 'Counseling referrals'],
      whenNotToUse: ['Immediate crisis situations', 'Already in active counseling'],
    },
    content: 'Hi {{student_name}},\n\nI wanted to check in and see how you\'re doing. College can be challenging, and it\'s okay to need support.\n\n{{institution_name}} cares about your wellbeing. If you\'d like to talk, I\'m here. You can also reach the {{counseling_center}} at {{counseling_phone}}.\n\nYou matter to us.\n\n{{sender_name}}\n{{sender_title}}',
    placeholders: [
      { key: 'student_name', label: 'Student Name', description: 'First name', required: true },
      { key: 'institution_name', label: 'Institution', description: 'Your institution', required: true },
      { key: 'counseling_center', label: 'Counseling Center', description: 'Name of center', required: true },
      { key: 'counseling_phone', label: 'Phone', description: 'Contact number', required: true },
      { key: 'sender_name', label: 'Sender', description: 'Your name', required: true },
      { key: 'sender_title', label: 'Title', description: 'Your title', required: true },
    ],
    requiredFields: {
      audience: ['first-year', 'continuing', 'at-risk'],
      moment: ['early-term', 'midterm', 're-engagement'],
      channel: ['email'],
    },
    ethicalGuardrails: [
      'Do not diagnose or label student behavior',
      'Avoid urgency that may cause anxiety',
      'Provide professional resources, not personal advice',
      'Maintain confidentiality',
    ],
    owner: 'Student Affairs',
    maintainer: 'Dean of Students',
    status: 'published',
    version: '1.0',
    createdAt: '2024-02-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
    changeHistory: [],
    playbook: 'Wellbeing Check-in',
  },
  {
    id: '4',
    title: 'Re-engagement Outreach',
    intentStatement: 'Reconnect with students who have stopped out or shown signs of withdrawal.',
    useCases: {
      whenToUse: ['Non-enrollment for 1+ semester', 'Withdrew mid-semester', 'Financial holds'],
      whenNotToUse: ['Graduated', 'Transferred officially'],
    },
    content: 'Hi {{student_name}},\n\nWe noticed you haven\'t been enrolled at {{institution_name}} recently, and we wanted you to know—you\'re still part of our community.\n\nWhether you\'re ready to return or just want to explore options, we\'re here to help. Many students take breaks and successfully complete their degrees.\n\nLet\'s talk about what\'s next for you: {{contact_link}}\n\n{{sender_name}}\n{{sender_title}}',
    placeholders: [
      { key: 'student_name', label: 'Student Name', description: 'First name', required: true },
      { key: 'institution_name', label: 'Institution', description: 'Your institution', required: true },
      { key: 'contact_link', label: 'Contact Link', description: 'Scheduling or contact link', required: true },
      { key: 'sender_name', label: 'Sender', description: 'Your name', required: true },
      { key: 'sender_title', label: 'Title', description: 'Your title', required: true },
    ],
    requiredFields: {
      audience: ['at-risk'],
      moment: ['re-engagement'],
      channel: ['email', 'sms'],
    },
    ethicalGuardrails: [
      'Do not assume reasons for departure',
      'Avoid guilt-based appeals',
      'Respect student\'s decision if they choose not to return',
    ],
    owner: 'Enrollment Management',
    maintainer: 'Retention Office',
    status: 'published',
    version: '1.2',
    createdAt: '2024-01-20T00:00:00Z',
    updatedAt: '2024-02-28T00:00:00Z',
    changeHistory: [],
    playbook: 'Re-engagement',
  },
];

export function useSharedLibrary() {
  const [templates, setTemplates] = useState<SharedTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTemplates(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse shared library:', e);
        setTemplates(DEFAULT_TEMPLATES);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
      }
    } else {
      setTemplates(DEFAULT_TEMPLATES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TEMPLATES));
    }
    setIsLoading(false);
  }, []);

  const saveToStorage = useCallback((temps: SharedTemplate[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(temps));
    setTemplates(temps);
  }, []);

  const filterTemplates = useCallback((filters: LibraryFilters): SharedTemplate[] => {
    let filtered = [...templates];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchLower) ||
        t.intentStatement.toLowerCase().includes(searchLower) ||
        t.content.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(t => t.status === filters.status);
    }

    if (filters.playbook) {
      filtered = filtered.filter(t => t.playbook === filters.playbook);
    }

    if (filters.channel) {
      filtered = filtered.filter(t => t.requiredFields.channel.includes(filters.channel!));
    }

    if (filters.audience) {
      filtered = filtered.filter(t => t.requiredFields.audience.includes(filters.audience!));
    }

    return filtered;
  }, [templates]);

  const getPlaybooks = useCallback((): string[] => {
    const playbooks = new Set<string>();
    templates.forEach(t => {
      if (t.playbook) playbooks.add(t.playbook);
    });
    return Array.from(playbooks);
  }, [templates]);

  const getTemplateById = useCallback((id: string): SharedTemplate | undefined => {
    return templates.find(t => t.id === id);
  }, [templates]);

  const updateTemplateStatus = useCallback((id: string, status: LibraryEntryStatus, notes?: string) => {
    const now = new Date().toISOString();
    const updated = templates.map(t => {
      if (t.id !== id) return t;
      return {
        ...t,
        status,
        approvalNotes: notes,
        updatedAt: now,
        changeHistory: [
          { id: crypto.randomUUID(), date: now, author: 'Current User', description: `Status changed to ${status}`, previousVersion: t.version },
          ...t.changeHistory,
        ],
      };
    });
    saveToStorage(updated);
  }, [templates, saveToStorage]);

  const addTemplate = useCallback((template: Omit<SharedTemplate, 'id' | 'createdAt' | 'updatedAt' | 'changeHistory'>) => {
    const now = new Date().toISOString();
    const newTemplate: SharedTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
      changeHistory: [],
    };
    saveToStorage([newTemplate, ...templates]);
    return newTemplate;
  }, [templates, saveToStorage]);

  const deleteTemplate = useCallback((id: string) => {
    const updated = templates.filter(t => t.id !== id);
    saveToStorage(updated);
  }, [templates, saveToStorage]);

  const clearAllTemplates = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setTemplates([]);
  }, []);

  const resetToDefaults = useCallback(() => {
    saveToStorage(DEFAULT_TEMPLATES);
  }, [saveToStorage]);

  return {
    templates,
    isLoading,
    filterTemplates,
    getPlaybooks,
    getTemplateById,
    updateTemplateStatus,
    addTemplate,
    deleteTemplate,
    clearAllTemplates,
    resetToDefaults,
  };
}
