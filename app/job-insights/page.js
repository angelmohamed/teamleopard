// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Switch } from "@/components/ui/switch";
// import { motion } from "framer-motion";
// import { TrendingUp } from "lucide-react";

// const jobData = [
//   { id: 1, title: "Software Engineer", views: 1200, applicants: 80, avgSalary: 90000 },
//   { id: 2, title: "UI/UX Designer", views: 850, applicants: 45, avgSalary: 75000 },
//   { id: 3, title: "Marketing Manager", views: 600, applicants: 30, avgSalary: 68000 },
// ];

// const jobInsights = jobData.map((job) => ({
//   ...job,
//   conversionRate: ((job.applicants / job.views) * 100).toFixed(2) + "%",
// }));

// function calculateAverageSalary(jobs) {
//   if (jobs.length === 0) return 0;
//   const totalSalary = jobs.reduce((sum, job) => sum + job.avgSalary, 0);
//   return (totalSalary / jobs.length).toFixed(2);
// }

// export default function JobInsightsPage() {
//   const [search, setSearch] = useState("");
//   const [darkMode, setDarkMode] = useState(false);

//   useEffect(() => {
//     if (darkMode) {
//       document.documentElement.classList.add("dark");
//     } else {
//       document.documentElement.classList.remove("dark");
//     }
//   }, [darkMode]);

//   const filteredJobs = jobInsights.filter((job) =>
//     job.title.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <motion.div 
//       initial={{ opacity: 0 }} 
//       animate={{ opacity: 1 }} 
//       transition={{ duration: 0.5 }}
//       className={`flex justify-center items-center min-h-screen p-4 transition-colors duration-500 ${darkMode ? "bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900" : "bg-gradient-to-r from-purple-500 via-pink-500 to-red-500"}`}
//     >
//       <Card className={`w-full max-w-4xl p-6 shadow-2xl rounded-xl transition-colors duration-500 ${darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
//         <CardHeader className={`rounded-t-xl transition-colors duration-500 ${darkMode ? "bg-blue-900 text-white" : "bg-gradient-to-r from-teal-400 to-blue-500 text-white"}`}>
//           <CardTitle className="text-xl font-bold text-center">📊 Job Listings Overview</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex justify-between items-center mb-6">
//             <Input
//               type="text"
//               placeholder="Search job titles..."
//               className={`w-1/2 p-3 border rounded-lg shadow-sm transition-colors duration-500 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-blue-400 focus:border-blue-600"}`}
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//             <div className="flex items-center gap-2">
//               <span>🌞</span>
//               <Switch checked={darkMode} onCheckedChange={setDarkMode} className={`transition-colors duration-500 ${darkMode ? "bg-blue-700" : "bg-blue-500"}`} />
//               <span>🌙</span>
//             </div>
//           </div>

//           {/* Enhanced Average Salary Display */}
//           <motion.div 
//             initial={{ scale: 0.8 }} 
//             animate={{ scale: 1 }} 
//             transition={{ duration: 0.5 }}
//             className={`flex flex-col items-center justify-center text-lg font-semibold mb-6 p-4 rounded-xl shadow-lg ${darkMode ? "bg-blue-800 text-gray-200" : "bg-yellow-100 text-gray-900"}`}
//           >
//             <TrendingUp className="w-10 h-10 text-green-500 mb-2" />
//             <p>Average Salary:</p>
//             <p className="text-2xl font-bold">💰 ${calculateAverageSalary(filteredJobs)} USD</p>
//           </motion.div>

