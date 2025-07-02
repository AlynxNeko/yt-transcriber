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
function normalizeLines(input: string, maxLen = 80): string[] {
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

  chunks.forEach((chunk) => {
    const slide = pptx.addSlide()
    const logicalLines = normalizeLines(chunk)
    let y = 0.5

    logicalLines.forEach((rawLine) => {
      const trimmed = rawLine.trim()
      const headingProps = getHeadingProps(trimmed)

      let text = trimmed
      let isBullet = false

      if (text === "" || trimmed.startsWith("```") || trimmed.startsWith("***") || trimmed.startsWith("---")) {
        // Skip empty lines, code blocks, or horizontal rules
        return
      }

      // Skip greeting lines from generated text
      // Only skip greeting lines if it's the first chunk
      // Skip greeting lines from generated text, and also skip the next line if it's a continuation (not a heading or bullet)
      if (
        chunks.indexOf(chunk) === 0 &&
        (
          trimmed.toLowerCase().startsWith("hi") ||
          trimmed.toLowerCase().startsWith("hello") ||
          trimmed.toLowerCase().startsWith("here is") ||
          trimmed.toLowerCase().startsWith("ofcourse") ||
          trimmed.toLowerCase().startsWith("of course") ||
          trimmed.toLowerCase().startsWith("sure")
        )
      ) {
        // Also skip the next logical line if it doesn't look like a heading or bullet
        const nextIdx = logicalLines.indexOf(rawLine) + 1
        if (
          nextIdx < logicalLines.length &&
          !isBulletLine(logicalLines[nextIdx].trim()) &&
          !/^#+\s+/.test(logicalLines[nextIdx].trim())
        ) {
          logicalLines[nextIdx] = "" // Mark as empty so it will be skipped
        }
        return
      }


      if (isBulletLine(trimmed)) {
        text = cleanBulletLine(trimmed)
        isBullet = true
      } else if (/^#+\s+/.test(trimmed)) {
        text = trimmed.replace(/^#+\s+/, "")
      }

      const wrappedLines = normalizeLines(text) // ensure wrapped lines again if needed
      const fullTextBlock = formatBlockWithBold(wrappedLines, isBullet)

      slide.addText(fullTextBlock, {
        x: 0.5,
        y,
        w: 8.5,
        fontSize: headingProps.fontSize,
        bold: headingProps.bold,
        color: "363636",
        lineSpacing: 1.2,
      })

      y += wrappedLines.length * 0.6
    })
  })

  const blob = (await pptx.write({ outputType: "blob" })) as Blob
  return blob
}
