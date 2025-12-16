import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function MessageInput({ value, onChange }: MessageInputProps) {
  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
        <MessageSquare className="w-4 h-4 text-primary" />
        Message Content
      </Label>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste or type your student-facing message here..."
        className="min-h-[180px] resize-y bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
      />
      <p className="text-xs text-muted-foreground">
        Include the full message content: subject line (if email), body text, and any calls to action.
      </p>
    </div>
  );
}
