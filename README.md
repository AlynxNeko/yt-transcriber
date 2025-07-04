# YouTube to Document Converter

Convert any YouTube video into a downloadable **PowerPoint (`.pptx`)** or **Word Document (`.docx`)**, using the power of Gemini and modern UI.

Now also supports **MP3/WAV to MP4** audio-to-video conversion with static branding!

![License](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/built%20with-Next.js-blue)

---

## ✨ Features

- ✅ Paste any valid YouTube URL
- ✅ Choose between PPTX or DOCX output
- ✅ Add custom title and notes
- ✅ Gemini-based smart transcript summarization
- ✅ Fully client-side document download
- ✅ 🎵 Upload MP3/WAV and convert to MP4 video with static image
- ✅ Download MP4 directly after conversion

---

## 📦 Project Structure

- `YouTubeConverterForm`: Accepts URL, title, notes, and output format
- `ProcessingPage`: Orchestrates async pipeline (transcript → Gemini → format)
- `ResultsPage`: Handles document generation and download
- `generate-docx` / `generate-pptx`: Converts Gemini output to `.docx` or `.pptx`
- `api/` routes:
  - `/api/transcript`: Handles YouTube transcript fetch
  - `/api/audio-converter`: Converts audio (MP3/WAV) into branded MP4 using FFmpeg
- `AudioConverterForm`: Standalone MP3/WAV to MP4 upload and conversion UI

---

## ⚠️ Sub-Project Dependency

This project **requires a deployed subproject/API service** to function:

> 🔗 Must deploy [`yt-transcriber-api`](https://github.com/AlynxNeko/yt-transcript-api) 

Update your `fetch` URLs if deploying elsewhere.

---

## 🚀 Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/AlynxNeko/yt-transcriber.git
cd yt-transcriber
```

### 2. Install dependencies
```bash
npm install
# or
pnpm install
```
### 3. Environtment Setup
Rename .example.env.local and change it's content
```env
OPENAI_API_KEY="NOT_REALLY_USED_NOW"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
TRANSCRIPT_API_URL="https://your-api.com/api/transcript" # From the yt-transcript-api github that you deployed
```
Currently the OPENAI isn't used yet
FFmpeg is required for MP3 to MP4 conversion. Either:
- Install FFmpeg globally and ensure it's in your PATH, or
- Use ffmpeg-static (already bundled)

### 4. Start the dev server
```bash
npm run dev
```
Then go to http://localhost:3000

---

## 🛠 Tech Stack
- Next.js (App Router)
- Shadcn/UI for components
- Lucide Icons
- PptxGenJS and docx for document generation
- Gemini via [Google AI Studio](https://aistudio.google.com/) (could be changed to GPT via OpenAI for better generation)
- `fluent-ffmpeg` with `ffmpeg-static` for server-side audio-to-video processing

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

## 🙋‍♂️ Author
AlynxNeko
[GitHub](https://github.com/AlynxNeko)

---

## 📎 Screenshots
Add screenshots by placing image links or embedding local images. For example:

---

### Youtube Conversion Home Page
![Home Page](./screenshots/home.png)

---

### Youtube Conversion Result
![Result Page](./screenshots/result.png)

---

### Audio Conversion Home Page
![Result Page](./screenshots/result.png)

---

### Audio Conversion Result
![Result Page](./screenshots/result.png)

---

## 💡 Future Ideas
- Add support for PDF export
- Upload custom transcripts (non-YouTube)
- Login system to track conversion history
- 🔊 Allow selecting background image or audio fade effects for MP3→MP4
- 🎨 Customize branding or visuals for the generated video

