"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Youtube, FileText, Presentation, CheckCircle } from "lucide-react"

interface ConversionData {
  youtubeUrl: string
  notes: string
  outputFormat: string
  timestamp: number
}

export default function ProcessingPage() {
  const [conversionData, setConversionData] = useState<ConversionData | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()

  const steps = [
    "Analyzing YouTube video...",
    "Extracting content...",
    "Generating document structure...",
    "Creating slides/pages...",
    "Finalizing document...",
    "Processing complete!",
  ]
  const hasRunRef = useRef(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
  // Prevent multiple runs of the effect
  if (hasRunRef.current || hasError) return
  hasRunRef.current = true
  
    const storedData = sessionStorage.getItem("conversionData")
    if (!storedData) {
      router.push("/")
      return
    }

    const data: ConversionData = JSON.parse(storedData)
    setConversionData(data)

    const runProcessing = async () => {
    try {
      // Step 1
      setCurrentStep(0)
      const res = await fetch("/api/transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl: data.youtubeUrl }),
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error("Transcript API failed: " + error)
      }

      const json = await res.json()
      const transcript = json.transcript.map((t: any) => t.text).join(" ")

      // Step 2
      setCurrentStep(1)
      const gptRes = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          notes: data.notes,
          format: data.outputFormat,
        }),
      })

      const gptData = await gptRes.json()
      if (!gptData.content) throw new Error("No GPT content returned")

      // Step 3
      setCurrentStep(2)
      sessionStorage.setItem("gptOutput", gptData.content)

      // Fake final steps
      const finalSteps = [3, 4, 5]
      for (const s of finalSteps) {
        await new Promise((res) => setTimeout(res, 1000))
        setCurrentStep(s)
      }

      setTimeout(() => router.push("/results"), 1500)
    } catch (err) {
      console.error("Processing failed:", err)
      alert("Failed to process video.")
      router.push("/")
    }
  }

  runProcessing()
  }, [router, hasError])


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
            <Youtube className="h-8 w-8 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Processing Your Video</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Conversion Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Output Format:</span>
              <div className="flex items-center gap-1">
                {getFormatIcon(conversionData.outputFormat)}
                <span className="text-sm font-medium">{conversionData.outputFormat.toUpperCase()}</span>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">URL:</span> {conversionData.youtubeUrl}
            </div>
            {conversionData.notes && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Notes:</span> {conversionData.notes}
              </div>
            )}
          </div>

          {/* Progress Animation */}
          <div className="text-center space-y-4">
            <div className="relative">
              {currentStep < steps.length - 1 ? (
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto" />
              ) : (
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500 animate-pulse" />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-800">{steps[currentStep]}</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(((currentStep + 1) / steps.length) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>
          </div>

          {/* Processing Steps List */}
          <div className="space-y-2">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    index < currentStep
                      ? "bg-green-500"
                      : index === currentStep
                        ? "bg-blue-500 animate-pulse"
                        : "bg-gray-300"
                  }`}
                />
                <span
                  className={`text-sm ${
                    index < currentStep
                      ? "text-green-600 line-through"
                      : index === currentStep
                        ? "text-blue-600 font-medium"
                        : "text-gray-500"
                  }`}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
