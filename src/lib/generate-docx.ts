import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";

// Helper to parse **bold** into TextRun[]
function parseBold(text: string): TextRun[] {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts: TextRun[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(boldRegex)) {
    const [full, boldText] = match;
    const start = match.index!;
    if (start > lastIndex) {
      parts.push(new TextRun(text.slice(lastIndex, start)));
    }
    parts.push(new TextRun({ text: boldText, bold: true }));
    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    parts.push(new TextRun(text.slice(lastIndex)));
  }

  return parts.length > 0 ? parts : [new TextRun(text)];
}

// Parse each Markdown-like line into styled Paragraph
function parseMarkdownLine(line: string): Paragraph {
  const trimmed = line.trim();

  // Skip separator lines like *** or ---
  if (/^(\*{3,}|-{3,})$/.test(trimmed)) {
    return new Paragraph({}); // empty paragraph (effectively skipped)
  }

  // Skip AI fluff
  if (trimmed.startsWith("Of course!") || trimmed.startsWith("Sure!")) {
    return new Paragraph({});
  }

  // Headings with bold support
  if (trimmed.startsWith("##### ")) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_5,
      children: parseBold(trimmed.replace(/^#####\s*/, "")),
    });
  }

  if (trimmed.startsWith("#### ")) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_4,
      children: parseBold(trimmed.replace(/^####\s*/, "")),
    });
  }

  if (trimmed.startsWith("### ")) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_3,
      children: parseBold(trimmed.replace(/^###\s*/, "")),
    });
  }

  if (trimmed.startsWith("## ")) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: parseBold(trimmed.replace(/^##\s*/, "")),
    });
  }

  if (trimmed.startsWith("# ")) {
    return new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: parseBold(trimmed.replace(/^#\s*/, "")),
    });
  }

  // Bullet point
  if (trimmed.startsWith("* ")) {
    return new Paragraph({
      bullet: { level: 0 },
      children: parseBold(trimmed.slice(2)),
    });
  }

  // Normal paragraph
  return new Paragraph({
    children: parseBold(trimmed),
  });
}

// Main function to convert content string into DOCX Blob
export async function generateDocxFile(content: string): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: content
          .split("\n")
          .filter((line) => line.trim() !== "")
          .map(parseMarkdownLine),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}
