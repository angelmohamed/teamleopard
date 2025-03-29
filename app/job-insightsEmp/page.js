"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";
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

  const filteredApplications = applications.filter(app =>
    (filter === "all" || app.status === filter) &&
    app.Employee?.username.toLowerCase().includes(search.toLowerCase())
  );

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.keys(statusCounts).map(status => ({ name: status, count: statusCounts[status] }));

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="p-6 min-h-screen transition-all duration-700 bg-gradient-to-br from-blue-300 via-purple-400 to-blue-600 text-gray-900"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        <Card className="bg-white shadow-xl border border-gray-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-extrabold bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">💼 Job Applications Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Input placeholder="🔎 Search by Employee..." value={search} onChange={e => setSearch(e.target.value)} className="p-3 border rounded-lg bg-gray-200 text-gray-900 placeholder-gray-500" />
              <Select onChange={e => setFilter(e.target.value)} className="p-3 border rounded-lg bg-gray-200 text-gray-900">
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} barSize={50}>
                <XAxis dataKey="name" stroke="gray" />
                <YAxis stroke="gray" />
                <Tooltip wrapperStyle={{ backgroundColor: "rgba(255,255,255,0.8)", color: "black" }} />
                <Legend wrapperStyle={{ color: "black" }} />
                <Bar dataKey="count" fill="url(#brightGradient)" name="Applications" />
                <defs>
                  <linearGradient id="brightGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6a5acd" />
                    <stop offset="100%" stopColor="#007bff" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-600 text-white">
                  <TableHead>Employee</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Skills</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications.length > 0 ? (
                  filteredApplications.map(app => (
                    <TableRow key={app.Application_id} className="hover:bg-blue-200">
                      <TableCell>{app.Employee?.username}</TableCell>
                      <TableCell>{app.Job_Posting?.title}</TableCell>
                      <TableCell className="font-bold text-purple-500">{app.status}</TableCell>
                      <TableCell>{JSON.parse(app.relevant_skills).join(", ")}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4 text-gray-500">No applications found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

