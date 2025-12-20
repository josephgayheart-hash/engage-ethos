import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { MessageSquarePlus, Star, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';

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

export default function BetaFeedbackPage() {
  const { user, profile, tenant } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
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
        page_path: '/feedback',
        feedback_type: feedbackType,
        feedback_text: feedbackText.trim(),
        rating: rating,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: 'Feedback submitted',
        description: 'Thank you for helping us improve UPlaybook!',
      });
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

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-zone-hero flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pillar-purple/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pillar-teal/10 rounded-full blur-3xl" />
        </div>
        
        <Card className="w-full max-w-md relative border-border/60 shadow-lg">
          <CardContent className="pt-12 pb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Thank You!</h2>
            <p className="text-muted-foreground mb-8">
              Your feedback has been submitted. We read every single piece of feedback and truly appreciate you taking the time to help us improve.
            </p>
            <div className="flex flex-col gap-3">
              <Button onClick={() => navigate('/dashboard')} className="w-full">
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsSubmitted(false);
                  setFeedbackText('');
                  setRating(null);
                  setFeatureArea('general');
                  setFeedbackType('general');
                }}
              >
                Submit More Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not logged in state
  if (!user) {
    return (
      <div className="min-h-screen bg-zone-hero flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pillar-purple/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pillar-teal/10 rounded-full blur-3xl" />
        </div>
        
        <Card className="w-full max-w-md relative border-border/60 shadow-lg">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
              <MessageSquarePlus className="w-6 h-6 text-amber-600" />
            </div>
            <CardTitle>Beta Feedback</CardTitle>
            <CardDescription>
              Please log in to submit your feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">Log In to Continue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zone-hero">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pillar-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pillar-teal/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pillar-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container max-w-2xl mx-auto py-12 px-4">
        {/* Back link */}
        <Link 
          to="/dashboard" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <Card className="border-border/60 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
              <MessageSquarePlus className="w-7 h-7 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Share Your Feedback</CardTitle>
            <CardDescription className="text-base mt-2">
              Help us build the best strategic communications platform for higher education. Your feedback goes directly to our team.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                placeholder="Tell us what you think, found a bug, or have a suggestion... We read every single message."
                rows={6}
                className="resize-none"
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
                    className="p-1.5 hover:scale-110 transition-transform rounded-md hover:bg-muted"
                  >
                    <Star 
                      className={`w-7 h-7 ${
                        rating && star <= rating 
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-muted-foreground/40'
                      }`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg border border-border/40">
              Submitting as <strong>{profile?.first_name} {profile?.last_name}</strong> from <strong>{tenant?.institution_name}</strong>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')} 
                disabled={isSubmitting}
                className="sm:flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting} 
                className="sm:flex-1 gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Feedback'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          You can also submit feedback anytime using the button in the bottom-right corner of the app.
        </p>
      </div>
    </div>
  );
}
