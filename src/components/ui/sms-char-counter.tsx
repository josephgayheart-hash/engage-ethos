import { cn } from "@/lib/utils";

interface SmsCharCounterProps {
  text: string;
  className?: string;
}

const SMS_LIMIT = 160;
const SMS_EXTENDED_LIMIT = 306; // 2 segments

export function SmsCharCounter({ text, className }: SmsCharCounterProps) {
  const charCount = text.length;
  const segments = Math.ceil(charCount / SMS_LIMIT) || 1;
  const isOverLimit = charCount > SMS_LIMIT;
  const isNearLimit = charCount > SMS_LIMIT * 0.9 && charCount <= SMS_LIMIT;

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <span className={cn(
        "font-mono",
        isOverLimit && "text-amber-600 dark:text-amber-400",
        isNearLimit && "text-amber-500",
        !isOverLimit && !isNearLimit && "text-muted-foreground"
      )}>
        {charCount}/{SMS_LIMIT}
      </span>
      {segments > 1 && (
        <span className="text-muted-foreground">
          ({segments} SMS segments)
        </span>
      )}
    </div>
  );
}
