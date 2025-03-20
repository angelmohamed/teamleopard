"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

const jobData = [
  { id: 1, title: "Software Engineer", views: 1200, applicants: 80, avgSalary: 90000 },
  { id: 2, title: "UI/UX Designer", views: 850, applicants: 45, avgSalary: 75000 },
  { id: 3, title: "Marketing Manager", views: 600, applicants: 30, avgSalary: 68000 },
];

const jobInsights = jobData.map((job) => ({
  ...job,
  conversionRate: ((job.applicants / job.views) * 100).toFixed(2) + "%",
}));

export default function JobInsightsPage() {
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const filteredJobs = jobInsights.filter((job) =>
    job.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`p-6 space-y-6 min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-extrabold text-center">📊 Job Listings Insights</h1>
        <div className="flex items-center gap-2">
          <span>🌞</span>
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          <span>🌙</span>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="flex justify-center">
        <Input
          type="text"
          placeholder="Search job titles..."
          className="w-1/2 p-3 border rounded-lg shadow-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Job Performance Chart */}
      <Card className={`shadow-lg rounded-lg overflow-hidden ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
        <CardHeader className="bg-blue-500 text-white">
          <CardTitle>📈 Job Performance Overview</CardTitle>
        </CardHeader>
        <CardContent className="h-80 p-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={jobData} barSize={50}>
              <XAxis dataKey="title" tick={{ fill: darkMode ? "#d1d5db" : "#374151" }} />
              <YAxis tick={{ fill: darkMode ? "#d1d5db" : "#374151" }} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? "#374151" : "white", color: darkMode ? "white" : "black" }} />
              <Legend />
              <Bar dataKey="views" fill="#3b82f6" name="Views" radius={[8, 8, 0, 0]} />
              <Bar dataKey="applicants" fill="#ef4444" name="Applicants" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Salary Trends Chart */}
      <Card className={`shadow-lg rounded-lg overflow-hidden ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
        <CardHeader className="bg-green-500 text-white">
          <CardTitle>💰 Average Salary Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-80 p-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={jobData}>
              <XAxis dataKey="title" tick={{ fill: darkMode ? "#d1d5db" : "#374151" }} />
              <YAxis tick={{ fill: darkMode ? "#d1d5db" : "#374151" }} />
              <Tooltip contentStyle={{ backgroundColor: darkMode ? "#374151" : "white", color: darkMode ? "white" : "black" }} />
              <Legend />
              <Line type="monotone" dataKey="avgSalary" stroke="#16a34a" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Job Insights Table */}
      <Card className={`shadow-lg rounded-lg overflow-hidden ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
        <CardHeader className="bg-gray-700 text-white">
          <CardTitle>📋 Job Insights Table</CardTitle>
        </CardHeader>
        <CardContent>
          <Table className="rounded-lg">
            <TableHeader>
              <TableRow className="bg-gray-200 dark:bg-gray-700">
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
                  <TableRow key={job.id} className="hover:bg-gray-100 dark:hover:bg-gray-600">
                    <TableCell>{job.title}</TableCell>
                    <TableCell>{job.views}</TableCell>
                    <TableCell>{job.applicants}</TableCell>
                    <TableCell className="text-green-600 font-bold">{job.conversionRate}</TableCell>
                    <TableCell className="text-blue-600 font-bold">${job.avgSalary.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">No jobs found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
