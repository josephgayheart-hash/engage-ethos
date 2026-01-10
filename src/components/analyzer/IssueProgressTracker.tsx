import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  ChevronDown,
  MessageSquare,
  Target
} from 'lucide-react';
import type { AnalysisSection, IssueRemediation } from '@/types/analyzer';

interface IssueProgressTrackerProps {
  sections: AnalysisSection[];
  resolvedIssues: IssueRemediation[];
  onToggleResolved: (issueId: string, sectionId: string, resolved: boolean) => void;
  onUpdateNotes: (issueId: string, sectionId: string, notes: string) => void;
}

export function IssueProgressTracker({
  sections,
  resolvedIssues,
  onToggleResolved,
  onUpdateNotes,
}: IssueProgressTrackerProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState('');

  // Calculate total issues and resolved count
  const allIssues = sections.flatMap(section => 
    section.issues.map((issue, idx) => ({
      ...issue,
      id: issue.id || `${section.id}-${idx}`,
      sectionId: section.id,
      sectionTitle: section.title
    }))
  );
  
  const totalIssues = allIssues.length;
  const resolvedCount = resolvedIssues.filter(r => r.resolved).length;
  const progressPercent = totalIssues > 0 ? Math.round((resolvedCount / totalIssues) * 100) : 0;

  const isResolved = (issueId: string, sectionId: string) => {
    return resolvedIssues.some(r => r.issueId === issueId && r.sectionId === sectionId && r.resolved);
  };

  const getIssueNotes = (issueId: string, sectionId: string) => {
    return resolvedIssues.find(r => r.issueId === issueId && r.sectionId === sectionId)?.notes || '';
  };

  const getSeverityIcon = (severity: 'error' | 'warning' | 'info') => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const handleNotesSubmit = (issueId: string, sectionId: string) => {
    onUpdateNotes(issueId, sectionId, notesDraft);
    setEditingNotes(null);
    setNotesDraft('');
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Group issues by section
  const sectionIssues = sections.map(section => ({
    section,
    issues: section.issues.map((issue, idx) => ({
      ...issue,
      id: issue.id || `${section.id}-${idx}`
    })),
    resolvedCount: section.issues.reduce((count, issue, idx) => {
      const issueId = issue.id || `${section.id}-${idx}`;
      return count + (isResolved(issueId, section.id) ? 1 : 0);
    }, 0)
  })).filter(s => s.issues.length > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4 text-primary" />
            Remediation Progress
          </CardTitle>
          <Badge variant={progressPercent === 100 ? 'default' : 'secondary'} className="text-xs">
            {resolvedCount}/{totalIssues} resolved
          </Badge>
        </div>
        <div className="mt-3">
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1.5">
            {progressPercent}% complete
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px]">
          <div className="space-y-3">
            {sectionIssues.map(({ section, issues, resolvedCount: sectionResolved }) => (
              <Collapsible
                key={section.id}
                open={expandedSections.includes(section.id)}
                onOpenChange={() => toggleSection(section.id)}
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-2">
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        expandedSections.includes(section.id) ? 'rotate-180' : ''
                      }`} />
                      <span className="font-medium text-sm truncate">{section.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={sectionResolved === issues.length ? 'default' : 'outline'} 
                        className="text-xs"
                      >
                        {sectionResolved}/{issues.length}
                      </Badge>
                      {sectionResolved === issues.length && (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 ml-4 space-y-2">
                    {issues.map((issue) => {
                      const issueId = issue.id!;
                      const resolved = isResolved(issueId, section.id);
                      const notes = getIssueNotes(issueId, section.id);
                      const isEditing = editingNotes === `${section.id}-${issueId}`;

                      return (
                        <div 
                          key={issueId} 
                          className={`p-3 rounded-lg border transition-colors ${
                            resolved ? 'bg-green-500/5 border-green-500/20' : 'bg-card'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={resolved}
                              onCheckedChange={(checked) => 
                                onToggleResolved(issueId, section.id, checked === true)
                              }
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getSeverityIcon(issue.severity)}
                                <span className={`text-sm ${resolved ? 'line-through text-muted-foreground' : ''}`}>
                                  {issue.message}
                                </span>
                              </div>
                              {issue.quotedText && (
                                <p className="text-xs text-muted-foreground italic mb-2">
                                  "{issue.quotedText}"
                                </p>
                              )}
                              {issue.recommendation && !resolved && (
                                <p className="text-xs text-primary/80 mb-2">
                                  💡 {issue.recommendation}
                                </p>
                              )}
                              
                              {/* Notes section */}
                              {isEditing ? (
                                <div className="space-y-2 mt-2">
                                  <Textarea
                                    value={notesDraft}
                                    onChange={(e) => setNotesDraft(e.target.value)}
                                    placeholder="Add notes about how you fixed this..."
                                    className="text-xs min-h-[60px]"
                                  />
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="h-7 text-xs"
                                      onClick={() => handleNotesSubmit(issueId, section.id)}
                                    >
                                      Save
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost"
                                      className="h-7 text-xs"
                                      onClick={() => {
                                        setEditingNotes(null);
                                        setNotesDraft('');
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : notes ? (
                                <button 
                                  className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded mt-1 hover:bg-muted"
                                  onClick={() => {
                                    setEditingNotes(`${section.id}-${issueId}`);
                                    setNotesDraft(notes);
                                  }}
                                >
                                  📝 {notes}
                                </button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs text-muted-foreground -ml-2 mt-1"
                                  onClick={() => {
                                    setEditingNotes(`${section.id}-${issueId}`);
                                    setNotesDraft('');
                                  }}
                                >
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Add notes
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            {totalIssues === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">No issues found!</p>
                <p className="text-xs">Your content is well-aligned with your brand.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
