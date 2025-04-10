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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";

// We keep your param usage for job posting ID, but won't use it for fetching Employer info
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

// The following are used for React-Quill's dynamic description box
import dynamic from "next/dynamic"; //for desc box
import "react-quill/dist/quill.snow.css"; //for desc box
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

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
  const { user, authLoading } = useAuth();
  const param = useParams();
  const id = param.id;

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

  const [jobListings, setJobListings] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const fetchJobListings = async () => {
    if (!id) return;

    const { data, error } = await supabase
      .from("Job_Posting")
      .select("*")
      .eq("company_ID", id)
      .order("posted_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase fetch error:", error);
      return;
    }

    console.log("✅ Raw job postings:", data);

    const formatted = data.map((job) => ({
      posting_id: job.posting_id,
      title: job.title,
      location: job.location,
      views: job.views ?? 0,
      status: job.status || "open",
      company_name: "",
      applicants: 0,
    }));

    setJobListings(formatted);
  };

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from('Applications')
      .select(`
        *,
        Job_Posting!inner (
          title,
          description,
          location,
          employment_type,
          salary_range
        ),
        Employee!inner (
          first_name,
          last_name,
          email,
          phone_num
        )
      `)
      .eq('Job_Posting.company_ID', id);

    if (error) {
      console.error('Error fetching applications:', error);
      return;
    }

    console.log('Fetched applications:', data?.length);
    setApplications(data || []);
    setLoadingApplications(false);
  };

  useEffect(() => {
    if (id) {
      console.log("👤 Company ID from URL:", id);
      fetchJobListings();
      fetchApplications();
    }
  }, [id]);

  // Also update the company data fetch to use the id parameter
  useEffect(() => {
    if (!id) return;

    const fetchCompanyData = async () => {
      try {
        const { data, error } = await supabase
          .from("Employer")
          .select("company_name, company_description")
          .eq("id", id)
          .single();

        if (error) throw error;
        setCompany(data);
      } catch (err) {
        console.error("Error fetching company data:", err.message);
      }
    };

    fetchCompanyData();
  }, [id]);

  // Create a new job posting, referencing param-based "id"
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Basic validation
      if (
        !jobTitle.trim() ||
        !description.trim() ||
        !location.trim() ||
        !employmentType ||
        !salaryRange.trim() ||
        !deadline ||
        !expectedSkills.trim()
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Validate deadline is not in the past
      const deadlineDate = new Date(deadline);
      if (deadlineDate < new Date()) {
        throw new Error("Deadline cannot be in the past");
      }

      // Create the job posting
      const { error: insertError } = await supabase.from("Job_Posting").insert([
        {
          title: jobTitle.trim(),
          description: description.trim(),
          location: location.trim(),
          employment_type: employmentType,
          salary_range: salaryRange.trim(),
          deadline,
          expected_skills: expectedSkills.trim(),
          status,
          company_ID: id,
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

  const [notificationList, setNotificationList] = useState([]);
  const [notiLimit, setNotiLimit] = useState(4);
  const [loadingNotis, setLoadingNotis] = useState(true);

  useEffect(() => {
    if (!id) return;
    //fetch notification info
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("Notifications")
        .select(`*`)
        .eq("employer_receiver_id", id)
        .eq("hidden", false) //hide hidden notis
        .order("created_at", { ascending: false }); //newest notis first
      //console.log("Notifications data:", data, "Error:", error);
      if (!error && data) {
        setNotificationList(data);
      }
      setLoadingNotis(false);
    };

    fetchNotifications();
  }, [id, notiLimit]); //run when user or limit changes

  // Published Date Formatting for notifications
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false, // 24-hour
      timeZone: "UTC",
    }).format(date);
  };

  const formatDateShort = (isoString) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  // Increase 'notiLimit' by 4 to load 4 more notificaitons
  const handleLoadMoreNotis = () => {
    setNotiLimit((prev) => prev + 4);
    console.log(notiLimit);
  };

  // Mocked recent activity
  /*const recentActivities = [
    "🟢 Jane Doe has applied for Frontend Developer",
    "🟡 Interview scheduled for Nash Shook",
    "🔵 3 new applications received for UX Designer",
    "🔵 4 new applications received for Senior VP",
    "🔵 3 new applications received for Toilet Opener",
    "🔵 5 new applications received for Backend Engineer", 
  ];*/

  // Add this new function to handle status updates
  const handleStatusUpdate = async (applicationId, newStatus) => {
    setUpdatingStatus(applicationId);
    try {
      const { error } = await supabase
        .from('Applications')
        .update({ status: newStatus })
        .eq('Application_id', applicationId);

      if (error) throw error;

      // Update local state to reflect the change
      setApplications(applications.map(app => 
        app.Application_id === applicationId 
          ? { ...app, status: newStatus }
          : app
      ));

    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // 5️⃣ If auth is loading or we haven't loaded company yet, show a fallback
  if (authLoading) return <p>Loading...</p>;

  // If we didn't fetch a company row yet, also show a basic "Loading..."
  if (!company) return <p>Loading...</p>;

  // modules for reactquill texbox
  const modules = {
    toolbar: [
      [{ size: ["normal", "large" /*, 'huge'*/] }], // text sizes
      ["bold", "italic", "underline"], // text styles
      /*[{ 'list': 'ordered' }, { 'list': 'bullet' }],*/ //list options (incompatible?)
      ["clean"], // reset formatting
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
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t posted any jobs yet.
                </p>
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
                        <p className="text-xs">
                          📝 {job.applicants} applicants
                        </p>
                        <div className="text-right mt-2">
                        <Link href={`/company-dashboard/${id}/stats/${job.posting_id}`}>

                            <Button
                              variant="outline"
                              className="text-sm w-full"
                            >
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

          {/* Add Applications section before Job Posting Form */}
          <Card>
            <CardHeader>
              <CardTitle>Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingApplications ? (
                <p className="text-muted-foreground">Loading applications...</p>
              ) : applications.length === 0 ? (
                <p className="text-center text-muted-foreground italic">
                  No applications received yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <Card key={app.Application_id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div>
                            <h4 className="font-semibold text-lg">{app.Job_Posting.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {app.Job_Posting.location} • {app.Job_Posting.employment_type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Salary Range: {app.Job_Posting.salary_range}
                            </p>
                          </div>
                          <div className="pt-2">
                            <h5 className="font-medium">Applicant Details</h5>
                            <p className="text-sm">
                              {app.Employee.first_name} {app.Employee.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              📧 {app.Employee.email}
                            </p>
                            {app.Employee.phone_num && (
                              <p className="text-sm text-muted-foreground">
                                📱 {app.Employee.phone_num}
                              </p>
                            )}
                          </div>
                          <p className="text-sm">
                            Applied: {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {updatingStatus === app.Application_id ? (
                            <div className="flex items-center">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          ) : (
                            <>
                              <select
                                value={app.status || 'pending'}
                                onChange={(e) => handleStatusUpdate(app.Application_id, e.target.value)}
                                className={`p-1 rounded-md text-sm border ${
                                  app.status === 'Accepted' ? 'bg-green-100 border-green-300' :
                                  app.status === 'Rejected' ? 'bg-red-100 border-red-300' :
                                  app.status === 'Interview Process' ? 'bg-blue-100 border-blue-300' :
                                  'bg-gray-100 border-gray-300'
                                }`}
                              >
                                <option value="pending">Pending</option>
                                <option value="Accepted">Accepted</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Interview Process">Interview Process</option>
                              </select>
                              <Badge
                                variant={
                                  app.status === 'Accepted' ? 'success' :
                                  app.status === 'Rejected' ? 'destructive' :
                                  app.status === 'Interview Process' ? 'default' :
                                  'secondary'
                                }
                                className="ml-2"
                              >
                                {app.status || 'Pending'}
                              </Badge>
                            </>
                          )}
                        </div>
                      </div>
                      {app.cover_letter && (
                        <div className="mt-4">
                          <p className="text-sm font-medium">Cover Letter:</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {app.cover_letter}
                          </p>
                        </div>
                      )}
                      {app.resume_file_name && (
                        <div className="mt-2">
                          <p className="text-sm">
                            Resume: {app.resume_file_name}
                          </p>
                        </div>
                      )}
                      <div className="mt-4">
                        <p className="text-sm font-medium">Job Description:</p>
                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                          {app.Job_Posting.description ? 
                            app.Job_Posting.description.replace(/<[^>]*>/g, '').replace(/\n/g, ', ') : 
                            'No description available'}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Posting Form */}
          <div className="w-full bg-white">
            <Card className="w-full shadow-lg rounded-lg">
              <CardHeader className="text-center border-b pb-4">
                <CardTitle className="text-2xl font-semibold">
                  List A Job
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {error && (
                  <p className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-green-600 text-sm mb-4 p-3 bg-green-50 rounded-md">
                    {success}
                  </p>
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
                        style={{ minHeight: "3rem" }}
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
                          min={new Date().toISOString().split("T")[0]}
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
                        "Post Job"
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
                onClick={() => (window.location.href = `/edit-company-profile`)}
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
              {loadingNotis ? (
                <p>Loading...</p>
              ) : notificationList.length == 0 ? (
                <p>No activity yet.</p>
              ) : (
                <div>
                  <div className={`flex flex-col gap-4`}>
                    {notificationList
                      .slice(0, notiLimit) //limits to notiLimit
                      .map((notification, index) => (
                        <Link key={index} href={notification.link}>
                          <p className="text-sm text-black hover:underline">
                            {notification.title} {notification.content}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(notification.created_at)} UTC.
                          </p>
                        </Link>
                      ))}
                  </div>
                  {notificationList.length > notiLimit && (
                    <Button
                      variant="ghost"
                      className="mt-2 w-full text-blue-500"
                      onClick={() => handleLoadMoreNotis()}
                    >
                      Show More
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
