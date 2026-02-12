import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ThumbsUp, Share2, Globe, ChevronLeft, ChevronRight, Search, MapPin, Clock, User, Play, ChevronUp, Wifi, Monitor, Calendar, Mail } from "lucide-react";

interface ChannelMockupProps {
  channel: string;
  imageUrl: string;
  profileName?: string;
}

const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto" style={{ maxWidth: 320 }}>
    <div className="rounded-[2.5rem] border-[3px] border-foreground/20 bg-foreground/5 p-2 shadow-2xl">
      <div className="relative rounded-[2rem] bg-background overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-foreground/20 rounded-b-2xl z-10" />
        <div className="flex items-center justify-between px-5 pt-2 pb-1 text-[10px] font-medium text-foreground/60 relative z-20">
          <span>9:41</span>
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-2 border border-foreground/40 rounded-sm relative">
              <div className="absolute inset-0.5 bg-foreground/40 rounded-[1px]" style={{ width: '70%' }} />
            </div>
          </div>
        </div>
        {children}
        <div className="flex justify-center py-2">
          <div className="w-28 h-1 bg-foreground/20 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

const BrowserFrame = ({ url, children }: { url: string; children: React.ReactNode }) => (
  <div className="rounded-lg border border-border bg-background shadow-2xl overflow-hidden">
    <div className="flex items-center gap-2 px-3 py-2 bg-muted/60 border-b border-border">
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-destructive/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
      </div>
      <div className="flex-1 flex items-center gap-1.5 bg-background rounded-md px-2.5 py-1 text-[10px] text-muted-foreground border border-border/50">
        <Globe className="w-3 h-3 shrink-0" />
        <span className="truncate">{url}</span>
      </div>
    </div>
    {children}
  </div>
);

/* ─── Original 6 Mockups ─── */

const SocialMediaMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <PhoneFrame>
    <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
      <span className="text-sm font-semibold text-foreground">Instagram</span>
      <MoreHorizontal className="w-4 h-4 text-foreground/60" />
    </div>
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
        <span className="text-[10px] font-bold text-primary">{(profileName || "U").charAt(0)}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground leading-tight">{profileName || "your_university"}</p>
        <p className="text-[10px] text-muted-foreground">Sponsored</p>
      </div>
    </div>
    <div className="aspect-square">
      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
    </div>
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
    <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
      <span className="text-sm font-semibold text-foreground">Feed</span>
      <Search className="w-4 h-4 text-foreground/60" />
    </div>
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
    <p className="px-3 pb-1.5 text-[11px] text-foreground">Discover what makes us different. Apply now for Fall 2026. 🎓</p>
    <div className="aspect-square">
      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
    </div>
    <div className="px-3 py-2 flex items-center justify-between border-t border-border/30 bg-muted/30">
      <div>
        <p className="text-[10px] text-muted-foreground">{profileName?.toLowerCase().replace(/\s+/g, '') || "university"}.edu</p>
        <p className="text-xs font-semibold text-foreground">Learn More</p>
      </div>
      <div className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-md">
        Apply Now
      </div>
    </div>
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
  <BrowserFrame url="mail.google.com/mail/u/0/#inbox">
    <div className="flex min-h-[320px]">
      <div className="w-16 bg-muted/30 border-r border-border/50 p-2 space-y-2 hidden sm:block">
        <div className="w-full h-6 bg-primary/20 rounded text-[8px] text-primary font-semibold flex items-center justify-center">Inbox</div>
        <div className="w-full h-4 bg-muted rounded" />
        <div className="w-full h-4 bg-muted rounded" />
        <div className="w-full h-4 bg-muted rounded" />
      </div>
      <div className="flex-1 p-3">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-primary">{(profileName || "U").charAt(0)}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground truncate">{profileName || "Your University"}</p>
            <p className="text-[10px] text-muted-foreground">Your journey starts here — Fall 2026 Applications Open</p>
          </div>
        </div>
        <div className="aspect-video rounded-md overflow-hidden mb-3">
          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
        </div>
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
    <div className="relative">
      <div className="aspect-video">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4">
        <h2 className="text-white text-lg font-bold leading-tight drop-shadow-lg">Your Future Starts Here</h2>
        <p className="text-white/80 text-[11px] mt-1 drop-shadow">Discover world-class education, research, and community.</p>
        <div className="mt-2 inline-flex w-fit bg-white text-foreground text-[10px] font-semibold px-3 py-1.5 rounded-md shadow">
          Explore Programs →
        </div>
      </div>
    </div>
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
      style={{ transform: "rotateY(-3deg) rotateX(2deg)", maxWidth: 360 }}
    >
      <div className="aspect-[4/3]">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      </div>
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
    <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background">
      <span className="text-[11px] font-bold text-foreground tracking-tight">Higher Education Today</span>
      <div className="flex items-center gap-3">
        <span className="text-[10px] text-muted-foreground">News</span>
        <span className="text-[10px] text-muted-foreground">Features</span>
        <span className="text-[10px] text-muted-foreground">Opinion</span>
      </div>
    </div>
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
      <div className="aspect-video rounded-md overflow-hidden mb-3">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      </div>
      <p className="text-[10px] text-muted-foreground italic mb-3">
        {profileName || "The university"}'s new campus expansion aims to redefine the student experience.
      </p>
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

