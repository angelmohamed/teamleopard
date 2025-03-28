"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExternalLink, FolderHeart, MapPin } from "lucide-react";

export default function JobPostings({ onSavedJobsChange, filters }) {
  const [jobs, setJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]); // Track saved job IDs
  const [limit, setLimit] = useState(4); // Number of jobs to display (starts with 4)
  const [loading, setLoading] = useState(false);

  // Increase 'limit' by 4 to load 4 more jobs
  const handleLoadMore = () => {
    setLimit((prev) => prev + 4);
  };

  // 🔹 1. Load job postings with filters, reacts to 'limit' and 'filters' changes
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      
      // Start building the query
      let query = supabase
        .from("Job_Posting")
        .select("posting_id, title, description, location, employment_type, salary_range, company_ID")
        .limit(limit);
      
      // Initialize salary filter flag
      let salaryFilterApplied = false;
      
      // Apply filters if they exist
      if (filters) {
        // Filter by salary range
        // Since salary_range can be in different formats like "$136457" or "$50k - $70k",
        // we need to handle the filtering in the application code instead of at the database level
        if (filters.salary?.min || filters.salary?.max) {
          salaryFilterApplied = true;
        }
        
        // Filter by job type
        if (filters.jobType) {
          query = query.eq('employment_type', filters.jobType);
        }
        
        // Filter by employer
        if (filters.employer) {
          query = query.eq('company_ID', filters.employer);
        }
      }
      
      const { data, error } = await query;

      if (error) {
        console.error("Error fetching jobs:", error);
      } else {
        // Apply salary filtering in JavaScript if needed
        let filteredJobs = data;
        
        if (filters && salaryFilterApplied) {
          filteredJobs = data.filter(job => {
            // Parse the salary range
            const salaryStr = job.salary_range || '';
            
            // Function to convert salary string to number
            const parseAmount = (str) => {
              if (!str) return 0;
              // Remove $ and any commas
              let numStr = str.replace(/[$,]/g, '');
              
              // Handle 'k' suffix (e.g., '50k' -> 50000)
              if (numStr.toLowerCase().endsWith('k')) {
                numStr = parseFloat(numStr.toLowerCase().replace('k', '')) * 1000;
              }
              
              return parseFloat(numStr) || 0;
            };
            
            // Check if it's a range (contains '-') or a single value
            if (salaryStr.includes('-')) {
              // It's a range like "$50k - $70k"
              const [minStr, maxStr] = salaryStr.split('-').map(s => s.trim());
              const minSalary = parseAmount(minStr);
              const maxSalary = parseAmount(maxStr);
              
              // Apply min filter if specified
              if (filters.salary?.min && minSalary < filters.salary.min) {
                return false;
              }
              
              // Apply max filter if specified
              if (filters.salary?.max && maxSalary > filters.salary.max) {
                return false;
              }
              
              return true;
            } else {
              // It's a single value like "$136457"
              const salary = parseAmount(salaryStr);
              
              // Apply min filter if specified
              if (filters.salary?.min && salary < filters.salary.min) {
                return false;
              }
              
              // Apply max filter if specified
              if (filters.salary?.max && salary > filters.salary.max) {
                return false;
              }
              
              return true;
            }
          });
        }
        
        setJobs(filteredJobs);
      }
      setLoading(false);
    };
    
    fetchJobs();
  }, [limit, filters]);

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
        <div className="flex justify-left mt-4">
          <button onClick={handleLoadMore} variant="default" className="px-4 py-2 bg-black text-white rounded-lg transition">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
