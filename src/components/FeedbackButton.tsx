import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageSquarePlus, Star, Loader2 } from 'lucide-react';

const featureAreas = [
  { value: 'message_evaluator', label: 'Message Evaluator' },
  { value: 'message_builder', label: 'Message Builder' },
  { value: 'strategy_mapper', label: 'Journey Designer' },
  { value: 'call_script', label: 'Call Script Generator' },
  { value: 'playground', label: 'AI Playground' },
  { value: 'byoc', label: 'Import & Evaluate (BYOC)' },
  { value: 'personal_library', label: 'Personal Library' },
  { value: 'shared_library', label: 'Shared Library' },
  { value: 'institutional_settings', label: 'Institutional Settings' },
  { value: 'admin_console', label: 'Admin Console' },
  { value: 'navigation', label: 'Navigation & Layout' },
  { value: 'general', label: 'General / Other' },
];

const feedbackTypes = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'improvement', label: 'Improvement Suggestion' },
  { value: 'question', label: 'Question' },
  { value: 'praise', label: 'Positive Feedback' },
  { value: 'general', label: 'General Feedback' },
];

export function FeedbackButton() {
  const { user, profile, tenant } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [featureArea, setFeatureArea] = useState('general');
  const [feedbackType, setFeedbackType] = useState('general');
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) {
      toast({
        title: 'Feedback required',
        description: 'Please enter your feedback before submitting.',
        variant: 'destructive',
      });
      return;
    }

    if (!user || !tenant) {
      toast({
        title: 'Not authenticated',
        description: 'Please log in to submit feedback.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('beta_feedback').insert({
        tenant_id: tenant.id,
        user_id: user.id,
        feature_area: featureArea,
        page_path: location.pathname,
        feedback_type: feedbackType,
        feedback_text: feedbackText.trim(),
        rating: rating,
      });

      if (error) throw error;

      toast({
        title: 'Feedback submitted',
        description: 'Thank you for helping us improve UPlaybook!',
      });

      // Reset form
      setFeatureArea('general');
      setFeedbackType('general');
      setFeedbackText('');
      setRating(null);
      setIsOpen(false);
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'Unable to submit feedback. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 shadow-lg bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
      >
        <MessageSquarePlus className="w-4 h-4 mr-2" />
        Beta Feedback
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquarePlus className="w-5 h-5 text-amber-600" />
              Beta Feedback
            </DialogTitle>
            <DialogDescription>
              Help us improve UPlaybook. Your feedback goes directly to our team.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Feature Area</Label>
                <Select value={featureArea} onValueChange={setFeatureArea}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {featureAreas.map(area => (
                      <SelectItem key={area.value} value={area.value}>
                        {area.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Feedback Type</Label>
                <Select value={feedbackType} onValueChange={setFeedbackType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Your Feedback</Label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Tell us what you think, found a bug, or have a suggestion..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Overall Experience (Optional)</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? null : star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star 
                      className={`w-6 h-6 ${
                        rating && star <= rating 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              Submitting as <strong>{profile?.first_name} {profile?.last_name}</strong> from <strong>{tenant?.institution_name}</strong>
              <br />
              Current page: <code>{location.pathname}</code>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
