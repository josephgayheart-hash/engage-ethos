import jsPDF from "jspdf";
import type { TalkingPointsDraft, CaseForCareDraft } from "@/types/uplaybook";

export interface BrandingOptions {
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
}

// Helper to convert hex to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [31, 42, 68]; // Default dark blue
}

// Helper to create a lighter tint of a color
function lightenColor(rgb: [number, number, number], factor: number = 0.9): [number, number, number] {
  return [
    Math.min(255, Math.round(rgb[0] + (255 - rgb[0]) * factor)),
    Math.min(255, Math.round(rgb[1] + (255 - rgb[1]) * factor)),
    Math.min(255, Math.round(rgb[2] + (255 - rgb[2]) * factor)),
  ];
}

async function loadImageAsDataUrl(url: string): Promise<{ dataUrl: string; format: "PNG" | "JPEG" }> {
  const res = await fetch(url, { mode: "cors" });
  if (!res.ok) throw new Error(`Failed to fetch logo (HTTP ${res.status})`);

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  const blob = await res.blob();

  const format: "PNG" | "JPEG" = contentType.includes("png")
    ? "PNG"
    : contentType.includes("jpeg") || contentType.includes("jpg")
      ? "JPEG"
      : url.toLowerCase().endsWith(".png")
        ? "PNG"
        : "JPEG";

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read logo data"));
    reader.readAsDataURL(blob);
  });

  return { dataUrl, format };
}
export function exportTalkingPointsToPDF(
  tp: TalkingPointsDraft, 
  institutionName?: string,
  branding?: BrandingOptions
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  // Extract branding colors or use defaults
  const primaryRgb = hexToRgb(branding?.primaryColor || '#0D9488'); // Teal
  const accentRgb = hexToRgb(branding?.accentColor || '#14B8A6');
  const primaryLight = lightenColor(primaryRgb, 0.9);

  const addText = (text: string, size: number, style: "normal" | "bold" | "italic" = "normal", color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth);
    
    // Check if we need a new page
    const lineHeight = size * 0.5;
    if (y + lines.length * lineHeight > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    
    doc.text(lines, margin, y);
    y += lines.length * lineHeight + 4;
  };

  const addSection = (title: string, sectionColor?: [number, number, number]) => {
    const color = sectionColor || primaryRgb;
    y += 6;
    doc.setFillColor(...color);
    doc.rect(margin, y - 5, contentWidth, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title.toUpperCase(), margin + 4, y + 2);
    y += 12;
    doc.setTextColor(0, 0, 0);
  };

  // Header with branding color
  doc.setFillColor(...primaryRgb);
  doc.rect(0, 0, pageWidth, 35, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("EXECUTIVE TALKING POINTS", margin, 22);
  if (institutionName) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(institutionName, margin, 30);
  }
  y = 45;

  // Context and Audience
  if (tp.context || tp.audience) {
    doc.setFillColor(...primaryLight);
    doc.rect(margin, y - 5, contentWidth, tp.context && tp.audience ? 30 : 18, "F");
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    
    if (tp.context) {
      doc.setFont("helvetica", "bold");
      doc.text("CONTEXT:", margin + 4, y + 2);
      doc.setFont("helvetica", "normal");
      const contextLines = doc.splitTextToSize(tp.context, contentWidth - 60);
      doc.text(contextLines, margin + 30, y + 2);
    }
    
    if (tp.audience) {
      const audienceY = tp.context ? y + 12 : y + 2;
      doc.setFont("helvetica", "bold");
      doc.text("AUDIENCE:", margin + 4, audienceY);
      doc.setFont("helvetica", "normal");
      const audienceLines = doc.splitTextToSize(tp.audience, contentWidth - 60);
      doc.text(audienceLines, margin + 34, audienceY);
    }
    
    y += tp.context && tp.audience ? 35 : 23;
  }

  // Opening Hook
  if (tp.openingHook) {
    addSection("Opening Hook", [34, 139, 34]);
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    addText(`"${tp.openingHook}"`, 11, "italic");
  }

  // Key Messages
  if (tp.keyMessages && tp.keyMessages.length > 0) {
    addSection("Key Talking Points", accentRgb);
    tp.keyMessages.forEach((message, i) => {
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(`${i + 1}.`, margin, y);
      doc.setFont("helvetica", "normal");
      const messageLines = doc.splitTextToSize(message, contentWidth - 10);
      
      if (y + messageLines.length * 5 > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      
      doc.text(messageLines, margin + 10, y);
      y += messageLines.length * 5 + 6;
    });
  }

  // Supporting Data
  if (tp.supportingData && tp.supportingData.length > 0) {
    addSection("Supporting Data & Evidence", [30, 100, 180]);
    tp.supportingData.forEach((data) => {
      doc.setFontSize(10);
      addText(`📊 ${data}`, 10);
    });
  }

  // Q&A
  if (tp.anticipatedQuestions && tp.anticipatedQuestions.length > 0) {
    addSection("Anticipated Q&A", [180, 120, 0]);
    tp.anticipatedQuestions.forEach((question, i) => {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(180, 120, 0);
      addText(`Q: ${question}`, 10, "bold", [150, 100, 0]);
      
      if (tp.suggestedResponses && tp.suggestedResponses[i]) {
        doc.setTextColor(34, 139, 34);
        addText(`A: ${tp.suggestedResponses[i]}`, 10, "normal", [34, 120, 34]);
      }
      y += 2;
    });
  }

  // Transition Phrases
  if (tp.transitionPhrases && tp.transitionPhrases.length > 0) {
    addSection("Transition Phrases", [100, 100, 100]);
    tp.transitionPhrases.forEach((phrase) => {
      addText(`→ "${phrase}"`, 10, "italic");
    });
  }

  // Closing Statement
  if (tp.closingStatement) {
    addSection("Closing Statement", [128, 0, 128]);
    doc.setFontSize(11);
    addText(`"${tp.closingStatement}"`, 11, "italic");
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer bar with primary color
    doc.setFillColor(...primaryRgb);
    doc.rect(0, pageHeight - 15, pageWidth, 15, "F");
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${institutionName || 'CampusVoice.AI'} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    );
  }

  doc.save("executive-talking-points.pdf");
}

