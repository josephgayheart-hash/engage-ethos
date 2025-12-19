import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Users, Building2, Loader2 } from "lucide-react";

interface ReferColleagueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReferColleagueDialog({ open, onOpenChange }: ReferColleagueDialogProps) {
  const { profile, tenant } = useAuth();
  const [referralType, setReferralType] = useState<"same_institution" | "other_institution">("same_institution");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    refereeName: "",
    refereeEmail: "",
    refereeInstitution: "", // For other_institution referrals
    personalMessage: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !tenant) return;

    setIsSubmitting(true);
    try {
      // Save referral to database
      const { error: insertError } = await supabase.from("referrals").insert({
        referrer_user_id: profile.id,
        referrer_tenant_id: profile.tenant_id,
        referee_email: formData.refereeEmail,
        referee_name: formData.refereeName,
        referral_type: referralType,
        personal_message: formData.personalMessage || null,
        status: "pending",
      });

      if (insertError) throw insertError;

      // Send referral email
      const { error: emailError } = await supabase.functions.invoke("send-referral-email", {
        body: {
          referralType,
          refereeName: formData.refereeName,
          refereeEmail: formData.refereeEmail,
          referrerName: `${profile.first_name} ${profile.last_name}`,
          referrerEmail: profile.email,
          // For same institution, use the referrer's tenant info
          // For other institution, use the referee's institution name they provided
          institutionName: referralType === "same_institution" 
            ? tenant.institution_name 
            : formData.refereeInstitution,
          referrerInstitution: tenant.institution_name, // Always include referrer's institution
          tenantId: referralType === "same_institution" ? profile.tenant_id : undefined,
          personalMessage: formData.personalMessage,
        },
      });

      if (emailError) throw emailError;

      toast.success(
        referralType === "same_institution"
          ? "Invitation sent to your colleague!"
          : "Invitation sent to your colleague!"
      );
      
      // Reset form
      setFormData({ refereeName: "", refereeEmail: "", refereeInstitution: "", personalMessage: "" });
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sending referral:", error);
      toast.error("Failed to send referral. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Invite a Colleague
          </DialogTitle>
          <DialogDescription>
            Know someone who'd benefit from UPlaybook.AI? Send them an invite!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <RadioGroup
            value={referralType}
            onValueChange={(value) => setReferralType(value as typeof referralType)}
            className="grid grid-cols-2 gap-4"
          >
            <Label
              htmlFor="same"
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                referralType === "same_institution"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value="same_institution" id="same" className="sr-only" />
              <Building2 className="h-6 w-6" />
              <span className="text-sm font-medium text-center">Same Institution</span>
              <span className="text-xs text-muted-foreground text-center">Joins your team</span>
            </Label>

            <Label
              htmlFor="other"
              className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 cursor-pointer transition-colors ${
                referralType === "other_institution"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <RadioGroupItem value="other_institution" id="other" className="sr-only" />
              <Users className="h-6 w-6" />
              <span className="text-sm font-medium text-center">Other Institution</span>
              <span className="text-xs text-muted-foreground text-center">New school signup</span>
            </Label>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="refereeName">Colleague's Name</Label>
            <Input
              id="refereeName"
              value={formData.refereeName}
              onChange={(e) => setFormData({ ...formData, refereeName: e.target.value })}
              placeholder="Jane Smith"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="refereeEmail">Colleague's Email</Label>
            <Input
              id="refereeEmail"
              type="email"
              value={formData.refereeEmail}
              onChange={(e) => setFormData({ ...formData, refereeEmail: e.target.value })}
              placeholder="jane@university.edu"
              required
            />
          </div>

          {referralType === "other_institution" && (
            <div className="space-y-2">
              <Label htmlFor="refereeInstitution">Their Institution Name</Label>
              <Input
                id="refereeInstitution"
                value={formData.refereeInstitution}
                onChange={(e) => setFormData({ ...formData, refereeInstitution: e.target.value })}
                placeholder="State University"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="personalMessage">Personal Message (optional)</Label>
            <Textarea
              id="personalMessage"
              value={formData.personalMessage}
              onChange={(e) => setFormData({ ...formData, personalMessage: e.target.value })}
              placeholder="Hey! I've been using this tool and thought you'd find it helpful..."
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Invite"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
