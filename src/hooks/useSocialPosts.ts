import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SocialPost {
  id: string;
  user_id: string;
  tenant_id: string;
  profile_id: string | null;
  platform: string[];
  caption: string | null;
  cta_text: string | null;
  cta_url: string | null;
  image_url: string | null;
  brand_overlay_data: unknown;
  scheduled_at: string | null;
  cadence: string | null;
  status: string;
  published_at: string | null;
  publish_error: string | null;
  created_at: string;
  updated_at: string;
}

export function useSocialPosts() {
  const { user, tenant } = useAuth();
  const qc = useQueryClient();
  const key = ["social-posts", tenant?.id];

  const query = useQuery({
    queryKey: key,
    enabled: !!user && !!tenant,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as SocialPost[];
    },
  });

  const upsert = useMutation({
    mutationFn: async (post: Partial<SocialPost> & { id?: string }) => {
      if (post.id) {
        const { data, error } = await supabase
          .from("social_posts")
          .update(post as any)
          .eq("id", post.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("social_posts")
          .insert({ ...post, user_id: user!.id, tenant_id: tenant!.id } as any)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: key }),
  });

  const publish = useMutation({
    mutationFn: async (postId: string) => {
      const { data, error } = await supabase.functions.invoke("publish-social-post", {
        body: { postId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: key });
      if (data?.success) {
        toast.success("Post published successfully!");
      } else {
        toast.warning("Some platforms failed to publish. Check the post for details.");
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return { posts: query.data ?? [], isLoading: query.isLoading, upsert, remove, publish };
}
