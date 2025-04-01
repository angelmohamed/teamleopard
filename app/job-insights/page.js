"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { TrendingUp } from "lucide-react";

function calculateAverageSalary(jobs) {
  if (jobs.length === 0) return 0;
  const totalSalary = jobs.reduce((sum, job) => sum + job.avgSalary, 0);
  return (totalSalary / jobs.length).toFixed(2);
}

export default function JobInsightsPage() {
  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchJobs = async () => {
      const { data, error } = await supabase
        .from("Job_Posting")
        .select("posting_id, title, salary_range");

      if (error) {
        console.error("Error fetching jobs:", error.message);
      } else {
        const transformed = data.map((job) => {
          let avgSalary = 0;
        
          if (job.salary_range) {
            // Extract numbers like 50000, 80k, $100000
            const rawValues = job.salary_range.match(/(\$?\d+(?:,\d+)?k?)/gi) || [];
        
            // Convert all matched values to clean integers
            const salaryNumbers = rawValues.map((val) => {
              let clean = val.toLowerCase().replace(/\$/g, "").replace(/,/g, "");
              if (clean.includes("k")) {
                clean = clean.replace("k", "");
                return parseInt(clean) * 1000;
              }
              return parseInt(clean);
            }).filter((num) => !isNaN(num) && num > 0);
        
            if (salaryNumbers.length > 0) {
              const sum = salaryNumbers.reduce((acc, curr) => acc + curr, 0);
              avgSalary = sum / salaryNumbers.length;
        
              if (avgSalary < 10000) {
                avgSalary = 0;
              }
            }
          }
        
          if (avgSalary === 0) {
            console.warn("⚠️ Skipped salary:", job.salary_range, "for job:", job.title);
          }
        
          return {
            id: job.posting_id,
            title: job.title,
            avgSalary,
            views: Math.floor(Math.random() * 1000) + 500,
            applicants: Math.floor(Math.random() * 100) + 10,
          };
        });
        
        setJobData(transformed);
      }

      setLoading(false);
    };

    fetchJobs();
  }, []);

  const jobInsights = jobData.map((job) => ({
    ...job,
    conversionRate: ((job.applicants / job.views) * 100).toFixed(2) + "%",
  }));

  const filteredJobs = jobInsights.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading job data...</p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen p-4 bg-white">
      <Card className="w-full max-w-4xl p-6 shadow-2xl rounded-xl bg-white text-gray-900">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">📊 Job Listings Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Input
              type="text"
              placeholder="Search job titles..."
              className="w-1/2 p-3 border border-blue-400 rounded-lg shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Average Salary Display */}
          <div className="flex flex-col items-center justify-center text-lg font-semibold mb-6 p-4 rounded-xl shadow-lg bg-yellow-100 text-gray-900">
            <TrendingUp className="w-10 h-10 text-green-500 mb-2" />
            <p>Average Salary:</p>
            <p className="text-2xl font-bold">💰 ${calculateAverageSalary(filteredJobs)} USD</p>
          </div>

          {/* Job Insights Table */}
          <Card className="shadow-lg rounded-lg overflow-hidden bg-blue-100 text-gray-900">
            <CardHeader>
              <CardTitle>📋 Job Insights Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="rounded-lg">
                <TableHeader>
                  <TableRow className="bg-blue-700 text-white">
                    <TableHead>Job Title</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Applicants</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                    <TableHead>Avg Salary ($)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                      <TableRow key={job.id} className="hover:bg-blue-200">
                        <TableCell>{job.title}</TableCell>
                        <TableCell>{job.views}</TableCell>
                        <TableCell>{job.applicants}</TableCell>
                        <TableCell className="text-green-600 font-bold">{job.conversionRate}</TableCell>
                        <TableCell className="text-yellow-600 font-bold">
                          {job.avgSalary > 0 ? `$${job.avgSalary.toLocaleString()}` : "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                        No jobs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
