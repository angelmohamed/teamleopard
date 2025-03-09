"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // shadcn button
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient"; // Import Supabase client
import { Description } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";

export default function CompanyDashboard() {
  const [expanded, setExpanded] = useState(false);
  const [company, setCompany] = useState(null);
  const [jobTitle, setJobTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [salaryRange, setSalaryRange] = useState("");
  const [deadline, setDeadline] = useState("");
  const [expectedSkills, setExpectedSkills] = useState("");
  const [status, setStatus] = useState("open");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobListings, setJobListings] = useState([]); // State for job listings
  const param = useParams();
  const id = param.id; // Get the company ID from the URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error } = await supabase.from("Job_Posting").insert([
      {
        title: jobTitle,
        description,
        location,
        employment_type: employmentType,
        salary_range: salaryRange,
        deadline,
        expected_skills: expectedSkills,
        status,
        company_ID: id,  // Use the company_id from the URL parameter
        posted_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Job listing created successfully!");
      fetchJobListings(); // Fetch job listings again to update the list
    }

    setLoading(false);
  };

  // Fetch company data from Supabase
  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        // Fetch company data from the "Employer" table
        const { data, error } = await supabase
          .from("Employer") // Replace with the actual table name
          .select("company_name, company_description") // Columns you need
          .eq("id", id) // Use the id from the URL params
          .single(); // Get a single result (assuming id is unique)

        if (error) {
          throw error;
        }
        setCompany(data); // Set company data if fetch is successful
      } catch (error) {
        console.error("Error fetching company data:", error.message);
      }
    };

    if (id) {
      fetchCompanyData();
    }
  }, [id]);

  // Fetch job listings for the company
  const fetchJobListings = async () => {
    try {
      const { data, error } = await supabase
        .from("Job_Posting")
        .select("*")
        .eq("company_ID", id)
        .order("posted_at", { ascending: false });

      if (error) {
        throw error;
      }
      setJobListings(data);
    } catch (error) {
      console.error("Error fetching job listings:", error.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobListings();
    }
  }, [id]);

  const recentActivities = [
    "🟢 Jane Doe has applied for Frontend Developer",
    "🟡 Interview scheduled for Nash Shook",
    "🔵 3 new applications received for UX Designer",
    "🔵 4 new applications received for Senior VP",
    "🔵 3 new applications received for Toilet Opener",
    "🔵 5 new applications received for Backend Engineer", // Extra line (should be hidden initially)
  ];

  if (!company) return <p>Loading...</p>;

  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Company Dashboard</h1>

      {/* ✅ Two-column responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 📊 Left Column (Metrics + Charts) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">12 Days</p>
                <p className="text-sm text-gray-500">Avg Time to Fill Position</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{jobListings.length}</p>
                <p className="text-sm text-gray-500">Total Job Listings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {jobListings.filter((job) => job.status === "active").length}
                </p>
                <p className="text-sm text-gray-500">Active Job Listings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">8%</p>
                <p className="text-sm text-gray-500">Application Conversion Rate</p>
              </div>
            </CardContent>
          </Card>

          {/* Vacancy Start Chart (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Job Vacancy Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p>📊 Chart Goes Here</p>
            </CardContent>
          </Card>

          <div className="flex w-1/2 justify-center items-center bg-white p-10">
            <Card className="w-full max-w-md shadow-lg rounded-lg">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-semibold">List A Job</CardTitle>
              </CardHeader>
              <CardContent>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-4">
                    <div>
                      <Label>Job Title</Label>
                      <Input
                        placeholder="Enter Job Title"
                        onChange={(e) => setJobTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        placeholder="Enter Job Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows="4"
                      />
                    </div>
                    <div>
                      <Label>Location</Label>
                      <Input
                        type="text"
                        placeholder="Enter Job Location"
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Employment Type</Label>
                      <select
                        value={employmentType}
                        onChange={(e) => setEmploymentType(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select Employment Type</option>
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <Label>Salary Range</Label>
                      <Input
                        type="text"
                        placeholder="Enter Salary Range"
                        onChange={(e) => setSalaryRange(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Deadline</Label>
                      <Input
                        type="date"
                        onChange={(e) => setDeadline(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Expected Skills</Label>
                      <Input
                        type="text"
                        placeholder="Enter Expected Skills"
                        onChange={(e) => setExpectedSkills(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Listing Job..." : "Listing Job"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 📌 Right Column (User Profile + Recent Activity) */}
        <div className="flex flex-col gap-6">
          {/* Company Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>{company.company_name}</CardTitle> {/* Using company_name */}
              <p className="text-sm text-gray-500">HR Manager</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">{company.company_description}</p> {/* Using company_description */}
              <Button 
                className="w-full bg-blue-500 text-white py-2 rounded-md"
                onClick={() => window.location.href=`/company-dashboard/${id}/edit-profile`}
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* ✅ Recent Activity with 'Show More' */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex flex-col gap-4 ${expanded ? "" : "max-h-32 overflow-hidden"}`}>
                {recentActivities.map((activity, index) => (
                  <p key={index} className="text-sm">{activity}</p>
                ))}
              </div>

              {/* Show More / Show Less Button */}
              {recentActivities.length > 5 && (
                <Button
                  variant="ghost"
                  className="mt-2 w-full text-blue-500"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Show Less" : "Show More"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
