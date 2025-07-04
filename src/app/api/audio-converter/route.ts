import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { tmpdir } from "os"
import { v4 as uuidv4 } from "uuid"
import ffmpeg from "fluent-ffmpeg"

const ffmpegPath = path.join(
  process.cwd(),
  "node_modules",
  "ffmpeg-static",
  process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"
)

ffmpeg.setFfmpegPath(ffmpegPath)
console.log("✅ FFmpeg path used:", ffmpegPath)

export async function POST(req: NextRequest) {
  console.log("🔧 [API] /api/audio-converter - POST request received")

  try {
    const formData = await req.formData()
    const file = formData.get("audio") as File

    if (!file || !file.name) {
      console.error("🚫 No file uploaded")
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    console.log("📦 Received file:", file.name)

    const buffer = Buffer.from(await file.arrayBuffer())
    const inputPath = path.join(tmpdir(), `${uuidv4()}_${file.name}`)
    await fs.writeFile(inputPath, buffer)

    const imagePath = path.resolve("./public/pbdlogo_hori.png")
    const outputPath = path.join(tmpdir(), `${uuidv4()}.mp4`)

    console.log("🎞 Starting ffmpeg conversion...")
    console.log("📂 inputPath:", inputPath)
    console.log("🖼️ imagePath:", imagePath)
    console.log("📤 outputPath:", outputPath)

    await new Promise((resolve, reject) => {
      ffmpeg()
        .input(imagePath)
        .loop()
        .input(inputPath)
        .outputOptions([
          "-c:v libx264",
          "-c:a aac",
          "-shortest",
          "-pix_fmt yuv420p",
        ])
        .save(outputPath)
        .on("end", () => {
          console.log("✅ FFmpeg conversion completed.")
          resolve(true)
        })
        .on("error", (err: Error) => {
          console.error("❌ FFmpeg error:", err) // <=== Add this for debugging
          reject(err)
        })
    })

    const outputBuffer = await fs.readFile(outputPath)

    await fs.unlink(inputPath)
    await fs.unlink(outputPath)

    return new NextResponse(outputBuffer, {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": "attachment; filename=converted.mp4",
      },
    })
  } catch (err: any) {
    console.error("🔥 API handler failed:", err.message || err)
    if (err.stack) console.error(err.stack)
    return NextResponse.json({ error: err.message || "Unknown server error" }, { status: 500 })
    }
}
