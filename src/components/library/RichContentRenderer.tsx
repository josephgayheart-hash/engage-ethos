import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { SmsCharCounter } from "@/components/ui/sms-char-counter";
import { 
  Mail, 
  MessageSquare, 
  Globe, 
  Phone, 
  Search, 
  Megaphone, 
  Mic, 
  FileText,
  Share2,
  Monitor,
  Quote,
  Target,
  MessageCircle,
  HelpCircle,
  ArrowRight,
  Heart,
  Users,
  DollarSign
} from "lucide-react";
import type { 
  Channel, 
  EmailDraft, 
  LandingPageDraft, 
  CallScriptDraft,
  SearchAdDraft,
  SocialAdDraft,
  TalkingPointsDraft,
  NewsArticleDraft,
  CaseForCareDraft
} from "@/types/campusvoice";

interface RichContentRendererProps {
  content: string;
  channel?: string;
  className?: string;
}

// Parse content based on channel type
const parseContent = (content: string, channel?: string): any => {
  // Try to parse as JSON first (for structured content)
  try {
    const parsed = JSON.parse(content);
    // Check if it has journey metadata - if so, return raw for JourneyViewer
    if (parsed._metadata || parsed.phases || parsed.overview) {
      return null; // Let JourneyViewer handle this
    }
    return parsed;
  } catch {
    // Not JSON, try to parse based on channel format
  }

  // Parse email format
  if (channel === 'email' || content.toLowerCase().includes('subject:')) {
    const subjectMatch = content.match(/Subject:\s*(.+?)(?:\n|$)/i);
    const bodyMatch = content.match(/Subject:.+?\n\n?([\s\S]*)/i);
    if (subjectMatch) {
      return {
        _type: 'email',
        subject: subjectMatch[1].trim(),
        body: bodyMatch?.[1]?.trim() || content,
      };
    }
  }

  // Parse multi-channel kit format
  if (content.includes('[EMAIL]') || content.includes('[SMS]') || content.includes('[SOCIAL MEDIA]')) {
    const sections: { channel: string; content: string }[] = [];
    const regex = /\[(EMAIL|SMS|SOCIAL MEDIA|PORTAL|LANDING PAGE|PHONE CALL|TALKING POINTS|SEARCH AD|SOCIAL AD)\]\s*([\s\S]*?)(?=\[(?:EMAIL|SMS|SOCIAL MEDIA|PORTAL|LANDING PAGE|PHONE CALL|TALKING POINTS|SEARCH AD|SOCIAL AD)\]|---\s*$|$)/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
      sections.push({
        channel: match[1].toLowerCase().replace(' ', '-'),
        content: match[2].trim(),
      });
    }
    if (sections.length > 0) {
      return { _type: 'kit', sections };
    }
  }

  // Parse talking points format
  if (channel === 'talking-points' || content.includes('KEY TALKING POINTS') || content.includes('EXECUTIVE TALKING POINTS')) {
    const result: TalkingPointsDraft = {
      context: '',
      audience: '',
      openingHook: '',
      keyMessages: [],
      supportingData: [],
      anticipatedQuestions: [],
      suggestedResponses: [],
      transitionPhrases: [],
      closingStatement: '',
    };

    // Extract sections
    const contextMatch = content.match(/CONTEXT:\s*(.+?)(?:\n|$)/i);
    const audienceMatch = content.match(/AUDIENCE:\s*(.+?)(?:\n|$)/i);
    const openingMatch = content.match(/OPENING HOOK:?\s*\n?"?(.+?)"?\s*(?:\n\n|$)/is);
    const closingMatch = content.match(/CLOSING STATEMENT:?\s*\n?"?(.+?)"?\s*$/is);

    if (contextMatch) result.context = contextMatch[1].trim();
    if (audienceMatch) result.audience = audienceMatch[1].trim();
    if (openingMatch) result.openingHook = openingMatch[1].replace(/^"|"$/g, '').trim();
    if (closingMatch) result.closingStatement = closingMatch[1].replace(/^"|"$/g, '').trim();

    // Extract key messages
    const keyMessagesMatch = content.match(/KEY TALKING POINTS:?\s*\n([\s\S]*?)(?=SUPPORTING DATA|ANTICIPATED|TRANSITION|CLOSING|$)/i);
    if (keyMessagesMatch) {
      const messages = keyMessagesMatch[1].match(/(?:\d+\.|•)\s*(.+?)(?=\n(?:\d+\.|•)|\n\n|$)/g);
      if (messages) {
        result.keyMessages = messages.map(m => m.replace(/^(?:\d+\.|•)\s*/, '').trim()).filter(Boolean);
      }
    }

    // Extract supporting data
    const supportingMatch = content.match(/SUPPORTING DATA.*?:?\s*\n([\s\S]*?)(?=ANTICIPATED|TRANSITION|CLOSING|$)/i);
    if (supportingMatch) {
      const data = supportingMatch[1].match(/(?:📊|•)\s*(.+?)(?=\n(?:📊|•)|\n\n|$)/g);
      if (data) {
        result.supportingData = data.map(d => d.replace(/^(?:📊|•)\s*/, '').trim()).filter(Boolean);
      }
    }

    // Extract Q&A
    const qaMatch = content.match(/ANTICIPATED Q&A:?\s*\n([\s\S]*?)(?=TRANSITION|CLOSING|$)/i);
    if (qaMatch) {
      const questions = qaMatch[1].match(/Q:\s*(.+?)(?=\nA:|$)/g);
      const answers = qaMatch[1].match(/A:\s*(.+?)(?=\nQ:|\n\n|$)/g);
      if (questions) result.anticipatedQuestions = questions.map(q => q.replace(/^Q:\s*/, '').trim());
      if (answers) result.suggestedResponses = answers.map(a => a.replace(/^A:\s*/, '').trim());
    }

    if (result.keyMessages.length > 0 || result.openingHook || result.context) {
      return { _type: 'talking-points', ...result };
    }
  }

  // Parse call script format
  if (channel === 'phone-call' || content.includes('OPENING:') && content.includes('PURPOSE:')) {
    const result: Partial<CallScriptDraft> = {
      opening: '',
      purpose: '',
      talkingPoints: [],
      objectionHandlers: [],
      closing: '',
      voicemail: '',
    };

    const openingMatch = content.match(/OPENING:\s*\n?([\s\S]*?)(?=PURPOSE:|$)/i);
    const purposeMatch = content.match(/PURPOSE:\s*\n?([\s\S]*?)(?=TALKING POINTS:|$)/i);
    const talkingMatch = content.match(/TALKING POINTS:\s*\n?([\s\S]*?)(?=OBJECTION|CLOSING:|$)/i);
    const objectionMatch = content.match(/OBJECTION.*?:\s*\n?([\s\S]*?)(?=CLOSING:|$)/i);
    const closingMatch = content.match(/CLOSING:\s*\n?([\s\S]*?)(?=VOICEMAIL:|$)/i);
    const voicemailMatch = content.match(/VOICEMAIL:\s*\n?([\s\S]*)$/i);

    if (openingMatch) result.opening = openingMatch[1].trim();
    if (purposeMatch) result.purpose = purposeMatch[1].trim();
    if (closingMatch) result.closing = closingMatch[1].trim();
    if (voicemailMatch) result.voicemail = voicemailMatch[1].trim();

    if (talkingMatch) {
      const points = talkingMatch[1].match(/(?:\d+\.)\s*(.+?)(?=\n\d+\.|\n\n|$)/g);
      if (points) {
        result.talkingPoints = points.map(p => p.replace(/^\d+\.\s*/, '').trim());
      }
    }

    if (objectionMatch) {
      const handlers = objectionMatch[1].split('\n').filter(h => h.trim());
      result.objectionHandlers = handlers;
    }

    if (result.opening || result.purpose) {
      return { _type: 'phone-call', ...result };
    }
  }

  // Parse landing page format
  if (channel === 'landing-page') {
    const lines = content.split('\n').filter(Boolean);
    if (lines.length >= 2) {
      return {
        _type: 'landing-page',
        headline: lines[0],
        subheadline: lines.length > 2 ? lines[1] : undefined,
        body: lines.slice(lines.length > 2 ? 2 : 1, -1).join('\n'),
        cta: lines[lines.length - 1].replace(/^\[|\]$/g, ''),
      };
    }
  }

  // Parse search ad format
  if (channel === 'digital-ad-search' || content.includes('HEADLINES:')) {
    const headlinesMatch = content.match(/HEADLINES:\s*\n([\s\S]*?)(?=DESCRIPTIONS:|$)/i);
    const descriptionsMatch = content.match(/DESCRIPTIONS:\s*\n([\s\S]*?)(?=DISPLAY URL:|$)/i);
    const urlMatch = content.match(/DISPLAY URL:\s*(.+?)$/im);

    if (headlinesMatch) {
      return {
        _type: 'digital-ad-search',
        headlines: headlinesMatch[1].split('\n').map(h => h.trim()).filter(Boolean),
        descriptions: descriptionsMatch?.[1].split('\n').map(d => d.trim()).filter(Boolean) || [],
        displayUrl: urlMatch?.[1]?.trim(),
      };
    }
  }

  // Parse social ad format
  if (channel === 'digital-ad-social' || content.includes('PRIMARY TEXT:')) {
    const primaryMatch = content.match(/PRIMARY TEXT:\s*\n?([\s\S]*?)(?=HEADLINE:|$)/i);
    const headlineMatch = content.match(/HEADLINE:\s*(.+?)(?:\n|$)/i);
    const descMatch = content.match(/DESCRIPTION:\s*(.+?)(?:\n|$)/i);
    const ctaMatch = content.match(/CTA:\s*(.+?)$/im);

    if (primaryMatch || headlineMatch) {
      return {
        _type: 'digital-ad-social',
        primaryText: primaryMatch?.[1]?.trim() || '',
        headline: headlineMatch?.[1]?.trim() || '',
        description: descMatch?.[1]?.trim(),
        ctaButton: ctaMatch?.[1]?.trim() || 'Learn More',
      };
    }
  }

  // Parse Case for Support format
  if (channel === 'case-for-care' || content.includes('CASE FOR SUPPORT') || content.includes('documentTitle')) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.documentTitle || parsed.visionStatement || parsed.callToAction || parsed.openingNarrative) {
        return { _type: 'case-for-care', ...parsed };
      }
    } catch {
      // Try to parse from text format
      const result: Partial<CaseForCareDraft> = {
        documentTitle: '',
        campaignName: '',
        targetAmount: '',
        openingNarrative: '',
        visionStatement: '',
        keyPrograms: [],
        impactStatistics: [],
        givingLevels: [],
        callToAction: '',
        closingStatement: '',
      };

      const titleMatch = content.match(/^(.+?)\n/);
      const campaignMatch = content.match(/Campaign:\s*(.+?)(?:\n|$)/i);
      const goalMatch = content.match(/Goal:\s*(.+?)(?:\n|$)/i);
      const visionMatch = content.match(/VISION:\s*\n?([\s\S]*?)(?=KEY PROGRAMS|IMPACT|GIVING|CALL TO ACTION|$)/i);
      const ctaMatch = content.match(/CALL TO ACTION:\s*\n?([\s\S]*?)(?=\n\n|$)/i);

      if (titleMatch) result.documentTitle = titleMatch[1].trim();
      if (campaignMatch) result.campaignName = campaignMatch[1].trim();
      if (goalMatch) result.targetAmount = goalMatch[1].trim();
      if (visionMatch) result.visionStatement = visionMatch[1].trim();
      if (ctaMatch) result.callToAction = ctaMatch[1].trim();

      if (result.documentTitle || result.visionStatement || result.callToAction) {
        return { _type: 'case-for-care', ...result };
      }
    }
  }

  // Default: return null to render as plain text
  return null;
};

