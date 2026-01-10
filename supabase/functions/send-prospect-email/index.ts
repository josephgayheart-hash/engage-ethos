import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  prospect_id: string;
  to_email: string;
  to_name: string;
  subject: string;
  body: string;
  from_name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prospect_id, to_email, to_name, subject, body, from_name }: SendEmailRequest = await req.json();

    if (!prospect_id || !to_email || !subject || !body) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing required fields: prospect_id, to_email, subject, body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId: string | null = null;
    
    if (authHeader) {
      const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id || null;
    }

    // Convert plain text body to HTML with line breaks preserved
    const htmlBody = body
      .split('\n')
      .map((line: string) => line.trim() === '' ? '<br>' : `<p style="margin: 0 0 10px 0;">${line}</p>`)
      .join('');

    const senderName = from_name || 'Dan Simmons';

    console.log('Sending email to:', to_email);
    console.log('Subject:', subject);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // Use your verified domain when available, fallback to onboarding domain for testing
        from: `${senderName} <noreply@campusvoice.ai>`,
        to: [to_email],
        subject: subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            ${htmlBody}
            <br>
            <p style="margin: 0;">Best,</p>
            <p style="margin: 5px 0 0 0; font-weight: 600;">${senderName}</p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">Co-Founder, CampusVoice.ai</p>
          </body>
          </html>
        `,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', responseData);
      return new Response(
        JSON.stringify({ success: false, error: responseData.message || 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Email sent:', responseData);

    // Log the outreach to the database
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    const { error: insertError } = await supabase
      .from('outreach_history')
      .insert({
        prospect_id,
        type: 'email',
        subject,
        body,
        created_by_user_id: userId,
      });

    if (insertError) {
      console.error('Failed to log outreach:', insertError);
      // Don't fail the request if logging fails
    }

    // Update prospect status to 'contacted'
    const { error: updateError } = await supabase
      .from('sales_prospects')
      .update({ status: 'contacted' })
      .eq('id', prospect_id);

    if (updateError) {
      console.error('Failed to update prospect status:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: { 
          message_id: responseData.id,
          logged: !insertError 
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
