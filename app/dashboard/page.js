// import React from "react";
// import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// const jobOffers = [
//   { title: "Software Engineer", location: "London, UK", hours: 40, salary: "£50,000" },
//   { title: "Data Analyst", location: "Manchester, UK", hours: 35, salary: "£42,000" },
//   { title: "UX Designer", location: "Remote", hours: 30, salary: "£38,000" },
//   { title: "Project Manager", location: "Birmingham, UK", hours: 40, salary: "£55,000" },
//   { title: "DevOps Engineer", location: "Edinburgh, UK", hours: 37, salary: "£52,000" },
//   { title: "Product Manager", location: "Liverpool, UK", hours: 40, salary: "£60,000" },
//   { title: "Frontend Developer", location: "Bristol, UK", hours: 35, salary: "£45,000" },
//   { title: "Backend Developer", location: "Oxford, UK", hours: 38, salary: "£48,000" }
// ];

// const appliedJobs = [
//   { title: "Data Scientist", location: "Glasgow, UK", hours: 37, salary: "£55,000", status: "pending" },
//   { title: "Network Engineer", location: "Newcastle, UK", hours: 40, salary: "£50,000", status: "rejected" },
//   { title: "Cybersecurity Analyst", location: "Remote", hours: 36, salary: "£58,000", status: "accepted" },
//   { title: "QA Engineer", location: "Cardiff, UK", hours: 35, salary: "£46,000", status: "waiting" }
// ];

// const statusColors = {
//   pending: "bg-gray-500",
//   rejected: "bg-red-500",
//   accepted: "bg-green-500",
//   waiting: "bg-orange-500"
// };

// const JobList = () => {
//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
//       <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center w-full">Available Job Listings</h2>
//       <div className="grid grid-cols-4 gap-4 mb-10">
//         {jobOffers.map((job, index) => (
//           <Card key={index} className="p-6 shadow-md bg-white">
//             <CardHeader>
//               <CardTitle className="text-xl font-semibold text-gray-800">{job.title}</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-gray-600"><strong>Location:</strong> {job.location}</p>
//               <p className="text-gray-600"><strong>Work Hours:</strong> {job.hours} hrs/week</p>
//               <p className="text-gray-600"><strong>Starting Salary:</strong> {job.salary}</p>
//             </CardContent>
//             <CardFooter>
//               <Button variant="default" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Apply</Button>
//             </CardFooter>
//           </Card>
//         ))}
//       </div>
      
//       <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center w-full">Jobs You've Applied To</h2>
//       <div className="grid grid-cols-4 gap-4">
//         {appliedJobs.map((job, index) => (
//           <Card key={index} className="p-6 shadow-md bg-white border-t-4 {statusColors[job.status]}">
//             <CardHeader>
//               <CardTitle className="text-xl font-semibold text-gray-800">{job.title}</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <p className="text-gray-600"><strong>Location:</strong> {job.location}</p>
//               <p className="text-gray-600"><strong>Work Hours:</strong> {job.hours} hrs/week</p>
//               <p className="text-gray-600"><strong>Starting Salary:</strong> {job.salary}</p>
//             </CardContent>
//             <CardFooter>
//               <span className={`text-white text-sm px-3 py-1 rounded-md ${statusColors[job.status]}`}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
//             </CardFooter>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// };

"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const jobOffers = [
  { title: "Software Engineer", location: "London, UK", hours: 40, salary: "£50,000", company: "Google", category: "Tech" },
  { title: "Data Analyst", location: "Manchester, UK", hours: 35, salary: "£42,000", company: "Amazon", category: "Data" },
  { title: "UX Designer", location: "Remote", hours: 30, salary: "£38,000", company: "Facebook", category: "Design" },
  { title: "Project Manager", location: "Birmingham, UK", hours: 40, salary: "£55,000", company: "Microsoft", category: "Management" }
];

const appliedJobs = [
  { title: "Cybersecurity Analyst", location: "Remote", hours: 36, salary: "£58,000", company: "IBM", status: "pending" },
  { title: "QA Engineer", location: "Cardiff, UK", hours: 35, salary: "£46,000", company: "Adobe", status: "accepted" },
  { title: "Network Engineer", location: "Newcastle, UK", hours: 40, salary: "£50,000", company: "Cisco", status: "rejected" },
  { title: "Data Scientist", location: "Glasgow, UK", hours: 37, salary: "£55,000", company: "Tesla", status: "waiting" }
];

const statusColors = {
  pending: "bg-gray-500",
  rejected: "bg-red-500",
  accepted: "bg-green-500",
  waiting: "bg-orange-500"
};

const JobList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col items-center ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"} p-10 space-y-10`}>
      <div className="flex items-center space-x-4">
        <span className="text-lg font-semibold">Dark Mode</span>
        <Switch checked={darkMode} onCheckedChange={() => setDarkMode(!darkMode)} />
      </div>
      <h2 className="text-3xl font-bold">Available Job Listings</h2>
      <div className="grid grid-cols-4 gap-6">
        {jobOffers.map((job, index) => (
          <Card key={index} className="p-6 shadow-lg bg-white rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{job.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Work Hours:</strong> {job.hours} hrs/week</p>
              <p><strong>Starting Salary:</strong> {job.salary}</p>
            </CardContent>
            <CardFooter>
              <Button variant="default">Apply</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <h2 className="text-3xl font-bold mt-10">Jobs You've Applied To</h2>
      <div className="grid grid-cols-4 gap-6">
        {appliedJobs.map((job, index) => (
          <Card key={index} className={`p-6 shadow-lg bg-white rounded-xl border-t-4 ${statusColors[job.status]}`}> 
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{job.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Company:</strong> {job.company}</p>
              <p><strong>Location:</strong> {job.location}</p>
              <p><strong>Work Hours:</strong> {job.hours} hrs/week</p>
              <p><strong>Starting Salary:</strong> {job.salary}</p>
            </CardContent>
            <CardFooter>
              <span className={`text-white px-3 py-1 rounded-md ${statusColors[job.status]}`}>{job.status.charAt(0).toUpperCase() + job.status.slice(1)}</span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobList;

