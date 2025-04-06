import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function POST(req: Request) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: "Missing job ID" }, { status: 400 })
    }

    // Fetch current views
    const { data: job, error: fetchError } = await supabase
      .from("Job_Posting")
      .select("views")
      .eq("posting_id", id)
      .single()

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Update view count
    const { error: updateError } = await supabase
      .from("Job_Posting")
      .update({ views: job.views + 1 })
      .eq("posting_id", id)

    if (updateError) {
      return NextResponse.json({ error: "Update failed" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
