import jsPDF from "jspdf";
import type { TalkingPointsDraft, CaseForCareDraft } from "@/types/campusvoice";

export interface BrandingOptions {
  primaryColor?: string;
  accentColor?: string;
  tertiaryColor?: string;
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
export async function exportTalkingPointsToPDF(
  draft: TalkingPointsDraft,
  institutionName?: string,
  branding?: BrandingOptions
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  const headerHeight = 70;
  const footerHeight = 25;

  // Brand colors with defaults
  const primaryColor = branding?.primaryColor || '#0D9488';
  const accentColor = branding?.accentColor || '#2DD4BF';
  const tertiaryColor = branding?.tertiaryColor || '#E2E8F0';
  
  const primaryRgb = hexToRgb(primaryColor);
  const accentRgb = hexToRgb(accentColor);
  const tertiaryRgb = hexToRgb(tertiaryColor);
  const lightPrimaryRgb = lightenColor(primaryRgb, 0.85);
  const lightAccentRgb = lightenColor(accentRgb, 0.85);
  const lightTertiaryRgb = lightenColor(tertiaryRgb, 0.5);

  // Load logo if provided
  let logoData: { dataUrl: string; format: 'PNG' | 'JPEG' } | null = null;
  if (branding?.logoUrl) {
    try {
      logoData = await loadImageAsDataUrl(branding.logoUrl);
    } catch (error) {
      console.warn('Failed to load logo for PDF:', error);
    }
  }

  let currentY = margin;
  let pageNumber = 1;

  const addHeader = () => {
    // Header background
    doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.rect(0, 0, pageWidth, headerHeight, 'F');
    
    // Accent strip at bottom of header
    doc.setFillColor(accentRgb[0], accentRgb[1], accentRgb[2]);
    doc.rect(0, headerHeight - 4, pageWidth, 4, 'F');

    let textStartX = margin;

    // Add logo if available
    if (logoData) {
      try {
        const logoSize = 28;
        const logoX = margin;
        const logoY = (headerHeight - logoSize) / 2;
        
        // White background circle for logo
        doc.setFillColor(255, 255, 255);
        doc.circle(logoX + logoSize / 2, logoY + logoSize / 2, logoSize / 2 + 2, 'F');
        
        doc.addImage(logoData.dataUrl, logoData.format, logoX, logoY, logoSize, logoSize);
        textStartX = margin + logoSize + 12;
      } catch (error) {
        console.warn('Failed to add logo to PDF:', error);
      }
    }

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    
    const title = 'EXECUTIVE TALKING POINTS';
    const maxTitleWidth = pageWidth - textStartX - margin - 10;
    let titleFontSize = 22;
    doc.setFontSize(titleFontSize);
    
    while (doc.getTextWidth(title) > maxTitleWidth && titleFontSize > 14) {
      titleFontSize -= 1;
      doc.setFontSize(titleFontSize);
    }
    
    doc.text(title, textStartX, 28);

    // Institution name
    if (institutionName) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text(institutionName, textStartX, 40);
    }

    // Topic/context badge
    if (draft.context) {
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      const contextText = `Topic: ${draft.context}`;
      doc.text(contextText, textStartX, 52);
    }

    // Date on the right
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const dateWidth = doc.getTextWidth(dateStr);
    doc.text(dateStr, pageWidth - margin - dateWidth, 28);
  };

