import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ── OAuth 1.0a helpers (Twitter / X) ── */

async function hmacSha1(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

function percentEncode(str: string): string {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

async function buildOAuthHeader(
  method: string,
  url: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  tokenSecret: string,
  extraParams: Record<string, string> = {}
): Promise<string> {
  const oauthParams: Record<string, string> = {
    oauth_consumer_key: consumerKey,
    oauth_nonce: crypto.randomUUID().replace(/-/g, ""),
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
    oauth_token: accessToken,
    oauth_version: "1.0",
    ...extraParams,
  };

  const allParams = { ...oauthParams };
  const paramStr = Object.keys(allParams)
    .sort()
    .map((k) => `${percentEncode(k)}=${percentEncode(allParams[k])}`)
    .join("&");

  const baseStr = `${method.toUpperCase()}&${percentEncode(url)}&${percentEncode(paramStr)}`;
  const signingKey = `${percentEncode(consumerSecret)}&${percentEncode(tokenSecret)}`;
  const signature = await hmacSha1(signingKey, baseStr);
  oauthParams["oauth_signature"] = signature;

  const header = Object.keys(oauthParams)
    .sort()
    .map((k) => `${percentEncode(k)}="${percentEncode(oauthParams[k])}"`)
    .join(", ");

  return `OAuth ${header}`;
}

/* ── Twitter media upload (chunked init → append → finalize) ── */

async function uploadMediaToTwitter(
  imageUrl: string,
  consumerKey: string,
  consumerSecret: string,
  accessToken: string,
  tokenSecret: string
): Promise<string | null> {
  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const imgBytes = new Uint8Array(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";

    // INIT
    const initUrl = "https://upload.twitter.com/1.1/media/upload.json";
    const initBody = new URLSearchParams({
      command: "INIT",
      total_bytes: imgBytes.length.toString(),
      media_type: contentType,
    });
    const initAuth = await buildOAuthHeader("POST", initUrl, consumerKey, consumerSecret, accessToken, tokenSecret);
    const initRes = await fetch(initUrl, {
      method: "POST",
      headers: { Authorization: initAuth, "Content-Type": "application/x-www-form-urlencoded" },
      body: initBody.toString(),
    });
    if (!initRes.ok) { await initRes.text(); return null; }
    const { media_id_string } = await initRes.json();

    // APPEND
    const formData = new FormData();
    formData.append("command", "APPEND");
    formData.append("media_id", media_id_string);
    formData.append("segment_index", "0");
    formData.append("media_data", btoa(String.fromCharCode(...imgBytes)));
    const appendAuth = await buildOAuthHeader("POST", initUrl, consumerKey, consumerSecret, accessToken, tokenSecret);
    const appendRes = await fetch(initUrl, {
      method: "POST",
      headers: { Authorization: appendAuth },
      body: formData,
    });
    if (!appendRes.ok) { await appendRes.text(); return null; }

    // FINALIZE
    const finalBody = new URLSearchParams({ command: "FINALIZE", media_id: media_id_string });
    const finalAuth = await buildOAuthHeader("POST", initUrl, consumerKey, consumerSecret, accessToken, tokenSecret);
    const finalRes = await fetch(initUrl, {
      method: "POST",
      headers: { Authorization: finalAuth, "Content-Type": "application/x-www-form-urlencoded" },
      body: finalBody.toString(),
    });
    if (!finalRes.ok) { await finalRes.text(); return null; }

    return media_id_string;
  } catch {
    return null;
  }
}

/* ── Platform publishers ── */

async function publishToTwitter(caption: string, imageUrl?: string | null): Promise<{ success: boolean; error?: string }> {
  const consumerKey = Deno.env.get("TWITTER_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("TWITTER_CONSUMER_SECRET");
  const accessToken = Deno.env.get("TWITTER_ACCESS_TOKEN");
  const tokenSecret = Deno.env.get("TWITTER_ACCESS_TOKEN_SECRET");

  if (!consumerKey || !consumerSecret || !accessToken || !tokenSecret) {
    return { success: false, error: "Twitter API credentials not configured" };
  }

  try {
    let mediaId: string | null = null;
    if (imageUrl) {
      mediaId = await uploadMediaToTwitter(imageUrl, consumerKey, consumerSecret, accessToken, tokenSecret);
    }

    const tweetUrl = "https://api.x.com/2/tweets";
    const body: Record<string, unknown> = { text: caption };
    if (mediaId) {
      body.media = { media_ids: [mediaId] };
    }

    // Do NOT include POST body params in OAuth signature for JSON requests
    const authHeader = await buildOAuthHeader("POST", tweetUrl, consumerKey, consumerSecret, accessToken, tokenSecret);
    const res = await fetch(tweetUrl, {
      method: "POST",
      headers: { Authorization: authHeader, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data?.detail || data?.title || "Twitter API error" };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function publishToLinkedIn(caption: string, _imageUrl?: string | null): Promise<{ success: boolean; error?: string }> {
  const token = Deno.env.get("LINKEDIN_ACCESS_TOKEN");
  if (!token) return { success: false, error: "LinkedIn credentials not configured" };

  try {
    // Get user URN
    const meRes = await fetch("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) { await meRes.text(); return { success: false, error: "Failed to get LinkedIn profile" }; }
    const me = await meRes.json();
    const personUrn = `urn:li:person:${me.sub}`;

    const postBody = {
      author: personUrn,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: { text: caption },
          shareMediaCategory: "NONE",
        },
      },
      visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
    };

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Restli-Protocol-Version": "2.0.0" },
      body: JSON.stringify(postBody),
    });
    const data = await res.text();
    if (!res.ok) return { success: false, error: data };
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

async function publishToFacebook(caption: string, imageUrl?: string | null): Promise<{ success: boolean; error?: string }> {
  const pageToken = Deno.env.get("FACEBOOK_PAGE_ACCESS_TOKEN");
  const pageId = Deno.env.get("FACEBOOK_PAGE_ID");
  if (!pageToken || !pageId) return { success: false, error: "Facebook credentials not configured" };

  try {
    const endpoint = imageUrl
      ? `https://graph.facebook.com/v19.0/${pageId}/photos`
      : `https://graph.facebook.com/v19.0/${pageId}/feed`;

    const params: Record<string, string> = { message: caption, access_token: pageToken };
    if (imageUrl) params.url = imageUrl;

    const body = new URLSearchParams(params);
    const res = await fetch(endpoint, { method: "POST", body });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data?.error?.message || "Facebook API error" };
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

/* ── Main handler ── */

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const { postId } = await req.json();
    if (!postId) throw new Error("Missing postId");

    // Fetch the post
    const { data: post, error: fetchError } = await supabase
      .from("social_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (fetchError || !post) throw new Error("Post not found");

    const platforms = post.platform as string[];
    const caption = [post.caption, post.cta_text ? `\n${post.cta_text}` : "", post.cta_url ? `\n${post.cta_url}` : ""]
      .filter(Boolean)
      .join("");

    const results: Record<string, { success: boolean; error?: string }> = {};

    for (const platform of platforms) {
      switch (platform) {
        case "twitter":
        case "x":
          results[platform] = await publishToTwitter(caption, post.image_url);
          break;
        case "linkedin":
          results[platform] = await publishToLinkedIn(caption, post.image_url);
          break;
        case "facebook":
          results[platform] = await publishToFacebook(caption, post.image_url);
          break;
        default:
          results[platform] = { success: false, error: `Unsupported platform: ${platform}` };
      }
    }

    const allSuccess = Object.values(results).every((r) => r.success);
    const errors = Object.entries(results)
      .filter(([, r]) => !r.success)
      .map(([p, r]) => `${p}: ${r.error}`)
      .join("; ");

    await supabase
      .from("social_posts")
      .update({
        status: allSuccess ? "published" : "failed",
        published_at: allSuccess ? new Date().toISOString() : null,
        publish_error: errors || null,
      })
      .eq("id", postId);

    return new Response(JSON.stringify({ success: allSuccess, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
