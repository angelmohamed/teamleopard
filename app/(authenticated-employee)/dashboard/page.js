"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../layout";
import JobPostings from "./job-postings";
import Filters from "./filters-aside";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";

export default function JobListings() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]); // Tracks saved jobs
  const [activeFilters, setActiveFilters] = useState({});

  // 1️⃣ Fetch employee details (username, first_name)
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("Employee")
        .select("username, first_name")
        .eq("id", user.id)
        .single();

      if (!error && data) setEmployee(data);
    })();
  }, [user]);

  // 2️⃣ Function to fetch saved jobs (called on mount + updates)
  const fetchSavedJobs = React.useCallback(async () => {
    if (!user) return;

    // Step 1: Get job_posting_ids from "Saved_Jobs"
    const { data, error } = await supabase
      .from("Saved_Jobs")
      .select("job_posting_id")
      .eq("employee_ID", user.id);

    if (error || !data) {
      console.error("Error fetching saved jobs:", error);
      setSavedJobs([]);
      return;
    }

    if (data.length === 0) {
      setSavedJobs([]);
      return;
    }

    // Step 2: Fetch job titles from "Job_Posting"
    const jobIds = data.map((item) => item.job_posting_id);
    const { data: jobData, error: jobError } = await supabase
      .from("Job_Posting")
      .select("posting_id, title")
      .in("posting_id", jobIds);

    if (jobError || !jobData) {
      console.error("Error fetching job titles:", jobError);
      setSavedJobs([]);
      return;
    }

    setSavedJobs(jobData); // => e.g. [ {posting_id, title}, ...]
  }, [user]);

  // 3️⃣ Use effect to fetch on mount + subscribe to Supabase updates
  useEffect(() => {
    fetchSavedJobs();

    // Realtime listener for Saved_Jobs table
    const subscription = supabase
      .channel("saved_jobs_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Saved_Jobs" },
        () => {
          fetchSavedJobs(); // Fetch updated saved jobs when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Cleanup subscription
    };
  }, [fetchSavedJobs, user]);

  // 4️⃣ Callback for <JobPostings> to trigger refresh
  const handleSavedJobsChange = async () => {
    console.log("Refreshing saved jobs..."); // Debugging log
    await fetchSavedJobs(); // Ensure backend updates reflect in UI
  };

  // Handle filter changes from the Filters component
  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  return (
    <div className="min-h-screen flex justify-center">
      <div className="w-full max-w-6xl flex">
        <Filters onFilterChange={handleFilterChange} />

        <main className="flex-1 p-6">
          <div className="md:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Filter className="w-5 h-5" />
                  <span>Filters</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-6">
                {/* Mobile filters */}
                <Filters onFilterChange={handleFilterChange} />
              </SheetContent>
            </Sheet>
          </div>

          {/* Profile Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Your profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Welcome,{" "}
                  {employee?.first_name ?? employee?.username ?? "Loading..."}
                </p>
              </CardContent>
            </Card>

            {/* Saved Jobs Section */}
            <Card>
              <CardHeader>
                <CardTitle>Your saved jobs</CardTitle>
              </CardHeader>
              <CardContent>
                {savedJobs.length === 0 ? (
                  <p className="mb-1 text-sm text-gray-600">No saved jobs yet.</p>
                ) : (
                  <ul className="list-disc list-inside">
                    {savedJobs.slice(0, 3).map((job) => (
                      <li key={job.posting_id}>
                        <a
                          href={`/dashboard/listing/${job.posting_id}`}
                          className="hover:underline mb-1 text-sm text-gray-600"
                        >
                          {job.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {savedJobs.length > 3 && (
                  <p className="text-sm text-gray-600 mt-2">
                    And {savedJobs.length - 3} more...
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Applications Section */}
            <Card>
              <CardHeader>
                <CardTitle>Your applications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Placeholder</p>
              </CardContent>
            </Card>
          </div>

          <div className="border-b my-6" />

          {/* Pass the callback and filters to <JobPostings> */}
          <JobPostings onSavedJobsChange={handleSavedJobsChange} filters={activeFilters} />
        </main>
      </div>
    </div>
  );
}
