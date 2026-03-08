import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, Loader2, AlertTriangle, XCircle } from "lucide-react";
import campusvoiceLogo from "@/assets/campusvoice-logo-new.png";

const AGREEMENT_TEXT = `This Agreement is made as of [current date] between Tyler Gayheart ("Disclosing Party") and the individual completing and signing this form ("Recipient"). The purpose of this Agreement is to allow the Recipient to review and evaluate demonstrations, concepts, and materials related to CampusVoice.ai. In connection with this evaluation, the Disclosing Party may share non-public information about the platform, and the Recipient agrees to keep that information confidential and use it only for the purpose of evaluating CampusVoice.ai.

Confidential Information includes any non-public information shared during the demonstration, including software features, workflows, product concepts, designs, documentation, screenshots, or related materials.

The Recipient agrees to keep the information confidential, use the information only to evaluate CampusVoice.ai, not share, copy, or reproduce the information without permission, not use the information to build or develop a similar product, and not record, capture screenshots, or otherwise document the demonstration without permission.

All ideas, software, designs, and materials related to CampusVoice.ai remain the property of Tyler Gayheart. This Agreement applies for three (3) years from the date of disclosure and is governed by the laws of the Commonwealth of Kentucky.`;

function getAgreementWithDate() {
  return AGREEMENT_TEXT.replace("[current date]", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }));
}

interface NDALink {
  id: string;
  slug: string;
  label: string;
  recipient_name: string | null;
  recipient_email: string | null;
  organization: string | null;
  redirect_url: string | null;
  expires_at: string | null;
  is_active: boolean;
  is_one_time: boolean;
  agreement_version: string;
  status: string;
}

type PageState = "loading" | "form" | "success" | "expired" | "signed" | "not-found";

function NDAPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <div className="flex justify-center mb-8">
          <img src={campusvoiceLogo} alt="CampusVoice" className="h-10 object-contain" />
        </div>
        {children}
      </div>
    </div>
  );
}

