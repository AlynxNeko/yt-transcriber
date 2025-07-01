import PptxGenJS from "pptxgenjs"

export async function generatePptxFile(content: string): Promise<Blob> {
  const pptx = new PptxGenJS()

  const chunks = content.split(/\n{2,}/g) // Split by double newlines
  chunks.forEach((chunk) => {
    const slide = pptx.addSlide()
    slide.addText(chunk.trim(), {
      x: 0.5,
      y: 0.5,
      w: 8.5,
      h: 5,
      fontSize: 18,
      color: "363636",
    })
  })

  // Correct method to return a Blob
  const blob = (await pptx.write({
    outputType: "blob",
  })) as Blob

  return blob
}
