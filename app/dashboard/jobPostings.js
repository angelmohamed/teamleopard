"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function JobPostings() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("Job_Posting")
        .select("title, description, location, employment_type") // Fetch only required fields
        .limit(5); // Get only the first 5

      if (error) {
        console.error("Error fetching jobs:", error);
      } else {
        setJobs(data);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Latest Job Postings</h2>
      {jobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job, index) => (
            <Card key={index} className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {job.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-gray-700 mb-2">{job.description}</p>
                <p className="text-gray-500">
                  📍 {job.location} | {job.employment_type}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>No jobs available.</p>
      )}
    </div>
  );
}
