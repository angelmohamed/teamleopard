"use client";

// export default JobList;
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const jobOffers = [
  { title: "Software Engineer", location: "London, UK", hours: 40, salary: "£50,000", company: "Google", category: "Tech", description: "Work on scalable software solutions." },
  { title: "Data Analyst", location: "Manchester, UK", hours: 35, salary: "£42,000", company: "Amazon", category: "Data", description: "Analyze and visualize complex datasets." },
  { title: "UX Designer", location: "Remote", hours: 30, salary: "£38,000", company: "Facebook", category: "Design", description: "Design user-friendly interfaces and experiences." },
  { title: "Project Manager", location: "Birmingham, UK", hours: 40, salary: "£55,000", company: "Microsoft", category: "Management", description: "Lead and coordinate software development teams." }
];

const appliedJobs = [
  { title: "Cybersecurity Analyst", location: "Remote", hours: 36, salary: "£58,000", company: "IBM", status: "applied" },
  { title: "QA Engineer", location: "Cardiff, UK", hours: 35, salary: "£46,000", company: "Adobe", status: "interview" },
  { title: "Network Engineer", location: "Newcastle, UK", hours: 40, salary: "£50,000", company: "Cisco", status: "rejected" },
  { title: "Data Scientist", location: "Glasgow, UK", hours: 37, salary: "£55,000", company: "Tesla", status: "offer" }
];

const statusColors = {
  applied: "bg-gray-600",
  interview: "bg-blue-500",
  rejected: "bg-red-600",
  offer: "bg-green-600"
};

const JobList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  const filteredJobs = jobOffers.filter(job =>
    (categoryFilter === "All" || job.category === categoryFilter) &&
    job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen flex flex-col items-center ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} p-6 md:p-10 space-y-6 md:space-y-10`}>
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full max-w-4xl border p-4 bg-gray-50 shadow-md rounded-md">
        <Input type="text" placeholder="Job title, company, or keyword" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="p-3 border rounded-md w-full md:w-1/2" />
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="p-3 border rounded-md w-full md:w-1/4">
          <option value="All">All Categories</option>
          <option value="Tech">Tech</option>
          <option value="Data">Data</option>
          <option value="Design">Design</option>
          <option value="Management">Management</option>
        </Select>
        <div className="flex items-center space-x-2">
          <span>Dark Mode</span>
          <Switch checked={darkMode} onCheckedChange={() => setDarkMode(!darkMode)} />
        </div>
      </div>
      <h2 className="text-2xl md:text-3xl font-bold w-full max-w-4xl text-left">Job Offers</h2>
      <div className="w-full max-w-4xl space-y-4">
        {filteredJobs.map((job, index) => (
          <Card key={index} className="p-4 md:p-6 shadow-md bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">{job.title}</CardTitle>
              <p className="text-sm text-gray-500">{job.company} - {job.location}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700 text-sm">{job.description}</p>
              <p className="text-gray-600 text-sm"><strong>Salary:</strong> {job.salary}</p>
              <p className="text-gray-600 text-sm"><strong>Work Hours:</strong> {job.hours} hrs/week</p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="default" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Apply</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <h2 className="text-2xl md:text-3xl font-bold w-full max-w-4xl text-left mt-10">Jobs You've Applied To</h2>
      <div className="w-full max-w-4xl space-y-4">
        {appliedJobs.map((job, index) => (
          <Card key={index} className={`p-4 md:p-6 shadow-md rounded-lg border ${statusColors[job.status]} text-white`}> 
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">{job.title}</CardTitle>
              <p className="text-sm">{job.company} - {job.location}</p>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Salary:</strong> {job.salary}</p>
              <p><strong>Work Hours:</strong> {job.hours} hrs/week</p>
              <p className="font-semibold uppercase">{job.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobList;

