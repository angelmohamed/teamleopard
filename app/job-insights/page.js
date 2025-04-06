"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function JobOverviewPage() {
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("Job_Posting")
        .select("posting_id, title, salary_range, views")

      if (error) {
        console.error("❌ Error fetching jobs:", error.message)
      } else {
        setJobs(data)
      }

      setLoading(false)
    }

    fetchJobs()
  }, [])

  const filtered = jobs.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">📊 Job Listings Overview</h1>

      <div className="flex justify-center">
        <Input
          placeholder="Search job titles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
      </div>

      {loading ? (
        <p className="text-center">Loading jobs...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((job) => (
            <Link
              key={job.posting_id}
              href={`/job-insights/${job.posting_id}`}
              className="hover:scale-[1.02] transition-all"
            >
              <Card className="bg-blue-50 hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="text-base font-semibold text-blue-900">
                    {job.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-gray-700 space-y-1">
                  <p>💸 Salary: {job.salary_range || "N/A"}</p>
                  <p>📈 Views: {job.views ?? 0}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
