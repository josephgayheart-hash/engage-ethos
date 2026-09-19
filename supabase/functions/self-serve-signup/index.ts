import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com',
  'proton.me', 'protonmail.com', 'gmx.com', 'yandex.com', 'mail.com', 'zoho.com',
]);

const BodySchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  institutionName: z.string().min(1).max(200),
  title: z.string().max(150).optional().nullable(),
  department: z.string().max(150).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  referralSource: z.string().max(60).optional().nullable(),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

async function notifyAdmins(admin: ReturnType<typeof createClient>, subject: string, lines: string[]) {
  if (!RESEND_API_KEY) return;
  try {
    const { data: roleRows } = await admin.from('user_roles').select('user_id').eq('role', 'super_admin');
    const ids = (roleRows ?? []).map((r: { user_id: string }) => r.user_id);
    if (!ids.length) return;
    const { data: adminProfiles } = await admin.from('profiles').select('email').in('id', ids);
    const recipients = (adminProfiles ?? []).map((p: { email: string }) => p.email).filter(Boolean);
    if (!recipients.length) return;

    const html = `<div style="font-family:Arial,sans-serif;max-width:560px"><h2 style="color:#1e293b;margin:0 0 12px">${subject}</h2>${lines
      .map((l) => `<p style="margin:0 0 6px;color:#475569;font-size:14px">${l}</p>`)
      .join('')}<p style="margin:18px 0 0"><a href="https://www.campusvoice.ai/admin/crm" style="background:#1a2036;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;font-size:14px">Open CRM</a></p></div>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: 'CampusVoice.AI <noreply@campusvoice.ai>',
        to: recipients,
        subject,
        html,
      }),
    });
  } catch (err) {
    console.error('Admin notification failed:', err);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return json({ error: 'Please check the details you entered.', fields: parsed.error.flatten().fieldErrors }, 400);
    }
    const body = parsed.data;
    const email = body.email.trim().toLowerCase();
    const domain = email.split('@')[1] ?? '';
    const isWorkEmail = domain.length > 0 && !FREE_EMAIL_DOMAINS.has(domain);

    // Always record the inbound request (this also pushes it into the CRM via trigger).
    const { error: requestError } = await admin.from('onboarding_requests').insert({
      first_name: body.firstName,
      last_name: body.lastName,
      email,
      phone: body.phone || null,
      institution_name_input: body.institutionName,
      department: body.department || null,
      title: body.title || null,
      referral_source: body.referralSource || null,
      request_status: isWorkEmail ? 'approved' : 'submitted',
      request_type: 'university',
    });
    if (requestError) console.error('onboarding_requests insert failed:', requestError.message);

    if (!isWorkEmail) {
      await notifyAdmins(admin, 'New access request (manual review needed)', [
        `<strong>${body.firstName} ${body.lastName}</strong> — ${email}`,
        `${body.institutionName}${body.title ? ` · ${body.title}` : ''}`,
        'Personal email address, so no account was created automatically.',
      ]);
      return json({ status: 'pending_review' });
    }

    // Find an existing workspace for this email domain, otherwise create one.
    let tenantId: string | null = null;
    let joinedExisting = false;

    const { data: domainMatch } = await admin
      .from('profiles')
      .select('tenant_id')
      .ilike('email', `%@${domain}`)
      .limit(1)
      .maybeSingle();

    if (domainMatch?.tenant_id) {
      tenantId = domainMatch.tenant_id as string;
      joinedExisting = true;
    } else {
      const { data: tenant, error: tenantError } = await admin
        .from('tenants')
        .insert({ institution_name: body.institutionName, tenant_type: 'university', status: 'active' })
        .select('id')
        .single();
      if (tenantError || !tenant) {
        console.error('tenant insert failed:', tenantError?.message);
        return json({ error: 'We could not set up your workspace. Please try again.' }, 500);
      }
      tenantId = tenant.id as string;
    }

    const { data: created, error: userError } = await admin.auth.admin.createUser({
      email,
      password: body.password,
      email_confirm: true,
      user_metadata: { first_name: body.firstName, last_name: body.lastName },
    });

    if (userError || !created?.user) {
      const msg = (userError?.message ?? '').toLowerCase();
      if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
        return json({ error: 'An account with this email already exists. Try signing in instead.' }, 409);
      }
      console.error('createUser failed:', userError?.message);
      return json({ error: 'We could not create your account. Please try again.' }, 500);
    }

    const userId = created.user.id;

    const { error: profileError } = await admin.from('profiles').insert({
      id: userId,
      tenant_id: tenantId,
      email,
      first_name: body.firstName,
      last_name: body.lastName,
      title: body.title || null,
      department: body.department || null,
      phone: body.phone || null,
      status: 'active',
      password_reset_required: false,
    });

    if (profileError) {
      console.error('profile insert failed:', profileError.message);
      await admin.auth.admin.deleteUser(userId).catch(() => {});
      return json({ error: 'We could not finish setting up your account. Please try again.' }, 500);
    }

    await admin.from('user_roles').insert({
      user_id: userId,
      role: joinedExisting ? 'user' : 'admin',
      tenant_id: tenantId,
    });

    await notifyAdmins(admin, 'New self-serve signup on CampusVoice.AI', [
      `<strong>${body.firstName} ${body.lastName}</strong> — ${email}`,
      `${body.institutionName}${body.title ? ` · ${body.title}` : ''}`,
      joinedExisting ? 'Joined an existing workspace for this email domain.' : 'A new workspace was created for them.',
      body.referralSource ? `Heard about us via: ${body.referralSource}` : '',
    ].filter(Boolean));

    return json({ status: 'signed_up', joinedExisting });
  } catch (err) {
    console.error('self-serve-signup error:', err);
    return json({ error: 'Something went wrong. Please try again.' }, 500);
  }
});
