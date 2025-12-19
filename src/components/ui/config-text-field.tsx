import { useState, useEffect, useCallback, memo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ConfigTextFieldProps {
  label: string;
  fieldKey: string;
  value: string;
  placeholder: string;
  hint?: string;
  onUpdate: (fieldKey: string, value: string) => void;
}

/**
 * Text field component for config forms that maintains local state
 * to prevent focus loss during parent re-renders.
 * 
 * Key features:
 * - Uses local state for immediate typing feedback
 * - Only calls onUpdate on blur to batch updates
 * - Memoized to prevent unnecessary re-renders
 * - Syncs with external value changes via useEffect
 */
export const ConfigTextField = memo(function ConfigTextField({
  label,
  fieldKey,
  value,
  placeholder,
  hint,
  onUpdate,
}: ConfigTextFieldProps) {
  const [localValue, setLocalValue] = useState(value || '');

  // Sync local state when external value changes (e.g., from parent reset)
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleBlur = useCallback(() => {
    if (localValue !== (value || '')) {
      onUpdate(fieldKey, localValue);
    }
  }, [localValue, value, fieldKey, onUpdate]);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <Input
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
      />
    </div>
  );
});
