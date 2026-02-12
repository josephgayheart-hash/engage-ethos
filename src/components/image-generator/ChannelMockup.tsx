import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ThumbsUp, Share2, Globe, ChevronLeft, ChevronRight, Search, Star, MapPin, Clock, User, ExternalLink } from "lucide-react";

interface ChannelMockupProps {
  channel: string;
  imageUrl: string;
  profileName?: string;
}

const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto" style={{ maxWidth: 320 }}>
    <div className="rounded-[2.5rem] border-[3px] border-foreground/20 bg-foreground/5 p-2 shadow-2xl">
      {/* Notch */}
      <div className="relative rounded-[2rem] bg-background overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground/20 rounded-b-2xl z-10" />
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-2 pb-1 text-[10px] font-medium text-foreground/60 relative z-20">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-2 border border-foreground/40 rounded-sm relative">
              <div className="absolute inset-0.5 bg-foreground/40 rounded-[1px]" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
        {children}
        {/* Home indicator */}
        <div className="flex justify-center py-2">
          <div className="w-28 h-1 bg-foreground/20 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const BrowserFrame = ({ url, children }: { url: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-border bg-background shadow-2xl overflow-hidden">
    {/* Title bar */}
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/60 border-b border-border">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
      </div>
      {/* Address bar */}
      <div className="flex-1 flex items-center gap-1.5 bg-background rounded-md px-2.5 py-1 text-[10px] text-muted-foreground border border-border/50">
        <Globe className="w-3 h-3 shrink-0" />
        <span className="truncate">{url}</span>
      </div>
    </div>
    {children}
  </div>
);

const SocialMediaMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <PhoneFrame>
    {/* App header */}
    <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
      <span className="text-sm font-semibold text-foreground">Instagram</span>
      <MoreHorizontal className="w-4 h-4 text-foreground/60" />
    </div>
    {/* Post header */}
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-[10px] font-bold text-primary">{(profileName || "U").charAt(0)}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground leading-tight">{profileName || "your_university"}</p>
        <p className="text-[10px] text-muted-foreground">Sponsored</p>
      </div>
    </div>
    {/* Image */}
    <div className="aspect-square">
      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
    </div>
    {/* Actions */}
    <div className="px-3 py-2 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Heart className="w-5 h-5 text-foreground/70" />
        <MessageCircle className="w-5 h-5 text-foreground/70" />
        <Send className="w-5 h-5 text-foreground/70" />
      </div>
      <Bookmark className="w-5 h-5 text-foreground/70" />
    </div>
    <div className="px-3 pb-2">
      <p className="text-[10px] font-semibold text-foreground">1,247 likes</p>
      <p className="text-[10px] text-muted-foreground mt-0.5">
        <span className="font-semibold text-foreground">{profileName || "your_university"}</span>{" "}
        Your caption goes here…
      </p>
    </div>
  </PhoneFrame>
);

const SocialAdMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <PhoneFrame>
    {/* Feed header */}
    <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
      <span className="text-sm font-semibold text-foreground">Feed</span>
      <Search className="w-4 h-4 text-foreground/60" />
    </div>
    {/* Ad header */}
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-[10px] font-bold text-primary">{(profileName || "U").charAt(0)}</span>
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-foreground leading-tight">{profileName || "Your University"}</p>
        <p className="text-[10px] text-muted-foreground">Sponsored · <Globe className="w-2.5 h-2.5 inline" /></p>
      </div>
      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
    </div>
    {/* Ad copy */}
    <p className="px-3 pb-1.5 text-[11px] text-foreground">Discover what makes us different. Apply now for Fall 2026. 🎓</p>
    {/* Image */}
    <div className="aspect-square">
      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
    </div>
    {/* CTA */}
    <div className="px-3 py-2 flex items-center justify-between border-t border-border/30 bg-muted/30">
      <div>
        <p className="text-[10px] text-muted-foreground">{profileName?.toLowerCase().replace(/\s+/g, '') || "university"}.edu</p>
        <p className="text-xs font-semibold text-foreground">Learn More</p>
      </div>
      <div className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-md">
        Apply Now
      </div>
    </div>
    {/* Engagement */}
    <div className="px-3 py-2 flex items-center gap-4">
      <div className="flex items-center gap-1 text-muted-foreground">
        <ThumbsUp className="w-3.5 h-3.5" />
        <span className="text-[10px]">Like</span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <MessageCircle className="w-3.5 h-3.5" />
        <span className="text-[10px]">Comment</span>
      </div>
      <div className="flex items-center gap-1 text-muted-foreground">
        <Share2 className="w-3.5 h-3.5" />
        <span className="text-[10px]">Share</span>
      </div>
    </div>
  </PhoneFrame>
);

const EmailMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <BrowserFrame url={`mail.google.com/mail/u/0/#inbox`}>
    <div className="flex min-h-[320px]">
      {/* Sidebar */}
      <div className="w-16 bg-muted/30 border-r border-border/50 p-2 space-y-2 hidden sm:block">
        <div className="w-full h-6 bg-primary/20 rounded text-[8px] text-primary font-semibold flex items-center justify-center">Inbox</div>
        <div className="w-full h-4 bg-muted rounded" />
        <div className="w-full h-4 bg-muted rounded" />
        <div className="w-full h-4 bg-muted rounded" />
      </div>
      {/* Email content */}
      <div className="flex-1 p-3">
        {/* Email header */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary">{(profileName || "U").charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{profileName || "Your University"}</p>
            <p className="text-[10px] text-muted-foreground">Your journey starts here — Fall 2026 Applications Open</p>
          </div>
        </div>
        {/* Hero image */}
        <div className="aspect-video rounded-md overflow-hidden mb-3">
          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
        </div>
        {/* Body placeholder */}
        <div className="space-y-1.5">
          <div className="h-2 bg-muted rounded w-full" />
          <div className="h-2 bg-muted rounded w-11/12" />
          <div className="h-2 bg-muted rounded w-9/12" />
          <div className="mt-3 w-24 h-7 bg-primary/20 rounded-md flex items-center justify-center">
            <span className="text-[10px] font-semibold text-primary">Apply Now →</span>
          </div>
        </div>
      </div>
    </div>
  </BrowserFrame>
);

const LandingPageMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <BrowserFrame url={`www.${profileName?.toLowerCase().replace(/\s+/g, '') || "university"}.edu`}>
    {/* Nav bar */}
    <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
          <span className="text-[8px] font-bold text-primary">{(profileName || "U").charAt(0)}</span>
        </div>
        <span className="text-[11px] font-semibold text-foreground">{profileName || "University"}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground">Admissions</span>
        <span className="text-[10px] text-muted-foreground">Academics</span>
        <span className="text-[10px] text-muted-foreground">Campus Life</span>
        <div className="bg-primary text-primary-foreground text-[9px] font-semibold px-2 py-1 rounded">Apply</div>
      </div>
    </div>
    {/* Hero */}
    <div className="relative">
      <div className="aspect-video">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      </div>
      {/* Overlay text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
        <h2 className="text-white text-lg font-bold leading-tight drop-shadow-lg">Your Future Starts Here</h2>
        <p className="text-white/80 text-[11px] mt-1 drop-shadow">Discover world-class education, research, and community.</p>
        <div className="mt-2 inline-flex w-fit bg-white text-foreground text-[10px] font-semibold px-3 py-1.5 rounded-md shadow">
          Explore Programs →
        </div>
      </div>
    </div>
    {/* Below hero */}
    <div className="p-4 space-y-2">
      <div className="h-2.5 bg-muted rounded w-3/4" />
      <div className="h-2 bg-muted rounded w-full" />
      <div className="h-2 bg-muted rounded w-5/6" />
    </div>
  </BrowserFrame>
);

const DirectMailMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <div className="flex items-center justify-center py-6" style={{ perspective: "800px" }}>
    <div
      className="rounded-lg overflow-hidden shadow-2xl border border-border/50 bg-background"
      style={{
        transform: "rotateY(-3deg) rotateX(2deg)",
        maxWidth: 360,
      }}
    >
      {/* Postcard image */}
      <div className="aspect-[4/3]">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      </div>
      {/* Bottom strip */}
      <div className="px-4 py-3 bg-background border-t border-border/50 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold text-foreground">{profileName || "Your University"}</p>
          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3" /> 123 Campus Drive
          </p>
        </div>
        <div className="w-10 h-10 border-2 border-dashed border-muted-foreground/30 rounded flex items-center justify-center">
          <span className="text-[7px] text-muted-foreground text-center leading-tight">STAMP</span>
        </div>
      </div>
    </div>
  </div>
);

const NewsArticleMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <BrowserFrame url="www.highereducationtoday.com/article/campus-spotlight">
    {/* News site header */}
    <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background">
      <span className="text-[11px] font-bold text-foreground tracking-tight">Higher Education Today</span>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground">News</span>
        <span className="text-[10px] text-muted-foreground">Features</span>
        <span className="text-[10px] text-muted-foreground">Opinion</span>
      </div>
    </div>
    {/* Article */}
    <div className="p-4">
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-2">
        <Clock className="w-3 h-3" />
        <span>February 12, 2026</span>
        <span>·</span>
        <span>Campus Spotlight</span>
      </div>
      <h3 className="text-sm font-bold text-foreground leading-snug mb-1">
        {profileName || "University"} Unveils New State-of-the-Art Facilities
      </h3>
      <p className="text-[10px] text-muted-foreground mb-3 flex items-center gap-1">
        <User className="w-3 h-3" /> By Sarah Mitchell, Education Correspondent
      </p>
      {/* Featured image */}
      <div className="aspect-video rounded-md overflow-hidden mb-3">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      </div>
      <p className="text-[10px] text-muted-foreground italic mb-3">
        {profileName || "The university"}'s new campus expansion aims to redefine the student experience.
      </p>
      {/* Article body placeholder */}
      <div className="space-y-1.5">
        <div className="h-2 bg-muted rounded w-full" />
        <div className="h-2 bg-muted rounded w-full" />
        <div className="h-2 bg-muted rounded w-10/12" />
        <div className="h-2 bg-muted rounded w-11/12" />
        <div className="h-2 bg-muted rounded w-8/12" />
      </div>
    </div>
  </BrowserFrame>
);

const mockupMap: Record<string, React.FC<{ imageUrl: string; profileName?: string }>> = {
  "social-media": SocialMediaMockup,
  "digital-ad-social": SocialAdMockup,
  "email": EmailMockup,
  "landing-page": LandingPageMockup,
  "direct-mail": DirectMailMockup,
  "news-article": NewsArticleMockup,
};

export const ChannelMockup = ({ channel, imageUrl, profileName }: ChannelMockupProps) => {
  const MockupComponent = mockupMap[channel] || SocialMediaMockup;
  return <MockupComponent imageUrl={imageUrl} profileName={profileName} />;
};
