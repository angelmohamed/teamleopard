"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Description } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";

// We keep your param usage for job posting ID, but won't use it for fetching Employer info
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// 1️⃣ Local `useAuth` hook for session-based user
function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.warn("No user found; might redirect or show fallback...");
        setUser(null);
      } else {
        setUser(data.user);
      }
      setAuthLoading(false);
    }

    fetchUser();
  }, []);

  return { user, authLoading };
}

export default function CompanyDashboard() {
  // 2️⃣ Auth-based user instead of relying on the param
  const { user, authLoading } = useAuth();

  const param = useParams();
  const id = param.id; // ⬅ Still used for job postings, but NOT for employer data

  const [expanded, setExpanded] = useState(false);
  const [company, setCompany] = useState(null);

  // Form states
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

  // Job listings
  const [jobListings, setJobListings] = useState([]);

  // 3️⃣ Fetch the Employer row by user.id (session-based), not param
  useEffect(() => {
    if (!user) return; // If user is null, skip for now

    const fetchCompanyData = async () => {
      try {
        const { data, error } = await supabase
          .from("Employer")
          .select("company_name, company_description")
          .eq("id", user.id) // Employer table uses the same UUID as Auth user.id
          .single();

        if (error) throw error;
        setCompany(data);
      } catch (err) {
        console.error("Error fetching company data:", err.message);
      }
    };

    fetchCompanyData();
  }, [user]);

  // 4️⃣ (Unchanged) Job Postings use the param-based ID 
  //     if your DB expects "company_ID" to match the route
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
    } catch (err) {
      console.error("Error fetching job listings:", err.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobListings();
    }
  }, [id]);

  // Create a new job posting, referencing param-based "id"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: insertError } = await supabase.from("Job_Posting").insert([
      {
        title: jobTitle,
        description,
        location,
        employment_type: employmentType,
        salary_range: salaryRange,
        deadline,
        expected_skills: expectedSkills,
        status,
        company_ID: id, // param-based ID
        posted_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess("Job listing created successfully!");
      fetchJobListings(); 
    }
    setLoading(false);
  };

  // 5️⃣ If auth is loading or we haven’t loaded company yet, show a fallback
  if (authLoading) return <p>Loading...</p>;

  // If we didn't fetch a company row yet, also show a basic "Loading..."
  if (!company) return <p>Loading...</p>;

  // Mocked recent activity
  const recentActivities = [
    "🟢 Jane Doe has applied for Frontend Developer",
    "🟡 Interview scheduled for Nash Shook",
    "🔵 3 new applications received for UX Designer",
    "🔵 4 new applications received for Senior VP",
    "🔵 3 new applications received for Toilet Opener",
    "🔵 5 new applications received for Backend Engineer", 
  ];

  // 6️⃣ The rest of your UI is untouched
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
                <p className="text-sm text-gray-500">
                  Avg Time to Fill Position
                </p>
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
                <p className="text-sm text-gray-500">
                  Application Conversion Rate
                </p>
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
                <CardTitle className="text-2xl font-semibold">
                  List A Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
                {success && (
                  <p className="text-green-600 text-sm mb-2">{success}</p>
                )}
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
              <CardTitle>{company.company_name}</CardTitle>
              <p className="text-sm text-gray-500">HR Manager</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                {company.company_description}
              </p>
              <Button
                className="w-full bg-blue-500 text-white py-2 rounded-md"
                onClick={() =>
                  window.location.href = `/company-dashboard/${id}/edit-profile`
                }
              >
                Update Profile
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity w/ Show More */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`flex flex-col gap-4 ${
                  expanded ? "" : "max-h-32 overflow-hidden"
                }`}
              >
                {recentActivities.map((activity, index) => (
                  <p key={index} className="text-sm">
                    {activity}
                  </p>
                ))}
              </div>

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
