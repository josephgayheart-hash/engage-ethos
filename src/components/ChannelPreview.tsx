import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SmsCharCounter } from "@/components/ui/sms-char-counter";
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
  FolderPlus
} from "lucide-react";
import type { 
  ChannelDrafts, 
  EmailDraft, 
  LandingPageDraft, 
  CallScriptDraft,
  Channel 
} from "@/types/persist";

interface ChannelPreviewProps {
  channel: Channel;
  content: ChannelDrafts[keyof ChannelDrafts];
  onCopy: (text: string) => void;
  onContentChange?: (channel: Channel, content: ChannelDrafts[keyof ChannelDrafts]) => void;
  onSaveToLibrary?: (channel: Channel, content: ChannelDrafts[keyof ChannelDrafts], contentText: string) => void;
}

const channelIcons: Record<Channel, React.ReactNode> = {
  'email': <Mail className="w-4 h-4" />,
  'sms': <MessageSquare className="w-4 h-4" />,
  'social-media': <Share2 className="w-4 h-4" />,
  'portal': <Monitor className="w-4 h-4" />,
  'landing-page': <Globe className="w-4 h-4" />,
  'direct-mail': <FileText className="w-4 h-4" />,
  'phone-call': <Phone className="w-4 h-4" />,
};

const channelLabels: Record<Channel, string> = {
  'email': 'Email',
  'sms': 'SMS/Text',
  'social-media': 'Social Media',
  'portal': 'Portal Notification',
  'landing-page': 'Landing Page',
  'direct-mail': 'Direct Mail',
  'phone-call': 'Phone Script',
};

export function ChannelPreview({ channel, content, onCopy, onContentChange, onSaveToLibrary }: ChannelPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState<ChannelDrafts[keyof ChannelDrafts]>(content);

  // Sync editedContent with parent content when it changes
  useEffect(() => {
    setEditedContent(content);
  }, [content]);

  const handleCopy = (text: string) => {
    onCopy(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      onSaveToLibrary(channel, editedContent, getFullContent(editedContent));
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
      default:
        return renderSimpleTextEdit();
    }
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
      default:
        return <p className="text-sm whitespace-pre-wrap">{String(displayContent)}</p>;
    }
  };

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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(getFullContent(editedContent))}
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
    </Card>
  );
}