export default function NDASignPage() {
  const { slug } = useParams<{ slug: string }>();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [link, setLink] = useState<NDALink | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [org, setOrg] = useState("");
  const [title, setTitle] = useState("");
  const [typedSig, setTypedSig] = useState("");
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Redirect countdown
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (!slug) { setPageState("not-found"); return; }
    (async () => {
      const { data, error } = await supabase
        .from("nda_links")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error || !data) { setPageState("not-found"); return; }
      const l = data as unknown as NDALink;
      if (l.expires_at && new Date(l.expires_at) < new Date()) { setPageState("expired"); return; }
      if (l.status === "signed" && l.is_one_time) { setPageState("signed"); return; }
      if (l.status === "revoked" || !l.is_active) { setPageState("expired"); return; }
      setLink(l);
      if (l.recipient_name) setName(l.recipient_name);
      if (l.recipient_email) setEmail(l.recipient_email);
      if (l.organization) setOrg(l.organization);
      setPageState("form");
    })();
  }, [slug]);

  // Canvas drawing handlers
  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    setHasDrawn(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [getPos]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "hsl(var(--foreground))";
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, getPos]);

  const stopDraw = useCallback(() => setIsDrawing(false), []);

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) { ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height); }
    setHasDrawn(false);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim() || !typedSig.trim()) {
      toast({ title: "Missing required fields", description: "Please fill in your name, email, and typed signature.", variant: "destructive" });
      return;
    }
    if (!check1 || !check2 || !check3) {
      toast({ title: "Please check all boxes", description: "You must acknowledge all three statements.", variant: "destructive" });
      return;
    }
    if (!link) return;

    setSubmitting(true);
    try {
      let drawnSigUrl: string | null = null;
      if (hasDrawn && canvasRef.current) {
        const blob = await new Promise<Blob | null>((res) => canvasRef.current!.toBlob(res, "image/png"));
        if (blob) {
          const fileName = `${link.slug}-${Date.now()}.png`;
          const { error: uploadErr } = await supabase.storage
            .from("nda-signatures")
            .upload(fileName, blob, { contentType: "image/png" });
          if (!uploadErr) {
            const { data: urlData } = supabase.storage.from("nda-signatures").getPublicUrl(fileName);
            drawnSigUrl = urlData.publicUrl;
          }
        }
      }

      const agreementText = getAgreementWithDate();
      const { error } = await supabase.from("nda_responses").insert({
        nda_link_id: link.id,
        signer_name: name.trim(),
        signer_email: email.trim(),
        signer_organization: org.trim() || null,
        signer_title: title.trim() || null,
        typed_signature: typedSig.trim(),
        drawn_signature_url: drawnSigUrl,
        agreement_text: agreementText,
        agreement_version: link.agreement_version,
        user_agent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        redirect_url: link.redirect_url,
        public_slug: link.slug,
        status: "signed",
      });

      if (error) throw error;

      if (link.is_one_time) {
        await supabase.from("nda_links").update({ status: "signed" }).eq("id", link.id);
      }

      setSubmittedAt(new Date().toLocaleString());
      setPageState("success");

      if (link.redirect_url) {
        setCountdown(5);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Something went wrong.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Countdown redirect
  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const t = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0 && link?.redirect_url) {
      window.location.href = link.redirect_url;
    }
  }, [countdown, link?.redirect_url]);

  if (pageState === "loading") return (
    <NDAPageWrapper>
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
    </NDAPageWrapper>
  );

  if (pageState === "not-found") return (
    <NDAPageWrapper>
      <Card className="text-center py-12">
        <CardContent className="space-y-3">
          <XCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Link Not Found</h2>
          <p className="text-muted-foreground">This NDA link doesn't exist or may have been removed.</p>
        </CardContent>
      </Card>
    </NDAPageWrapper>
  );

  if (pageState === "expired") return (
    <NDAPageWrapper>
      <Card className="text-center py-12">
        <CardContent className="space-y-3">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
          <h2 className="text-xl font-semibold">This Link Has Expired</h2>
          <p className="text-muted-foreground">This NDA link is no longer active. Please reach out for a new one.</p>
        </CardContent>
      </Card>
    </NDAPageWrapper>
  );

  if (pageState === "signed") return (
    <NDAPageWrapper>
      <Card className="text-center py-12">
        <CardContent className="space-y-3">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto" />
          <h2 className="text-xl font-semibold">Already Signed</h2>
          <p className="text-muted-foreground">This NDA has already been signed. No further action is needed.</p>
        </CardContent>
      </Card>
    </NDAPageWrapper>
  );

  if (pageState === "success") return (
    <NDAPageWrapper>
      <Card className="text-center py-12">
        <CardContent className="space-y-4">
          <CheckCircle className="h-14 w-14 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-semibold">You're all set! ✨</h2>
          <p className="text-muted-foreground">Your NDA has been signed successfully.</p>
          <div className="text-sm text-muted-foreground space-y-1">
            <p><span className="font-medium text-foreground">{name}</span> · {email}</p>
            {submittedAt && <p>Signed on {submittedAt}</p>}
          </div>
          {link?.redirect_url && (
            <div className="pt-4 space-y-2">
              {countdown !== null && countdown > 0 && (
                <p className="text-sm text-muted-foreground">Redirecting in {countdown}s…</p>
              )}
              <Button onClick={() => window.location.href = link.redirect_url!}>
                Continue to Demo →
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </NDAPageWrapper>
  );

  // Form state
  return (
    <NDAPageWrapper>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">👋 Hey, I can't wait to show you what I've built.</h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto">
            Before we begin, please take a quick moment to review and sign this simple confidentiality agreement so we can keep the demo respectful, private, and easy.
          </p>
        </div>

        <Card>
          <CardContent className="p-4 md:p-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Confidentiality Agreement</h3>
            <div className="max-h-64 overflow-y-auto text-sm leading-relaxed text-foreground/90 whitespace-pre-line border rounded-md p-4 bg-muted/30">
              {getAgreementWithDate()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Legal Name <span className="text-destructive">*</span></Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" maxLength={200} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" maxLength={255} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="org">Organization</Label>
                <Input id="org" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Your company or institution" maxLength={200} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Your role or title" maxLength={200} />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-2">
                <Checkbox id="c1" checked={check1} onCheckedChange={(v) => setCheck1(!!v)} className="mt-0.5" />
                <Label htmlFor="c1" className="text-sm font-normal leading-snug cursor-pointer">
                  I understand this demo includes non-public product information and I will keep it confidential
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="c2" checked={check2} onCheckedChange={(v) => setCheck2(!!v)} className="mt-0.5" />
                <Label htmlFor="c2" className="text-sm font-normal leading-snug cursor-pointer">
                  I will not record, screenshot, copy, or redistribute the demo or related materials without permission
                </Label>
              </div>
              <div className="flex items-start gap-2">
                <Checkbox id="c3" checked={check3} onCheckedChange={(v) => setCheck3(!!v)} className="mt-0.5" />
                <Label htmlFor="c3" className="text-sm font-normal leading-snug cursor-pointer">
                  I agree that typing my name below constitutes my electronic signature for this agreement
                </Label>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <Label htmlFor="sig">Electronic Signature <span className="text-destructive">*</span></Label>
              <Input
                id="sig"
                value={typedSig}
                onChange={(e) => setTypedSig(e.target.value)}
                placeholder="Type your full name as your signature"
                className="font-serif text-lg italic"
                maxLength={200}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Drawn Signature <span className="text-muted-foreground text-xs">(optional)</span></Label>
                {hasDrawn && (
                  <Button variant="ghost" size="sm" onClick={clearCanvas} className="text-xs h-7">Clear</Button>
                )}
              </div>
              <canvas
                ref={canvasRef}
                width={500}
                height={120}
                className="w-full border rounded-md bg-background cursor-crosshair touch-none"
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={stopDraw}
                onMouseLeave={stopDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={stopDraw}
              />
              <p className="text-xs text-muted-foreground">Draw your signature above using a mouse or finger</p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || !name || !email || !typedSig || !check1 || !check2 || !check3}
              className="w-full mt-4"
              size="lg"
            >
              {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting…</> : "Sign & Submit"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </NDAPageWrapper>
  );
}
