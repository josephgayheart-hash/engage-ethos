import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SmsCharCounter } from "@/components/ui/sms-char-counter";
import { useToast } from "@/hooks/use-toast";
import { SalesforceCredentialsDialog } from "@/components/SalesforceCredentialsDialog";
import { openInGoogleDocs, formatForGoogleDocs } from "@/lib/googleDocsExport";
import { exportTalkingPointsToPDF, exportCaseForSupportToPDF } from "@/lib/pdfExport";
import { 
  Copy, 
  Check, 
  Mail, 
  MessageSquare, 
  Share2, 
  Monitor, 
  FileText, 
  Phone,
  Globe,
  Pencil,
  X,
  FolderPlus,
  Search,
  Megaphone,
  Mic,
  Target,
  Cloud,
  ExternalLink,
  Heart,
  User,
  BookOpen,
  Lightbulb,
  Users,
  GraduationCap,
  Building2,
  Sparkles,
  FileDown
} from "lucide-react";
import type { 
  ChannelDrafts, 
  EmailDraft, 
  LandingPageDraft, 
  CallScriptDraft,
  SearchAdDraft,
  SocialAdDraft,
  TalkingPointsDraft,
  NewsArticleDraft,
  CaseForCareDraft,
  Channel 
} from "@/types/uplaybook";

interface ChannelPreviewProps {
  channel: Channel;
  content: ChannelDrafts[keyof ChannelDrafts];
  onCopy: (text: string) => void;
  onContentChange?: (channel: Channel, content: ChannelDrafts[keyof ChannelDrafts]) => void;
  onSaveToLibrary?: (channel: Channel, content: ChannelDrafts[keyof ChannelDrafts], contentText: string) => void | (() => void);
  institutionName?: string;
}

const channelIcons: Record<Channel, React.ReactNode> = {
  'email': <Mail className="w-4 h-4" />,
  'sms': <MessageSquare className="w-4 h-4" />,
  'social-media': <Share2 className="w-4 h-4" />,
  'portal': <Monitor className="w-4 h-4" />,
  'landing-page': <Globe className="w-4 h-4" />,
  'direct-mail': <FileText className="w-4 h-4" />,
  'phone-call': <Phone className="w-4 h-4" />,
  'digital-ad-search': <Search className="w-4 h-4" />,
  'digital-ad-social': <Megaphone className="w-4 h-4" />,
  'talking-points': <Mic className="w-4 h-4" />,
  'news-article': <FileText className="w-4 h-4" />,
  'case-for-care': <Heart className="w-4 h-4" />,
};

const channelLabels: Record<Channel, string> = {
  'email': 'Email',
  'sms': 'SMS/Text',
  'social-media': 'Social Media',
  'portal': 'Portal Notification',
  'landing-page': 'Landing Page',
  'direct-mail': 'Direct Mail',
  'phone-call': 'Phone Script',
  'digital-ad-search': 'Search Ad (Google/Bing)',
  'digital-ad-social': 'Social Ad (Meta/LinkedIn)',
  'talking-points': 'Executive Talking Points',
  'news-article': 'News Article',
  'case-for-care': 'Case for Support',
};