  const addFooter = () => {
    const footerY = pageHeight - footerHeight;
    
    // Footer background
    doc.setFillColor(tertiaryRgb[0], tertiaryRgb[1], tertiaryRgb[2]);
    doc.rect(0, footerY, pageWidth, footerHeight, 'F');
    
    // Accent line at top of footer
    doc.setFillColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.rect(0, footerY, pageWidth, 2, 'F');

    // Footer text
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    const footerText = institutionName ? `${institutionName} | Executive Talking Points` : 'Executive Talking Points';
    doc.text(footerText, margin, footerY + 14);

    // Page number
    const pageText = `Page ${pageNumber}`;
    const pageTextWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - margin - pageTextWidth, footerY + 14);
  };

  const checkPageBreak = (requiredHeight: number) => {
    const maxY = pageHeight - footerHeight - 15;
    if (currentY + requiredHeight > maxY) {
      addFooter();
      doc.addPage();
      pageNumber++;
      addHeader();
      currentY = headerHeight + 15;
    }
  };

  const drawSectionBox = (
    title: string,
    content: string | string[],
    iconColor: [number, number, number],
    bgColor: [number, number, number]
  ) => {
    const titleHeight = 10;
    const contentLines = Array.isArray(content) ? content : [content];
    
    // Calculate content height
    doc.setFontSize(10);
    let totalContentHeight = 0;
    contentLines.forEach(line => {
      const wrappedLines = doc.splitTextToSize(line, contentWidth - 20);
      totalContentHeight += wrappedLines.length * 5 + 3;
    });
    
    const boxHeight = titleHeight + totalContentHeight + 12;
    checkPageBreak(boxHeight + 8);

    // Draw rounded box background
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 3, 3, 'F');
    
    // Left accent bar
    doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
    doc.roundedRect(margin, currentY, 4, boxHeight, 2, 2, 'F');

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(iconColor[0], iconColor[1], iconColor[2]);
    doc.text(title.toUpperCase(), margin + 12, currentY + 8);

    // Content
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    
    let contentY = currentY + titleHeight + 8;
    contentLines.forEach(line => {
      const wrappedLines = doc.splitTextToSize(line, contentWidth - 20);
      wrappedLines.forEach((wrappedLine: string) => {
        doc.text(wrappedLine, margin + 12, contentY);
        contentY += 5;
      });
      contentY += 2;
    });

    currentY += boxHeight + 8;
  };

  const drawBulletList = (
    title: string,
    items: string[],
    iconColor: [number, number, number],
    bgColor: [number, number, number]
  ) => {
    const titleHeight = 10;
    
    // Calculate content height
    doc.setFontSize(10);
    let totalContentHeight = 0;
    items.forEach(item => {
      const wrappedLines = doc.splitTextToSize(`• ${item}`, contentWidth - 24);
      totalContentHeight += wrappedLines.length * 5 + 2;
    });
    
    const boxHeight = titleHeight + totalContentHeight + 12;
    checkPageBreak(boxHeight + 8);

    // Draw rounded box background
    doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 3, 3, 'F');
    
    // Left accent bar
    doc.setFillColor(iconColor[0], iconColor[1], iconColor[2]);
    doc.roundedRect(margin, currentY, 4, boxHeight, 2, 2, 'F');

    // Section title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(iconColor[0], iconColor[1], iconColor[2]);
    doc.text(title.toUpperCase(), margin + 12, currentY + 8);

    // Bullet items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    
    let contentY = currentY + titleHeight + 8;
    items.forEach(item => {
      const wrappedLines = doc.splitTextToSize(`• ${item}`, contentWidth - 24);
      wrappedLines.forEach((wrappedLine: string) => {
        doc.text(wrappedLine, margin + 12, contentY);
        contentY += 5;
      });
      contentY += 1;
    });

    currentY += boxHeight + 8;
  };

  // Add first page header
  addHeader();
  currentY = headerHeight + 15;

  // Audience info box
  if (draft.audience) {
    doc.setFillColor(lightTertiaryRgb[0], lightTertiaryRgb[1], lightTertiaryRgb[2]);
    doc.roundedRect(margin, currentY, contentWidth, 20, 3, 3, 'F');
    doc.setDrawColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, currentY, contentWidth, 20, 3, 3, 'S');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryRgb[0], primaryRgb[1], primaryRgb[2]);
    doc.text('TARGET AUDIENCE', margin + 8, currentY + 8);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(draft.audience, margin + 8, currentY + 15);
    
    currentY += 28;
  }

  // Opening Hook - Primary color
  if (draft.openingHook) {
    drawSectionBox(
      'Opening Hook',
      draft.openingHook,
      primaryRgb,
      lightPrimaryRgb
    );
  }

  // Key Talking Points - Accent color
  if (draft.keyMessages && draft.keyMessages.length > 0) {
    drawBulletList(
      'Key Talking Points',
      draft.keyMessages,
      accentRgb,
      lightAccentRgb
    );
  }

  // Supporting Data - Primary color variation
  if (draft.supportingData && draft.supportingData.length > 0) {
    const dataVariant: [number, number, number] = [
      Math.min(255, primaryRgb[0] + 40),
      Math.min(255, primaryRgb[1] + 20),
      primaryRgb[2]
    ];
    drawBulletList(
      'Supporting Data',
      draft.supportingData,
      dataVariant,
      lightenColor(dataVariant, 0.85)
    );
  }

  // Anticipated Q&A - Tertiary/accent mix
  if (draft.anticipatedQuestions && draft.anticipatedQuestions.length > 0) {
    const qaColor: [number, number, number] = [
      Math.floor((primaryRgb[0] + accentRgb[0]) / 2),
      Math.floor((primaryRgb[1] + accentRgb[1]) / 2),
      Math.floor((primaryRgb[2] + accentRgb[2]) / 2)
    ];
    drawBulletList(
      'Anticipated Q&A',
      draft.anticipatedQuestions,
      qaColor,
      lightenColor(qaColor, 0.85)
    );
  }

  // Transition Phrases - Muted primary
  if (draft.transitionPhrases && draft.transitionPhrases.length > 0) {
    const transitionColor: [number, number, number] = lightenColor(primaryRgb, 0.3);
    drawBulletList(
      'Transition Phrases',
      draft.transitionPhrases,
      transitionColor,
      lightenColor(transitionColor, 0.7)
    );
  }

  // Closing Statement - Accent color
  if (draft.closingStatement) {
    drawSectionBox(
      'Closing Statement',
      draft.closingStatement,
      accentRgb,
      lightAccentRgb
    );
  }

  // Add footer to last page
  addFooter();

  doc.save('executive-talking-points.pdf');
}

