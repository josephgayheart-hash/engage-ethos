import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSocialPosts, type SocialPost } from "@/hooks/useSocialPosts";
import { PostComposerCard } from "@/components/social/PostComposerCard";
import { PostQueueList } from "@/components/social/PostQueueList";
import { SEOHead } from "@/components/SEOHead";
import { useBrandMode } from "@/contexts/BrandModeContext";
import { useInstitutionalProfiles } from "@/hooks/useInstitutionalProfiles";
import { useAuth } from "@/contexts/AuthContext";

export default function SocialPostsPage() {
  const { brand } = useBrandMode();
  const { posts, isLoading, upsert, remove, publish } = useSocialPosts();
  const [selected, setSelected] = useState<SocialPost | null>(null);
  const { user } = useAuth();
  const { profiles } = useInstitutionalProfiles();
  const activeProfile = profiles?.[0];
  const config = activeProfile?.config as any;

  const brandColors = config?.brandColors || [];
  const logoUrl = config?.logoUrl;
  const logoUrls = config?.logoUrls;
  const institutionName = activeProfile?.name;

  const handleSave = (data: Partial<SocialPost>) => {
    upsert.mutate(data as any, {
      onSuccess: (saved: any) => setSelected(saved as SocialPost),
    });
  };

  const handleNew = () => setSelected(null);

  return (
    <>
      <SEOHead title={`${brand.navItems.socialPosts ?? "Social Posts"} | ${brand.name}`} description="Create, schedule, and publish social media posts." />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">{brand.navItems.socialPosts ?? "Social Posts"}</h1>
            <p className="text-xs text-muted-foreground">Create, schedule, and publish to social platforms</p>
          </div>
          <Button size="sm" onClick={handleNew}>
            <Plus className="h-3.5 w-3.5 mr-1" /> New Post
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
          <div>
            <PostQueueList
              posts={posts}
              selectedId={selected?.id}
              onSelect={setSelected}
              onDelete={(id) => remove.mutate(id)}
              onPublish={(id) => publish.mutate(id)}
              isPublishing={publish.isPending}
            />
          </div>

          <div>
            <PostComposerCard
              post={selected}
              onSave={handleSave}
              onPublish={(id) => publish.mutate(id)}
              isSaving={upsert.isPending}
              isPublishing={publish.isPending}
              brandColors={brandColors}
              logoUrl={logoUrl}
              logoUrls={logoUrls}
              institutionName={institutionName}
            />
          </div>
        </div>
      </div>
    </>
  );
}
