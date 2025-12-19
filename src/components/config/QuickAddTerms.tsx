import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Common pre-populated options for various term types
export const COMMON_ACADEMIC_TERMS = [
  "credit hours",
  "full-time status",
  "part-time status", 
  "prerequisite",
  "corequisite",
  "major",
  "minor",
  "general education",
  "elective",
  "academic standing",
];

export const COMMON_GRADING_TERMS = [
  "midterm grade",
  "final grade",
  "GPA",
  "cumulative GPA",
  "academic probation",
  "Dean's List",
  "pass/fail",
  "incomplete",
  "withdrawal",
  "grade appeal",
];

export const COMMON_ENROLLMENT_TERMS = [
  "add/drop period",
  "registration",
  "waitlist",
  "course load",
  "course catalog",
  "schedule adjustment",
  "late registration",
  "enrollment verification",
  "transcript",
  "degree audit",
];

export const COMMON_SEMESTER_NAMES = [
  "Fall",
  "Spring", 
  "Summer",
  "Winter",
  "Fall Semester",
  "Spring Semester",
  "Summer Session",
  "Winter Session",
  "Maymester",
  "J-Term",
];

interface QuickAddTermsProps {
  terms: readonly string[];
  currentValues: string[];
  onAdd: (term: string) => void;
  label?: string;
}

export function QuickAddTerms({ 
  terms, 
  currentValues, 
  onAdd,
  label = "Quick add:"
}: QuickAddTermsProps) {
  // Filter out terms that are already added
  const availableTerms = terms.filter(term => !currentValues.includes(term));

  if (availableTerms.length === 0) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-1">
        {availableTerms.slice(0, 8).map((term) => (
          <Button
            key={term}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => onAdd(term)}
          >
            <Plus className="w-3 h-3" />
            {term}
          </Button>
        ))}
      </div>
    </div>
  );
}
