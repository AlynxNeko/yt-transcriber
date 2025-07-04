"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Video, Download, ArrowLeft, CheckCircle, Music } from "lucide-react"

export default function AudioResultsPage() {
  const router = useRouter()
  const [videoBlobUrl, setVideoBlobUrl] = useState("")
  const [fileName, setFileName] = useState("")

  useEffect(() => {
    const data = sessionStorage.getItem("convertedVideoData")
    if (!data) {
      router.push("/audio-converter")
      return
    }

    const parsed = JSON.parse(data)
    setVideoBlobUrl(parsed.blobUrl)
    setFileName(parsed.fileName)
  }, [router])

  const handleDownload = () => {
    const a = document.createElement("a")
    a.href = videoBlobUrl
    a.download = fileName
    a.click()
  }

  const handleNewConversion = () => {
    sessionStorage.removeItem("convertedVideoData")
    router.push("/audio-converter")
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-100">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Conversion Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Video className="h-6 w-6 text-pink-500" />
                <div>
                  <p className="font-medium text-gray-800">{fileName}</p>
                  <p className="text-sm text-gray-600">MP4 • Ready for download</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Format:</span> MP4 Video (Audio Only)
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date().toLocaleString()}
              </div>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            className="w-full h-12 text-lg font-medium bg-purple-600 hover:bg-purple-700"
          >
            <Download className="h-5 w-5 mr-2" />
            Download MP4 Video
          </Button>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleNewConversion} className="flex-1 bg-transparent">
              <Music className="h-4 w-4 mr-2" />
              Convert Another
            </Button>
            <Button variant="outline" onClick={handleDownload} className="flex-1">
              Download Again
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <Button variant="ghost" className="w-full" onClick={() => router.push("/")} type="button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to YouTube Converter
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p>
              Your audio file has been successfully converted to an MP4 video format. The video contains only the audio
              track with a static image, perfect for platforms that require video uploads.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
