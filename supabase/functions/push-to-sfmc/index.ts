import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map CampusVoice channels to SFMC asset type IDs
const SFMC_ASSET_TYPES: Record<string, { id: number; name: string }> = {
  'email': { id: 208, name: 'htmlemail' },
  'sms': { id: 230, name: 'smsMessage' },
  'landing-page': { id: 205, name: 'htmlblock' },
  'phone-call': { id: 196, name: 'textblock' },
  'digital-ad-search': { id: 196, name: 'textblock' },
  'digital-ad-social': { id: 196, name: 'textblock' },
  'talking-points': { id: 196, name: 'textblock' },
  'social-media': { id: 196, name: 'textblock' },
  'portal': { id: 196, name: 'textblock' },
  'direct-mail': { id: 196, name: 'textblock' },
};

interface PushRequest {
  clientId: string;
  clientSecret: string;
  subdomain: string;
  content: string;
  name: string;
  channel: string;
  folderId?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientId, clientSecret, subdomain, content, name, channel, folderId }: PushRequest = await req.json();

    // Validate required fields
    if (!clientId || !clientSecret || !subdomain || !content || !name) {
      console.error('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields: clientId, clientSecret, subdomain, content, name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Attempting to push content to SFMC subdomain: ${subdomain}`);
    console.log(`Content name: ${name}, Channel: ${channel}`);

    // Step 1: Get OAuth access token
    const authUrl = `https://${subdomain}.auth.marketingcloudapis.com/v2/token`;
    console.log(`Authenticating with SFMC at: ${authUrl}`);
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!authResponse.ok) {
      const authError = await authResponse.text();
      console.error('SFMC Auth failed:', authError);
      return new Response(
        JSON.stringify({ 
          error: 'Authentication failed', 
          details: 'Invalid credentials or subdomain. Please check your SFMC API credentials.' 
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;
    const restInstanceUrl = authData.rest_instance_url || `https://${subdomain}.rest.marketingcloudapis.com`;
    
    console.log('Successfully authenticated with SFMC');

    // Step 2: Create asset in Content Builder
    const assetType = SFMC_ASSET_TYPES[channel] || SFMC_ASSET_TYPES['email'];
    
    const assetPayload: Record<string, unknown> = {
      name: name,
      assetType: {
        id: assetType.id,
        name: assetType.name,
      },
      content: content,
      // Add AMPscript merge field hints
      meta: {
        options: {
          generateFrom: 'CampusVoice',
          mergeFields: ['%%FirstName%%', '%%StudentType%%', '%%DeadlineDate%%', '%%InstitutionName%%'],
        },
      },
    };

    // Add to specific folder if provided
    if (folderId) {
      assetPayload.category = { id: folderId };
    }

    const assetUrl = `${restInstanceUrl}/asset/v1/content/assets`;
    console.log(`Creating asset at: ${assetUrl}`);
    
    const assetResponse = await fetch(assetUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assetPayload),
    });

    if (!assetResponse.ok) {
      const assetError = await assetResponse.text();
      console.error('SFMC Asset creation failed:', assetError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create asset in Content Builder', 
          details: assetError 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const assetData = await assetResponse.json();
    console.log('Successfully created asset:', assetData.id, assetData.name);

    return new Response(
      JSON.stringify({
        success: true,
        assetId: assetData.id,
        assetName: assetData.name,
        assetType: assetType.name,
        message: `Content successfully pushed to SFMC Content Builder`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in push-to-sfmc function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