export function ChannelPreview({ channel, content, onCopy, onContentChange, onSaveToLibrary, institutionName }: ChannelPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<ChannelDrafts[keyof ChannelDrafts]>(content);
  const [sfmcDialogOpen, setSfmcDialogOpen] = useState(false);
  const { toast } = useToast();

  // Sync editedContent with parent content when it changes
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleCopy = (text: string) => {
    onCopy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportToPDF = () => {
    try {
      if (channel === 'talking-points') {
        exportTalkingPointsToPDF(editedContent as TalkingPointsDraft, institutionName);
        toast({
          title: "PDF Downloaded",
          description: "Executive Talking Points exported successfully.",
        });
      } else if (channel === 'case-for-care') {
        exportCaseForSupportToPDF(editedContent as CaseForCareDraft, institutionName);
        toast({
          title: "PDF Downloaded",
          description: "Case for Support exported successfully.",
        });
      }
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Could not generate PDF. Please try again.",
      });
    }
  };

  const handleOpenInGoogleDocs = async () => {
    const fullContent = getFullContent(editedContent);
    const formattedContent = formatForGoogleDocs(fullContent, {
      title: channelLabels[channel],
      channel: channel,
      generatedAt: new Date(),
    });
    const success = await openInGoogleDocs(formattedContent);
    if (success) {
      toast({
        title: "Opening Google Docs",
        description: "Content copied! Paste (Ctrl/Cmd+V) in the new document.",
      });
    }
  };

  // Get SFMC content type based on channel
  const getSfmcContentType = (): string => {
    switch (channel) {
      case 'email': return 'email';
      case 'sms': return 'sms';
      case 'landing-page': return 'landingPage';
      case 'phone-call': return 'script';
      case 'digital-ad-search': return 'searchAd';
      case 'digital-ad-social': return 'socialAd';
      case 'talking-points': return 'talkingPoints';
      default: return 'content';
    }
  };

  // Build channel-specific SFMC content structure
  const buildSfmcContent = () => {
    const baseContent = {
      name: `${channelLabels[channel]} - ${new Date().toLocaleDateString()}`,
      channel: channel,
      contentType: getSfmcContentType(),
      createdAt: new Date().toISOString(),
      mergeFields: ["%%FirstName%%", "%%StudentType%%", "%%DeadlineDate%%", "%%InstitutionName%%"],
    };

    if (channel === 'email') {
      const email = editedContent as EmailDraft;
      return {
        ...baseContent,
        subject: email.subject,
        preheader: email.subject.substring(0, 100),
        body: email.body,
        ampscriptReady: true,
      };
    }

    if (channel === 'sms') {
      const text = editedContent as string;
      return {
        ...baseContent,
        message: text,
        characterCount: text.length,
        segmentCount: Math.ceil(text.length / 160),
        complianceNote: "Ensure opt-out language is included",
      };
    }

    if (channel === 'landing-page') {
      const lp = editedContent as LandingPageDraft;
      return {
        ...baseContent,
        headline: lp.headline,
        subheadline: lp.subheadline,
        body: lp.body,
        cta: lp.cta,
      };
    }

    if (channel === 'phone-call') {
      const script = editedContent as CallScriptDraft;
      return {
        ...baseContent,
        opening: script.opening,
        purpose: script.purpose,
        talkingPoints: script.talkingPoints,
        objectionHandlers: script.objectionHandlers,
        closing: script.closing,
        voicemail: script.voicemail,
      };
    }

    if (channel === 'digital-ad-search') {
      const ad = editedContent as SearchAdDraft;
      return {
        ...baseContent,
        headlines: ad.headlines,
        descriptions: ad.descriptions,
        displayUrl: ad.displayUrl,
        headlineCharLimits: ad.headlines?.map(h => ({ text: h, length: h.length, maxLength: 30 })),
        descriptionCharLimits: ad.descriptions?.map(d => ({ text: d, length: d.length, maxLength: 90 })),
      };
    }

    if (channel === 'digital-ad-social') {
      const ad = editedContent as SocialAdDraft;
      return {
        ...baseContent,
        primaryText: ad.primaryText,
        headline: ad.headline,
        description: ad.description,
        ctaButton: ad.ctaButton,
      };
    }

    if (channel === 'talking-points') {
      const tp = editedContent as TalkingPointsDraft;
      return {
        ...baseContent,
        context: tp.context,
        audience: tp.audience,
        openingHook: tp.openingHook,
        keyMessages: tp.keyMessages,
        supportingData: tp.supportingData,
        anticipatedQuestions: tp.anticipatedQuestions,
        suggestedResponses: tp.suggestedResponses,
        transitionPhrases: tp.transitionPhrases,
        closingStatement: tp.closingStatement,
      };
    }

    // Default for simple text channels
    return {
      ...baseContent,
      content: editedContent as string,
    };
  };

  const handleExportToSalesforce = () => {
    setSfmcDialogOpen(true);
  };

  const handleStartEdit = () => {
    setEditedContent(content);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  const getFullContent = (c: ChannelDrafts[keyof ChannelDrafts] = editedContent): string => {
    if (typeof c === 'string') return c;
    if (channel === 'email') {
      const email = c as EmailDraft;
      return `Subject: ${email.subject}\n\n${email.body}`;
    }
    if (channel === 'landing-page') {
      const lp = c as LandingPageDraft;
      return `${lp.headline}\n${lp.subheadline || ''}\n\n${lp.body}\n\n[${lp.cta}]`;
    }
    if (channel === 'phone-call') {
      const script = c as CallScriptDraft;
      return `OPENING:\n${script.opening}\n\nPURPOSE:\n${script.purpose}\n\nTALKING POINTS:\n${script.talkingPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n${script.objectionHandlers?.length ? `OBJECTION HANDLERS:\n${script.objectionHandlers.join('\n')}\n\n` : ''}CLOSING:\n${script.closing}\n\n${script.voicemail ? `VOICEMAIL:\n${script.voicemail}` : ''}`;
    }
    if (channel === 'digital-ad-search') {
      const ad = c as SearchAdDraft;
      return `HEADLINES:\n${(ad.headlines || []).join('\n')}\n\nDESCRIPTIONS:\n${(ad.descriptions || []).join('\n')}${ad.displayUrl ? `\n\nDISPLAY URL: ${ad.displayUrl}` : ''}`;
    }
    if (channel === 'digital-ad-social') {
      const ad = c as SocialAdDraft;
      return `PRIMARY TEXT:\n${ad.primaryText}\n\nHEADLINE: ${ad.headline}${ad.description ? `\nDESCRIPTION: ${ad.description}` : ''}\n\nCTA: ${ad.ctaButton}`;
    }
    if (channel === 'talking-points') {
      const tp = c as TalkingPointsDraft;
      let result = `EXECUTIVE TALKING POINTS\n${'='.repeat(40)}\n\n`;
      if (tp.context) result += `CONTEXT: ${tp.context}\n`;
      if (tp.audience) result += `AUDIENCE: ${tp.audience}\n\n`;
      if (tp.openingHook) result += `OPENING HOOK:\n"${tp.openingHook}"\n\n`;
      if (tp.keyMessages?.length) result += `KEY TALKING POINTS:\n${tp.keyMessages.map((m, i) => `${i + 1}. ${m}`).join('\n\n')}\n\n`;
      if (tp.supportingData?.length) result += `SUPPORTING DATA & EVIDENCE:\n${tp.supportingData.map(d => `📊 ${d}`).join('\n')}\n\n`;
      if (tp.anticipatedQuestions?.length) {
        result += `ANTICIPATED Q&A:\n`;
        tp.anticipatedQuestions.forEach((q, i) => {
          result += `Q: ${q}\n`;
          if (tp.suggestedResponses?.[i]) result += `A: ${tp.suggestedResponses[i]}\n`;
          result += '\n';
        });
      }
      if (tp.transitionPhrases?.length) result += `TRANSITION PHRASES:\n${tp.transitionPhrases.map(t => `→ "${t}"`).join('\n')}\n\n`;
      if (tp.closingStatement) result += `CLOSING STATEMENT:\n"${tp.closingStatement}"`;
      return result;
    }
    if (channel === 'news-article') {
      const article = c as NewsArticleDraft;
      let result = `${article.headline}\n`;
      if (article.subheadline) result += `${article.subheadline}\n`;
      result += `\n${article.leadParagraph}\n\n`;
      if (article.bodyParagraphs?.length) result += article.bodyParagraphs.join('\n\n') + '\n\n';
      if (article.pullQuote) result += `"${article.pullQuote.quote}"\n— ${article.pullQuote.attribution}\n\n`;
      if (article.boilerplate) result += `---\n${article.boilerplate}\n`;
      if (article.mediaContact) {
        result += `\nMedia Contact:\n${article.mediaContact.name}, ${article.mediaContact.title}\n${article.mediaContact.email}${article.mediaContact.phone ? ` | ${article.mediaContact.phone}` : ''}\n`;
      }
      return result;
    }
    if (channel === 'case-for-care') {
      const cfc = c as CaseForCareDraft;
      let result = `CASE FOR SUPPORT\n${'='.repeat(40)}\n\n`;
      if (cfc.documentTitle) result += `${cfc.documentTitle}\n`;
      if (cfc.campaignName) result += `Campaign: ${cfc.campaignName}\n`;
      if (cfc.targetAmount) result += `Goal: ${cfc.targetAmount}\n\n`;
      if (cfc.openingNarrative) result += `${cfc.openingNarrative}\n\n`;
      if (cfc.visionStatement) result += `VISION:\n${cfc.visionStatement}\n\n`;
      if (cfc.keyPrograms?.length) {
        result += `KEY PROGRAMS:\n`;
        cfc.keyPrograms.forEach(p => { result += `• ${p.name}: ${p.description} (Impact: ${p.impact})\n`; });
        result += '\n';
      }
      if (cfc.impactStatistics?.length) result += `IMPACT:\n${cfc.impactStatistics.map(s => `📊 ${s}`).join('\n')}\n\n`;
      if (cfc.givingLevels?.length) {
        result += `GIVING LEVELS:\n`;
        cfc.givingLevels.forEach(g => { result += `• ${g.amount}: ${g.impact}\n`; });
        result += '\n';
      }
      if (cfc.callToAction) result += `CALL TO ACTION:\n${cfc.callToAction}\n\n`;
      if (cfc.closingStatement) result += `${cfc.closingStatement}`;
      return result;
    }
    return '';
  };

  // Just commit edits locally, don't save to library
  const handleCommitEdits = () => {
    if (onContentChange) {
      onContentChange(channel, editedContent);
    }
    setIsEditing(false);
  };

  // Separate action to save to library
  const handleSaveToLibrary = () => {
    if (onSaveToLibrary) {
      // Support both the full signature and a simple callback
      if (onSaveToLibrary.length === 0) {
        (onSaveToLibrary as () => void)();
      } else {
        onSaveToLibrary(channel, editedContent, getFullContent(editedContent));
      }
    }
  };

  // Edit renderers for each channel type
  const renderEmailEdit = () => {
    const email = editedContent as EmailDraft;
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Subject Line</Label>
          <Input
            value={email.subject}
            onChange={(e) => setEditedContent({ ...email, subject: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Email Body</Label>
          <Textarea
            value={email.body}
            onChange={(e) => setEditedContent({ ...email, body: e.target.value })}
            className="mt-1 min-h-[200px]"
          />
        </div>
      </div>
    );
  };

  const renderSimpleTextEdit = () => {
    const text = editedContent as string;
    return (
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setEditedContent(e.target.value)}
          className="min-h-[120px]"
        />
        {channel === 'sms' && <SmsCharCounter text={text} />}
        {channel === 'social-media' && (
          <p className="text-xs text-muted-foreground">{text.length}/280 characters</p>
        )}
      </div>
    );
  };

  const renderLandingPageEdit = () => {
    const lp = editedContent as LandingPageDraft;
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Headline</Label>
          <Input
            value={lp.headline}
            onChange={(e) => setEditedContent({ ...lp, headline: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Subheadline</Label>
          <Input
            value={lp.subheadline || ''}
            onChange={(e) => setEditedContent({ ...lp, subheadline: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Body Content</Label>
          <Textarea
            value={lp.body}
            onChange={(e) => setEditedContent({ ...lp, body: e.target.value })}
            className="mt-1 min-h-[120px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Call to Action</Label>
          <Input
            value={lp.cta}
            onChange={(e) => setEditedContent({ ...lp, cta: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
    );
  };

  const renderCallScriptEdit = () => {
    const script = editedContent as CallScriptDraft;
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Opening</Label>
          <Textarea
            value={script.opening}
            onChange={(e) => setEditedContent({ ...script, opening: e.target.value })}
            className="mt-1 min-h-[60px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Purpose</Label>
          <Textarea
            value={script.purpose}
            onChange={(e) => setEditedContent({ ...script, purpose: e.target.value })}
            className="mt-1 min-h-[60px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Talking Points (one per line)</Label>
          <Textarea
            value={script.talkingPoints.join('\n')}
            onChange={(e) => setEditedContent({ ...script, talkingPoints: e.target.value.split('\n').filter(Boolean) })}
            className="mt-1 min-h-[100px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Objection Handlers (one per line)</Label>
          <Textarea
            value={(script.objectionHandlers || []).join('\n')}
            onChange={(e) => setEditedContent({ ...script, objectionHandlers: e.target.value.split('\n').filter(Boolean) })}
            className="mt-1 min-h-[60px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Closing</Label>
          <Textarea
            value={script.closing}
            onChange={(e) => setEditedContent({ ...script, closing: e.target.value })}
            className="mt-1 min-h-[60px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Voicemail Script</Label>
          <Textarea
            value={script.voicemail || ''}
            onChange={(e) => setEditedContent({ ...script, voicemail: e.target.value })}
            className="mt-1 min-h-[60px]"
          />
        </div>
      </div>
    );
  };

  const renderSearchAdEdit = () => {
    const ad = editedContent as SearchAdDraft;
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Headlines (max 30 chars each, one per line)</Label>
          <Textarea
            value={(ad.headlines || []).join('\n')}
            onChange={(e) => setEditedContent({ ...ad, headlines: e.target.value.split('\n').slice(0, 3) })}
            className="mt-1 min-h-[80px]"
            placeholder="Headline 1&#10;Headline 2&#10;Headline 3"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Descriptions (max 90 chars each, one per line)</Label>
          <Textarea
            value={(ad.descriptions || []).join('\n')}
            onChange={(e) => setEditedContent({ ...ad, descriptions: e.target.value.split('\n').slice(0, 2) })}
            className="mt-1 min-h-[60px]"
            placeholder="Description 1&#10;Description 2"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Display URL (optional)</Label>
          <Input
            value={ad.displayUrl || ''}
            onChange={(e) => setEditedContent({ ...ad, displayUrl: e.target.value })}
            className="mt-1"
            placeholder="university.edu/admissions"
          />
        </div>
      </div>
    );
  };

  const renderSocialAdEdit = () => {
    const ad = editedContent as SocialAdDraft;
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Primary Text (Ad Copy)</Label>
          <Textarea
            value={ad.primaryText || ''}
            onChange={(e) => setEditedContent({ ...ad, primaryText: e.target.value })}
            className="mt-1 min-h-[100px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Headline</Label>
          <Input
            value={ad.headline || ''}
            onChange={(e) => setEditedContent({ ...ad, headline: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Description</Label>
          <Input
            value={ad.description || ''}
            onChange={(e) => setEditedContent({ ...ad, description: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">CTA Button</Label>
          <Input
            value={ad.ctaButton || ''}
            onChange={(e) => setEditedContent({ ...ad, ctaButton: e.target.value })}
            className="mt-1"
            placeholder="Learn More"
          />
        </div>
      </div>
    );
  };

  const renderTalkingPointsEdit = () => {
    const tp = editedContent as TalkingPointsDraft;
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Context (e.g., "Board meeting", "Donor lunch")</Label>
          <Input
            value={tp.context || ''}
            onChange={(e) => setEditedContent({ ...tp, context: e.target.value })}
            className="mt-1"
            placeholder="Board presentation, individual meeting, speech..."
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Audience</Label>
          <Input
            value={tp.audience || ''}
            onChange={(e) => setEditedContent({ ...tp, audience: e.target.value })}
            className="mt-1"
            placeholder="Board of trustees, alumni donors..."
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Opening Hook</Label>
          <Textarea
            value={tp.openingHook || ''}
            onChange={(e) => setEditedContent({ ...tp, openingHook: e.target.value })}
            className="mt-1 min-h-[60px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Key Messages (one per line)</Label>
          <Textarea
            value={(tp.keyMessages || []).join('\n')}
            onChange={(e) => setEditedContent({ ...tp, keyMessages: e.target.value.split('\n').filter(Boolean) })}
            className="mt-1 min-h-[120px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Supporting Data/Evidence (one per line)</Label>
          <Textarea
            value={(tp.supportingData || []).join('\n')}
            onChange={(e) => setEditedContent({ ...tp, supportingData: e.target.value.split('\n').filter(Boolean) })}
            className="mt-1 min-h-[80px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Anticipated Questions (one per line)</Label>
          <Textarea
            value={(tp.anticipatedQuestions || []).join('\n')}
            onChange={(e) => setEditedContent({ ...tp, anticipatedQuestions: e.target.value.split('\n').filter(Boolean) })}
            className="mt-1 min-h-[80px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Suggested Responses (one per line, matches questions above)</Label>
          <Textarea
            value={(tp.suggestedResponses || []).join('\n')}
            onChange={(e) => setEditedContent({ ...tp, suggestedResponses: e.target.value.split('\n').filter(Boolean) })}
            className="mt-1 min-h-[80px]"
            placeholder="Answer 1&#10;Answer 2&#10;Answer 3"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Transition Phrases (one per line)</Label>
          <Textarea
            value={(tp.transitionPhrases || []).join('\n')}
            onChange={(e) => setEditedContent({ ...tp, transitionPhrases: e.target.value.split('\n').filter(Boolean) })}
            className="mt-1 min-h-[60px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Closing Statement</Label>
          <Textarea
            value={tp.closingStatement || ''}
            onChange={(e) => setEditedContent({ ...tp, closingStatement: e.target.value })}
            className="mt-1 min-h-[60px]"
          />
        </div>
      </div>
    );
  };

  const renderNewsArticleEdit = () => {
    const article = editedContent as NewsArticleDraft;
    return (
      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground">Headline</Label>
          <Input
            value={article.headline || ''}
            onChange={(e) => setEditedContent({ ...article, headline: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Subheadline</Label>
          <Input
            value={article.subheadline || ''}
            onChange={(e) => setEditedContent({ ...article, subheadline: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Lead Paragraph (The Lede)</Label>
          <Textarea
            value={article.leadParagraph || ''}
            onChange={(e) => setEditedContent({ ...article, leadParagraph: e.target.value })}
            className="mt-1 min-h-[80px]"
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Body Paragraphs (one per line, blank line between)</Label>
          <Textarea
            value={(article.bodyParagraphs || []).join('\n\n')}
            onChange={(e) => setEditedContent({ ...article, bodyParagraphs: e.target.value.split('\n\n').filter(Boolean) })}
            className="mt-1 min-h-[150px]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Pull Quote</Label>
            <Textarea
              value={article.pullQuote?.quote || ''}
              onChange={(e) => setEditedContent({ ...article, pullQuote: { ...article.pullQuote, quote: e.target.value, attribution: article.pullQuote?.attribution || '' } })}
              className="mt-1 min-h-[60px]"
              placeholder="A compelling quote..."
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Quote Attribution</Label>
            <Input
              value={article.pullQuote?.attribution || ''}
              onChange={(e) => setEditedContent({ ...article, pullQuote: { ...article.pullQuote, quote: article.pullQuote?.quote || '', attribution: e.target.value } })}
              className="mt-1"
              placeholder="Name, Title"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Boilerplate (About the Institution)</Label>
          <Textarea
            value={article.boilerplate || ''}
            onChange={(e) => setEditedContent({ ...article, boilerplate: e.target.value })}
            className="mt-1 min-h-[60px]"
          />
        </div>
      </div>
    );
  };

  const renderEditContent = () => {
    switch (channel) {
      case 'email':
        return renderEmailEdit();
      case 'sms':
      case 'social-media':
      case 'portal':
      case 'direct-mail':
        return renderSimpleTextEdit();
      case 'landing-page':
        return renderLandingPageEdit();
      case 'phone-call':
        return renderCallScriptEdit();
      case 'digital-ad-search':
        return renderSearchAdEdit();
      case 'digital-ad-social':
        return renderSocialAdEdit();
      case 'talking-points':
        return renderTalkingPointsEdit();
      case 'news-article':
        return renderNewsArticleEdit();
      case 'case-for-care':
        return renderCaseForCareEdit();
      default:
        return renderSimpleTextEdit();
    }
  };

  const renderCaseForCareEdit = () => {
    const cfc = editedContent as CaseForCareDraft;
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Document Title</Label>
            <Input value={cfc.documentTitle || ''} onChange={(e) => setEditedContent({ ...cfc, documentTitle: e.target.value })} className="mt-1" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Campaign Name</Label>
            <Input value={cfc.campaignName || ''} onChange={(e) => setEditedContent({ ...cfc, campaignName: e.target.value })} className="mt-1" />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Target Amount</Label>
          <Input value={cfc.targetAmount || ''} onChange={(e) => setEditedContent({ ...cfc, targetAmount: e.target.value })} className="mt-1" placeholder="$50 million" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Opening Narrative (Story)</Label>
          <Textarea value={cfc.openingNarrative || ''} onChange={(e) => setEditedContent({ ...cfc, openingNarrative: e.target.value })} className="mt-1 min-h-[120px]" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Vision Statement</Label>
          <Textarea value={cfc.visionStatement || ''} onChange={(e) => setEditedContent({ ...cfc, visionStatement: e.target.value })} className="mt-1 min-h-[60px]" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Impact Statistics (one per line)</Label>
          <Textarea value={(cfc.impactStatistics || []).join('\n')} onChange={(e) => setEditedContent({ ...cfc, impactStatistics: e.target.value.split('\n').filter(Boolean) })} className="mt-1 min-h-[80px]" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Call to Action</Label>
          <Textarea value={cfc.callToAction || ''} onChange={(e) => setEditedContent({ ...cfc, callToAction: e.target.value })} className="mt-1 min-h-[60px]" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Closing Statement</Label>
          <Textarea value={cfc.closingStatement || ''} onChange={(e) => setEditedContent({ ...cfc, closingStatement: e.target.value })} className="mt-1 min-h-[60px]" />
        </div>
      </div>
    );
  };

  const renderEmailPreview = (email: EmailDraft) => (
    <div className="space-y-3">
      <div className="bg-muted/50 rounded-lg p-3 border border-border">
        <p className="text-xs text-muted-foreground mb-1">Subject Line</p>
        <p className="font-medium text-sm">{email.subject}</p>
      </div>
      <div className="bg-card rounded-lg p-4 border border-border">
        <p className="text-xs text-muted-foreground mb-2">Email Body</p>
        <p className="text-sm whitespace-pre-wrap">{email.body}</p>
      </div>
    </div>
  );

  const renderSmsPreview = (sms: string) => (
    <div className="space-y-2">
      <div className="bg-primary/10 rounded-2xl rounded-bl-sm p-4 max-w-[320px] border border-primary/20">
        <p className="text-sm whitespace-pre-wrap">{sms}</p>
      </div>
      <SmsCharCounter text={sms} />
    </div>
  );

  const renderSocialPreview = (post: string) => (
    <div className="bg-card rounded-lg p-4 border border-border max-w-[400px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
          <Share2 className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">Your Institution</p>
          <p className="text-xs text-muted-foreground">@institution</p>
        </div>
      </div>
      <p className="text-sm whitespace-pre-wrap">{post}</p>
      <p className="text-xs text-muted-foreground mt-2">{post.length}/280 characters</p>
    </div>
  );

  const renderPortalPreview = (notification: string) => (
    <div className="bg-card rounded-lg border border-border overflow-hidden max-w-[400px]">
      <div className="bg-primary/10 px-4 py-2 border-b border-border">
        <p className="text-xs font-medium text-primary">New Notification</p>
      </div>
      <div className="p-4">
        <p className="text-sm whitespace-pre-wrap">{notification}</p>
      </div>
    </div>
  );

  const renderLandingPagePreview = (lp: LandingPageDraft) => (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-6 text-center">
        <h2 className="text-xl font-bold mb-2">{lp.headline}</h2>
        {lp.subheadline && (
          <p className="text-sm text-muted-foreground">{lp.subheadline}</p>
        )}
      </div>
      <div className="p-6">
        <p className="text-sm whitespace-pre-wrap mb-4">{lp.body}</p>
        <Button className="w-full">{lp.cta}</Button>
      </div>
    </div>
  );

  const renderDirectMailPreview = (letter: string) => (
    <div className="bg-card rounded-lg p-6 border border-border shadow-sm max-w-[500px]">
      <p className="text-sm whitespace-pre-wrap font-serif">{letter}</p>
    </div>
  );

  const renderCallScriptPreview = (script: CallScriptDraft) => (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
        <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">OPENING</p>
        <p className="text-sm">{script.opening}</p>
      </div>
      
      <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">PURPOSE</p>
        <p className="text-sm">{script.purpose}</p>
      </div>
      
      <div className="bg-card rounded-lg p-4 border border-border">
        <p className="text-xs font-semibold text-muted-foreground mb-2">TALKING POINTS</p>
        <ul className="space-y-2">
          {script.talkingPoints.map((point, i) => (
            <li key={i} className="text-sm flex gap-2">
              <span className="text-primary font-medium">{i + 1}.</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
      
      {script.objectionHandlers && script.objectionHandlers.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-2">OBJECTION HANDLERS</p>
          <ul className="space-y-1">
            {script.objectionHandlers.map((handler, i) => (
              <li key={i} className="text-sm">• {handler}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
        <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">CLOSING</p>
        <p className="text-sm">{script.closing}</p>
      </div>
      
      {script.voicemail && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-1">VOICEMAIL SCRIPT</p>
          <p className="text-sm italic">{script.voicemail}</p>
        </div>
      )}
    </div>
  );

  const renderSearchAdPreview = (ad: SearchAdDraft) => (
    <div className="space-y-3">
      {/* Google/Bing Search Ad Preview */}
      <div className="bg-card rounded-lg border border-border p-4 max-w-[600px]">
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <span className="px-1 py-0.5 bg-muted rounded text-[10px] font-medium">Ad</span>
          <span>{ad.displayUrl || 'university.edu'}</span>
        </div>
        <div className="space-y-1">
          {(ad.headlines || []).map((headline, i) => (
            <span key={i} className="text-blue-600 dark:text-blue-400 text-lg font-medium hover:underline cursor-pointer">
              {headline}{i < (ad.headlines?.length || 0) - 1 ? ' | ' : ''}
            </span>
          ))}
        </div>
        <div className="mt-2 space-y-1">
          {(ad.descriptions || []).map((desc, i) => (
            <p key={i} className="text-sm text-muted-foreground">{desc}</p>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Headlines:</span> {(ad.headlines || []).map((h, i) => `${h.length}/30`).join(', ')} chars
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Descriptions:</span> {(ad.descriptions || []).map((d, i) => `${d.length}/90`).join(', ')} chars
          </p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground italic">
        Note: Upload your images directly in Google/Bing Ads Manager
      </p>
    </div>
  );

  const renderSocialAdPreview = (ad: SocialAdDraft) => (
    <div className="space-y-3">
      {/* Meta/LinkedIn Ad Preview */}
      <div className="bg-card rounded-lg border border-border overflow-hidden max-w-[400px]">
        {/* Ad header */}
        <div className="p-3 flex items-center gap-2 border-b border-border">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Your Institution</p>
            <p className="text-xs text-muted-foreground">Sponsored</p>
          </div>
        </div>
        
        {/* Primary text */}
        <div className="p-3">
          <p className="text-sm whitespace-pre-wrap">{ad.primaryText}</p>
        </div>
        
        {/* Image placeholder */}
        <div className="bg-muted/50 h-48 flex items-center justify-center border-y border-border">
          <div className="text-center text-muted-foreground">
            <Megaphone className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">Image uploaded separately</p>
          </div>
        </div>
        
        {/* Link preview */}
        <div className="p-3 bg-muted/30">
          <p className="text-xs text-muted-foreground uppercase">university.edu</p>
          <p className="text-sm font-semibold">{ad.headline}</p>
          {ad.description && <p className="text-xs text-muted-foreground">{ad.description}</p>}
        </div>
        
        {/* CTA */}
        <div className="p-3 border-t border-border">
          <Button size="sm" className="w-full">{ad.ctaButton || 'Learn More'}</Button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground italic">
        Note: Upload your creative assets directly in Meta/LinkedIn Ads Manager
      </p>
    </div>
  );

  const renderTalkingPointsPreview = (tp: TalkingPointsDraft) => (
    <div className="space-y-4">
      {/* Header with context */}
      <div className="bg-teal-50 dark:bg-teal-950/30 rounded-lg p-4 border border-teal-200 dark:border-teal-800">
        <div className="flex items-center gap-2 mb-3">
          <Mic className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          <span className="font-semibold text-lg text-teal-700 dark:text-teal-300">Executive Talking Points</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tp.context && (
            <div className="bg-white/50 dark:bg-black/20 rounded p-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Context</p>
              <p className="text-sm font-medium">{tp.context}</p>
            </div>
          )}
          {tp.audience && (
            <div className="bg-white/50 dark:bg-black/20 rounded p-2">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Audience</p>
              <p className="text-sm font-medium">{tp.audience}</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Opening Hook */}
      {tp.openingHook && (
        <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 uppercase tracking-wide">Opening Hook</p>
          <p className="text-sm leading-relaxed italic border-l-2 border-green-400 pl-3">"{tp.openingHook}"</p>
        </div>
      )}
      
      {/* Key Messages - Enhanced display */}
      {tp.keyMessages && tp.keyMessages.length > 0 && (
        <div className="bg-card rounded-lg p-4 border-2 border-primary/20">
          <p className="text-xs font-semibold text-primary mb-4 uppercase tracking-wide flex items-center gap-2">
            <Target className="w-4 h-4" />
            Key Talking Points
          </p>
          <div className="space-y-4">
            {tp.keyMessages.map((message, i) => (
              <div key={i} className="flex gap-3 bg-muted/30 rounded-lg p-3">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">{i + 1}</span>
                <p className="text-sm leading-relaxed pt-0.5">{message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Supporting Data */}
      {tp.supportingData && tp.supportingData.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-3 uppercase tracking-wide">Supporting Data & Evidence</p>
          <div className="grid gap-2">
            {tp.supportingData.map((data, i) => (
              <div key={i} className="flex items-start gap-2 bg-white/50 dark:bg-black/20 rounded p-2">
                <span className="text-blue-500 font-bold">📊</span>
                <span className="text-sm">{data}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Anticipated Q&A - Now with suggested responses */}
      {tp.anticipatedQuestions && tp.anticipatedQuestions.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-3 uppercase tracking-wide">Anticipated Q&A</p>
          <div className="space-y-3">
            {tp.anticipatedQuestions.map((question, i) => (
              <div key={i} className="bg-white/50 dark:bg-black/20 rounded-lg p-3 space-y-2">
                <p className="text-sm">
                  <span className="font-bold text-amber-700 dark:text-amber-400">Q:</span> {question}
                </p>
                {tp.suggestedResponses && tp.suggestedResponses[i] && (
                  <p className="text-sm pl-4 border-l-2 border-amber-300 text-muted-foreground">
                    <span className="font-bold text-green-600 dark:text-green-400">A:</span> {tp.suggestedResponses[i]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Transition Phrases */}
      {tp.transitionPhrases && tp.transitionPhrases.length > 0 && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Transition Phrases</p>
          <div className="flex flex-wrap gap-2">
            {tp.transitionPhrases.map((phrase, i) => (
              <span key={i} className="text-sm bg-background px-3 py-1.5 rounded-full border shadow-sm italic">"{phrase}"</span>
            ))}
          </div>
        </div>
      )}
      
      {/* Closing Statement */}
      {tp.closingStatement && (
        <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2 uppercase tracking-wide">Closing Statement</p>
          <p className="text-sm leading-relaxed font-medium border-l-2 border-purple-400 pl-3">"{tp.closingStatement}"</p>
        </div>
      )}
    </div>
  );

  const renderNewsArticlePreview = (article: NewsArticleDraft) => (
    <div className="space-y-4">
      {/* Article Header */}
      <div className="border-b border-border pb-4">
        <h2 className="text-xl font-bold mb-2">{article.headline}</h2>
        {article.subheadline && (
          <p className="text-sm text-muted-foreground italic">{article.subheadline}</p>
        )}
      </div>
      
      {/* Lead Paragraph */}
      <div className="bg-muted/30 rounded-lg p-4 border-l-4 border-primary">
        <p className="text-sm leading-relaxed font-medium">{article.leadParagraph}</p>
      </div>
      
      {/* Body Paragraphs */}
      {article.bodyParagraphs && article.bodyParagraphs.length > 0 && (
        <div className="space-y-3">
          {article.bodyParagraphs.map((paragraph, i) => (
            <p key={i} className="text-sm leading-relaxed">{paragraph}</p>
          ))}
        </div>
      )}
      
      {/* Pull Quote */}
      {article.pullQuote && article.pullQuote.quote && (
        <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary my-4">
          <p className="text-lg italic mb-2">"{article.pullQuote.quote}"</p>
          <p className="text-sm font-medium text-muted-foreground">— {article.pullQuote.attribution}</p>
        </div>
      )}
      
      {/* Boilerplate */}
      {article.boilerplate && (
        <div className="bg-muted/50 rounded-lg p-4 border border-border mt-4">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">About</p>
          <p className="text-sm">{article.boilerplate}</p>
        </div>
      )}
      
      {/* Media Contact */}
      {article.mediaContact && (
        <div className="bg-card rounded-lg p-4 border border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Media Contact</p>
          <p className="text-sm font-medium">{article.mediaContact.name}</p>
          <p className="text-xs text-muted-foreground">{article.mediaContact.title}</p>
          <p className="text-sm text-primary">{article.mediaContact.email}</p>
          {article.mediaContact.phone && (
            <p className="text-sm">{article.mediaContact.phone}</p>
          )}
        </div>
      )}
      
      {/* Tags */}
      {article.suggestedTags && article.suggestedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {article.suggestedTags.map((tag, i) => (
            <span key={i} className="text-xs bg-muted px-2 py-1 rounded-full">#{tag}</span>
          ))}
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    const displayContent = isEditing ? editedContent : content;
    if (!displayContent) return <p className="text-muted-foreground text-sm">No content generated</p>;
    
    switch (channel) {
      case 'email':
        return renderEmailPreview(displayContent as EmailDraft);
      case 'sms':
        return renderSmsPreview(displayContent as string);
      case 'social-media':
        return renderSocialPreview(displayContent as string);
      case 'portal':
        return renderPortalPreview(displayContent as string);
      case 'landing-page':
        return renderLandingPagePreview(displayContent as LandingPageDraft);
      case 'direct-mail':
        return renderDirectMailPreview(displayContent as string);
      case 'phone-call':
        return renderCallScriptPreview(displayContent as CallScriptDraft);
      case 'digital-ad-search':
        return renderSearchAdPreview(displayContent as SearchAdDraft);
      case 'digital-ad-social':
        return renderSocialAdPreview(displayContent as SocialAdDraft);
      case 'talking-points':
        // Check if content is a valid TalkingPointsDraft object
        if (typeof displayContent === 'object' && displayContent !== null && 
            ('keyMessages' in displayContent || 'context' in displayContent || 'audience' in displayContent || 'openingHook' in displayContent)) {
          return renderTalkingPointsPreview(displayContent as TalkingPointsDraft);
        }
        // Fallback to displaying as formatted text
        return <p className="text-sm whitespace-pre-wrap">{String(displayContent)}</p>;
      case 'news-article':
        if (typeof displayContent === 'object' && displayContent !== null && 
            ('headline' in displayContent || 'leadParagraph' in displayContent)) {
          return renderNewsArticlePreview(displayContent as NewsArticleDraft);
        }
        return <p className="text-sm whitespace-pre-wrap">{String(displayContent)}</p>;
      case 'case-for-care':
        // Log for debugging
        console.log('[ChannelPreview] case-for-care content:', displayContent, 'type:', typeof displayContent);
        if (typeof displayContent === 'object' && displayContent !== null && 
            ('documentTitle' in displayContent || 'openingNarrative' in displayContent || 'visionStatement' in displayContent || 'callToAction' in displayContent)) {
          return renderCaseForCarePreview(displayContent as CaseForCareDraft);
        }
        // If it's an object but doesn't match structure, try to display as JSON
        if (typeof displayContent === 'object' && displayContent !== null) {
          console.warn('[ChannelPreview] case-for-care content is object but missing expected fields:', Object.keys(displayContent));
          return renderCaseForCarePreview(displayContent as CaseForCareDraft);
        }
        return <p className="text-sm whitespace-pre-wrap">{String(displayContent)}</p>;
      default:
        return <p className="text-sm whitespace-pre-wrap">{String(displayContent)}</p>;
    }
  };

  // Helper to render stat (handles both string and object format)
  const renderStat = (stat: string | { value: string; label: string; context?: string }, index: number) => {
    if (typeof stat === 'string') {
      // Legacy string format - try to extract number
      const match = stat.match(/^([\d.]+%?|\$[\d,.]+[BMK]?|#\d+|[\d,]+\+?)/);
      if (match) {
        const value = match[1];
        const label = stat.replace(value, '').trim();
        return (
          <div key={index} className="text-center p-4 bg-card rounded-xl border shadow-sm">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{value}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">{label}</div>
          </div>
        );
      }
      return (
        <div key={index} className="text-center p-4 bg-card rounded-xl border shadow-sm">
          <div className="text-sm text-foreground">{stat}</div>
        </div>
      );
    }
    // Object format { value, label, context }
    return (
      <div key={index} className="text-center p-4 bg-card rounded-xl border shadow-sm">
        <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">{stat.label}</div>
        {stat.context && <div className="text-xs text-muted-foreground mt-1">{stat.context}</div>}
      </div>
    );
  };

  const renderCaseForCarePreview = (cfc: CaseForCareDraft) => (
    <div className="space-y-6 -mx-2">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-rose-600 via-rose-500 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3 opacity-90">
            <Heart className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider">Case for Support</span>
          </div>
          {cfc.documentTitle && (
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{cfc.documentTitle}</h2>
          )}
          {cfc.campaignTagline && (
            <p className="text-lg italic opacity-90 mb-3">{cfc.campaignTagline}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-4">
            {cfc.campaignName && (
              <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">{cfc.campaignName}</Badge>
            )}
            {cfc.targetAmount && (
              <Badge className="bg-white text-rose-600 hover:bg-white/90 font-bold">{cfc.targetAmount} Goal</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Leader's Message */}
      {cfc.leaderMessage && (
        <div className="bg-gradient-to-br from-slate-50 to-stone-50 dark:from-slate-950/50 dark:to-stone-950/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">A Message from Leadership</h3>
              <p className="text-sm font-semibold text-foreground">{cfc.leaderMessage.leaderName}</p>
              <p className="text-xs text-muted-foreground mb-4">{cfc.leaderMessage.leaderTitle}</p>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap italic">
                {cfc.leaderMessage.message}
              </p>
              {cfc.leaderMessage.signature && (
                <p className="text-sm font-medium text-foreground mt-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                  — {cfc.leaderMessage.signature}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Strategic Pillars */}
      {cfc.strategicPillars && cfc.strategicPillars.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Our Strategic Vision
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {cfc.strategicPillars.map((pillar, i) => {
              const pillarColors = [
                'from-blue-500 to-cyan-500',
                'from-purple-500 to-pink-500', 
                'from-emerald-500 to-teal-500'
              ];
              const bgColors = [
                'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
                'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800',
                'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800'
              ];
              return (
                <div key={i} className={`rounded-xl p-5 border ${bgColors[i % 3]}`}>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pillarColors[i % 3]} flex items-center justify-center mb-3`}>
                    {i === 0 && <GraduationCap className="w-5 h-5 text-white" />}
                    {i === 1 && <Lightbulb className="w-5 h-5 text-white" />}
                    {i === 2 && <Users className="w-5 h-5 text-white" />}
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{pillar.name}</h4>
                  <p className="text-sm text-muted-foreground">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Opening Story Block */}
      {(cfc.openingStory || cfc.openingNarrative) && (
        <div className="relative bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-6 border border-amber-200 dark:border-amber-800">
          <div className="absolute -top-3 left-6 text-6xl text-amber-400/60 font-serif leading-none">"</div>
          <div className="relative pt-4">
            {cfc.openingStory?.headline && (
              <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-3">{cfc.openingStory.headline}</h3>
            )}
            <p className="text-base leading-relaxed text-foreground/90 whitespace-pre-wrap font-serif">
              {cfc.openingStory?.narrative || cfc.openingNarrative}
            </p>
            {cfc.openingStory?.attribution && (
              <p className="text-sm text-muted-foreground mt-4 font-medium">— {cfc.openingStory.attribution}</p>
            )}
          </div>
          <div className="absolute -bottom-3 right-6 text-6xl text-amber-400/60 font-serif leading-none rotate-180">"</div>
        </div>
      )}

      {/* Pull Quote Band */}
      {cfc.pullQuotes && cfc.pullQuotes.length > 0 && (
        <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-6">
          {cfc.pullQuotes.map((pq, i) => (
            <div key={i} className={i > 0 ? 'mt-4 pt-4 border-t border-primary/20' : ''}>
              <p className="text-xl md:text-2xl italic font-medium text-primary/90">"{pq.quote}"</p>
              {pq.attribution && (
                <p className="text-sm text-muted-foreground mt-2 text-right">— {pq.attribution}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Impact Statistics Grid */}
      {cfc.impactStatistics && cfc.impactStatistics.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-4 uppercase tracking-wider flex items-center gap-2">
            <span className="w-8 h-0.5 bg-blue-400" />
            Impact by the Numbers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {cfc.impactStatistics.map((stat, i) => renderStat(stat, i))}
          </div>
        </div>
      )}

      {/* Vision & Mission Cards */}
      {(cfc.visionStatement || cfc.missionConnection) && (
        <div className="grid md:grid-cols-2 gap-4">
          {cfc.visionStatement && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">Vision</span>
              </div>
              <p className="text-sm font-medium text-foreground">{cfc.visionStatement}</p>
            </div>
          )}
          {cfc.missionConnection && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">Mission</span>
              </div>
              <p className="text-sm font-medium text-foreground">{cfc.missionConnection}</p>
            </div>
          )}
        </div>
      )}

      {/* Problem Statement */}
      {cfc.problemStatement && (
        <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-xl p-5 border-l-4 border-rose-400">
          <p className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">The Challenge</p>
          <p className="text-sm text-foreground">{cfc.problemStatement}</p>
        </div>
      )}

      {/* Key Programs */}
      {cfc.keyPrograms && cfc.keyPrograms.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Key Initiatives</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {cfc.keyPrograms.map((p, i) => (
              <div key={i} className="bg-card rounded-xl p-4 border shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-foreground mb-1">{p.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{p.description}</p>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
                    Impact: {p.impact}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Testimonials */}
      {cfc.testimonials && cfc.testimonials.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Voices of Impact</h3>
          <div className="grid gap-3">
            {cfc.testimonials.map((t, i) => (
              <div key={i} className="bg-card rounded-xl p-5 border-l-4 border-rose-400 shadow-sm">
                <p className="text-sm italic text-foreground mb-3">"{t.quote}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center">
                    <User className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.attribution}</p>
                    {t.role && <p className="text-xs text-muted-foreground">{t.role}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Giving Opportunities Table (UC Davis style) */}
      {cfc.givingOpportunities && cfc.givingOpportunities.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            Philanthropic Opportunities
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            {cfc.givingOpportunities.map((cat, i) => {
              const catColors = [
                'border-t-blue-500 bg-blue-50/50 dark:bg-blue-950/20',
                'border-t-purple-500 bg-purple-50/50 dark:bg-purple-950/20',
                'border-t-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
              ];
              const textColors = [
                'text-blue-700 dark:text-blue-400',
                'text-purple-700 dark:text-purple-400',
                'text-emerald-700 dark:text-emerald-400'
              ];
              return (
                <div key={i} className={`rounded-xl border border-t-4 ${catColors[i % 3]} p-4`}>
                  <h4 className={`font-semibold text-sm mb-3 ${textColors[i % 3]}`}>{cat.category}</h4>
                  <div className="space-y-3">
                    {cat.opportunities.map((opp, j) => (
                      <div key={j} className="bg-white/60 dark:bg-black/20 rounded-lg p-3">
                        <p className="font-medium text-sm text-foreground">{opp.name}</p>
                        <p className="text-lg font-bold text-primary">{opp.amount}</p>
                        <p className="text-xs text-muted-foreground">{opp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Giving Levels - Tier Cards (fallback/legacy) */}
      {cfc.givingLevels && cfc.givingLevels.length > 0 && !cfc.givingOpportunities && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Ways to Give</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {cfc.givingLevels.map((g, i) => {
              // Make larger amounts more prominent
              const isLarge = g.amount.includes('100') || g.amount.includes('million') || i === cfc.givingLevels!.length - 1;
              return (
                <div 
                  key={i} 
                  className={`rounded-xl p-4 text-center border transition-all hover:scale-105 ${
                    isLarge 
                      ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white border-amber-300 col-span-2 md:col-span-1' 
                      : 'bg-card border-border'
                  }`}
                >
                  <p className={`text-lg font-bold mb-1 ${isLarge ? 'text-white' : 'text-foreground'}`}>{g.amount}</p>
                  <p className={`text-xs ${isLarge ? 'text-white/90' : 'text-muted-foreground'}`}>{g.impact}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Call to Action Banner */}
      {cfc.callToAction && (
        <div className="bg-gradient-to-r from-rose-600 to-purple-600 rounded-2xl p-6 text-white text-center">
          <p className="text-lg md:text-xl font-semibold mb-4">{cfc.callToAction}</p>
          {cfc.contactInfo && (
            <div className="flex flex-wrap justify-center gap-4 text-sm opacity-90">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {cfc.contactInfo.name}, {cfc.contactInfo.title}
              </span>
              {cfc.contactInfo.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {cfc.contactInfo.email}
                </span>
              )}
              {cfc.contactInfo.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  {cfc.contactInfo.phone}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Closing Statement */}
      {cfc.closingStatement && (
        <div className="border-t-2 border-dashed border-muted pt-6 text-center">
          <p className="text-base italic text-muted-foreground font-serif">{cfc.closingStatement}</p>
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {channelIcons[channel]}
            {channelLabels[channel]}
          </CardTitle>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  className="text-muted-foreground"
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleCommitEdits}
                  title="Save edits"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Done
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleStartEdit}
                  title="Edit content"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                {onSaveToLibrary && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSaveToLibrary}
                    title="Save to Personal Library"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </Button>
                )}
                {['email', 'sms', 'landing-page'].includes(channel) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportToSalesforce}
                    title="Push to Salesforce Marketing Cloud"
                  >
                    <Cloud className="w-4 h-4 text-blue-500" />
                  </Button>
                )}
                {['talking-points', 'case-for-care'].includes(channel) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportToPDF}
                    title="Export to PDF"
                  >
                    <FileDown className="w-4 h-4 text-red-500" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenInGoogleDocs}
                  title="Open in Google Docs"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(getFullContent(editedContent))}
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? renderEditContent() : renderContent()}
      </CardContent>

      <SalesforceCredentialsDialog
        open={sfmcDialogOpen}
        onOpenChange={setSfmcDialogOpen}
        content={getFullContent(editedContent)}
        contentName={`${channelLabels[channel]} - ${new Date().toLocaleDateString()}`}
        channel={channel}
      />
    </Card>
  );
}
