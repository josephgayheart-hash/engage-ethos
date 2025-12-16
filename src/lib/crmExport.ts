// CRM Export Templates for Higher Ed Platforms

import type { SavedMessage } from '@/types/library';

export interface CRMExportFormat {
  id: string;
  name: string;
  description: string;
  fileExtension: string;
  mimeType: string;
}

export const CRM_FORMATS: CRMExportFormat[] = [
  {
    id: 'slate',
    name: 'Technolutions Slate',
    description: 'CSV format compatible with Slate Deliver',
    fileExtension: 'csv',
    mimeType: 'text/csv',
  },
  {
    id: 'salesforce',
    name: 'Salesforce Marketing Cloud',
    description: 'JSON format for Salesforce import',
    fileExtension: 'json',
    mimeType: 'application/json',
  },
  {
    id: 'ellucian',
    name: 'Ellucian CRM Recruit',
    description: 'XML format for Ellucian communications',
    fileExtension: 'xml',
    mimeType: 'application/xml',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CSV format for HubSpot email templates',
    fileExtension: 'csv',
    mimeType: 'text/csv',
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    description: 'HTML template for Mailchimp campaigns',
    fileExtension: 'html',
    mimeType: 'text/html',
  },
  {
    id: 'generic',
    name: 'Generic CSV',
    description: 'Universal CSV format for any CRM',
    fileExtension: 'csv',
    mimeType: 'text/csv',
  },
];

// Export to Slate format
function exportToSlate(messages: SavedMessage[]): string {
  const headers = [
    'Template Name',
    'Subject',
    'Body',
    'Population',
    'Send Date',
    'Channel',
    'Tags',
  ];
  
  const rows = messages.map(msg => [
    `"${msg.title.replace(/"/g, '""')}"`,
    `"${(msg.title || '').replace(/"/g, '""')}"`,
    `"${msg.content.replace(/"/g, '""').replace(/\n/g, '\\n')}"`,
    `"${msg.audience || ''}"`,
    `"${new Date(msg.createdAt).toISOString().split('T')[0]}"`,
    `"${msg.channel || 'email'}"`,
    `"${msg.notes || ''}"`,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Export to Salesforce Marketing Cloud format
function exportToSalesforce(messages: SavedMessage[]): string {
  const data = {
    contentBlocks: messages.map(msg => ({
      id: msg.id,
      name: msg.title,
      content: {
        subject: msg.title,
        body: msg.content,
      },
      meta: {
        audience: msg.audience,
        channel: msg.channel,
        moment: msg.moment,
        domain: msg.domain,
        createdAt: msg.createdAt,
        tags: msg.notes,
      },
    })),
  };
  
  return JSON.stringify(data, null, 2);
}

// Export to Ellucian format
function exportToEllucian(messages: SavedMessage[]): string {
  const xmlContent = messages.map(msg => `
  <communication>
    <id>${msg.id}</id>
    <name><![CDATA[${msg.title}]]></name>
    <subject><![CDATA[${msg.title}]]></subject>
    <body><![CDATA[${msg.content}]]></body>
    <channel>${msg.channel || 'email'}</channel>
    <audience>${msg.audience || ''}</audience>
    <moment>${msg.moment || ''}</moment>
    <created>${msg.createdAt}</created>
  </communication>`).join('\n');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<communications>
${xmlContent}
</communications>`;
}

// Export to HubSpot format
function exportToHubSpot(messages: SavedMessage[]): string {
  const headers = [
    'Template Name',
    'Subject Line',
    'Email Body',
    'List',
    'Created Date',
  ];
  
  const rows = messages.map(msg => [
    `"${msg.title.replace(/"/g, '""')}"`,
    `"${msg.title.replace(/"/g, '""')}"`,
    `"${msg.content.replace(/"/g, '""').replace(/\n/g, '<br>')}"`,
    `"${msg.audience || 'All'}"`,
    `"${new Date(msg.createdAt).toISOString()}"`,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Export to Mailchimp HTML format
function exportToMailchimp(messages: SavedMessage[]): string {
  if (messages.length === 0) return '';
  
  const msg = messages[0]; // Export first message as template
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${msg.title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0066cc; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #ffffff; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>*|MC:SUBJECT|*</h1>
    </div>
    <div class="content">
      ${msg.content.split('\n').map(p => `<p>${p}</p>`).join('\n      ')}
    </div>
    <div class="footer">
      <p>*|LIST:COMPANY|* | *|LIST:ADDRESS|*</p>
      <p><a href="*|UNSUB|*">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}

// Export to generic CSV format
function exportToGeneric(messages: SavedMessage[]): string {
  const headers = [
    'ID',
    'Title',
    'Content',
    'Channel',
    'Audience',
    'Moment',
    'Domain',
    'Goal',
    'Tone',
    'Created At',
    'Updated At',
    'Approved',
    'Notes',
  ];
  
  const rows = messages.map(msg => [
    `"${msg.id}"`,
    `"${msg.title.replace(/"/g, '""')}"`,
    `"${msg.content.replace(/"/g, '""').replace(/\n/g, '\\n')}"`,
    `"${msg.channel || ''}"`,
    `"${msg.audience || ''}"`,
    `"${msg.moment || ''}"`,
    `"${msg.domain || ''}"`,
    `"${msg.goal || ''}"`,
    `"${msg.tone || ''}"`,
    `"${msg.createdAt}"`,
    `"${msg.updatedAt}"`,
    `"${msg.approved}"`,
    `"${(msg.notes || '').replace(/"/g, '""')}"`,
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

// Main export function
export function exportToCRM(messages: SavedMessage[], format: string): { content: string; format: CRMExportFormat } {
  const formatConfig = CRM_FORMATS.find(f => f.id === format) || CRM_FORMATS[CRM_FORMATS.length - 1];
  
  let content: string;
  
  switch (format) {
    case 'slate':
      content = exportToSlate(messages);
      break;
    case 'salesforce':
      content = exportToSalesforce(messages);
      break;
    case 'ellucian':
      content = exportToEllucian(messages);
      break;
    case 'hubspot':
      content = exportToHubSpot(messages);
      break;
    case 'mailchimp':
      content = exportToMailchimp(messages);
      break;
    default:
      content = exportToGeneric(messages);
  }
  
  return { content, format: formatConfig };
}

// Download helper
export function downloadExport(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