export async function exportCaseForSupportToPDF(
  cfc: CaseForCareDraft, 
  institutionName?: string,
  branding?: BrandingOptions
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25; // Increased margin for better readability
  const contentWidth = pageWidth - margin * 2;
  let y = 25;

  // Extract branding colors - strictly from institution profile, no platform defaults
  const primaryRgb = hexToRgb(branding?.primaryColor || '#1F2A44');
  const accentRgb = hexToRgb(branding?.accentColor || branding?.primaryColor || '#1F2A44');
  const primaryLight = lightenColor(primaryRgb, 0.92);
  const accentLight = lightenColor(accentRgb, 0.92);

  // Pre-load logo if available
  let logoData: { dataUrl: string; format: "PNG" | "JPEG" } | null = null;
  if (branding?.logoUrl) {
    try {
      logoData = await loadImageAsDataUrl(branding.logoUrl);
    } catch (e) {
      console.error("Failed to load logo for PDF:", e);
    }
  }

  const checkPageBreak = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - 30) {
      doc.addPage();
      y = 30;
    }
  };

  const addText = (
    text: string | undefined | null, 
    size: number, 
    style: "normal" | "bold" | "italic" = "normal", 
    color: [number, number, number] = [40, 40, 40]
  ) => {
    // Guard against undefined/null text
    const safeText = text || "";
    if (!safeText) return;
    
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(safeText, contentWidth - 5);
    if (!lines || lines.length === 0) return;
    checkPageBreak(lines.length * size * 0.5);
    doc.text(lines, margin, y);
    y += lines.length * size * 0.5 + 4;
  };

  // Cover Page Header with Primary Color
  doc.setFillColor(...primaryRgb);
  doc.rect(0, 0, pageWidth, 70, "F");

  // Add logo in top-left of header if available — preserve aspect ratio
  let textStartX = margin;
  
  if (logoData) {
    try {
      // Load image to get natural dimensions for aspect ratio
      const img = new Image();
      img.src = logoData.dataUrl;
      const naturalW = img.naturalWidth || 1;
      const naturalH = img.naturalHeight || 1;
      const aspect = naturalW / naturalH;
      
      const maxLogoH = 25;
      const maxLogoW = 50;
      const logoHeight = Math.min(maxLogoH, maxLogoW / aspect);
      const logoWidth = logoHeight * aspect;
      
      doc.addImage(logoData.dataUrl, logoData.format, margin, 10, logoWidth, logoHeight);
      textStartX = margin + logoWidth + 8;
    } catch (e) {
      console.error("Failed to add logo to PDF:", e);
    }
  }

  // Helper to dynamically reduce font size until text fits
  const fitTextToWidth = (
    text: string,
    maxWidth: number,
    startSize: number,
    minSize: number
  ): number => {
    let fontSize = startSize;
    doc.setFont("helvetica", "bold");
    while (fontSize > minSize) {
      doc.setFontSize(fontSize);
      const textWidth = doc.getTextWidth(text);
      if (textWidth <= maxWidth) break;
      fontSize -= 1;
    }
    return fontSize;
  };

  // Calculate available width for title (accounting for logo if present)
  const titleAvailableWidth = logoData 
    ? contentWidth - logoWidth - 18 
    : contentWidth - 10;

  // Title with dynamic font sizing - position after logo if present
  doc.setTextColor(255, 255, 255);
  const title = cfc.documentTitle || "CASE FOR SUPPORT";

  // Start at 24pt, reduce until it fits (minimum 14pt)
  const titleFontSize = fitTextToWidth(title.toUpperCase(), titleAvailableWidth, 24, 14);
  doc.setFontSize(titleFontSize);
  doc.setFont("helvetica", "bold");

  // Wrap if still too long after scaling
  const titleLines = doc.splitTextToSize(title.toUpperCase(), titleAvailableWidth);
  doc.text(titleLines, textStartX, 22);

  // Calculate where title ends
  const titleLineHeight = titleFontSize * 0.5;
  let headerY = 22 + (titleLines.length - 1) * titleLineHeight + 8;

  // Campaign name below title
  if (cfc.campaignName) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    const campaignLines = doc.splitTextToSize(cfc.campaignName, titleAvailableWidth);
    doc.text(campaignLines, textStartX, headerY);
    headerY += campaignLines.length * 6 + 4;
  }

  // Campaign tagline
  if (cfc.campaignTagline) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const taglineText = `"${cfc.campaignTagline}"`;
    const taglineLines = doc.splitTextToSize(taglineText, titleAvailableWidth);
    doc.text(taglineLines, textStartX, headerY);
    headerY += taglineLines.length * 5 + 2;
  }

  // Institution name BELOW tagline in left-aligned area (sub-unit/college name)
  if (institutionName) {
    doc.setTextColor(200, 200, 200);  // Lighter text for sub-unit
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const instLines = doc.splitTextToSize(institutionName, titleAvailableWidth);
    doc.text(instLines, textStartX, headerY);
  }

  y = 85;

  // Target Amount with accent color
  if (cfc.targetAmount) {
    // Calculate dynamic box height based on content
    const targetMaxWidth = contentWidth - 20;
    
    // Use fitTextToWidth for targetAmount to ensure it fits
    doc.setFont("helvetica", "bold");
    const targetFontSize = fitTextToWidth(cfc.targetAmount, targetMaxWidth, 22, 12);
    doc.setFontSize(targetFontSize);
    const targetLines = doc.splitTextToSize(cfc.targetAmount, targetMaxWidth);
    
    // Calculate dynamic box height based on lines
    const lineHeight = targetFontSize * 0.5;
    const boxHeight = Math.max(28, 14 + targetLines.length * lineHeight + 10);
    
    doc.setFillColor(...accentLight);
    doc.roundedRect(margin, y - 8, contentWidth, boxHeight, 3, 3, "F");
    doc.setDrawColor(...accentRgb);
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y - 8, contentWidth, boxHeight, 3, 3, "S");
    
    // Center the target amount text
    doc.setTextColor(...accentRgb);
    doc.setFontSize(targetFontSize);
    doc.setFont("helvetica", "bold");
    
    // Calculate Y position for centered text
    const textBlockHeight = targetLines.length * lineHeight;
    const startY = y - 8 + (boxHeight - textBlockHeight - 10) / 2 + lineHeight;
    
    targetLines.forEach((line: string, idx: number) => {
      doc.text(line, pageWidth / 2, startY + idx * lineHeight, { align: "center" });
    });
    
    // "Campaign Goal" label at bottom of box
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Campaign Goal", pageWidth / 2, y - 8 + boxHeight - 6, { align: "center" });
    
    y += boxHeight + 10;
  }

  // Leader Message - dynamic height
  if (cfc.leaderMessage) {
    const messageText = cfc.leaderMessage.message || "";
    const truncatedMessage = messageText.length > 400 ? messageText.substring(0, 400) + "..." : messageText;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    const messageLines = doc.splitTextToSize(truncatedMessage, contentWidth - 15);
    const lineH = 5;
    const boxHeight = Math.max(30, 14 + (messageLines?.length || 1) * lineH + 12);
    
    checkPageBreak(boxHeight + 5);
    doc.setFillColor(...primaryLight);
    doc.roundedRect(margin, y - 5, contentWidth, boxHeight, 3, 3, "F");
    doc.setDrawColor(...primaryRgb);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y - 5, contentWidth, boxHeight, 3, 3, "S");
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    if (messageLines && messageLines.length > 0) {
      messageLines.forEach((line: string, idx: number) => {
        if (line) doc.text(line, margin + 8, y + 5 + idx * lineH);
      });
    }
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryRgb);
    const leaderAttribution = `— ${cfc.leaderMessage.leaderName || "Leadership"}, ${cfc.leaderMessage.leaderTitle || ""}`.replace(/, $/, "");
    doc.text(leaderAttribution, margin + 8, y - 5 + boxHeight - 6);
    y += boxHeight + 5;
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
    if (narrativeLines && narrativeLines.length > 0) {
      doc.text(narrativeLines, margin + 8, y + 15);
    }
    
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
      doc.text(pillar.name || "Pillar", margin + 5, y + 4);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 60);
      doc.setFontSize(9);
      const descLines = doc.splitTextToSize(pillar.description || "", contentWidth - 15);
      if (descLines && descLines[0]) {
        doc.text(descLines[0], margin + 5, y + 12);
      }
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
      const statValue = (typeof stat === "object" ? stat.value : stat) || "";
      const statLabel = (typeof stat === "object" ? stat.label : "") || "";
      
      // Skip if no value
      if (!statValue) {
        col++;
        return;
      }
      
      // Truncate stat value if too wide
      const maxValueWidth = statWidth - 8;
      let displayValue = statValue;
      if (doc.getTextWidth(statValue) > maxValueWidth) {
        doc.setFontSize(11);
        if (doc.getTextWidth(statValue) > maxValueWidth) {
          displayValue = statValue.substring(0, 12) + "...";
        }
      }
      doc.text(displayValue, x + statWidth / 2, rowY + 8, { align: "center" });

      // Label with two-line support
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      const labelLines = doc.splitTextToSize(statLabel, statWidth - 6);
      doc.text(labelLines[0] || "", x + statWidth / 2, rowY + 15, { align: "center" });
      if (labelLines[1]) {
        doc.text(labelLines[1], x + statWidth / 2, rowY + 20, { align: "center" });
      }

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
      doc.text(`• ${program.name || "Program"}`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const programDesc = `${program.description || ""} (Impact: ${program.impact || "TBD"})`;
      const descLines = doc.splitTextToSize(programDesc, contentWidth - 12);
      if (descLines && descLines.length > 0) {
        doc.text(descLines, margin + 8, y + 6);
      }
      y += 10 + (descLines?.length || 1) * 4;
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
      const quoteText = quote.quote ? `"${quote.quote}"` : "";
      if (quoteText) {
        const quoteLines = doc.splitTextToSize(quoteText, contentWidth - 20);
        if (quoteLines && quoteLines[0]) {
          doc.text(quoteLines[0], margin + 10, y + 5);
        }
      }

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`— ${quote.attribution || "Anonymous"}`, margin + 10, y + 15);
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
      doc.text(category.category || "Category", margin, y);
      y += 6;

      category.opportunities.forEach((opp) => {
        checkPageBreak(16);
        doc.setTextColor(...primaryRgb);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        const oppLabel = `${opp.name || "Opportunity"} - ${opp.amount || "TBD"}`;
        doc.text(oppLabel, margin + 5, y);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(80, 80, 80);
        const descLines = doc.splitTextToSize(opp.description || "", contentWidth - 15);
        if (descLines && descLines[0]) {
          doc.text(descLines[0], margin + 5, y + 5);
        }
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
      // Calculate widths - use more space for long amount text
      const amountText = level.amount || "$0";
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      const amountTextWidth = doc.getTextWidth(amountText);
      const amountColWidth = Math.max(70, amountTextWidth + 10); // At least 70, or text width + padding
      const impactMaxWidth = contentWidth - amountColWidth - 10;

      // Wrap impact text
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const impactLines = doc.splitTextToSize(level.impact || "", impactMaxWidth);

      // Dynamic box height based on wrapped lines
      const lineHeight = 4.5;
      const boxHeight = Math.max(14, 8 + (impactLines?.length || 1) * lineHeight);

      checkPageBreak(boxHeight + 5);

      // Draw box with dynamic height
      doc.setFillColor(...accentLight);
      doc.roundedRect(margin, y - 3, contentWidth, boxHeight, 2, 2, "F");

      // Amount on left - use dark text for better contrast on light background
      doc.setTextColor(40, 40, 40); // Dark text instead of accent color
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(amountText, margin + 5, y + 6);

      // Wrapped impact text on right
      doc.setFont("helvetica", "normal");
      doc.setTextColor(40, 40, 40); // Dark text for readability
      doc.setFontSize(9);
      if (impactLines && impactLines.length > 0) {
        impactLines.forEach((line: string, idx: number) => {
          if (line) {
            doc.text(line, margin + amountColWidth, y + 6 + idx * lineHeight);
          }
        });
      }

      y += boxHeight + 5;
    });
  }

  // Call to Action - dynamic height based on content
  if (cfc.callToAction) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    const ctaLines = doc.splitTextToSize(cfc.callToAction || "", contentWidth - 20);
    const ctaLineHeight = 5.5;
    const ctaBoxHeight = Math.max(24, 12 + (ctaLines?.length || 1) * ctaLineHeight);
    
    checkPageBreak(ctaBoxHeight + 8);
    y += 5;
    doc.setFillColor(...primaryRgb);
    doc.roundedRect(margin, y - 5, contentWidth, ctaBoxHeight, 3, 3, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    if (ctaLines && ctaLines.length > 0) {
      // Center vertically within box
      const textStartY = y - 5 + (ctaBoxHeight - ctaLines.length * ctaLineHeight) / 2 + ctaLineHeight;
      ctaLines.forEach((line: string, idx: number) => {
        if (line) {
          doc.text(line, pageWidth / 2, textStartY + idx * ctaLineHeight, { align: "center" });
        }
      });
    }
    y += ctaBoxHeight + 5;
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
    const contactText = `${cfc.contactInfo.name || "Contact"}, ${cfc.contactInfo.title || ""} | ${cfc.contactInfo.email || ""}${cfc.contactInfo.phone ? ` | ${cfc.contactInfo.phone}` : ""}`;
    const contactLines = doc.splitTextToSize(contactText, contentWidth - 15);
    if (contactLines && contactLines[0]) {
      doc.text(contactLines[0], margin + 5, y + 13);
    }
    y += 28;
  }

  // Closing Statement
  if (cfc.closingStatement) {
    checkPageBreak(22);
    doc.setTextColor(...accentRgb);
    doc.setFontSize(11);
    doc.setFont("helvetica", "italic");
    const closingLines = doc.splitTextToSize(cfc.closingStatement || "", contentWidth);
    if (closingLines && closingLines.length > 0) {
      doc.text(closingLines, pageWidth / 2, y + 5, { align: "center" });
    }
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
    
    // Left side: Institution name
    doc.text(institutionName || '', margin, pageHeight - 8);
    
    // Center: Page numbers
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 8, { align: "center" });
    
    // Right side: CampusVoice branding
    doc.text("Powered by CampusVoice.AI", pageWidth - margin, pageHeight - 8, { align: "right" });
  }

  doc.save("case-for-support.pdf");
}
