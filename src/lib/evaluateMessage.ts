import type { MessageContext, EvaluationResult, PillarEvaluation, Rating } from "@/types/persist";

// Mock evaluation function - in production, this would call an AI service
export function evaluateMessage(
  content: string, 
  context: MessageContext
): EvaluationResult {
  const wordCount = content.split(/\s+/).length;
  const hasAuthorityMarkers = /professor|dean|advisor|office|department|university/i.test(content);
  const hasConsensusMarkers = /students|peers|others|community|together/i.test(content);
  const hasMultipleActions = (content.match(/click|visit|call|email|schedule|sign up|register|submit/gi) || []).length > 1;
  const hasUrgency = /urgent|immediately|deadline|last chance|act now/i.test(content);
  const hasQuestion = /\?/.test(content);

  const getAuthorityRating = (): Rating => {
    if (hasAuthorityMarkers && context.moment !== 'recruitment') return 'Strong';
    if (hasAuthorityMarkers) return 'Moderate';
    return 'Needs Attention';
  };

  const getSusceptibilityRating = (): Rating => {
    if (context.audience === 'at-risk' && hasUrgency) return 'Needs Attention';
    if (context.audience === 'first-year' && wordCount < 100) return 'Strong';
    return 'Moderate';
  };

  const getCognitiveRating = (): Rating => {
    if (wordCount > 200 || hasMultipleActions) return 'Needs Attention';
    if (wordCount < 80 && !hasMultipleActions) return 'Strong';
    return 'Moderate';
  };

  const getConsensusRating = (): Rating => {
    if (!hasConsensusMarkers) return 'Moderate';
    if (context.audience === 'at-risk') return 'Needs Attention';
    return 'Moderate';
  };

  const getEthicsRating = (): Rating => {
    if (hasUrgency && context.audience === 'at-risk') return 'Needs Attention';
    if (hasQuestion && !hasUrgency) return 'Strong';
    return 'Moderate';
  };

  const pillars: PillarEvaluation[] = [
    {
      pillar: "Authority Alignment",
      pillarKey: "authority",
      rating: getAuthorityRating(),
      explanation: hasAuthorityMarkers 
        ? "The message establishes an authoritative source, which research shows significantly increases students' intentions to engage in positive academic behaviors (Gayheart, 2021)."
        : "The message lacks a clear authoritative source. Research indicates that explicit authority cues are particularly effective in higher education contexts.",
      recommendation: hasAuthorityMarkers
        ? "Consider whether the authority source is optimally positioned. Leading with institutional authority can strengthen message efficacy."
        : "Add a clear sender identity from an authoritative source (e.g., academic advisor, department, dean's office) to increase message credibility and response rates."
    },
    {
      pillar: "Audience Susceptibility Context",
      pillarKey: "susceptibility",
      rating: getSusceptibilityRating(),
      explanation: context.audience === 'at-risk'
        ? "At-risk students often face higher cognitive and emotional loads. Messages should account for potentially lower motivation and reduced processing capacity."
        : "The message context suggests a general audience with typical responsiveness to persuasive cues. Consider whether assumptions about student motivation are appropriate.",
      recommendation: context.audience === 'at-risk'
        ? "Reduce assumed motivation and provide clearer, more supportive framing. Avoid language that may induce anxiety or shame."
        : "Ensure the message doesn't assume too much prior knowledge or motivation. Match complexity to the audience's likely processing state."
    },
    {
      pillar: "Cognitive Load & Message Friction",
      pillarKey: "cognitive",
      rating: getCognitiveRating(),
      explanation: hasMultipleActions
        ? "Multiple calls to action increase cognitive load and may reduce completion rates. The Elaboration Likelihood Model suggests clearer paths increase peripheral processing effectiveness."
        : `The message is ${wordCount} words, which is ${wordCount > 150 ? 'relatively lengthy and may cause cognitive fatigue' : 'appropriate for maintaining attention'}. Clear next steps support action completion.`,
      recommendation: hasMultipleActions
        ? "Consolidate to a single primary call to action. Additional options can be presented as secondary, clearly subordinate choices."
        : wordCount > 150
          ? "Consider shortening the message or breaking it into scannable sections. Use headers or bullet points for key information."
          : "Maintain this level of clarity. Ensure the primary action is visually distinct and easy to complete."
    },
    {
      pillar: "Consensus Use",
      pillarKey: "consensus",
      rating: getConsensusRating(),
      explanation: hasConsensusMarkers
        ? "Social proof elements are present. However, research shows consensus cues have limited or context-dependent effects in higher education settings (Gayheart, 2021)."
        : "No explicit social proof or peer comparison is used. This may be appropriate as consensus cues show inconsistent effects in academic contexts.",
      recommendation: hasConsensusMarkers
        ? "Evaluate whether consensus cues meaningfully support your goal. Consider reducing reliance on social proof in favor of authority-based framing."
        : "Social proof is not essential for effective academic communication. If used, ensure it's specific, credible, and relevant to the target audience."
    },
    {
      pillar: "Ethical Persuasion & Autonomy",
      pillarKey: "ethics",
      rating: getEthicsRating(),
      explanation: hasUrgency
        ? "Urgency language may create pressure that undermines student autonomy. Ethical persuasion preserves choice while providing compelling reasons to act."
        : "The message appears to preserve student choice and avoids coercive elements. This aligns with O'Keefe's framework for ethical persuasion.",
      recommendation: hasUrgency
        ? "Replace urgency cues with supportive framing that emphasizes benefits and provides clear but non-coercive timelines."
        : "Continue prioritizing student autonomy. Ensure any deadlines are presented as helpful information rather than threats."
    }
  ];

  const refinedMessage = generateRefinedMessage(content, context, pillars);
  const reducedLoadMessage = generateReducedLoadMessage(content, context);

  return {
    pillars,
    refinedMessage,
    reducedLoadMessage,
    changeExplanation: "The refined version strengthens authority cues by clarifying the sender's role and expertise. Cognitive load is reduced through shorter sentences and a single clear call to action. Urgency language is replaced with supportive framing that preserves student autonomy."
  };
}

function generateRefinedMessage(
  content: string, 
  context: MessageContext,
  _pillars: PillarEvaluation[]
): string {
  // This is a simplified mock - in production, this would use AI
  const authorityPrefix = context.moment === 'mid-term-warning'
    ? "From Your Academic Advisor:\n\n"
    : context.moment === 'support'
    ? "From the Office of Student Success:\n\n"
    : "From the Office of the Dean:\n\n";

  const cleanedContent = content
    .replace(/urgent|immediately|last chance|act now/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return authorityPrefix + cleanedContent;
}

function generateReducedLoadMessage(
  content: string,
  context: MessageContext
): string {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const keyPoints = sentences.slice(0, 3).join('. ') + '.';
  
  const ctaMap: Record<typeof context.moment, string> = {
    'recruitment': '\n\nReady to learn more? Click here to schedule a visit.',
    'early-term': '\n\nNeed support? Reply to this message to connect with an advisor.',
    'mid-term-warning': '\n\nOne step to get back on track: Schedule a 15-minute check-in.',
    'support': '\n\nWe are here to help. Click here to access support resources.',
    're-engagement': '\n\nWe would love to hear from you. Reply to share what would help most.'
  };

  return keyPoints + ctaMap[context.moment];
}
