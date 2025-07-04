"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Music, Video, Upload, ArrowLeft } from "lucide-react"

export default function AudioConverterForm() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/wave"]
      if (
        validTypes.includes(file.type) ||
        file.name.toLowerCase().endsWith(".mp3") ||
        file.name.toLowerCase().endsWith(".wav")
      ) {
        setAudioFile(file)
      } else {
        alert("Please select a valid MP3 or WAV file")
        e.target.value = ""
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile) return

    setIsSubmitting(true)
    console.log("Starting conversion for:", audioFile.name)

    try {
        const formData = new FormData()
        formData.append("audio", audioFile)

        const res = await fetch("/api/audio-converter", {
        method: "POST",
        body: formData,
        })

        if (!res.ok) {
        throw new Error("Conversion failed")
        }

        const blob = await res.blob()
        const blobUrl = URL.createObjectURL(blob)

        sessionStorage.setItem("convertedVideoData", JSON.stringify({
        blobUrl,
        fileName: audioFile.name.replace(/\.(mp3|wav)$/i, ".mp4"),
        }))

        router.push("/audio-converter/results")
    } catch (err) {
        console.error("Error during conversion:", err)
        alert("Conversion failed. Please try again.")
        setIsSubmitting(false)
    }
    }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const isFormValid = audioFile

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 to-pink-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-2">
            <Music className="h-6 w-6 text-purple-500" />
            <span className="text-2xl">→</span>
            <Video className="h-6 w-6 text-pink-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Audio to Video Converter</CardTitle>
          <CardDescription>Convert MP3 or WAV files to MP4 video format</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="audio-file">Audio File (MP3 or WAV)</Label>
              <div className="relative">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="audio-file"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-colors"
                  >
                    {!audioFile ? (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">MP3 or WAV files only</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Music className="w-8 h-8 mb-2 text-purple-500" />
                        <p className="text-sm font-medium text-gray-700">{audioFile.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(audioFile.size)}</p>
                        <p className="text-xs text-purple-600 mt-1">Click to change file</p>
                      </div>
                    )}
                    <input
                      id="audio-file"
                      type="file"
                      accept=".mp3,.wav,audio/mpeg,audio/wav"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                "Convert to Video"
              )}
            </Button>
          </form>

          {/* Back to YouTube Converter */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button variant="ghost" className="w-full" onClick={() => router.push("/")} type="button">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to YouTube Converter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
