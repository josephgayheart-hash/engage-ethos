
INSERT INTO public.playbook_kits (kit_key, name, description, category, institution_types, target_audiences, target_cohorts, journey_template, message_templates, best_practices, research_notes, is_active)
VALUES
-- Cultivation Journey
(
  'advancement-cultivation',
  'Donor Cultivation Journey',
  'A multi-touch cultivation sequence designed to move prospects from awareness to readiness, building affinity through storytelling, impact data, and personal connection.',
  'advancement',
  ARRAY['all', 'four-year-university', 'community-college', 'doctoral-university', 'masters-university', 'baccalaureate-college'],
  ARRAY['donors', 'alumni', 'parents', 'friends'],
  ARRAY['lapsed-donors', 'mid-level-prospects', 'first-time-donors'],
  '{"phases":[{"name":"Awareness","duration":"2 weeks","focus":"Introduce institutional mission and impact through storytelling"},{"name":"Engagement","duration":"3 weeks","focus":"Share impact reports, student success stories, and campus updates"},{"name":"Affinity Building","duration":"3 weeks","focus":"Personal outreach, event invitations, and volunteer opportunities"},{"name":"Readiness","duration":"2 weeks","focus":"Gift officer introduction and giving opportunity framing"}]}'::jsonb,
  '[{"title":"Impact Spotlight Email","channel":"email","focus":"Share a compelling student or program success story with impact data"},{"title":"Alumni Connection Social Post","channel":"social","focus":"Celebrate alumni achievements tied to institutional mission"},{"title":"Personal Note from Gift Officer","channel":"letter","focus":"Warm personal outreach establishing relationship"},{"title":"Event Invitation","channel":"email","focus":"Invite to campus event, virtual tour, or donor appreciation gathering"}]'::jsonb,
  ARRAY[
    'Lead with mission-aligned stories, not ask amounts',
    'Include at least one personal touchpoint (call or handwritten note) per cultivation cycle',
    'Share impact data that connects gifts to outcomes (e.g., "Your $500 funded 3 student internships")',
    'Segment by affinity—program alumni respond better to department-specific content'
  ],
  'Based on CASE (Council for Advancement and Support of Education) donor engagement best practices and moves management frameworks.',
  true
),
-- Solicitation Journey
(
  'advancement-solicitation',
  'Annual Fund Solicitation Campaign',
  'A structured ask sequence for annual fund campaigns, progressing from soft ask to direct appeal with urgency triggers and matching gift opportunities.',
  'advancement',
  ARRAY['all', 'four-year-university', 'community-college', 'doctoral-university', 'masters-university', 'baccalaureate-college'],
  ARRAY['donors', 'alumni', 'parents'],
  ARRAY['lapsed-donors', 'recurring-donors', 'first-time-donors', 'mid-level-prospects'],
  '{"phases":[{"name":"Soft Ask","duration":"1 week","focus":"Frame the need and share a compelling case for support"},{"name":"Direct Appeal","duration":"1 week","focus":"Clear ask with specific giving levels and impact descriptions"},{"name":"Social Proof","duration":"1 week","focus":"Share donor testimonials, participation rates, and matching gift opportunities"},{"name":"Urgency Close","duration":"3 days","focus":"Deadline-driven messaging with progress-to-goal updates"}]}'::jsonb,
  '[{"title":"Case for Support Email","channel":"email","focus":"Present the need with data and a personal story"},{"title":"Direct Ask Email","channel":"email","focus":"Clear giving levels with specific impact per amount"},{"title":"Matching Gift Announcement","channel":"email","focus":"Announce matching gift opportunity to double impact"},{"title":"Countdown Social Posts","channel":"social","focus":"Progress-to-goal updates with donor count and momentum"},{"title":"Final Push SMS","channel":"sms","focus":"Last chance reminder with direct giving link"}]'::jsonb,
  ARRAY[
    'Always tie ask amounts to tangible outcomes (e.g., "$50 = one textbook scholarship")',
    'Include a matching gift opportunity when possible—it increases response rates by 22%',
    'Use progress-to-goal messaging in final phase to create social momentum',
    'Segment messaging by previous giving level to avoid under-asking or over-asking'
  ],
  'Informed by AFP (Association of Fundraising Professionals) annual giving benchmarks and direct response fundraising research.',
  true
),
-- Giving Day Journey
(
  'advancement-giving-day',
  'Giving Day Campaign Playbook',
  'A complete 24-hour giving day campaign framework with pre-day hype, day-of cadence management, and post-day stewardship built in.',
  'advancement',
  ARRAY['all', 'four-year-university', 'community-college', 'doctoral-university', 'masters-university', 'baccalaureate-college'],
  ARRAY['donors', 'alumni', 'parents', 'students', 'faculty', 'staff', 'friends'],
  ARRAY['all-constituents', 'challenge-gift-donors', 'social-ambassadors'],
  '{"phases":[{"name":"Pre-Day Hype","duration":"7 days","focus":"Build anticipation with ambassador recruitment, challenge gift announcements, and countdown content"},{"name":"Day-Of Morning","duration":"6 hours","focus":"Launch with energy—leaderboard updates, social takeovers, and early bird incentives"},{"name":"Day-Of Afternoon","duration":"6 hours","focus":"Momentum maintenance with milestone celebrations, matching gift unlocks, and ambassador pushes"},{"name":"Day-Of Evening","duration":"6 hours","focus":"Final stretch with urgency, gratitude, and real-time goal tracking"},{"name":"Post-Day Thank You","duration":"3 days","focus":"Immediate gratitude, impact preview, and stewardship handoff"}]}'::jsonb,
  '[{"title":"Save the Date Email","channel":"email","focus":"Announce giving day date with early challenge gift teaser"},{"title":"Ambassador Toolkit","channel":"social","focus":"Pre-built social posts, graphics, and talking points for peer ambassadors"},{"title":"Morning Launch Email","channel":"email","focus":"Day-of kickoff with direct giving link and first challenge unlock"},{"title":"Milestone Social Updates","channel":"social","focus":"Real-time progress posts celebrating donor count and gift milestones"},{"title":"Final Hour Push","channel":"email","focus":"Last chance email with live progress-to-goal and urgency"},{"title":"Thank You Email","channel":"email","focus":"Immediate gratitude with total raised, donor count, and impact preview"}]'::jsonb,
  ARRAY[
    'Recruit ambassadors 2-3 weeks early—peer-to-peer outreach drives 40% of giving day gifts',
    'Structure challenge gifts to unlock at participation milestones, not just dollar amounts',
    'Post leaderboard and milestone updates every 2 hours on social media',
    'Send the thank-you email within 2 hours of campaign close while energy is high',
    'Plan at least 3 matching/challenge gift moments spread across the day'
  ],
  'Based on GiveCampus, ScaleFunder, and Giving Tuesday best practices for higher education giving days.',
  true
),
-- Stewardship Journey
(
  'advancement-stewardship',
  'Donor Stewardship Lifecycle',
  'A year-round stewardship framework that keeps donors engaged between asks, reinforcing the impact of their giving and deepening institutional affinity.',
  'advancement',
  ARRAY['all', 'four-year-university', 'community-college', 'doctoral-university', 'masters-university', 'baccalaureate-college'],
  ARRAY['donors', 'alumni'],
  ARRAY['first-time-donors', 'recurring-donors', 'major-gift-donors', 'planned-giving-prospects'],
  '{"phases":[{"name":"Immediate Gratitude","duration":"48 hours","focus":"Personal thank you within 48 hours of gift—email, call, or handwritten note"},{"name":"Impact Reporting","duration":"30 days","focus":"Show exactly how the gift is being used with stories, data, and photos"},{"name":"Ongoing Engagement","duration":"6 months","focus":"Regular non-ask touchpoints: campus updates, event invitations, student spotlights"},{"name":"Anniversary Recognition","duration":"1 week","focus":"Celebrate the giving anniversary with personalized impact summary and renewal opportunity"}]}'::jsonb,
  '[{"title":"Immediate Thank You Email","channel":"email","focus":"Personal gratitude with gift receipt and impact preview"},{"title":"Impact Report","channel":"email","focus":"Detailed report showing how the gift was used with student stories and data"},{"title":"Student Thank You Video","channel":"email","focus":"Short video from a scholarship recipient or program beneficiary"},{"title":"Campus Update Newsletter","channel":"email","focus":"Non-ask engagement touchpoint with institutional news and stories"},{"title":"Giving Anniversary Card","channel":"letter","focus":"Personalized card celebrating their giving anniversary with cumulative impact"},{"title":"Stewardship Landing Page","channel":"landing","focus":"Personalized web page showing donor impact, stories, and giving history"}]'::jsonb,
  ARRAY[
    'Thank donors within 48 hours—speed of acknowledgment correlates with retention',
    'First-time donor retention averages 23%; a strong stewardship sequence can push it above 40%',
    'Include at least 4 non-ask touchpoints for every 1 ask touchpoint',
    'Use the donor''s name and specific gift details in every stewardship communication',
    'Annual impact reports should include both quantitative data and qualitative stories'
  ],
  'Informed by Penelope Burk''s "Donor-Centered Fundraising" research and Bloomerang donor retention studies.',
  true
);
