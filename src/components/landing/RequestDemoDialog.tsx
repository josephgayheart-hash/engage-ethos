import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Send, CheckCircle2, Calendar } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';

interface RequestDemoDialogProps {
  trigger?: React.ReactNode;
}

export function RequestDemoDialog({ trigger }: RequestDemoDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.institution) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.functions.invoke('send-demo-request', {
        body: {
          name: formData.name,
          email: formData.email,
          institution: formData.institution,
          message: formData.message,
        },
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: 'Demo Request Sent!',
        description: 'Our team will reach out to you shortly.',
      });
    } catch (error: unknown) {
      console.error('Error sending demo request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send demo request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      // Reset form when closing
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', email: '', institution: '', message: '' });
      }, 200);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg">
            <Calendar className="w-4 h-4 mr-2" />
            Request a Demo
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[hsl(82_85%_55%_/_0.2)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[hsl(82_70%_40%)]" />
            </div>
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-center">Request Received!</DialogTitle>
              <DialogDescription className="text-center">
                Thank you for your interest in CampusVoice.AI. Our team will review your request and reach out to schedule a demo.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={() => handleOpenChange(false)} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[hsl(270_70%_55%)]" />
                Request a Demo
              </DialogTitle>
              <DialogDescription>
                Learn how CampusVoice.AI can transform your institution's communications. Fill out the form below and we'll be in touch.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="demo-name">Full Name *</Label>
                <Input
                  id="demo-name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-email">Email *</Label>
                <Input
                  id="demo-email"
                  type="email"
                  placeholder="you@university.edu"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-institution">Institution/Company *</Label>
                <Input
                  id="demo-institution"
                  placeholder="Your institution or company"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="demo-message">Message (optional)</Label>
                <Textarea
                  id="demo-message"
                  placeholder="Tell us about your needs or questions..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[hsl(270_70%_55%)] to-[hsl(270_70%_45%)] hover:from-[hsl(270_70%_50%)] hover:to-[hsl(270_70%_40%)]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Request
                  </>
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                By submitting, you agree to be contacted about CampusVoice.AI.
              </p>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
