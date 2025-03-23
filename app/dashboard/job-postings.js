"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExternalLink, FolderHeart, MapPin } from "lucide-react";

export default function JobPostings({ onSavedJobsChange }) {
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]); // Track saved job IDs
  const [limit, setLimit] = useState(4); // Number of jobs to display (starts with 4)

  // Increase 'limit' by 4 to load 4 more jobs
  const handleLoadMore = () => {
    setLimit((prev) => prev + 4);
  };
  

  // 🔹 1. Load job postings, reacts to 'limit' being changed.
  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("Job_Posting")
        .select("posting_id, title, description, location, employment_type")
        .limit(limit);

      if (error) {
        console.error("Error fetching jobs:", error);
      } else {
        setJobs(data);
      }
    };
    fetchJobs();
  }, [limit]);

  // 🔹 2. Fetch saved job IDs for the user
  useEffect(() => {
    const fetchSavedJobs = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) return;

      const { data: savedData, error } = await supabase
        .from("Saved_Jobs")
        .select("job_posting_id")
        .eq("employee_ID", authData.user.id);

      if (!error && savedData) {
        setSavedJobIds(savedData.map((row) => row.job_posting_id));
      }
    };
    fetchSavedJobs();
  }, []);

  // 🔹 3. Toggle save/un-save job
  const handleFavourite = async (jobId, e) => {
    e.preventDefault(); // Prevents navigation
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        console.warn("No user session found");
        return;
      }

      const userId = authData.user.id;
      const isSaved = savedJobIds.includes(jobId);

      if (isSaved) {
        // REMOVE (DELETE from Saved_Jobs)
        const { error: deleteError } = await supabase
          .from("Saved_Jobs")
          .delete()
          .eq("employee_ID", userId)
          .eq("job_posting_id", jobId);

        if (!deleteError) {
          setSavedJobIds((prev) => prev.filter((id) => id !== jobId)); // Immediate UI update
          console.log(`Job ${jobId} unsaved successfully!`);
          onSavedJobsChange(); // Ensure parent updates
        } else {
          console.error("Error removing saved job:", deleteError);
        }
      } else {
        // ADD (INSERT into Saved_Jobs)
        const { error: insertError } = await supabase
          .from("Saved_Jobs")
          .insert([
            {
              job_posting_id: jobId,
              employee_ID: userId,
              saved_at: new Date().toISOString(),
            },
          ]);

        if (!insertError) {
          setSavedJobIds((prev) => [...prev, jobId]); // Immediate UI update
          console.log(`Job ${jobId} saved successfully!`);
          onSavedJobsChange(); // Ensure parent updates
        } else {
          console.error("Error saving job:", insertError);
        }
      }
    } catch (err) {
      console.error("Unexpected error in handleFavourite:", err);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Latest Job Postings</h2>
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const isSaved = savedJobIds.includes(job.posting_id);
            return (
              <Link key={job.posting_id} href={`/dashboard/listing/${job.posting_id}`} passHref>
                <Card className="border shadow-sm hover:shadow-md transition h-full flex flex-col cursor-pointer">
                  <CardHeader className="flex justify-between items-start">
                    {/* Job Title */}
                    <CardTitle className="text-lg font-semibold truncate">
                      {job.title}
                    </CardTitle>

                    {/* Icons (External Link + Favourite) */}
                    <div className="flex items-center gap-2">
                      {/* External Link Icon */}
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-50 rounded-md">
                        <ExternalLink size={18} className="text-gray-600" />
                      </div>

                      {/* Favourite Icon - red if isSaved */}
                      <button
                        onClick={(e) => handleFavourite(job.posting_id, e)}
                        className={`flex items-center justify-center w-8 h-8 bg-gray-50 rounded-md 
                          ${isSaved ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}
                      >
                        <FolderHeart size={18} />
                      </button>
                    </div>
                  </CardHeader>

                  <CardContent className="text-sm flex-grow">
                    <p className="text-gray-700 mb-2 line-clamp-3">
                      {job.description}
                    </p>
                    {/* Location & Employment Type */}
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                      <MapPin size={16} className="text-gray-400" />
                      <span>
                        {job.location} | {job.employment_type}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        
      ) : (
        <p>No jobs available.</p>
      )}

      {/* Load More Button */}
      {/* Disappears when all jobs have been loaded. */}
      {jobs.length >= limit && (
        <div className="flex justify-center mt-4">
          <button onClick={handleLoadMore} variant="default" className="px-4 py-2 bg-black text-white rounded-lg transition">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
