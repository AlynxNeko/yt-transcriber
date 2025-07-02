"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Presentation, Download, ArrowLeft, CheckCircle } from "lucide-react"
import { generateDocxFile } from "@/lib/generate-docx"
import { generatePptxFile } from "@/lib/generate-pptx"

interface ConversionData {
  youtubeUrl: string
  notes: string
  outputFormat: string
  timestamp: number
}

export default function ResultsPage() {
  const [conversionData, setConversionData] = useState<ConversionData | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Get conversion data from sessionStorage
    const storedData = sessionStorage.getItem("conversionData")
    if (!storedData) {
      router.push("/")
      return
    }

    const data: ConversionData = JSON.parse(storedData)
    setConversionData(data)
  }, [router])

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      const output = sessionStorage.getItem("gptOutput")
      if (!output) throw new Error("Missing GPT output")

      let blob: Blob

      if (conversionData?.outputFormat === "docx") {
        blob = await generateDocxFile(output)
      } else if (conversionData?.outputFormat === "pptx") {
        blob = await generatePptxFile(output)
      } else {
        throw new Error("Unsupported file format")
      }

      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `YouTube_Video.${conversionData.outputFormat}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error(err)
      alert("File generation failed.")
    }

    setIsDownloading(false)
  }

  const handleNewConversion = () => {
    sessionStorage.removeItem("conversionData")
    router.push("/")
  }

  if (!conversionData) {
    return null
  }

  const getFormatIcon = (format: string) => {
    return format === "pptx" ? (
      <Presentation className="h-6 w-6 text-orange-500" />
    ) : (
      <FileText className="h-6 w-6 text-blue-500" />
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Conversion Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Details */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFormatIcon(conversionData.outputFormat)}
                <div>
                  <p className="font-medium text-gray-800">YouTube_Video.{conversionData.outputFormat}</p>
                  <p className="text-sm text-gray-600">Ready for download</p>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <span className="font-medium">Source:</span> {conversionData.youtubeUrl}
              </div>
              <div>
                <span className="font-medium">Format:</span> {conversionData.outputFormat.toUpperCase()}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date().toLocaleString()}
              </div>
              {conversionData.notes && (
                <div>
                  <span className="font-medium">Notes:</span> {conversionData.notes}
                </div>
              )}
            </div>
          </div>

          {/* Download Button */}
          <Button onClick={handleDownload} className="w-full h-12 text-lg font-medium" disabled={isDownloading}>
            {isDownloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Download File
              </>
            )}
          </Button>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleNewConversion} className="flex-1 bg-transparent">
              <ArrowLeft className="h-4 w-4 mr-2" />
              New Conversion
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
              Download Again
            </Button>
          </div>

          {/* Success Message */}
          <div className="text-center text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
            <p>
              Your YouTube video has been successfully converted to a {conversionData.outputFormat.toUpperCase()}{" "}
              document. The file is ready for download and will be available for the next 24 hours.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
