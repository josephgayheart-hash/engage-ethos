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
  ArrowRight
} from "lucide-react";
import type { 
  Channel, 
  EmailDraft, 
  LandingPageDraft, 
  CallScriptDraft,
  SearchAdDraft,
  SocialAdDraft,
  TalkingPointsDraft,
  NewsArticleDraft
} from "@/types/uplaybook";

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
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 text-center space-y-2">
      <h2 className="text-2xl font-bold">{content.headline}</h2>
      {content.subheadline && (
        <p className="text-muted-foreground">{content.subheadline}</p>
      )}
    </div>
    <div className="p-6">
      <div className="prose prose-sm max-w-none mb-6">
        {content.body.split('\n').map((para, i) => (
          <p key={i} className="mb-3">{para}</p>
        ))}
      </div>
      <div className="text-center">
        <span className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium">
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
