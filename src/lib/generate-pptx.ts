import PptxGenJS from "pptxgenjs"

// --- Parse **bold** into TextProps[] ---
function parseBoldPptx(text: string): PptxGenJS.TextProps[] {
  const boldRegex = /\*\*(.*?)\*\*/g
  const parts: PptxGenJS.TextProps[] = []
  let lastIndex = 0

  for (const match of text.matchAll(boldRegex)) {
    const [full, boldText] = match
    const start = match.index!
    if (start > lastIndex) {
      parts.push({ text: text.slice(lastIndex, start) })
    }
    parts.push({ text: boldText, options: { bold: true } })
    lastIndex = start + full.length
  }

  if (lastIndex < text.length) {
    parts.push({ text: text.slice(lastIndex) })
  }

  return parts.length > 0 ? parts : [{ text }]
}

// --- Detect heading level ---
function getHeadingProps(line: string): { fontSize: number; bold: boolean } {
  if (line.startsWith("# ")) return { fontSize: 28, bold: true }
  if (line.startsWith("## ")) return { fontSize: 24, bold: true }
  if (line.startsWith("### ")) return { fontSize: 20, bold: true }
  if (line.startsWith("#### ")) return { fontSize: 19, bold: true }
  if (line.startsWith("##### ")) return { fontSize: 18, bold: true }
  return { fontSize: 18, bold: false }
}

// --- Check and clean bullet lines ---
function isBulletLine(line: string): boolean {
  return /^\s*[\*\-]\s+/.test(line)
}
function cleanBulletLine(line: string): string {
  return line.replace(/^\s*[\*\-]\s+/, "")
}

// --- Split a paragraph into lines, and wrap long lines to maxLen ---
function normalizeLines(input: string, maxLen = 75): string[] {
  const rawLines = input.split("\n").filter((l) => l.trim() !== "")
  const finalLines: string[] = []

  rawLines.forEach((line) => {
    const words = line.trim().split(" ")
    let buffer = ""

    words.forEach((word) => {
      if ((buffer + word).length + 1 > maxLen) {
        finalLines.push(buffer.trim())
        buffer = word + " "
      } else {
        buffer += word + " "
      }
    })

    if (buffer.trim()) {
      finalLines.push(buffer.trim())
    }
  })

  return finalLines
}

// --- Combine all wrapped + bolded text into one TextProps[] block ---
function formatBlockWithBold(lines: string[], isBullet: boolean): PptxGenJS.TextProps[] {
  const block: PptxGenJS.TextProps[] = []

  lines.forEach((line, idx) => {
    const lineText = isBullet && idx === 0 ? `• ${line}` : line
    const parsed = parseBoldPptx(lineText)
    if (idx > 0) block.push({ text: "\n" })
    block.push(...parsed)
  })

  return block
}

