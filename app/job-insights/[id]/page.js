"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function JobDetailPage() {
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch job data
  useEffect(() => {
    const postId = Number(id)
    if (isNaN(postId)) {
      setError("Invalid job ID")
      setLoading(false)
      return
    }

    const fetchJob = async () => {
      const { data, error } = await supabase
        .from("Job_Posting")
        .select("*")
        .eq("posting_id", postId)
        .single()

      if (error) {
        setError("Job not found")
        console.error("Supabase error:", error.message)
      } else {
        setJob(data)
      }

      setLoading(false)
    }

    fetchJob()
  }, [id])

  // Increment views
  useEffect(() => {
    fetch("/api/view-job", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: Number(id) }),
    })
  }, [id])

  if (loading) return <div className="p-6">Loading job data...</div>
  if (error) return <div className="p-6 text-red-600 font-semibold">{error}</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Job Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-blue-700">{job.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>💼 Employment Type:</span>
            <span>{job.employment_type || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span>📍 Location:</span>
            <span>{job.location || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span>💸 Salary Range:</span>
            <span>{job.salary_range || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span>📈 Views:</span>
            <span className="font-semibold text-blue-600">{job.views ?? 0}</span>
          </div>
          <div className="flex justify-between">
            <span>⏳ Deadline:</span>
            <span>{job.deadline || "N/A"}</span>
          </div>
        </CardContent>
      </Card>

      {/* Job Description Card */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-800 whitespace-pre-wrap">
          {job.description ? 
            job.description.replace(/<[^>]*>/g, '') : 
            "No description provided."}
        </CardContent>
      </Card>
    </div>
  )
}
