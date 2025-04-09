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
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function JobListings() {
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [activeFilters, setActiveFilters] = useState({});
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  // Fetch employee info
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

  // Fetch saved jobs with upcoming deadlines
  const fetchSavedJobs = React.useCallback(async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("Saved_Jobs")
      .select("job_posting_id")
      .eq("employee_ID", user.id);

    if (error || !data || data.length === 0) {
      setSavedJobs([]);
      return;
    }

    const jobIds = data.map((item) => item.job_posting_id);
    const { data: jobData, error: jobError } = await supabase
      .from("Job_Posting")
      .select("posting_id, title, deadline")
      .in("posting_id", jobIds);

    if (jobError || !jobData) {
      console.error("Error fetching job titles:", jobError);
      setSavedJobs([]);
      return;
    }

    const now = new Date();
    const validJobs = jobData
      .filter((job) => job.deadline && new Date(job.deadline) > now)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

    setSavedJobs(validJobs);
  }, [user]);

  // Fetch applications
  const fetchApplications = React.useCallback(async () => {
    if (!user) return;

    setLoadingApplications(true);
    
    try {
      // Fetch applications with job details
      const { data, error } = await supabase
        .from("Applications")
        .select(`
          Application_id, 
          created_at, 
          status,
          resume_file_name,
          job_posting_id,
          Job_Posting (
            posting_id, 
            title, 
            company_ID,
            Employer (
              company_name
            )
          )
        `)
        .eq("employee_ID", user.id)
        .order("created_at", { ascending: false })
        .limit(5); // Limit to 5 most recent applications

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        setApplications(data || []);
      }
    } catch (err) {
      console.error("Unexpected error in fetchApplications:", err);
    } finally {
      setLoadingApplications(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSavedJobs();
    fetchApplications();

    const subscription = supabase
      .channel("saved_jobs_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Saved_Jobs" },
        () => {
          fetchSavedJobs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [fetchSavedJobs, fetchApplications, user]);

  const handleSavedJobsChange = async () => {
    await fetchSavedJobs();
  };

  const handleFilterChange = (filters) => {
    setActiveFilters(filters);
  };

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get badge color based on status
  const getStatusBadge = (status) => {
    const statusMap = {
      "pending": "bg-yellow-100 text-yellow-800",
      "reviewed": "bg-blue-100 text-blue-800",
      "interview": "bg-purple-100 text-purple-800",
      "rejected": "bg-red-100 text-red-800",
      "accepted": "bg-green-100 text-green-800"
    };
    
    return statusMap[status?.toLowerCase()] || "bg-gray-100 text-gray-800";
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
                <Filters onFilterChange={handleFilterChange} />
              </SheetContent>
            </Sheet>
          </div>

          {/* Profile + Saved Jobs + Applications */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Profile */}
            <Card>
              <CardHeader>
                <CardTitle>Your profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Welcome, {employee?.first_name ?? employee?.username ?? "Loading..."}
                </p>
              </CardContent>
            </Card>

            {/* Saved Jobs */}
            <Card>
              <CardHeader>
                <CardTitle>Your saved jobs</CardTitle>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto pr-1">
                {savedJobs.length === 0 ? (
                  <p className="mb-1 text-sm text-gray-600">No saved jobs yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {savedJobs.map((job) => {
                      const daysLeft = Math.ceil(
                        (new Date(job.deadline).getTime() - new Date().getTime()) /
                          (1000 * 60 * 60 * 24)
                      );
                      const isUrgent = daysLeft <= 7;

                      return (
                        <li
                          key={job.posting_id}
                          className="flex items-center justify-between border-b pb-2"
                        >
                          <a
                            href={`/dashboard/listing/${job.posting_id}`}
                            className="hover:underline text-sm text-gray-800 font-medium"
                          >
                            {job.title}
                          </a>
                          <span
                            className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                              isUrgent
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2}
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 8v4l3 1m6-1a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {daysLeft} day{daysLeft !== 1 ? "s" : ""} left
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Applications */}
            <Card>
              <CardHeader>
                <Link href="/applications" className="hover:underline">
                  <CardTitle>Your applications</CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="max-h-64 overflow-y-auto pr-1">
                {loadingApplications ? (
                  <p className="text-sm text-gray-600">Loading applications...</p>
                ) : applications.length === 0 ? (
                  <p className="text-sm text-gray-600">No applications yet.</p>
                ) : (
                  <div className="space-y-4">
                    {applications.slice(0, 5).map((application) => (
                      <div key={application.Application_id} className="border-b pb-3 last:border-b-0 last:pb-0">
                        <div className="flex justify-between items-start">
                          <a
                            href={`/dashboard/listing/${application.job_posting_id}`}
                            className="hover:underline text-sm text-gray-800 font-medium"
                          >
                            {application.Job_Posting?.title || "Job Unavailable"}
                          </a>
                          <Badge className={`${getStatusBadge(application.status)} text-xs uppercase hover:no-underline hover:bg-opacity-100 hover:shadow-none`}>
                            {application.status || "Pending"}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                          {application.Job_Posting?.Employer?.company_name || "Unknown Company"}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Applied on {formatDate(application.created_at)}
                        </p>
                      </div>
                    ))}
                    <div className="mt-4 text-center">
                      <Link href="/applications" className="text-blue-600 hover:underline text-sm">
                        View all applications
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="border-b my-6" />

          {/* Job Listings */}
          <JobPostings
            onSavedJobsChange={handleSavedJobsChange}
            filters={activeFilters}
          />
        </main>
      </div>
    </div>
  );
}