/* ─── 13 New Mockups ─── */

const StoryMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <PhoneFrame>
    <div className="relative" style={{ aspectRatio: "9/16" }}>
      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      {/* Story progress dots */}
      <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`flex-1 h-0.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/40'}`} />
        ))}
      </div>
      {/* Profile */}
      <div className="absolute top-5 left-3 flex items-center gap-2 z-10">
        <div className="w-7 h-7 rounded-full bg-white/30 backdrop-blur flex items-center justify-center">
          <span className="text-[9px] font-bold text-white">{(profileName || "U").charAt(0)}</span>
        </div>
        <span className="text-[10px] font-semibold text-white drop-shadow">{profileName || "your_university"}</span>
        <span className="text-[9px] text-white/60">2h</span>
      </div>
      {/* Swipe up */}
      <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1 z-10">
        <ChevronUp className="w-5 h-5 text-white animate-bounce" />
        <span className="text-[10px] font-semibold text-white drop-shadow">Learn More</span>
      </div>
    </div>
  </PhoneFrame>
);

const DigitalSignageMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <div className="mx-auto" style={{ maxWidth: 480 }}>
    {/* Wall mount bracket */}
    <div className="flex justify-center mb-1">
      <div className="w-16 h-2 bg-foreground/20 rounded-b-sm" />
    </div>
    <div className="rounded-md border-[4px] border-foreground/30 bg-black shadow-2xl overflow-hidden">
      <div className="relative">
        <div className="aspect-video">
          <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
        </div>
        {/* Info bar overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-3 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-3 h-3 text-white/60" />
            <span className="text-[9px] text-white/80 font-medium">{profileName || "Campus Display"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3 text-green-400/80" />
            <span className="text-[9px] text-white/60">10:30 AM · 72°F</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const EventFlyerMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <PhoneFrame>
    <div className="px-3 py-2 border-b border-border/50 flex items-center gap-2">
      <Calendar className="w-4 h-4 text-primary" />
      <span className="text-xs font-semibold text-foreground">Events</span>
    </div>
    <div style={{ aspectRatio: "4/5" }}>
      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
    </div>
    <div className="px-3 py-2.5 space-y-1.5">
      <p className="text-xs font-bold text-foreground">Spring Open House 2026</p>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Apr 12, 2026</span>
        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Main Quad</span>
      </div>
      <div className="flex items-center gap-1.5 mt-1">
        <div className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-md flex-1 text-center">RSVP</div>
        <div className="border border-border text-foreground text-[10px] font-semibold px-3 py-1.5 rounded-md flex-1 text-center">Share</div>
      </div>
    </div>
  </PhoneFrame>
);

const PresentationSlideMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <BrowserFrame url="docs.google.com/presentation/d/1abc...">
    {/* Toolbar */}
    <div className="flex items-center justify-between px-3 py-1.5 bg-muted/40 border-b border-border/50">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-semibold text-foreground">{profileName || "University"} Presentation</span>
      </div>
      <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
        <span>Slide 1 of 12</span>
      </div>
    </div>
    {/* Slide area */}
    <div className="p-4 bg-muted/20 flex items-center justify-center">
      <div className="relative aspect-video w-full rounded shadow-lg overflow-hidden border border-border/30">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex flex-col justify-end p-4">
          <h3 className="text-white text-sm font-bold drop-shadow">{profileName || "University Name"}</h3>
          <p className="text-white/70 text-[10px] drop-shadow">Strategic Plan 2026–2030</p>
        </div>
      </div>
    </div>
    {/* Slide nav */}
    <div className="flex items-center justify-center gap-3 py-2 border-t border-border/50 bg-muted/30">
      <ChevronLeft className="w-4 h-4 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground">1 / 12</span>
      <ChevronRight className="w-4 h-4 text-muted-foreground" />
    </div>
  </BrowserFrame>
);

const WebBannerMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <BrowserFrame url={`www.${profileName?.toLowerCase().replace(/\s+/g, '') || "university"}.edu`}>
    {/* Banner */}
    <div style={{ aspectRatio: "3/1" }} className="overflow-hidden">
      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
    </div>
    {/* Page skeleton */}
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
          <span className="text-[8px] font-bold text-primary">{(profileName || "U").charAt(0)}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-muted-foreground">About</span>
          <span className="text-[10px] text-muted-foreground">Admissions</span>
          <span className="text-[10px] text-muted-foreground">Research</span>
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-muted rounded w-2/3" />
        <div className="h-2 bg-muted rounded w-full" />
        <div className="h-2 bg-muted rounded w-5/6" />
      </div>
    </div>
  </BrowserFrame>
);

const MMSMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <PhoneFrame>
    <div className="px-3 py-2 border-b border-border/50 text-center">
      <p className="text-[10px] text-muted-foreground">Messages</p>
      <p className="text-xs font-semibold text-foreground">{profileName || "University"}</p>
    </div>
    <div className="p-3 space-y-2 min-h-[280px] flex flex-col justify-end">
      {/* Previous message */}
      <div className="flex justify-start">
        <div className="bg-muted rounded-2xl rounded-bl-sm px-3 py-1.5 max-w-[85%]">
          <p className="text-[11px] text-foreground">Don't forget — Spring registration opens tomorrow! 📚</p>
        </div>
      </div>
      {/* Image message */}
      <div className="flex justify-start">
        <div className="rounded-2xl rounded-bl-sm overflow-hidden max-w-[75%] shadow-sm">
          <div className="aspect-square">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
      {/* Timestamp */}
      <p className="text-[9px] text-muted-foreground text-center">Today 10:15 AM</p>
      {/* Input */}
      <div className="flex items-center gap-2 pt-1">
        <div className="flex-1 h-8 bg-muted rounded-full px-3 flex items-center">
          <span className="text-[10px] text-muted-foreground">iMessage</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center">
          <ChevronUp className="w-4 h-4 text-primary-foreground" />
        </div>
      </div>
    </div>
  </PhoneFrame>
);

const LinkedInBannerMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <BrowserFrame url={`www.linkedin.com/school/${profileName?.toLowerCase().replace(/\s+/g, '-') || "university"}`}>
    {/* Banner */}
    <div className="relative">
      <div style={{ aspectRatio: "4/1" }} className="overflow-hidden">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      </div>
      {/* Profile circle overlapping */}
      <div className="absolute -bottom-5 left-4 w-16 h-16 rounded-full border-4 border-background bg-primary/20 flex items-center justify-center shadow-md">
        <span className="text-lg font-bold text-primary">{(profileName || "U").charAt(0)}</span>
      </div>
    </div>
    {/* Profile info */}
    <div className="pt-7 px-4 pb-3">
      <p className="text-sm font-bold text-foreground">{profileName || "Your University"}</p>
      <p className="text-[10px] text-muted-foreground">Higher Education · 10,001+ employees</p>
      <div className="flex items-center gap-2 mt-2">
        <div className="bg-primary text-primary-foreground text-[9px] font-semibold px-3 py-1 rounded-full">+ Follow</div>
        <div className="border border-border text-foreground text-[9px] font-semibold px-3 py-1 rounded-full">Visit website</div>
      </div>
    </div>
  </BrowserFrame>
);

const FacebookCoverMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <BrowserFrame url={`www.facebook.com/${profileName?.toLowerCase().replace(/\s+/g, '') || "university"}`}>
    {/* Cover */}
    <div className="relative">
      <div style={{ aspectRatio: "2.63/1" }} className="overflow-hidden">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      </div>
    </div>
    {/* Page info */}
    <div className="px-4 py-2 border-b border-border/50 flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-background shadow">
        <span className="text-sm font-bold text-primary">{(profileName || "U").charAt(0)}</span>
      </div>
      <div>
        <p className="text-sm font-bold text-foreground">{profileName || "Your University"}</p>
        <p className="text-[10px] text-muted-foreground">University · 54K followers</p>
      </div>
    </div>
    {/* Tabs */}
    <div className="flex items-center gap-4 px-4 py-1.5 text-[10px] text-muted-foreground border-b border-border/50">
      <span className="font-semibold text-primary border-b-2 border-primary pb-1">Home</span>
      <span>About</span>
      <span>Events</span>
      <span>Photos</span>
    </div>
  </BrowserFrame>
);

const YouTubeThumbnailMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <BrowserFrame url="www.youtube.com/watch?v=...">
    {/* Player */}
    <div className="relative aspect-video bg-black">
      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-14 h-10 bg-red-600/90 rounded-xl flex items-center justify-center shadow-lg">
          <Play className="w-6 h-6 text-white fill-white" />
        </div>
      </div>
      {/* Duration */}
      <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">4:32</div>
    </div>
    {/* Video info */}
    <div className="p-3 flex gap-2">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
        <span className="text-[10px] font-bold text-primary">{(profileName || "U").charAt(0)}</span>
      </div>
      <div>
        <p className="text-xs font-semibold text-foreground leading-snug">{profileName || "University"} — Campus Tour 2026</p>
        <p className="text-[10px] text-muted-foreground">{profileName || "Your University"} · 12K views · 2 days ago</p>
      </div>
    </div>
  </BrowserFrame>
);

const PrintAdMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <div className="flex items-center justify-center py-4" style={{ perspective: "800px" }}>
    <div
      className="bg-background rounded shadow-2xl border border-border/50 overflow-hidden"
      style={{ transform: "rotateY(3deg) rotateX(1deg)", maxWidth: 280 }}
    >
      {/* Magazine header */}
      <div className="px-3 py-1.5 border-b border-border/30 bg-muted/30">
        <p className="text-[9px] text-muted-foreground text-center italic">The Chronicle of Higher Education</p>
      </div>
      <div style={{ aspectRatio: "8.5/11" }}>
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      </div>
      {/* Ad footer */}
      <div className="px-3 py-2 bg-background border-t border-border/30 text-center">
        <p className="text-[10px] font-bold text-foreground">{profileName || "Your University"}</p>
        <p className="text-[9px] text-muted-foreground">Where Leaders Are Made</p>
      </div>
    </div>
  </div>
);

const ViewbookMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <div className="flex items-center justify-center py-4" style={{ perspective: "1000px" }}>
    <div
      className="flex rounded shadow-2xl overflow-hidden border border-border/50"
      style={{ transform: "rotateY(-2deg)", maxWidth: 420 }}
    >
      {/* Left page */}
      <div className="w-1/2 bg-background p-3 flex flex-col justify-between border-r border-border/30">
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold text-foreground">{profileName || "Your University"}</p>
          <p className="text-[8px] text-muted-foreground uppercase tracking-widest">Viewbook 2026</p>
        </div>
        <div className="space-y-1">
          <div className="h-1.5 bg-muted rounded w-full" />
          <div className="h-1.5 bg-muted rounded w-10/12" />
          <div className="h-1.5 bg-muted rounded w-8/12" />
          <div className="h-1.5 bg-muted rounded w-11/12" />
        </div>
        <p className="text-[8px] text-muted-foreground italic">"The experience changed my life."</p>
      </div>
      {/* Right page — image */}
      <div className="w-1/2 aspect-[4/3]">
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
      </div>
    </div>
  </div>
);

const DonorReportMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <div className="flex items-center justify-center py-4" style={{ perspective: "800px" }}>
    <div
      className="bg-background rounded shadow-2xl border border-border/50 overflow-hidden"
      style={{ maxWidth: 260 }}
    >
      <div className="relative" style={{ aspectRatio: "8.5/11" }}>
        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
        {/* Title overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-4">
          <p className="text-[9px] text-white/60 uppercase tracking-widest">Annual Report</p>
          <p className="text-sm font-bold text-white leading-tight">{profileName || "Your University"}</p>
          <p className="text-[10px] text-white/80 mt-0.5">Fiscal Year 2025–2026</p>
          <div className="w-8 h-0.5 bg-white/40 mt-2 rounded" />
        </div>
      </div>
    </div>
  </div>
);

const PortalBannerMockup = ({ imageUrl, profileName }: { imageUrl: string; profileName?: string }) => (
  <BrowserFrame url={`portal.${profileName?.toLowerCase().replace(/\s+/g, '') || "university"}.edu`}>
    {/* Portal nav */}
    <div className="flex items-center justify-between px-4 py-2 bg-muted/40 border-b border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center">
          <span className="text-[8px] font-bold text-primary">{(profileName || "U").charAt(0)}</span>
        </div>
        <span className="text-[10px] font-semibold text-foreground">Student Portal</span>
      </div>
      <div className="flex items-center gap-3 text-[9px] text-muted-foreground">
        <span>Dashboard</span>
        <span>Courses</span>
        <span>Financial Aid</span>
        <Mail className="w-3 h-3" />
      </div>
    </div>
    {/* Banner */}
    <div style={{ aspectRatio: "3/1" }} className="overflow-hidden">
      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
    </div>
    {/* Dashboard skeleton */}
    <div className="p-3 grid grid-cols-3 gap-2">
      {["Registration", "Grades", "Financial Aid"].map((label) => (
        <div key={label} className="bg-muted/50 rounded-md p-2 text-center">
          <div className="w-6 h-6 bg-muted rounded mx-auto mb-1" />
          <p className="text-[9px] text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  </BrowserFrame>
);

/* ─── Mockup Map ─── */

const mockupMap: Record<string, React.FC<{ imageUrl: string; profileName?: string }>> = {
  "social-media": SocialMediaMockup,
  "digital-ad-social": SocialAdMockup,
  "email": EmailMockup,
  "landing-page": LandingPageMockup,
  "direct-mail": DirectMailMockup,
  "news-article": NewsArticleMockup,
  "story": StoryMockup,
  "digital-signage": DigitalSignageMockup,
  "event-flyer": EventFlyerMockup,
  "presentation-slide": PresentationSlideMockup,
  "web-banner": WebBannerMockup,
  "mms": MMSMockup,
  "linkedin-banner": LinkedInBannerMockup,
  "facebook-cover": FacebookCoverMockup,
  "youtube-thumbnail": YouTubeThumbnailMockup,
  "print-ad": PrintAdMockup,
  "viewbook": ViewbookMockup,
  "donor-report": DonorReportMockup,
  "portal-banner": PortalBannerMockup,
};

export const ChannelMockup = ({ channel, imageUrl, profileName }: ChannelMockupProps) => {
  const MockupComponent = mockupMap[channel] || SocialMediaMockup;
  return <MockupComponent imageUrl={imageUrl} profileName={profileName} />;
};
