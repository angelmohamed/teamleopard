"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Check, Clock } from "lucide-react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const Dashboard = () => {
  const [employee, setEmployee] = useState(null);
  const [username, setUsername] = useState("");
  const param = useParams();
  const id = param.id;
  
  // States for real data from Supabase
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [jobOffers, setJobOffers] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [darkMode, setDarkMode] = useState(false);

  const [preferredCategory, setPreferredCategory] = useState("Tech");
  const [preferredLocation, setPreferredLocation] = useState("");
  const [receiveNotifications, setReceiveNotifications] = useState(true);

  // Fetch employee data when component mounts or id changes
  useEffect(() => {
    const fetchEmployeeData = async () => {
      const { data, error } = await supabase
        .from("Employee")
        .select("username") // Fetch only the username
        .eq("id", id)
        .single(); // Assuming you want a single employee

      if (error) {
        console.error("Error fetching employee:", error);
      } else {
        setEmployee(data); // Store entire employee data if needed
        setUsername(data?.username); // Set the username
      }
    };

    if (id) {
      fetchEmployeeData();
    }
  }, [id]);

  // Fetch upcoming deadlines (job postings with deadlines)
  useEffect(() => {
    const fetchUpcomingDeadlines = async () => {
      const { data, error } = await supabase
        .from("Job_Posting")
        .select("*")
        .order("deadline", { ascending: true })
        .limit(5);

      if (error) {
        console.error("Error fetching upcoming deadlines:", error);
      } else {
        // Transform the data to match our component's expected format
        const transformedData = data.map(job => {
          // Calculate days left or set to null if rolling deadline
          let daysLeft = null;
          if (job.deadline) {
            const deadline = new Date(job.deadline);
            const today = new Date();
            const diffTime = Math.abs(deadline - today);
            daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          }
          
          return {
            title: job.title,
            daysLeft: job.deadline ? daysLeft : null
          };
        });
        
        setUpcomingDeadlines(transformedData);
      }
    };

    fetchUpcomingDeadlines();
  }, []);

  // Fetch my applications
  useEffect(() => {
    const fetchMyApplications = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("Applications")
        .select(`
          *,
          Job_Posting(title)
        `)
        .eq("employee_ID", id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("Error fetching applications:", error);
      } else {
        // Transform the data to match our component's expected format
        const transformedData = data.map(app => {
          let info = "Awaiting response";
          if (app.interview_date) {
            info = `Interview on ${new Date(app.interview_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}`;
          } else if (app.status === 'offered') {
            info = "Offer received";
          } else if (app.status === 'rejected') {
            info = "Application rejected";
          }
          
          return {
            title: app.Job_Posting?.title || "Job",
            info: info
          };
        });
        
        setMyApplications(transformedData);
      }
    };

    fetchMyApplications();
  }, [id]);

  // Fetch job offers (all available job postings)
  useEffect(() => {
    const fetchJobOffers = async () => {
      const { data, error } = await supabase
        .from("Job_Posting")
        .select(`
          *,
          Employer(company_name)
        `)
        .eq("status", "active")
        .order("posted_at", { ascending: false });

      if (error) {
        console.error("Error fetching job offers:", error);
      } else {
        // Transform the data to match our component's expected format
        const transformedData = data.map(job => {
          return {
            title: job.title,
            location: job.location,
            hours: job.employment_type || "Full-time",
            salary: job.salary_range || "Not specified",
            company: job.Employer?.company_name || "Company",
            category: job.category || "Other",
            description: job.description || "No description available."
          };
        });
        
        setJobOffers(transformedData);
      }
    };

    fetchJobOffers();
  }, []);

  // Fetch applied jobs
  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("Applications")
        .select(`
          *,
          Job_Posting(
            title,
            location,
            employment_type,
            salary_range,
            Employer(company_name)
          )
        `)
        .eq("employee_ID", id);

      if (error) {
        console.error("Error fetching applied jobs:", error);
      } else {
        // Transform the data to match our component's expected format
        const transformedData = data.map(app => {
          let status = "applied";
          if (app.status === "interview") {
            status = "interview";
          } else if (app.status === "rejected") {
            status = "rejected";
          } else if (app.status === "offered" || app.status === "accepted") {
            status = "offer";
          }
          
          return {
            title: app.Job_Posting?.title || "Job",
            location: app.Job_Posting?.location || "Location",
            hours: app.Job_Posting?.employment_type || "Full-time",
            salary: app.Job_Posting?.salary_range || "Not specified",
            company: app.Job_Posting?.Employer?.company_name || "Company",
            status: status
          };
        });
        
        setAppliedJobs(transformedData);
      }
    };

    fetchAppliedJobs();
  }, [id]);

  const statusColors = {
    applied: "bg-gray-200 text-gray-800",
    interview: "bg-blue-200 text-blue-800",
    rejected: "bg-red-200 text-red-800",
    offer: "bg-green-200 text-green-800",
  };

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
      {/* TOP SECTION: USERNAME DISPLAY */}
      <div className="w-full max-w-4xl text-center mb-6">
        <h1 className="text-2xl font-semibold">
          Welcome, @{username || "Loading..."}
        </h1>
      </div>

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
              <label className="text-sm font-medium">
                Receive Notifications
              </label>
              <Switch
                checked={receiveNotifications}
                onCheckedChange={() =>
                  setReceiveNotifications(!receiveNotifications)
                }
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={() => window.location.href=`/dashboard/${id}/edit-profile`} 
              className="w-full"
            >
              Update Profile
            </Button>
          </CardFooter>
        </Card>

        {/* Your Upcoming Deadlines (Vertical List) */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Your upcoming deadlines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingDeadlines.length > 0 ? (
              upcomingDeadlines.map((deadline, index) => {
                const isRolling = deadline.daysLeft === null;
                const labelText = isRolling
                  ? "Rolling deadline"
                  : `${deadline.daysLeft} days left`;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="text-sm font-medium">{deadline.title}</div>
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
              })
            ) : (
              <div className="text-center text-gray-500">No deadlines found</div>
            )}
          </CardContent>
        </Card>

        {/* Your Applications (Vertical List with color-coded bubbles) */}
        <Card className="p-4">
          <CardHeader>
            <CardTitle>Your applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {myApplications.length > 0 ? (
              myApplications.map((app, index) => {
                const colorClasses = getApplicationInfoClasses(app.info);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md"
                  >
                    <div className="text-sm font-medium">{app.title}</div>
                    <div
                      className={`text-xs px-2 py-1 rounded-full ${colorClasses}`}
                    >
                      {app.info}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500">No applications found</div>
            )}
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
          <Switch
            checked={darkMode}
            onCheckedChange={() => setDarkMode(!darkMode)}
          />
        </div>
      </div>

      {/* JOB OFFERS SECTION */}
      <h2 className="text-2xl md:text-3xl font-bold w-full max-w-4xl text-left">
        Job Offers
      </h2>
      <div className="w-full max-w-4xl space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job, index) => (
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
                  <strong>Work Hours:</strong> {job.hours}
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
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">No job offers found matching your criteria</div>
        )}
      </div>

      {/* JOBS YOU'VE APPLIED TO SECTION */}
      <h2 className="text-2xl md:text-3xl font-bold w-full max-w-4xl text-left mt-10">
        Jobs {"you've"} applied to
      </h2>
      <div className="w-full max-w-4xl space-y-4">
        {appliedJobs.length > 0 ? (
          appliedJobs.map((job, index) => (
            <Card
              key={index}
              className={`p-4 md:p-6 shadow-md rounded-lg border ${
                statusColors[job.status]
              } `}
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
                  <strong>Work Hours:</strong> {job.hours}
                </p>
                <p className="font-semibold uppercase">{job.status}</p>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">You haven't applied to any jobs yet</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
