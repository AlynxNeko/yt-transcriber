import { NextResponse } from "next/server"
import { execFile } from "child_process"
import path from "path"

export async function GET() {
  const ffmpegPath = path.join(
    process.cwd(),
    "node_modules",
    "ffmpeg-static",
    process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg"
  )

  return new Promise((resolve) => {
    execFile(ffmpegPath, ["-version"], (err, stdout, stderr) => {
      if (err) {
        console.error("❌ FFmpeg error:", err)
        resolve(
          NextResponse.json(
            {
              status: "error",
              message: err.message,
              path: ffmpegPath,
            },
            { status: 500 }
          )
        )
      } else {
        resolve(
          NextResponse.json({
            status: "ok",
            ffmpegPath,
            version: stdout.trim(),
          })
        )
      }
    })
  })
}
