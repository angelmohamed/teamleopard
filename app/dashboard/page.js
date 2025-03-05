"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check, Clock } from "lucide-react";


const upcomingDeadlines = [
  { title: "Supply Chain Placement 2025", daysLeft: 2 },
  { title: "Industrial Placements and Internships London", daysLeft: null },
  { title: "Data Analyst Placement Ipswich 2025", daysLeft: null },
];


const myApplications = [
  { title: "Finance Internship 2025", info: "Interview on Mar 10" },
  { title: "Marketing Internship 2025", info: "Awaiting response" },
  { title: "Engineering Placement 2025", info: "Offer received" },
];


const statusColors = {
  applied: "bg-gray-200 text-gray-800",
  interview: "bg-blue-200 text-blue-800",
  rejected: "bg-red-200 text-red-800",
  offer: "bg-green-200 text-green-800",
};

const jobOffers = [
  { title: "Software Engineer", location: "London, UK", hours: 40, salary: "£50,000", company: "Google", category: "Tech", description: "Work on scalable software solutions." },
  { title: "Data Analyst", location: "Manchester, UK", hours: 35, salary: "£42,000", company: "Amazon", category: "Data", description: "Analyze and visualize complex datasets." },
  { title: "UX Designer", location: "Remote", hours: 30, salary: "£38,000", company: "Facebook", category: "Design", description: "Design user-friendly interfaces and experiences." },
  { title: "Project Manager", location: "Birmingham, UK", hours: 40, salary: "£55,000", company: "Microsoft", category: "Management", description: "Lead and coordinate software development teams." },
];

const appliedJobs = [
  { title: "Cybersecurity Analyst", location: "Remote", hours: 36, salary: "£58,000", company: "IBM", status: "applied" },
  { title: "QA Engineer", location: "Cardiff, UK", hours: 35, salary: "£46,000", company: "Adobe", status: "interview" },
  { title: "Network Engineer", location: "Newcastle, UK", hours: 40, salary: "£50,000", company: "Cisco", status: "rejected" },
  { title: "Data Scientist", location: "Glasgow, UK", hours: 37, salary: "£55,000", company: "Tesla", status: "offer" },
];

// Helper function for application bubbles in "Your applications" box
function getApplicationInfoClasses(info) {
  const infoLower = info.toLowerCase();
  if (infoLower.includes("interview")) {
    return "bg-blue-200 text-blue-800";
  } else if (infoLower.includes("awaiting")) {
    return "bg-gray-200 text-gray-800";
  } else if (infoLower.includes("offer")) {
    return "bg-green-200 text-green-800";
  }
  return "bg-gray-200 text-gray-800";
}

const JobList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  
  const [preferredCategory, setPreferredCategory] = useState("Tech");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [receiveNotifications, setReceiveNotifications] = useState(true);

  const filteredJobs = jobOffers.filter(
    (job) =>
      (categoryFilter === "All" || job.category === categoryFilter) &&
      job.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div
      className={`min-h-screen flex flex-col items-center ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      } p-6 md:p-10 space-y-6 md:space-y-10`}
    >
      {/* TOP SECTION: THREE BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {/* Employee Preferences Box */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Employee Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Preferred Category
              </label>
              <Select
                value={preferredCategory}
                onChange={(e) => setPreferredCategory(e.target.value)}
              >
                <option value="Tech">Tech</option>
                <option value="Data">Data</option>
                <option value="Design">Design</option>
                <option value="Management">Management</option>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Preferred Location
              </label>
              <Input
                type="text"
                placeholder="Enter location"
                value={preferredLocation}
                onChange={(e) => setPreferredLocation(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Receive Notifications</label>
              <Switch
                checked={receiveNotifications}
                onCheckedChange={() => setReceiveNotifications(!receiveNotifications)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Update Preferences</Button>
          </CardFooter>
        </Card>

        {/* Your Upcoming Deadlines (Vertical List) */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Your upcoming deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.map((deadline, index) => {
              const isRolling = deadline.daysLeft === null;
              const labelText = isRolling
                ? "Rolling deadline"
                : `${deadline.daysLeft} days left`;

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="text-sm font-medium">
                    {deadline.title}
                  </div>
                  <div className="flex items-center space-x-2">
                    {isRolling ? (
                      <span className="bg-gray-200 text-gray-800 text-xs py-1 px-2 rounded-full">
                        {labelText}
                      </span>
                    ) : (
                      <div className="flex items-center space-x-1 text-blue-800 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{labelText}</span>
                      </div>
                    )}
                    <Button variant="outline" size="sm">
                      <Check className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Your Applications (Vertical List with color-coded bubbles) */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Your applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myApplications.map((app, index) => {
              const colorClasses = getApplicationInfoClasses(app.info);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="text-sm font-medium">{app.title}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${colorClasses}`}>
                    {app.info}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* EXISTING SEARCH / FILTER BAR */}
      <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4 w-full max-w-4xl border p-4 bg-gray-50 shadow-md rounded-md">
        <Input
          type="text"
          placeholder="Job title, company, or keyword"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-3 border rounded-md w-full md:w-1/2"
        />
        <Select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="p-3 border rounded-md w-full md:w-1/4"
        >
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

      {/* JOB OFFERS SECTION */}
      <h2 className="text-2xl md:text-3xl font-bold w-full max-w-4xl text-left">
        Job Offers
      </h2>
      <div className="w-full max-w-4xl space-y-4">
        {filteredJobs.map((job, index) => (
          <Card
            key={index}
            className="p-4 md:p-6 shadow-md bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">
                {job.title}
              </CardTitle>
              <p className="text-sm text-gray-500">
                {job.company} - {job.location}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-700 text-sm">{job.description}</p>
              <p className="text-gray-600 text-sm">
                <strong>Salary:</strong> {job.salary}
              </p>
              <p className="text-gray-600 text-sm">
                <strong>Work Hours:</strong> {job.hours} hrs/week
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                variant="default"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Apply
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* JOBS YOU'VE APPLIED TO SECTION */}
      <h2 className="text-2xl md:text-3xl font-bold w-full max-w-4xl text-left mt-10">
        Jobs {"you've"} applied to
      </h2>
      <div className="w-full max-w-4xl space-y-4">
        {appliedJobs.map((job, index) => (
          <Card
            key={index}
            className={`p-4 md:p-6 shadow-md rounded-lg border ${statusColors[job.status]} `}
          >
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold">
                {job.title}
              </CardTitle>
              <p className="text-sm">
                {job.company} - {job.location}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                <strong>Salary:</strong> {job.salary}
              </p>
              <p>
                <strong>Work Hours:</strong> {job.hours} hrs/week
              </p>
              <p className="font-semibold uppercase">{job.status}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobList;