import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";

import appCss from "../styles.css?url";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PostHogIdentifier } from "@/components/PostHogIdentifier";
import { usePageTracking } from "@/hooks/usePageTracking";
import { reportLovableError } from "@/lib/lovable-error-reporting";
import NotFound from "@/pages/NotFound";

// ported from main.tsx
import { initPostHog } from "@/lib/posthog";

initPostHog();

function PageTracker() {
  usePageTracking();
  return null;
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      {
        name: "google-site-verification",
        content: "f5TbuveIG_w2xWInsOqF7wtq8YJyH7WcnVWsRVYK5g8",
      },
      { title: "CampusVoice.AI — AI copywriting that stays on your brand" },
      {
        name: "description",
        content:
          "Upload your brand voice once, then generate emails, social posts, campaigns, and journeys that sound like you. Built for higher-ed, enterprise, nonprofit, and healthcare brand teams.",
      },
      { name: "author", content: "CampusVoice.AI" },
      {
        property: "og:title",
        content: "CampusVoice.AI — AI copywriting that stays on your brand",
      },
      {
        property: "og:description",
        content:
          "Upload your brand voice once, then generate emails, social posts, campaigns, and journeys that sound like you.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.campusvoice.ai/" },
      { property: "og:image", content: "https://www.campusvoice.ai/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@CampusVoiceAI" },
      {
        name: "twitter:title",
        content: "CampusVoice.AI — AI copywriting that stays on your brand",
      },
      {
        name: "twitter:description",
        content:
          "Upload your brand voice once, then generate emails, social posts, campaigns, and journeys that sound like you.",
      },
      { name: "twitter:image", content: "https://www.campusvoice.ai/og-image.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap",
      },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "canonical", href: "https://www.campusvoice.ai/" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFound,
  errorComponent: RootErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <PostHogIdentifier />
          <PageTracker />
          <ScrollToTop />
          <Toaster />
          <Sonner />
          <Outlet />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-2 text-xl font-semibold">This page didn't load</h1>
        <p className="mb-6 text-muted-foreground">
          Something went wrong on our end. You can try again or head back home.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => {
              router.invalidate();
              reset();
            }}
          >
            Try again
          </button>
          <a className="rounded-md border border-border px-4 py-2" href="/">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