// Render email content
const EmailRenderer = ({ content }: { content: EmailDraft }) => (
  <div className="space-y-4">
    <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Subject Line</p>
      <p className="font-medium text-lg">{content.subject}</p>
    </div>
    <div className="bg-background rounded-lg p-4 border">
      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Email Body</p>
      <div className="prose prose-sm max-w-none">
        {content.body.split('\n').map((para, i) => (
          <p key={i} className="mb-3 last:mb-0">{para}</p>
        ))}
      </div>
    </div>
  </div>
);

// Render SMS content
const SmsRenderer = ({ content }: { content: string }) => (
  <div className="space-y-3">
    <div className="max-w-sm mx-auto">
      <div className="bg-primary text-primary-foreground rounded-2xl rounded-br-md p-4 shadow-sm">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>
    </div>
    <SmsCharCounter text={content} className="text-center" />
  </div>
);

// Render talking points
const TalkingPointsRenderer = ({ content }: { content: TalkingPointsDraft & { _type: string } }) => (
  <div className="space-y-6">
    {(content.context || content.audience) && (
      <div className="flex flex-wrap gap-4 text-sm">
        {content.context && (
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Context:</span>
            <span className="font-medium">{content.context}</span>
          </div>
        )}
        {content.audience && (
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Audience:</span>
            <span className="font-medium">{content.audience}</span>
          </div>
        )}
      </div>
    )}

    {content.openingHook && (
      <div className="bg-primary/5 border-l-4 border-primary rounded-r-lg p-4">
        <p className="text-xs text-primary uppercase tracking-wide mb-2 font-medium">Opening Hook</p>
        <p className="text-lg italic">"{content.openingHook}"</p>
      </div>
    )}

    {content.keyMessages && content.keyMessages.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Mic className="w-4 h-4" />
          Key Talking Points
        </h4>
        <div className="space-y-2">
          {content.keyMessages.map((msg, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-medium flex items-center justify-center">
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed">{msg}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {content.supportingData && content.supportingData.length > 0 && (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Supporting Data</h4>
        <div className="grid gap-2">
          {content.supportingData.map((data, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-primary">📊</span>
              <span>{data}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {content.anticipatedQuestions && content.anticipatedQuestions.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <HelpCircle className="w-4 h-4" />
          Anticipated Q&A
        </h4>
        <div className="space-y-3">
          {content.anticipatedQuestions.map((q, i) => (
            <div key={i} className="border rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium">Q: {q}</p>
              {content.suggestedResponses?.[i] && (
                <p className="text-sm text-muted-foreground">A: {content.suggestedResponses[i]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {content.transitionPhrases && content.transitionPhrases.length > 0 && (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Transition Phrases</h4>
        <div className="flex flex-wrap gap-2">
          {content.transitionPhrases.map((phrase, i) => (
            <Badge key={i} variant="outline" className="text-sm font-normal">
              "{phrase}"
            </Badge>
          ))}
        </div>
      </div>
    )}

    {content.closingStatement && (
      <div className="bg-secondary/10 border-l-4 border-secondary rounded-r-lg p-4">
        <p className="text-xs text-secondary uppercase tracking-wide mb-2 font-medium">Closing Statement</p>
        <p className="text-lg italic">"{content.closingStatement}"</p>
      </div>
    )}
  </div>
);

// Render call script
const CallScriptRenderer = ({ content }: { content: CallScriptDraft & { _type: string } }) => (
  <div className="space-y-4">
    {content.opening && (
      <div className="p-4 rounded-lg border bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
        <p className="text-xs text-green-700 dark:text-green-400 uppercase tracking-wide mb-2 font-medium">Opening</p>
        <p className="text-sm">{content.opening}</p>
      </div>
    )}

    {content.purpose && (
      <div className="p-4 rounded-lg border">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">Purpose</p>
        <p className="text-sm">{content.purpose}</p>
      </div>
    )}

    {content.talkingPoints && content.talkingPoints.length > 0 && (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Talking Points</p>
        <ol className="space-y-2 list-decimal list-inside">
          {content.talkingPoints.map((point, i) => (
            <li key={i} className="text-sm">{point}</li>
          ))}
        </ol>
      </div>
    )}

    {content.objectionHandlers && content.objectionHandlers.length > 0 && (
      <div className="p-4 rounded-lg border bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900">
        <p className="text-xs text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2 font-medium">Objection Handlers</p>
        <ul className="space-y-1">
          {content.objectionHandlers.map((handler, i) => (
            <li key={i} className="text-sm flex items-start gap-2">
              <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0" />
              {handler}
            </li>
          ))}
        </ul>
      </div>
    )}

    {content.closing && (
      <div className="p-4 rounded-lg border bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
        <p className="text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-2 font-medium">Closing</p>
        <p className="text-sm">{content.closing}</p>
      </div>
    )}

    {content.voicemail && (
      <div className="p-4 rounded-lg border border-dashed">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2 font-medium">📞 Voicemail Script</p>
        <p className="text-sm italic">{content.voicemail}</p>
      </div>
    )}
  </div>
);

// Render landing page
const LandingPageRenderer = ({ content }: { content: LandingPageDraft & { _type: string } }) => (
  <div className="border rounded-lg overflow-hidden">
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-8 text-center space-y-3">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{content.headline}</h1>
      {content.subheadline && (
        <h2 className="text-base md:text-lg text-muted-foreground font-medium">{content.subheadline}</h2>
      )}
      {content.slug && (
        <p className="text-xs text-muted-foreground/60 font-mono">/{content.slug}</p>
      )}
    </div>
    <div className="p-6 space-y-6">
      <div className="prose prose-sm max-w-none">
        {content.body.split('\n').filter(Boolean).map((para, i) => (
          <p key={i} className="mb-3 leading-relaxed">{para}</p>
        ))}
      </div>
      {content.sections && content.sections.length > 0 && (
        <div className="space-y-4 border-t border-border pt-4">
          {content.sections.map((section, i) => (
            <div key={i}>
              <h2 className="text-lg font-semibold mb-1">{section.heading}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>
      )}
      <div className="text-center pt-2">
        <span className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold text-sm tracking-wide">
          {content.cta}
        </span>
      </div>
    </div>
  </div>
);

// Render search ad
const SearchAdRenderer = ({ content }: { content: SearchAdDraft & { _type: string } }) => (
  <div className="space-y-4 max-w-lg">
    <div className="border rounded-lg p-4 bg-white dark:bg-background">
      <p className="text-xs text-green-700 mb-1">Ad • {content.displayUrl || 'example.edu'}</p>
      <div className="space-y-1 mb-2">
        {content.headlines?.map((h, i) => (
          <span key={i} className="text-blue-600 text-lg font-medium">
            {h}{i < (content.headlines?.length || 0) - 1 ? ' | ' : ''}
          </span>
        ))}
      </div>
      {content.descriptions?.map((d, i) => (
        <p key={i} className="text-sm text-muted-foreground">{d}</p>
      ))}
    </div>
    <div className="text-xs text-muted-foreground space-y-1">
      {content.headlines?.map((h, i) => (
        <div key={i} className="flex justify-between">
          <span>Headline {i + 1}</span>
          <span className={h.length > 30 ? 'text-destructive' : ''}>{h.length}/30</span>
        </div>
      ))}
      {content.descriptions?.map((d, i) => (
        <div key={i} className="flex justify-between">
          <span>Description {i + 1}</span>
          <span className={d.length > 90 ? 'text-destructive' : ''}>{d.length}/90</span>
        </div>
      ))}
    </div>
  </div>
);

// Render social ad
const SocialAdRenderer = ({ content }: { content: SocialAdDraft & { _type: string } }) => (
  <div className="max-w-md mx-auto border rounded-lg overflow-hidden">
    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
      <span className="text-muted-foreground text-sm">[Ad Image/Video]</span>
    </div>
    <div className="p-4 space-y-3">
      <p className="text-sm">{content.primaryText}</p>
      <Separator />
      <div>
        <p className="font-semibold">{content.headline}</p>
        {content.description && (
          <p className="text-sm text-muted-foreground">{content.description}</p>
        )}
      </div>
      <span className="inline-block bg-primary text-primary-foreground px-4 py-1.5 rounded text-sm font-medium">
        {content.ctaButton}
      </span>
    </div>
  </div>
);

// Render Case for Support
const CaseForCareRenderer = ({ content }: { content: CaseForCareDraft & { _type: string } }) => (
  <div className="space-y-6">
    {/* Header */}
    <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl p-6 border border-rose-200 dark:border-rose-900">
      <div className="flex items-center gap-3 mb-3">
        <Heart className="w-6 h-6 text-rose-500" />
        <span className="text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wide font-medium">Case for Support</span>
      </div>
      {content.documentTitle && (
        <h2 className="text-2xl font-bold mb-2">{content.documentTitle}</h2>
      )}
      {content.campaignName && (
        <p className="text-lg text-muted-foreground">{content.campaignName}</p>
      )}
      {content.campaignTagline && (
        <p className="text-sm italic text-rose-600 dark:text-rose-400 mt-2">"{content.campaignTagline}"</p>
      )}
      {content.targetAmount && (
        <div className="mt-4 inline-flex items-center gap-2 bg-rose-500 text-white px-4 py-2 rounded-lg">
          <DollarSign className="w-5 h-5" />
          <span className="font-bold text-lg">{content.targetAmount}</span>
        </div>
      )}
    </div>

    {/* Leader Message */}
    {content.leaderMessage && (
      <div className="bg-muted/50 rounded-lg p-5 border-l-4 border-rose-500">
        <p className="text-sm italic mb-3">"{content.leaderMessage.message}"</p>
        <p className="text-sm font-medium text-rose-600 dark:text-rose-400">
          — {content.leaderMessage.leaderName}, {content.leaderMessage.leaderTitle}
        </p>
      </div>
    )}

    {/* Opening Story or Narrative */}
    {(content.openingStory || content.openingNarrative) && (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Quote className="w-4 h-4" />
          Story of Impact
        </h4>
        {content.openingStory ? (
          <div className="bg-card rounded-lg p-4 border">
            {content.openingStory.headline && (
              <h5 className="font-semibold mb-2">{content.openingStory.headline}</h5>
            )}
            <p className="text-sm italic">{content.openingStory.narrative}</p>
            {content.openingStory.attribution && (
              <p className="text-xs text-muted-foreground mt-2">— {content.openingStory.attribution}</p>
            )}
          </div>
        ) : (
          <p className="text-sm">{content.openingNarrative}</p>
        )}
      </div>
    )}

    {/* Vision Statement */}
    {content.visionStatement && (
      <div className="space-y-2">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <Target className="w-4 h-4" />
          Our Vision
        </h4>
        <p className="text-sm">{content.visionStatement}</p>
      </div>
    )}

    {/* Strategic Pillars */}
    {content.strategicPillars && content.strategicPillars.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Strategic Pillars</h4>
        <div className="grid gap-3 md:grid-cols-2">
          {content.strategicPillars.map((pillar, i) => (
            <div key={i} className="bg-card rounded-lg p-4 border">
              <p className="font-medium text-rose-600 dark:text-rose-400">{pillar.name}</p>
              <p className="text-sm text-muted-foreground mt-1">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Key Programs */}
    {content.keyPrograms && content.keyPrograms.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Key Programs</h4>
        <div className="space-y-2">
          {content.keyPrograms.map((program, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-rose-500/10 text-rose-500 text-sm font-medium flex items-center justify-center">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{program.name}</p>
                <p className="text-sm text-muted-foreground">{program.description}</p>
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">Impact: {program.impact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Impact Statistics */}
    {content.impactStatistics && content.impactStatistics.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Impact by the Numbers</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {content.impactStatistics.map((stat, i) => (
            <div key={i} className="bg-rose-500 text-white rounded-lg p-4 text-center">
              <p className="text-xl font-bold">{typeof stat === 'string' ? stat : stat.value}</p>
              {typeof stat === 'object' && stat.label && (
                <p className="text-xs opacity-90 mt-1">{stat.label}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Giving Levels */}
    {content.givingLevels && content.givingLevels.length > 0 && (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Ways to Give
        </h4>
        <div className="space-y-2">
          {content.givingLevels.map((level, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="font-bold text-rose-600 dark:text-rose-400">{level.amount}</span>
              <span className="text-sm text-muted-foreground">{level.impact}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Call to Action */}
    {content.callToAction && (
      <div className="bg-rose-500 text-white rounded-xl p-5 text-center">
        <p className="font-medium">{content.callToAction}</p>
      </div>
    )}

    {/* Closing Statement */}
    {content.closingStatement && (
      <p className="text-center text-sm italic text-muted-foreground">{content.closingStatement}</p>
    )}

    {/* Contact Info */}
    {content.contactInfo && (
      <div className="bg-muted/50 rounded-lg p-4 text-center text-sm">
        <p className="font-medium">{content.contactInfo.name}</p>
        <p className="text-muted-foreground">{content.contactInfo.title}</p>
        <p className="text-rose-600 dark:text-rose-400">{content.contactInfo.email}</p>
        {content.contactInfo.phone && <p className="text-muted-foreground">{content.contactInfo.phone}</p>}
      </div>
    )}
  </div>
);

// Render multi-channel kit
const KitRenderer = ({ sections }: { sections: { channel: string; content: string }[] }) => (
  <div className="space-y-6">
    {sections.map((section, i) => (
      <div key={i} className="border rounded-lg overflow-hidden">
        <div className="bg-muted/50 px-4 py-2 border-b flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {section.channel.replace('-', ' ')}
          </Badge>
        </div>
        <div className="p-4">
          <RichContentRenderer content={section.content} channel={section.channel} />
        </div>
      </div>
    ))}
  </div>
);

export function RichContentRenderer({ content, channel, className }: RichContentRendererProps) {
  const parsed = parseContent(content, channel);

  // If we couldn't parse to structured format, render as plain text
  if (!parsed) {
    return (
      <div className={className}>
        <div className="bg-muted rounded-lg p-6">
          <pre className="whitespace-pre-wrap text-sm font-sans leading-relaxed">{content}</pre>
          {channel === 'sms' && <SmsCharCounter text={content} className="mt-4" />}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {parsed._type === 'email' && <EmailRenderer content={parsed} />}
      {parsed._type === 'talking-points' && <TalkingPointsRenderer content={parsed} />}
      {parsed._type === 'phone-call' && <CallScriptRenderer content={parsed} />}
      {parsed._type === 'landing-page' && <LandingPageRenderer content={parsed} />}
      {parsed._type === 'digital-ad-search' && <SearchAdRenderer content={parsed} />}
      {parsed._type === 'digital-ad-social' && <SocialAdRenderer content={parsed} />}
      {parsed._type === 'case-for-care' && <CaseForCareRenderer content={parsed} />}
      {parsed._type === 'kit' && <KitRenderer sections={parsed.sections} />}
      {channel === 'sms' && typeof parsed === 'string' && <SmsRenderer content={parsed} />}
      
      {/* If parsed but no matching type, fallback to structured JSON view */}
      {parsed && !parsed._type && typeof parsed === 'object' && (
        <div className="bg-muted rounded-lg p-6">
          <pre className="whitespace-pre-wrap text-sm font-mono">{JSON.stringify(parsed, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
