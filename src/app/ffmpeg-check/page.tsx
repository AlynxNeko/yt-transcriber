"use client"

import { useEffect, useState } from "react"

export default function FFmpegCheckPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/ffmpeg-check")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((e) =>
        setData({
          status: "error",
          message: e.message,
        })
      )
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-4">Checking FFmpeg...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">FFmpeg Check</h1>
      <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
