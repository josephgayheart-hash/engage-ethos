import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface MessageActionsProps {
  content: string;
  messageId: string;
}

export function MessageActions({ content, messageId }: MessageActionsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Could not copy to clipboard",
      });
    }
  };

  const handleFeedback = (type: 'up' | 'down') => {
    if (feedback === type) {
      setFeedback(null);
    } else {
      setFeedback(type);
      toast({
        title: type === 'up' ? "Thanks for the feedback!" : "Feedback noted",
        description: type === 'up' 
          ? "Glad this was helpful" 
          : "We'll work on improving responses",
      });
    }
  };

  return (
    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 w-7 p-0",
          feedback === 'up' && "text-green-600 bg-green-100 hover:bg-green-100"
        )}
        onClick={() => handleFeedback('up')}
        title="Good response"
      >
        <ThumbsUp className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "h-7 w-7 p-0",
          feedback === 'down' && "text-red-600 bg-red-100 hover:bg-red-100"
        )}
        onClick={() => handleFeedback('down')}
        title="Poor response"
      >
        <ThumbsDown className="h-3.5 w-3.5" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-green-600" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </Button>
    </div>
  );
}
