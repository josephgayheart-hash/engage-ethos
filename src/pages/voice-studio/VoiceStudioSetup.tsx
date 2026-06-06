import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const USE_CASES = [
  { id: "exec-emails", label: "Executive emails" },
  { id: "meeting-summaries", label: "Meeting summaries & notes" },
  { id: "marketing-copy", label: "Marketing & customer copy" },
  { id: "internal-memos", label: "Internal memos & updates" },
  { id: "general-writing", label: "General writing & editing" },
  { id: "research", label: "Research & analysis" },
];

const LENGTHS = [
  { id: "concise", label: "Concise — get to the point" },
  { id: "balanced", label: "Balanced" },
  { id: "detailed", label: "Detailed — include reasoning" },
];
const FORMATS = [
  { id: "bullets", label: "Bullets first" },
  { id: "prose", label: "Prose only" },
  { id: "mixed", label: "Mix of both" },
];

const STEPS = ["Use cases", "About you", "Preferences", "Voice"] as const;

export default function VoiceStudioSetup() {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);

  // Step 1
  const [useCases, setUseCases] = useState<string[]>([]);
  // Step 2
  const [name, setName] = useState("");
  const [titleRole, setTitleRole] = useState("");
  const [company, setCompany] = useState("");
  const [about, setAbout] = useState("");
  // Step 3
  const [length, setLength] = useState("balanced");
  const [format, setFormat] = useState("mixed");
  const [formality, setFormality] = useState<number[]>([6]);
  const [bannedWords, setBannedWords] = useState("leverage, synergy, circle back, best-in-class");
  const [noEmDash, setNoEmDash] = useState(true);
  const [useMarkdown, setUseMarkdown] = useState(true);
  // Step 4
  const [s1, setS1] = useState("");
  const [s2, setS2] = useState("");
  const [s3, setS3] = useState("");

  useEffect(() => {
    document.title = "Compass — Setup";
    if (!user) return;
    (async () => {
      const { data: prof } = await supabase
        .from("personal_ai_profile")
        .select("*")
        .maybeSingle();
      if (prof) {
        setUseCases((prof.use_cases as string[]) ?? []);
        setAbout(prof.about_me ?? "");
        const prefs = (prof.response_prefs as Record<string, unknown>) ?? {};
        if (typeof prefs.length === "string") setLength(prefs.length);
        if (typeof prefs.format === "string") setFormat(prefs.format);
        if (typeof prefs.formality === "number") setFormality([prefs.formality]);
        if (typeof prefs.banned_words === "string") setBannedWords(prefs.banned_words);
        if (typeof prefs.no_em_dash === "boolean") setNoEmDash(prefs.no_em_dash);
        if (typeof prefs.use_markdown === "boolean") setUseMarkdown(prefs.use_markdown);
        const samples = (prof.voice_samples as string[]) ?? [];
        if (samples[0]) setS1(samples[0]);
        if (samples[1]) setS2(samples[1]);
        if (samples[2]) setS3(samples[2]);
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name,last_name,title")
        .eq("id", user.id)
        .maybeSingle();
      if (profile) {
        setName(`${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim());
        if (profile.title) setTitleRole(profile.title);
      }
    })();
  }, [user]);

  const toggleUseCase = (id: string) => {
    setUseCases(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const canNext = () => {
    if (step === 0) return useCases.length > 0;
    if (step === 1) return name.trim().length > 0;
    if (step === 3) return [s1, s2, s3].some(s => s.trim().length > 80);
    return true;
  };

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    const samples = [s1, s2, s3].map(s => s.trim()).filter(s => s.length > 40);
    const response_prefs = {
      length, format, formality: formality[0],
      banned_words: bannedWords, no_em_dash: noEmDash, use_markdown: useMarkdown,
    };
    const about_me = [
      name && `Name: ${name}`,
      titleRole && `Role: ${titleRole}`,
      company && `Company: ${company}`,
      about && `What I do: ${about}`,
    ].filter(Boolean).join("\n");

    try {
      // 1. Save profile (without voice_profile yet)
      const { error: upErr } = await supabase
        .from("personal_ai_profile")
        .upsert({
          user_id: user.id,
          use_cases: useCases,
          about_me,
          response_prefs,
          voice_samples: samples,
        }, { onConflict: "user_id" });
      if (upErr) throw upErr;

      // 2. Train voice if samples provided
      if (samples.length > 0) {
        setTraining(true);
        try {
          await supabase.functions.invoke("voice-studio-train", { body: { samples } });
        } catch (e) {
          console.warn("voice training failed (continuing):", e);
        }
        setTraining(false);
      }

      // 3. Mark setup complete
      await supabase
        .from("personal_ai_profile")
        .update({ setup_completed_at: new Date().toISOString() })
        .eq("user_id", user.id);

      await refreshProfile();
      toast({ title: "Compass is ready", description: "You're all set — let's write something." });
      navigate("/compass");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Setup failed";
      toast({ title: "Couldn't save setup", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
      setTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center text-primary-foreground shadow-sm">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Compass</h1>
            <p className="text-xs text-muted-foreground">Quick setup — about 2 minutes</p>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "h-7 w-7 rounded-full text-xs flex items-center justify-center font-medium shrink-0",
                i < step ? "bg-primary text-primary-foreground" :
                i === step ? "bg-foreground text-background" :
                "bg-muted text-muted-foreground"
              )}>
                {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={cn("text-xs hidden sm:block", i === step ? "font-medium" : "text-muted-foreground")}>{s}</span>
              {i < STEPS.length - 1 && <div className={cn("flex-1 h-px", i < step ? "bg-primary" : "bg-border")} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-6 space-y-6">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">How will you use Compass?</h2>
                <p className="text-sm text-muted-foreground mt-1">Pick everything that fits. We'll tune the assistant to those use cases.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {USE_CASES.map(uc => (
                  <button
                    key={uc.id}
                    type="button"
                    onClick={() => toggleUseCase(uc.id)}
                    className={cn(
                      "text-left rounded-lg border px-3 py-2.5 text-sm transition",
                      useCases.includes(uc.id)
                        ? "border-primary bg-primary/5 text-foreground"
                        : "border-border/60 hover:border-border hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox checked={useCases.includes(uc.id)} className="pointer-events-none" />
                      {uc.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Tell us a bit about you</h2>
                <p className="text-sm text-muted-foreground mt-1">We'll keep this in mind on every response.</p>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="name">Your name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tyler Eastman" />
                </div>
                <div>
                  <Label htmlFor="title">Role / title</Label>
                  <Input id="title" value={titleRole} onChange={(e) => setTitleRole(e.target.value)} placeholder="Communications Director" />
                </div>
                <div>
                  <Label htmlFor="company">Company / organization</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Co." />
                </div>
                <div>
                  <Label htmlFor="about">What do you work on?</Label>
                  <Textarea
                    id="about"
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="1–3 lines: who you write for, what kind of work fills your week, what good output looks like."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold">How should it respond?</h2>
                <p className="text-sm text-muted-foreground mt-1">Set your defaults. You can change any of this later.</p>
              </div>

              <div>
                <Label className="mb-2 block">Response length</Label>
                <RadioGroup value={length} onValueChange={setLength} className="space-y-1.5">
                  {LENGTHS.map(l => (
                    <label key={l.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <RadioGroupItem value={l.id} id={`len-${l.id}`} />
                      {l.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Format</Label>
                <RadioGroup value={format} onValueChange={setFormat} className="space-y-1.5">
                  {FORMATS.map(f => (
                    <label key={f.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <RadioGroupItem value={f.id} id={`fmt-${f.id}`} />
                      {f.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div>
                <Label className="mb-2 block">Formality <span className="text-muted-foreground font-normal">({formality[0]}/10)</span></Label>
                <Slider value={formality} onValueChange={setFormality} min={1} max={10} step={1} />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>Casual</span><span>Formal</span>
                </div>
              </div>

              <div>
                <Label htmlFor="banned">Words to avoid <span className="text-muted-foreground font-normal">(comma separated)</span></Label>
                <Input id="banned" value={bannedWords} onChange={(e) => setBannedWords(e.target.value)} />
              </div>

              <div className="flex items-center justify-between pt-1">
                <Label htmlFor="emdash" className="cursor-pointer">No em dashes</Label>
                <Switch id="emdash" checked={noEmDash} onCheckedChange={setNoEmDash} />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="md" className="cursor-pointer">Use markdown formatting</Label>
                <Switch id="md" checked={useMarkdown} onCheckedChange={setUseMarkdown} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold">Train your voice</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Paste 1–3 real samples of your writing (emails, memos, posts). We'll extract your voice — tone, rhythm, vocabulary — and use it every time.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { v: s1, set: setS1, n: 1 },
                  { v: s2, set: setS2, n: 2 },
                  { v: s3, set: setS3, n: 3 },
                ].map(({ v, set, n }) => (
                  <div key={n}>
                    <Label htmlFor={`s${n}`} className="text-xs">Sample {n} {n === 1 ? <span className="text-destructive">*</span> : <span className="text-muted-foreground">(optional)</span>}</Label>
                    <Textarea
                      id={`s${n}`}
                      value={v}
                      onChange={(e) => set(e.target.value)}
                      placeholder={n === 1 ? "Paste a real example of your writing (80+ characters)" : "Another sample for better calibration"}
                      rows={5}
                      className="font-mono text-[13px]"
                    />
                    <div className="text-[10px] text-muted-foreground mt-0.5 text-right">{v.length} chars</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <Button
              variant="ghost"
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0 || loading}
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={!canNext() || loading}>
                Next <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={!canNext() || loading}>
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> {training ? "Training your voice…" : "Saving…"}</>
                ) : (
                  <>Finish setup <Check className="h-4 w-4 ml-1.5" /></>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
