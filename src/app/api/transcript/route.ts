import { NextRequest, NextResponse } from "next/server"

function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11})/)
  return match ? match[1] : null
}

export async function POST(req: NextRequest) {
  try {
    const { youtubeUrl } = await req.json()

    if (!youtubeUrl) {
      return NextResponse.json({ error: "Missing YouTube URL" }, { status: 400 })
    }

    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }
    const transcriptApiBaseUrl = process.env.TRANSCRIPT_API_URL || "http://localhost:5000"
    const apiUrl = `${transcriptApiBaseUrl}/transcript/${videoId}`
    const res = await fetch(apiUrl)

    if (!res.ok) {
      const errorText = await res.text()
      return NextResponse.json({ error: `Transcript API error: ${errorText}` }, { status: res.status })
    }

    const json = await res.json()
    return NextResponse.json({ transcript: json })
  } catch (err) {
    console.error("Transcript fetch error:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
