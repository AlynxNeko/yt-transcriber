import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"


export async function POST(req: NextRequest) {
  try {
    const { transcript, notes, format } = await req.json()

    if (!transcript || !format) {
      return NextResponse.json({ error: "Missing transcript or format" }, { status: 400 })
    }

    const prompt = `You are a helpful assistant. Given the transcript of a YouTube video, generate a ${
      format === "pptx" ? "PowerPoint slide content (if the content is a lot in a slide, split into two with '(1)' '(2)' mark in the title). No need to specify Slide 1 or Slide 2 etc" : "well-structured Word document"
      }. Include relevant titles, bullet points, and summaries. Make sure to make it very detailed"${
        notes ? `User notes: "${notes}".` : ""
      }

      Transcript:
      ${transcript}
      `
    //OpenAI
    // const openaiApiKey = process.env.OPENAI_API_KEY
    // if (!openaiApiKey) {
    //   console.error("[/api/generate] OPENAI_API_KEY is not set")
    //   return NextResponse.json({ error: "OPENAI_API_KEY is not set" }, { status: 500 })
    // }
    // console.log("[/api/generate] Using OpenAI API key")
    // const openai = new OpenAI({ apiKey: openaiApiKey })
    // const completion = await openai.chat.completions.create({
    //   model: "gpt-3.5-turbo", // or "gpt-4" if you have access
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0.7,
    // })


    // const completion = await openai.chat.completions.create({
    //   model: "gpt-4", // or "gpt-3.5-turbo" if on free tier
    //   messages: [{ role: "user", content: prompt }],
    //   temperature: 0.7,
    // })

    // gemini google api
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not set" }, { status: 500 })
    }
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt }
              ]
            }
          ]
        })
      }
    )

    if (!geminiRes.ok) {
      const error = await geminiRes.text()
      return NextResponse.json({ error: `Gemini API error: ${error}` }, { status: 500 })
    }

    const geminiData = await geminiRes.json()
    const content =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""


    // const content = completion.choices[0]?.message?.content?.trim() || ""
    // console.log("[/api/generate] Generated content:", content)
    // const content = transcript
    if (!content) {
      return NextResponse.json({ error: "No Gemini content returned" }, { status: 500 })
    }
    return NextResponse.json({ content })
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
