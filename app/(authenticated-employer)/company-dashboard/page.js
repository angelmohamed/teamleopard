"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Description } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";
import { Loader2 } from "lucide-react";

// We keep your param usage for job posting ID, but won't use it for fetching Employer info
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// The following are used for React-Quill's dynamic description box
import dynamic from 'next/dynamic'; //for desc box
import 'react-quill/dist/quill.snow.css'; //for desc box
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
  // const fetchJobListings = async () => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("Job_Posting")
  //       .select("*")
  //       .eq("company_ID", id) 
  //       .order("posted_at", { ascending: false });

  //     if (error) {
  //       throw error;
  //     }
  //     setJobListings(data);
  //   } catch (err) {
  //     console.error("Error fetching job listings:", err.message);
  //   }
  // };

  const fetchJobListings = async () => {
    if (!user) return;
  
    const { data, error } = await supabase
      .from("Job_Posting")
      .select("*") // simpler, flat structure
      .eq("company_ID", user.id)
      .order("posted_at", { ascending: false });
  
    if (error) {
      console.error("❌ Supabase fetch error:", error);
      return;
    }
  
    console.log("✅ Raw job postings:", data); // Check this in your browser dev tools
  
    // Format data for your cards
    const formatted = data.map((job) => ({
      posting_id: job.posting_id,
      title: job.title,
      location: job.location,
      views: job.views ?? 0,
      status: job.status || "open",
      company_name: "",        // omit for now – no join
      applicants: 0,           // omit for now – no join
    }));
  
    setJobListings(formatted);
  };
  
  
  
  

  // useEffect(() => {
  //   if (id) {
  //     fetchJobListings();
  //   }
  // }, [id]);


  useEffect(() => {
    if (user) {
      console.log("👤 Logged-in user ID:", user.id); // ✅ Add this line
      fetchJobListings();
    }
  }, [user]);
  
  
  
  // Create a new job posting, referencing param-based "id"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Basic validation
      if (!jobTitle.trim() || !description.trim() || !location.trim() || 
          !employmentType || !salaryRange.trim() || !deadline || !expectedSkills.trim()) {
        throw new Error("Please fill in all required fields");
      }

      // Validate deadline is not in the past
      const deadlineDate = new Date(deadline);
      if (deadlineDate < new Date()) {
        throw new Error("Deadline cannot be in the past");
      }

      // Create the job posting
      const { error: insertError } = await supabase
        .from("Job_Posting")
        .insert([
          {
            title: jobTitle.trim(),
            description: description.trim(),
            location: location.trim(),
            employment_type: employmentType,
            salary_range: salaryRange.trim(),
            deadline,
            expected_skills: expectedSkills.trim(),
            status,
            company_ID: user.id,
            posted_at: new Date().toISOString(),
          },
        ]);

      if (insertError) {
        throw new Error(insertError.message);
      }

      // Clear form on success
      setJobTitle("");
      setDescription("");
      setLocation("");
      setEmploymentType("");
      setSalaryRange("");
      setDeadline("");
      setExpectedSkills("");
      setStatus("open");
      
      setSuccess("Job posted successfully!");
      
      // Refresh job listings
      fetchJobListings();
    } catch (error) {
      console.error("Error posting job:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 5️⃣ If auth is loading or we haven't loaded company yet, show a fallback
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

  // modules for reactquill texbox
  const modules = {
    toolbar: [
      [{ 'size': ['normal', 'large'/*, 'huge'*/] }], // text sizes
      ['bold', 'italic', 'underline'], // text styles
      /*[{ 'list': 'ordered' }, { 'list': 'bullet' }],*/ //list options (incompatible?)
      ['clean'] // reset formatting
    ],
  };
  console.log("📋 jobListings state in render:", jobListings);

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
    {/* Optional chart placeholder */}
    <p className="mb-4">📊 Chart Goes Here</p>
    {jobListings.length === 0 ? (
  <p className="text-sm text-muted-foreground">You haven’t posted any jobs yet.</p>
) : (
  <div className="flex gap-4 overflow-x-auto pb-2">
    {jobListings.map((job) => (
      <Card
        key={job.posting_id}
        className="min-w-[240px] cursor-pointer hover:shadow-lg transition"
      >
        <CardContent className="p-4">
          <h4 className="font-semibold">{job.title}</h4>
          {/* <p className="text-sm text-muted-foreground">{job.company_name}</p> */}
          
          <p className="text-xs">{job.location}</p>
          <p className="text-xs mt-2">👁 {job.views} views</p>
          <p className="text-xs">📝 {job.applicants} applicants</p>
          <div className="text-right mt-2">
        <Link href={`/company-dashboard/stats/${job.posting_id}`}>
          <Button variant="outline" className="text-sm w-full">
            📊 View Stats
          </Button>
        </Link>
      </div>
        </CardContent>
      </Card>
    ))}
  </div>
)}

  </CardContent>
</Card>

          {/* Job Posting Form */}
          <div className="w-full bg-white p-6">
            <Card className="w-full shadow-lg rounded-lg">
              <CardHeader className="text-center border-b pb-4">
                <CardTitle className="text-2xl font-semibold">
                  List A Job
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {error && <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md">{error}</p>}
                {success && (
                  <p className="text-green-600 text-sm mb-4 p-3 bg-green-50 rounded-md">{success}</p>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="grid gap-6">
                    {/* Title and Employment Type row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Job Title</Label>
                        <Input
                          placeholder="e.g. Senior Software Engineer"
                          value={jobTitle}
                          onChange={(e) => setJobTitle(e.target.value)}
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
                          <option value="">Select employment type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Internship">Internship</option>
                          <option value="Remote">Remote</option>
                        </select>
                      </div>
                    </div>

                    {/* Location and Salary row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Location</Label>
                        <Input
                          type="text"
                          placeholder="e.g. London, UK or Remote"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label>Salary Range</Label>
                        <Input
                          type="text"
                          placeholder="e.g. £50,000 - £70,000 or $50k - $70k"
                          value={salaryRange}
                          onChange={(e) => setSalaryRange(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Description field */}
                    {/* OLD:
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        placeholder="Detailed job description, responsibilities, and requirements"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md min-h-[200px]"
                        rows="8"
                      />
                    </div>*/}
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <ReactQuill
                        id="description"
                        value={description}
                        onChange={setDescription}
                        /*onChange={(e) => setDescription(e.target.value)} <- this doesnt work*/
                        modules={modules}
                        placeholder="Detailed job description, responsibilities, and requirements"
                        style={{ minHeight: '3rem' }}
                      />
                    </div>

                    {/* Deadline and Status row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Application Deadline</Label>
                        <Input
                          type="date"
                          value={deadline}
                          onChange={(e) => setDeadline(e.target.value)}
                          required
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <select
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          required
                          className="w-full p-2 border border-gray-300 rounded-md"
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                          <option value="draft">Draft</option>
                        </select>
                      </div>
                    </div>

                    {/* Skills field */}
                    <div>
                      <Label>Expected Skills</Label>
                      <textarea
                        placeholder="List required skills, one per line"
                        value={expectedSkills}
                        onChange={(e) => setExpectedSkills(e.target.value)}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows="4"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Posting Job...
                        </div>
                      ) : (
                        'Post Job'
                      )}
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
