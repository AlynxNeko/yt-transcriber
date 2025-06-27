"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Presentation } from "lucide-react"

export default function ClientOnlySelect({
  outputFormat,
  setOutputFormat,
}: {
  outputFormat: string
  setOutputFormat: (val: string) => void
}) {
  return (
    <Select value={outputFormat} onValueChange={setOutputFormat} required>
      <SelectTrigger id="output-format">
        <SelectValue placeholder="Choose output format" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pptx">
          <div className="flex items-center gap-2">
            <Presentation className="h-4 w-4 text-orange-500" />
            PowerPoint (.pptx)
          </div>
        </SelectItem>
        <SelectItem value="docx">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            Word Document (.docx)
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  )
}