export function exportCaseForSupportToPDF(
  cfc: CaseForCareDraft, 
  institutionName?: string,
  branding?: BrandingOptions
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25; // Increased margin for better readability
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  // Extract branding colors
  const primaryRgb = hexToRgb(branding?.primaryColor || '#1F2A44');
  const accentRgb = hexToRgb(branding?.accentColor || '#2C7A7B');
  const primaryLight = lightenColor(primaryRgb, 0.92);
  const accentLight = lightenColor(accentRgb, 0.92);

  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 30) {
      doc.addPage();
      y = 30;
    }
  };

  const addText = (
    text: string, 
    size: number, 
    style: "normal" | "bold" | "italic" = "normal", 
    color: [number, number, number] = [40, 40, 40]
  ) => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, contentWidth - 5);
    checkPageBreak(lines.length * size * 0.5);
    doc.text(lines, margin, y);
    y += lines.length * size * 0.5 + 4;
  };

  // Cover Page Header with Primary Color
  doc.setFillColor(...primaryRgb);
  doc.rect(0, 0, pageWidth, 70, "F");

  // Add logo if available
  let logoLoaded = false;
  if (branding?.logoUrl) {
    try {
      // Note: Logo loading is async, but jsPDF addImage needs sync data
      // For now, we'll skip logo - would need to pre-load as base64
    } catch (e) {
      console.error("Failed to load logo:", e);
    }
  }

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  const title = cfc.documentTitle || "CASE FOR SUPPORT";
  doc.text(title.toUpperCase(), margin, 35);

  // Campaign name and tagline
  if (cfc.campaignName) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(cfc.campaignName, margin, 48);
  }

  if (cfc.campaignTagline) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    doc.text(`"${cfc.campaignTagline}"`, margin, 60);
  }

  // Institution name on the right
  if (institutionName) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(institutionName, pageWidth - margin, 35, { align: "right" });
  }

  y = 85;

  // Target Amount with accent color
  if (cfc.targetAmount) {
    doc.setFillColor(...accentLight);
    doc.roundedRect(margin, y - 8, contentWidth, 28, 3, 3, "F");
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y - 8, contentWidth, 28, 3, 3, "S");
    
    doc.setTextColor(...accentRgb);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(cfc.targetAmount, pageWidth / 2, y + 6, { align: "center" });
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Campaign Goal", pageWidth / 2, y + 15, { align: "center" });
    y += 38;
  }

  // Leader Message
  if (cfc.leaderMessage) {
    checkPageBreak(55);
    doc.setFillColor(...primaryLight);
    doc.roundedRect(margin, y - 5, contentWidth, 45, 3, 3, "F");
    doc.setDrawColor(...primaryRgb);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y - 5, contentWidth, 45, 3, 3, "S");
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const messageText = cfc.leaderMessage.message || "";
    const truncatedMessage = messageText.length > 280 ? messageText.substring(0, 280) + "..." : messageText;
    const messageLines = doc.splitTextToSize(truncatedMessage, contentWidth - 15);
    doc.text(messageLines, margin + 8, y + 5);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryRgb);
    doc.text(`— ${cfc.leaderMessage.leaderName}, ${cfc.leaderMessage.leaderTitle}`, margin + 8, y + 37);
    y += 55;
  }

  // Opening Story
  if (cfc.openingStory) {
    checkPageBreak(50);
    doc.setFillColor(...accentLight);
    doc.roundedRect(margin, y - 5, contentWidth, 42, 3, 3, "F");
    
    doc.setTextColor(...accentRgb);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(cfc.openingStory.headline || "A Story of Impact", margin + 8, y + 5);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(60, 60, 60);
    const narrativeText = cfc.openingStory.narrative || "";
    const truncatedNarrative = narrativeText.length > 180 ? narrativeText.substring(0, 180) + "..." : narrativeText;
    const narrativeLines = doc.splitTextToSize(truncatedNarrative, contentWidth - 15);
    doc.text(narrativeLines, margin + 8, y + 15);
    
    if (cfc.openingStory.attribution) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...accentRgb);
      doc.text(`— ${cfc.openingStory.attribution}`, margin + 8, y + 35);
    }
    y += 52;
  }

  // Vision Statement
  if (cfc.visionStatement) {
    checkPageBreak(30);
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("OUR VISION", margin, y);
    y += 8;
    addText(cfc.visionStatement, 10, "normal", [60, 60, 60]);
    y += 5;
  }

  // Strategic Pillars
  if (cfc.strategicPillars && cfc.strategicPillars.length > 0) {
    checkPageBreak(50);
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("STRATEGIC PILLARS", margin, y);
    y += 10;

    cfc.strategicPillars.forEach((pillar) => {
      checkPageBreak(22);
      doc.setFillColor(...primaryLight);
      doc.roundedRect(margin, y - 3, contentWidth, 18, 2, 2, "F");
      
      doc.setTextColor(...primaryRgb);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(pillar.name, margin + 5, y + 4);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      const descLines = doc.splitTextToSize(pillar.description, contentWidth - 15);
      doc.text(descLines[0], margin + 5, y + 12);
      y += 24;
    });
  }

  // Impact Statistics
  if (cfc.impactStatistics && cfc.impactStatistics.length > 0) {
    checkPageBreak(45);
    y += 5;
    doc.setTextColor(...accentRgb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("IMPACT BY THE NUMBERS", margin, y);
    y += 12;

    const statWidth = (contentWidth - 10) / 3;
    let col = 0;
    let rowY = y;

    cfc.impactStatistics.forEach((stat) => {
      if (col === 3) {
        col = 0;
        rowY += 32;
        checkPageBreak(32);
      }

      const x = margin + col * (statWidth + 5);
      doc.setFillColor(...accentRgb);
      doc.roundedRect(x, rowY - 3, statWidth, 26, 2, 2, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      const statValue = typeof stat === "object" ? stat.value : stat;
      const statLabel = typeof stat === "object" ? stat.label : "";
      doc.text(statValue, x + statWidth / 2, y + 8, { align: "center" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      const labelLines = doc.splitTextToSize(statLabel, statWidth - 6);
      doc.text(labelLines[0] || "", x + statWidth / 2, y + 17, { align: "center" });

      col++;
    });
    y = rowY + 38;
  }

  // Key Programs
  if (cfc.keyPrograms && cfc.keyPrograms.length > 0) {
    checkPageBreak(40);
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("KEY PROGRAMS", margin, y);
    y += 10;

    cfc.keyPrograms.forEach((program) => {
      checkPageBreak(25);
      doc.setTextColor(...primaryRgb);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`• ${program.name}`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const descLines = doc.splitTextToSize(`${program.description} (Impact: ${program.impact})`, contentWidth - 12);
      doc.text(descLines, margin + 8, y + 6);
      y += 10 + descLines.length * 4;
    });
  }

  // Pull Quotes
  if (cfc.pullQuotes && cfc.pullQuotes.length > 0) {
    checkPageBreak(30);
    y += 5;
    cfc.pullQuotes.forEach((quote) => {
      checkPageBreak(28);
      doc.setFillColor(...accentLight);
      doc.roundedRect(margin, y - 3, contentWidth, 22, 2, 2, "F");
      doc.setDrawColor(...accentRgb);
      doc.setLineWidth(2);
      doc.line(margin + 3, y, margin + 3, y + 16);

      doc.setTextColor(...accentRgb);
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      const quoteLines = doc.splitTextToSize(`"${quote.quote}"`, contentWidth - 20);
      doc.text(quoteLines[0], margin + 10, y + 5);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`— ${quote.attribution}`, margin + 10, y + 15);
      y += 28;
    });
  }

  // Giving Opportunities
  if (cfc.givingOpportunities && cfc.givingOpportunities.length > 0) {
    checkPageBreak(50);
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("GIVING OPPORTUNITIES", margin, y);
    y += 10;

    cfc.givingOpportunities.forEach((category) => {
      checkPageBreak(30);
      doc.setTextColor(...accentRgb);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(category.category, margin, y);
      y += 6;

      category.opportunities.forEach((opp) => {
        checkPageBreak(16);
        doc.setTextColor(...primaryRgb);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text(`${opp.name} - ${opp.amount}`, margin + 5, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        const descLines = doc.splitTextToSize(opp.description, contentWidth - 15);
        doc.text(descLines[0], margin + 5, y + 5);
        y += 14;
      });
      y += 4;
    });
  }

  // Giving Levels
  if (cfc.givingLevels && cfc.givingLevels.length > 0) {
    checkPageBreak(40);
    doc.setTextColor(...accentRgb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("WAYS TO GIVE", margin, y);
    y += 10;

    cfc.givingLevels.forEach((level) => {
      checkPageBreak(14);
      doc.setFillColor(...accentLight);
      doc.roundedRect(margin, y - 3, contentWidth, 12, 2, 2, "F");
      doc.setTextColor(...accentRgb);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(level.amount, margin + 5, y + 5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.text(level.impact, margin + 45, y + 5);
      y += 16;
    });
  }

  // Call to Action
  if (cfc.callToAction) {
    checkPageBreak(32);
    y += 5;
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(margin, y - 5, contentWidth, 22, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const ctaLines = doc.splitTextToSize(cfc.callToAction, contentWidth - 20);
    doc.text(ctaLines, pageWidth / 2, y + 6, { align: "center" });
    y += 28;
  }

  // Contact Info
  if (cfc.contactInfo) {
    checkPageBreak(28);
    doc.setFillColor(...primaryLight);
    doc.roundedRect(margin, y - 3, contentWidth, 22, 2, 2, "F");
    doc.setTextColor(...primaryRgb);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("FOR MORE INFORMATION:", margin + 5, y + 4);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    const contactText = `${cfc.contactInfo.name}, ${cfc.contactInfo.title} | ${cfc.contactInfo.email}${cfc.contactInfo.phone ? ` | ${cfc.contactInfo.phone}` : ""}`;
    const contactLines = doc.splitTextToSize(contactText, contentWidth - 15);
    doc.text(contactLines[0], margin + 5, y + 13);
    y += 28;
  }

  // Closing Statement
  if (cfc.closingStatement) {
    checkPageBreak(22);
    doc.setTextColor(...accentRgb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    const closingLines = doc.splitTextToSize(cfc.closingStatement, contentWidth);
    doc.text(closingLines, pageWidth / 2, y + 5, { align: "center" });
  }

  // Footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Footer bar with primary color
    doc.setFillColor(...primaryRgb);
    doc.rect(0, pageHeight - 18, pageWidth, 18, "F");
    
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(
      `${institutionName || 'CampusVoice.AI'} | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );
  }

  doc.save("case-for-support.pdf");
}
