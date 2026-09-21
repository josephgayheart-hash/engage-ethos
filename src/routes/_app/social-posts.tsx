import { createFileRoute } from "@tanstack/react-router";
import SocialPostsPage from "@/pages/SocialPostsPage";

export const Route = createFileRoute("/_app/social-posts")({
  component: SocialPostsPage,
});
