import { useState, useEffect } from 'react';
import { X, Mail, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ExitIntentDialogProps {
  enabled?: boolean;
}

export function ExitIntentDialog({ enabled = true }: ExitIntentDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled || hasShown) return;

    // Check if already shown this session
    const shown = sessionStorage.getItem('exit_intent_shown');
    if (shown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves toward the top of the viewport
      if (e.clientY <= 5 && !hasShown) {
        setOpen(true);
        setHasShown(true);
        sessionStorage.setItem('exit_intent_shown', 'true');
      }
    };

    // Wait a bit before attaching the listener
    const timeout = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave);
    }, 5000); // Wait 5 seconds before enabling

    return () => {
      clearTimeout(timeout);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, hasShown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    try {
      // Store the email interest
      const { error } = await supabase
        .from('onboarding_requests')
        .insert({
          email,
          first_name: 'Newsletter',
          last_name: 'Subscriber',
          institution_name_input: 'Unknown',
          referral_source: 'exit_intent',
          request_status: 'submitted',
        });

      if (error && !error.message.includes('duplicate')) {
        throw error;
      }

      toast({
        title: "Thanks for your interest!",
        description: "We'll keep you updated on CampusVoice.",
      });
      setOpen(false);
    } catch (err) {
      console.error('Exit intent submit error:', err);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto p-3 rounded-xl bg-primary/10 w-fit mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center font-serif text-xl">
            Wait! Don't miss out
          </DialogTitle>
          <DialogDescription className="text-center">
            Get early access to new features and higher ed communications insights delivered to your inbox.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@institution.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Subscribe'}
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            No spam, unsubscribe anytime. We respect your inbox.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ExitIntentDialog;