//           {/* Job Performance Chart */}
//           <Card className={`mb-6 shadow-lg rounded-lg overflow-hidden transition-colors duration-500 ${darkMode ? "bg-gray-800 text-white" : "bg-gradient-to-r from-green-400 to-blue-500 text-white"}`}>
//             <CardHeader>
//               <CardTitle>📈 Job Performance Overview</CardTitle>
//             </CardHeader>
//             <CardContent className="h-80 p-6">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={jobData} barSize={50}>
//                   <XAxis dataKey="title" tick={{ fill: darkMode ? "#d1d5db" : "#ffffff" }} />
//                   <YAxis tick={{ fill: darkMode ? "#d1d5db" : "#ffffff" }} />
//                   <Tooltip contentStyle={{ backgroundColor: darkMode ? "#374151" : "#1e293b", color: "white" }} />
//                   <Legend />
//                   <Bar dataKey="views" fill={darkMode ? "#64748b" : "#ffbb33"} name="Views" />
//                   <Bar dataKey="applicants" fill={darkMode ? "#818cf8" : "#ff4444"} name="Applicants" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           {/* Job Insights Table */}
//           <Card className={`shadow-lg rounded-lg overflow-hidden transition-colors duration-500 ${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-r from-blue-600 to-purple-600 text-white"}`}>
//             <CardHeader>
//               <CardTitle>📋 Job Insights Table</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Table className="rounded-lg">
//                 <TableHeader>
//                   <TableRow className="bg-blue-700 text-white">
//                     <TableHead>Job Title</TableHead>
//                     <TableHead>Views</TableHead>
//                     <TableHead>Applicants</TableHead>
//                     <TableHead>Conversion Rate</TableHead>
//                     <TableHead>Avg Salary ($)</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {filteredJobs.length > 0 ? (
//                     filteredJobs.map((job) => (
//                       <TableRow key={job.id} className="hover:bg-blue-500">
//                         <TableCell>{job.title}</TableCell>
//                         <TableCell>{job.views}</TableCell>
//                         <TableCell>{job.applicants}</TableCell>
//                         <TableCell className="text-green-300 font-bold">{job.conversionRate}</TableCell>
//                         <TableCell className="text-yellow-300 font-bold">${job.avgSalary.toLocaleString()}</TableCell>
//                       </TableRow>
//                     ))
//                   ) : (
//                     <TableRow>
//                       <TableCell colSpan={5} className="text-center py-4 text-gray-300">No jobs found.</TableCell>
//                     </TableRow>
//                   )}
//                 </TableBody>
//               </Table>
//             </CardContent>
//           </Card>
//         </CardContent>
//       </Card>
//     </motion.div>
//   );
// }
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function JobInsights() {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchApplications = async () => {
      const { data, error } = await supabase.from("Applications").select("*, Employee(username), Job_Posting(title)");
      if (!error) setApplications(data);
    };
    fetchApplications();
  }, []);

  const filteredApplications = applications.filter(
    (app) =>
      (filter === "all" || app.status === filter) &&
      app.Employee?.username.toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(statusCounts).map((status) => ({ name: status, count: statusCounts[status] }));

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className={`min-h-screen p-6 transition-colors duration-500 ${darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}
    >
      <Card className="max-w-6xl mx-auto shadow-lg rounded-xl p-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">📊 Job Applications Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Input 
              type="text" 
              placeholder="Search by Employee..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-1/2 border p-3 rounded-md"
            />
            <div className="flex items-center gap-2">
              <span>🌞</span>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <span>🌙</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card className="p-4 shadow-md rounded-lg text-center">
              <CardTitle>Total Applications</CardTitle>
              <CardContent className="text-3xl font-bold">{applications.length}</CardContent>
            </Card>
            <Card className="p-4 shadow-md rounded-lg text-center">
              <CardTitle>Accepted</CardTitle>
              <CardContent className="text-3xl font-bold">{statusCounts["accepted"] || 0}</CardContent>
            </Card>
            <Card className="p-4 shadow-md rounded-lg text-center">
              <CardTitle>Pending</CardTitle>
              <CardContent className="text-3xl font-bold">{statusCounts["pending"] || 0}</CardContent>
            </Card>
          </div>

          <Card className="mb-6 shadow-md rounded-lg overflow-hidden">
            <CardHeader>
              <CardTitle>📈 Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-80 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={50}>
                  <XAxis dataKey="name" tick={{ fill: darkMode ? "#d1d5db" : "#374151" }} />
                  <YAxis tick={{ fill: darkMode ? "#d1d5db" : "#374151" }} />
                  <Tooltip contentStyle={{ backgroundColor: darkMode ? "#374151" : "#1e293b", color: "white" }} />
                  <Legend />
                  <Bar dataKey="count" fill={darkMode ? "#4f46e5" : "#6366f1"} name="Applications" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md rounded-lg overflow-hidden">
            <CardHeader>
              <CardTitle>📋 Applications Table</CardTitle>
            </CardHeader>
            <CardContent>
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="bg-blue-700 text-white">
                    <TableHead>Employee</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((app) => (
                      <TableRow key={app.Application_id} className="hover:bg-blue-500">
                        <TableCell>{app.Employee?.username}</TableCell>
                        <TableCell>{app.Job_Posting?.title}</TableCell>
                        <TableCell>{app.status}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-gray-400">No applications found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </motion.div>
  );
}