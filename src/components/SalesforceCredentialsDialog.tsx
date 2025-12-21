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

interface SalesforceCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
  contentName: string;
  channel: string;
}

interface StoredCredentials {
  clientId: string;
  subdomain: string;
}

const STORAGE_KEY = 'sfmc_credentials';

export function SalesforceCredentialsDialog({
  open,
  onOpenChange,
  content,
  contentName,
  channel,
}: SalesforceCredentialsDialogProps) {
  const { toast } = useToast();
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [rememberCredentials, setRememberCredentials] = useState(true);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string; assetId?: string } | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    if (open) {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed: StoredCredentials = JSON.parse(saved);
          setClientId(parsed.clientId || "");
          setSubdomain(parsed.subdomain || "");
        } catch {
          // Invalid stored data
        }
      }
      // Reset state when dialog opens
      setPushResult(null);
      setClientSecret("");
    }
  }, [open]);

  const handlePush = async () => {
    if (!clientId || !clientSecret || !subdomain) {
      toast({
        title: "Missing credentials",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsPushing(true);
    setPushResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("push-to-sfmc", {
        body: {
          clientId,
          clientSecret,
          subdomain,
          content,
          name: contentName,
          channel,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.error) {
        setPushResult({
          success: false,
          message: data.details || data.error,
        });
      } else {
        // Save credentials if requested (never save secret)
        if (rememberCredentials) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ clientId, subdomain })
          );
        }

        setPushResult({
          success: true,
          message: data.message,
          assetId: data.assetId,
        });

        toast({
          title: "Pushed to Salesforce",
          description: `Asset "${data.assetName}" created in Content Builder`,
        });
      }
    } catch (error) {
      console.error("SFMC push error:", error);
      setPushResult({
        success: false,
        message: error instanceof Error ? error.message : "Failed to push to Salesforce",
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset after close animation
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
            <Cloud className="w-5 h-5 text-blue-500" />
            Push to Salesforce Marketing Cloud
          </DialogTitle>
          <DialogDescription>
            Enter your SFMC API credentials to push content directly to Content Builder.
          </DialogDescription>
        </DialogHeader>

        {pushResult ? (
          <div className="py-6">
            <div className={`flex flex-col items-center gap-3 text-center ${pushResult.success ? 'text-green-600' : 'text-destructive'}`}>
              {pushResult.success ? (
                <CheckCircle className="w-12 h-12" />
              ) : (
                <AlertCircle className="w-12 h-12" />
              )}
              <p className="font-medium">
                {pushResult.success ? "Success!" : "Push Failed"}
              </p>
              <p className="text-sm text-muted-foreground">{pushResult.message}</p>
              {pushResult.assetId && (
                <p className="text-xs text-muted-foreground">Asset ID: {pushResult.assetId}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Help Section */}
            <Collapsible open={helpOpen} onOpenChange={setHelpOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
                  <span className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    How do I get API credentials?
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${helpOpen ? 'rotate-180' : ''}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <div className="bg-muted/50 rounded-lg p-4 space-y-3 text-sm border">
                  <p className="font-medium text-foreground">Create an Installed Package in SFMC:</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Log into Marketing Cloud and go to <strong>Setup</strong></li>
                    <li>Navigate to <strong>Platform Tools → Apps → Installed Packages</strong></li>
                    <li>Click <strong>"New"</strong> to create a new package</li>
                    <li>Name it (e.g., "CampusVoice Integration")</li>
                    <li>Click <strong>"Add Component"</strong> → Select <strong>"API Integration"</strong></li>
                    <li>Choose <strong>"Server-to-Server"</strong> integration type</li>
                    <li>
                      Enable these permissions:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>Content Builder: Read, Write</li>
                        <li>Saved Content: Read, Write, Publish</li>
                      </ul>
                    </li>
                    <li>Save and copy your <strong>Client ID</strong>, <strong>Client Secret</strong>, and <strong>Subdomain</strong></li>
                  </ol>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2">
                      <strong>Finding your Subdomain:</strong> Look at your SFMC login URL. It follows this pattern:
                    </p>
                    <code className="text-xs bg-background px-2 py-1 rounded block">
                      https://<span className="text-primary font-bold">[subdomain]</span>.auth.marketingcloudapis.com
                    </code>
                  </div>
                  <a 
                    href="https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/create-integration-enhanced.html" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    View official Salesforce documentation
                  </a>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="space-y-2">
              <Label htmlFor="subdomain">SFMC Subdomain</Label>
              <Input
                id="subdomain"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="mc1234abcd"
                disabled={isPushing}
              />
              <p className="text-xs text-muted-foreground">
                Found in your SFMC URL: https://[subdomain].rest.marketingcloudapis.com
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientId">Client ID</Label>
              <Input
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="Your API Client ID"
                disabled={isPushing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientSecret">Client Secret</Label>
              <Input
                id="clientSecret"
                type="password"
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Your API Client Secret"
                disabled={isPushing}
              />
              <p className="text-xs text-muted-foreground">
                Your secret is only used for this request and is never stored.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={rememberCredentials}
                onCheckedChange={(checked) => setRememberCredentials(checked === true)}
                disabled={isPushing}
              />
              <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                Remember subdomain and client ID for next time
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
              <Button variant="outline" onClick={handleClose} disabled={isPushing}>
                Cancel
              </Button>
              <Button onClick={handlePush} disabled={isPushing} className="flex items-center gap-2">
                {isPushing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Pushing...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    Push to SFMC
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
