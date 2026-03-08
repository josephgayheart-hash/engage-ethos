import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Cloud, Loader2, CheckCircle, AlertCircle, HelpCircle, ChevronDown, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SlateCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  contentName: string;
  channel: string;
  subject?: string;
  audience?: string;
}

interface StoredSlateCredentials {
  subdomain: string;
}

const STORAGE_KEY = "slate_credentials";

export function SlateCredentialsDialog({
  open,
  onOpenChange,
  content,
  contentName,
  channel,
  subject,
  audience,
}: SlateCredentialsDialogProps) {
  const { toast } = useToast();
  const [slateSubdomain, setSlateSubdomain] = useState("");
  const [slateApiKey, setSlateApiKey] = useState("");
  const [rememberCredentials, setRememberCredentials] = useState(true);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{
    success: boolean;
    message: string;
    mailingId?: string;
  } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed: StoredSlateCredentials = JSON.parse(saved);
          setSlateSubdomain(parsed.subdomain || "");
        } catch {
          // Invalid stored data
        }
      }
      setPushResult(null);
      setSlateApiKey("");
    }
  }, [open]);

  const handlePush = async () => {
    if (!slateSubdomain || !slateApiKey) {
      toast({
        title: "Missing credentials",
        description: "Please enter your Slate subdomain and API key",
        variant: "destructive",
      });
      return;
    }

    setIsPushing(true);
    setPushResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("push-to-slate", {
        body: {
          slateSubdomain,
          slateApiKey,
          content,
          name: contentName,
          channel,
          subject,
          audience,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        setPushResult({
          success: false,
          message: data.error,
        });
      } else {
        if (rememberCredentials) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ subdomain: slateSubdomain })
          );
        }

        setPushResult({
          success: true,
          message: data.message,
          mailingId: data.mailingId,
        });

        toast({
          title: "Pushed to Slate",
          description: `Mailing "${data.mailingName}" created in Slate Deliver`,
        });
      }
    } catch (error) {
      console.error("Slate push error:", error);
      setPushResult({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to push to Slate",
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => {
      setPushResult(null);
      setHelpOpen(false);
    }, 200);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-emerald-500" />
            Push to Slate CRM
          </DialogTitle>
          <DialogDescription>
            Push this content directly into Slate Deliver as a draft mailing.
          </DialogDescription>
        </DialogHeader>

        {pushResult ? (
          <div className="py-6">
            <div
              className={`flex flex-col items-center gap-3 text-center ${
                pushResult.success ? "text-green-600" : "text-destructive"
              }`}
            >
              {pushResult.success ? (
                <CheckCircle className="w-12 h-12" />
              ) : (
                <AlertCircle className="w-12 h-12" />
              )}
              <p className="font-medium">
                {pushResult.success ? "Success!" : "Push Failed"}
              </p>
              <p className="text-sm text-muted-foreground">
                {pushResult.message}
              </p>
              {pushResult.mailingId && (
                <p className="text-xs text-muted-foreground">
                  Mailing ID: {pushResult.mailingId}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Help Section */}
            <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between text-muted-foreground hover:text-foreground"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    How do I get Slate API credentials?
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      helpOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm border">
                  <p className="font-medium text-foreground">
                    Generate a Slate API Key:
                  </p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>
                      Log into your Slate instance at{" "}
                      <strong>[subdomain].technolutions.net</strong>
                    </li>
                    <li>
                      Navigate to <strong>Database → API</strong>
                    </li>
                    <li>
                      Click <strong>"Create New API Key"</strong>
                    </li>
                    <li>
                      Name it (e.g., "CampusVoice Integration")
                    </li>
                    <li>
                      Enable <strong>Deliver</strong> permissions (Read +
                      Write)
                    </li>
                    <li>Copy the generated API key</li>
                  </ol>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>Finding your Subdomain:</strong> Look at your
                      Slate login URL:
                    </p>
                    <code className="text-xs bg-background px-2 py-1 rounded block">
                      https://
                      <span className="text-primary font-bold">
                        [subdomain]
                      </span>
                      .technolutions.net
                    </code>
                  </div>
                  <a
                    href="https://technolutions.com/solutions/slate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Learn more about Slate
                  </a>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="space-y-2">
              <Label htmlFor="slateSubdomain">Slate Subdomain</Label>
              <Input
                id="slateSubdomain"
                value={slateSubdomain}
                onChange={(e) => setSlateSubdomain(e.target.value)}
                placeholder="yourschool"
                disabled={isPushing}
              />
              <p className="text-xs text-muted-foreground">
                From your URL: https://[subdomain].technolutions.net
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slateApiKey">API Key</Label>
              <Input
                id="slateApiKey"
                type="password"
                value={slateApiKey}
                onChange={(e) => setSlateApiKey(e.target.value)}
                placeholder="Your Slate API key"
                disabled={isPushing}
              />
              <p className="text-xs text-muted-foreground">
                Your API key is only used for this request and is never
                stored.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberSlate"
                checked={rememberCredentials}
                onCheckedChange={(checked) =>
                  setRememberCredentials(checked === true)
                }
                disabled={isPushing}
              />
              <Label
                htmlFor="rememberSlate"
                className="text-sm font-normal cursor-pointer"
              >
                Remember subdomain for next time
              </Label>
            </div>

            <div className="bg-muted rounded-lg p-3">
              <p className="text-xs text-muted-foreground">
                <strong>Pushing:</strong> {contentName}
              </p>
              <p className="text-xs text-muted-foreground">
                <strong>Channel:</strong> {channel}
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          {pushResult ? (
            <Button onClick={handleClose}>
              {pushResult.success ? "Done" : "Close"}
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isPushing}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePush}
                disabled={isPushing}
                className="flex items-center gap-2"
              >
                {isPushing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Pushing...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    Push to Slate
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
