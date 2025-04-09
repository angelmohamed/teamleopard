"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Local useAuth hook for session-based authentication
function useAuth() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        console.warn("No user found");
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

export default function EmployerApplicationsPage() {
  const { user, authLoading } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch applications with joins on Job_Posting and Employee.
  // (Make sure your Supabase schema has foreign key relationships defined.)
  const fetchApplications = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("Applications")
      .select(`
        Application_id,
        created_at,
        status,
        cover_letter,
        employee_ID,
        Employee(first_name, last_name),
        Job_Posting(posting_id, title, description, location, company_ID)
      `)
      // .eq("Job_Posting.company_ID", user.id);

    if (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    } else {
      console.log("Applications data:", data);
      setApplications(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  if (authLoading) return <p>Loading authentication...</p>;
  if (!user) return <p>You must be logged in to view your applications.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Applications Received</h1>
      {loading ? (
        <p>Loading applications...</p>
      ) : applications.length === 0 ? (
        <p>No applications received yet.</p>
      ) : (
        // Responsive grid: one column on small screens, two columns on medium+ screens
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {applications.map((app) => {
            // Use a fallback to check both possible keys for Employee data.
            const employeeData = app.Employee || app.employee;
            // Build the applicant's name based on the available data.
            const applicantName =
              employeeData && employeeData.first_name
                ? employeeData.last_name && employeeData.last_name.trim() !== ""
                  ? `${employeeData.first_name} ${employeeData.last_name}`
                  : employeeData.first_name
                : app.employee_ID;
            const jobPosting = app.Job_Posting || app.job_posting;
            return (
              <Card key={app.Application_id} className="shadow rounded-lg overflow-hidden">
                <CardHeader className="bg-white p-4 flex flex-col md:flex-row justify-between items-start md:items-center border-b">
                  <div>
                    <CardTitle className="text-lg font-bold mb-1">
                      {jobPosting?.title || `Job #${jobPosting?.posting_id || "N/A"}`}
                    </CardTitle>
                    <p className="text-xs text-gray-500">
                      Received on: {new Date(app.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      Applicant: {applicantName}
                    </p>
                  </div>
                  <div className="mt-3 md:mt-0">
                    <Link href={`/send-request/${app.Application_id}`}>
                      <Button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                        Send Request
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  {app.cover_letter ? (
                    <p className="text-gray-700 text-sm">
                      <strong>Cover Letter:</strong> {app.cover_letter}
                    </p>
                  ) : (
                    <p className="text-gray-700 text-sm">No cover letter provided.</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}



// "use client";
// import React, { useState, useEffect, useCallback } from "react";
// import Link from "next/link";
// import { supabase } from "@/lib/supabaseClient";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";

// // Local useAuth hook for session-based authentication
// function useAuth() {
//   const [user, setUser] = useState(null);
//   const [authLoading, setAuthLoading] = useState(true);

//   useEffect(() => {
//     async function fetchUser() {
//       const { data, error } = await supabase.auth.getUser();
//       if (error || !data?.user) {
//         console.warn("No user found");
//         setUser(null);
//       } else {
//         setUser(data.user);
//       }
//       setAuthLoading(false);
//     }
//     fetchUser();
//   }, []);

//   return { user, authLoading };
// }

// export default function EmployerApplicationsPage() {
//   const { user, authLoading } = useAuth();
//   const [applications, setApplications] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch applications where the Job_Posting belongs to the logged-in employer.
//   // This uses a join to pull in job details (e.g. title, description, location).
//   const fetchApplications = useCallback(async () => {
//     if (!user) return;
//     setLoading(true);
//     const { data, error } = await supabase
//       .from("Applications")
//       .select(`
//         Application_id,
//         created_at,
//         status,
//         cover_letter,
//         employee_ID,
//         Job_Posting(
//           posting_id,
//           title,
//           description,
//           location,
//           company_ID
//         )
//       `)
//       // Filter so that only applications for job postings owned by this employer are returned.
//       .eq("Job_Posting.company_ID", user.id);

//     if (error) {
//       console.error("Error fetching applications:", error);
//       setApplications([]);
//     } else {
//       setApplications(data);
//     }
//     setLoading(false);
//   }, [user]);

//   useEffect(() => {
//     if (user) {
//       fetchApplications();
//     }
//   }, [user, fetchApplications]);

//   if (authLoading) return <p>Loading authentication...</p>;
//   if (!user) return <p>You must be logged in to view your applications.</p>;

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <h1 className="text-2xl font-bold mb-4">Applications Received</h1>
//       {loading ? (
//         <p>Loading applications...</p>
//       ) : applications.length === 0 ? (
//         <p>No applications received yet.</p>
//       ) : (
//         <div className="grid grid-cols-1 gap-4">
//           {applications.map((app) => (
//             <Card key={app.Application_id}>
//               <CardHeader className="flex justify-between items-center">
//                 {/* Left side: Job information */}
//                 <div>
//                   <CardTitle className="text-lg font-semibold">
//                     {app.Job_Posting?.title || `Job #${app.Job_Posting?.posting_id}`}
//                   </CardTitle>
//                   <p className="text-xs text-gray-500">
//                     Received on: {new Date(app.created_at).toLocaleDateString()}
//                   </p>
//                 </div>
//                 {/* Right side: Button for sending request */}
//                 <div>
//                   <Button
//                     as="a"
//                     href={`/applications/request/${app.Application_id}`}
//                     className="bg-blue-500 hover:bg-blue-600 text-white rounded px-3 py-1 text-sm"
//                   >
//                     Send Request
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 {app.cover_letter ? (
//                   <p className="text-gray-700 text-sm">
//                     <strong>Cover Letter:</strong> {app.cover_letter}
//                   </p>
//                 ) : (
//                   <p className="text-gray-700 text-sm">No cover letter provided.</p>
//                 )}
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }
