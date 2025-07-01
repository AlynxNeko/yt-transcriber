"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Youtube, FileText, Presentation } from "lucide-react"
import dynamic from "next/dynamic"
const ClientOnlySelect = dynamic(() => import("./client-only-select"), { ssr: false })

export default function YouTubeConverterForm() {
  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [outputFormat, setOutputFormat] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Store form data in sessionStorage for the processing page
    const formData = {
      youtubeUrl,
      notes,
      outputFormat,
      timestamp: Date.now(),
    }

    sessionStorage.setItem("conversionData", JSON.stringify(formData))

    // Navigate to processing page
    router.push("/processing")
  }

  const isValidYouTubeUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    return youtubeRegex.test(url)
  }

  const isFormValid = youtubeUrl && isValidYouTubeUrl(youtubeUrl) && outputFormat

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <Youtube className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">YouTube to Document</CardTitle>
          <CardDescription>Convert YouTube videos to PowerPoint or Word documents</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="youtube-url">YouTube URL</Label>
              <Input
                id="youtube-url"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className={`${
                  youtubeUrl && !isValidYouTubeUrl(youtubeUrl) ? "border-red-500 focus-visible:ring-red-500" : ""
                }`}
                required
              />
              {youtubeUrl && !isValidYouTubeUrl(youtubeUrl) && (
                <p className="text-sm text-red-500">Please enter a valid YouTube URL</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any specific instructions or notes for the conversion..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="output-format">Output Format</Label>
              <ClientOnlySelect outputFormat={outputFormat} setOutputFormat={setOutputFormat} />
            </div>

            <Button type="submit" className="w-full" disabled={!isFormValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </>
              ) : (
                "Convert Video"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