// --- Main generator ---
export async function generatePptxFile(content: string): Promise<Blob> {
  const pptx = new PptxGenJS()
  const rawSections = content
    .split(/\n(?:\*{3,}|-{3,})\n/g)
    .map(section => section.trim())
    .filter(section => section.length > 0)

  const chunks: string[] = []

  rawSections.forEach(section => {
    const subChunks = normalizeLines(section)
      .map(line => line.trim())
      .filter(line => line.length > 0)

    for (let i = 0; i < subChunks.length; i += 9) {
      const chunkGroup = subChunks.slice(i, i + 9).join("\n")
      chunks.push(chunkGroup)
    }
  })

  // --- Front slide (Styled like reference image) ---
  const front = pptx.addSlide()

  // Main Title
  let title_ = sessionStorage.getItem("Title_") || "{Title}"

  // Split if > 20 characters
  if (title_.length > 20) {
    const middle = Math.floor(title_.length / 2)

    // Find closest space around the middle
    let splitIndex = title_.lastIndexOf(" ", middle)
    if (splitIndex === -1 || splitIndex < 5) {
      splitIndex = title_.indexOf(" ", middle) // fallback to next space
    }

    if (splitIndex !== -1) {
      title_ = title_.slice(0, splitIndex) + "\n" + title_.slice(splitIndex + 1)
    }
  }

  front.addText(title_ || "{Title}", {
    x: 0.7,
    y: 0.0,
    w: 8,
    h: 2,
    fontSize: 42,
    bold: true,
    color: "000000",
    align: "left",
    fontFace: "Arial",
  })

  // Subtitle
  front.addText("Introduction Proposal", {
    x: 0.7,
    y: 1.9,
    fontSize: 18,
    color: "000000",
    bold: false,
    fontFace: "Arial",
  })

  // Year (bolded)
  front.addText("Year of 2025", {
    x: 0.7,
    y: 2.2,
    fontSize: 18,
    bold: true,
    color: "000000",
    fontFace: "Arial",
  })

  // Attribution
  front.addText("from Pasti Bisa Digital", {
    x: 0.7,
    y: 2.5,
    fontSize: 14,
    color: "444444",
    fontFace: "Arial",
  })

  // Footer (copyright notice)
  front.addText("© 2025 Pasti Bisa Digital. All rights reserved.\nThis document and its contents are the property of Pasti Bisa Digital and are protected by copyright laws. Unauthorized reproduction, distribution, or modification of this document, in whole or in part, is prohibited without prior written consent from Pasti Bisa Digital.", {
    x: 0.7,
    y: 4.5,
    w: 8,
    h: 1,
    fontSize: 8,
    color: "555555",
    fontFace: "Arial",
  })

  // Logo
  front.addImage({
    path: "pbdlogo.png",
      x: 8.25, y: 0.2, w: 1.5, h: 0.5
  })

  chunks.forEach((chunk) => {
    const logicalLines = normalizeLines(chunk)
    let y = 0.5
    const textBlocks: { block: PptxGenJS.TextProps[]; options: any }[] = []

    logicalLines.forEach((rawLine) => {
      const trimmed = rawLine.trim()
      if (trimmed === "" || trimmed.startsWith("```") || trimmed.startsWith("***") || trimmed.startsWith("---"))
        return

      if (chunks.indexOf(chunk) === 0 && (
        trimmed.toLowerCase().startsWith("hi") ||
        trimmed.toLowerCase().startsWith("hello") ||
        trimmed.toLowerCase().startsWith("here is") ||
        trimmed.toLowerCase().startsWith("ofcourse") ||
        trimmed.toLowerCase().startsWith("of course") ||
        trimmed.toLowerCase().startsWith("sure")
      )) {
        const nextIdx = logicalLines.indexOf(rawLine) + 1
        if (
          nextIdx < logicalLines.length &&
          !isBulletLine(logicalLines[nextIdx].trim()) &&
          !/^#+\s+/.test(logicalLines[nextIdx].trim())
        ) logicalLines[nextIdx] = ""
        return
      }

      let text = trimmed
      let isBullet = false
      if (isBulletLine(trimmed)) {
        text = cleanBulletLine(trimmed)
        isBullet = true
      } else if (/^#+\s+/.test(trimmed)) {
        text = trimmed.replace(/^#+\s+/, "")
      }

      const headingProps = getHeadingProps(trimmed)
      const wrappedLines = normalizeLines(text)
      const fullTextBlock = formatBlockWithBold(wrappedLines, isBullet)

      textBlocks.push({
        block: fullTextBlock,
        options: {
          x: 0.5,
          y,
          w: 8.5,
          fontSize: headingProps.fontSize,
          bold: headingProps.bold,
          color: "363636",
          lineSpacing: 1.2,
        },
      })
      y += wrappedLines.length * 0.6
    })

    if (textBlocks.length === 0) return // skip empty slides

    const slide = pptx.addSlide()
    slide.addImage({
      path: "pbdlogo.png",
      x: 8.25, y: 0.2, w: 1.5, h: 0.5
    })
    textBlocks.forEach(({ block, options }) => {
      slide.addText(block, options)
    })
  })

  const blob = (await pptx.write({ outputType: "blob" })) as Blob
  return blob
}
