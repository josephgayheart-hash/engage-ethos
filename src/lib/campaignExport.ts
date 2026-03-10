import { format, parseISO, addDays } from "date-fns";

interface ExportTouchpoint {
  tMinusDays: number;
  label: string;
  channel: string;
  segment: string;
  messageType: string;
  tone: string;
  status: string;
  generatedContent?: string;
}

interface ExportCampaign {
  name: string;
  giving_day_date: string;
  goal_amount?: string | null;
  status: string;
  target_segments: string[];
  touchpoints: ExportTouchpoint[];
  notes?: string | null;
}

const PHASE_MAP: Record<string, string> = {
  "-30": "Cultivation", "-21": "Cultivation",
  "-14": "Solicitation", "-7": "Solicitation",
  "-3": "Urgency", "-1": "Urgency",
  "0": "Giving Day",
  "1": "Stewardship", "3": "Stewardship", "7": "Stewardship",
};

const CHANNEL_LABELS: Record<string, string> = {
  email: "Email",
  sms: "SMS",
  "social-media": "Social Media",
  "phone-call": "Phone Call",
  "landing-page": "Landing Page",
};

const SEGMENT_LABELS: Record<string, string> = {
  "all-donors": "All Donors",
  "first-time": "First-Time Donors",
  lapsed: "Lapsed Donors",
  recurring: "Recurring Donors",
  "major-gift": "Major Gift Prospects",
  alumni: "Alumni",
  parents: "Parents & Families",
  "faculty-staff": "Faculty & Staff",
};

export function campaignToText(
  campaign: ExportCampaign,
  profileName?: string,
): string {
  const givingDay = parseISO(campaign.giving_day_date);
  const lines: string[] = [];

  lines.push(campaign.name.toUpperCase());
  lines.push("=".repeat(campaign.name.length));
  lines.push("");

  lines.push(`Giving Day:  ${format(givingDay, "EEEE, MMMM d, yyyy")}`);
  if (profileName) lines.push(`Profile:     ${profileName}`);
  if (campaign.goal_amount) lines.push(`Goal:        $${campaign.goal_amount.replace(/^\$/, "")}`);
  lines.push(`Status:      ${campaign.status}`);
  if (campaign.target_segments?.length) {
    lines.push(`Segments:    ${campaign.target_segments.map(s => SEGMENT_LABELS[s] || s).join(", ")}`);
  }
  lines.push("");
  lines.push("-".repeat(60));
  lines.push("");

  // Group touchpoints by phase
  const phases = ["Cultivation", "Solicitation", "Urgency", "Giving Day", "Stewardship"];
  for (const phase of phases) {
    const phaseTps = campaign.touchpoints
      .filter(tp => (PHASE_MAP[String(tp.tMinusDays)] || "Other") === phase)
      .sort((a, b) => a.tMinusDays - b.tMinusDays);

    if (phaseTps.length === 0) continue;

    lines.push(`## ${phase.toUpperCase()}`);
    lines.push("");

    for (const tp of phaseTps) {
      const sendDate = addDays(givingDay, tp.tMinusDays);
      const tLabel = tp.tMinusDays === 0 ? "DAY OF" : tp.tMinusDays > 0 ? `T+${tp.tMinusDays}` : `T${tp.tMinusDays}`;
      const statusIcon = tp.status === "approved" ? "✅" : tp.status === "drafted" ? "📝" : tp.status === "sent" ? "📤" : "⬜";

      lines.push(`${statusIcon}  ${tLabel} — ${format(sendDate, "MMM d")} — ${tp.label}`);
      lines.push(`    Channel: ${CHANNEL_LABELS[tp.channel] || tp.channel}  |  Segment: ${SEGMENT_LABELS[tp.segment] || tp.segment}  |  Type: ${tp.messageType}`);

      if (tp.generatedContent) {
        lines.push("");
        // Indent generated content
        const contentLines = tp.generatedContent.split("\n").map(l => `    ${l}`);
        lines.push(...contentLines);
      }
      lines.push("");
    }
  }

  if (campaign.notes) {
    lines.push("-".repeat(60));
    lines.push("NOTES");
    lines.push(campaign.notes);
  }

  lines.push("");
  lines.push(`Exported from CampusVoice.AI on ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}`);

  return lines.join("\n");
}
