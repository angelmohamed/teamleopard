import React from 'react';
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper function to ensure user has an Employee record
  const ensureEmployeeRecord = async (userId) => {
    try {
      // First check if user exists in Employee table
      const { data: employeeData, error: employeeError } = await supabase
        .from("Employee")
        .select("id")
        .eq("id", userId)
        .maybeSingle();
        
      if (employeeError) {
        console.error("Error checking employee data:", employeeError);
        return false;
      }
      
      // If employee record exists, we're good
      if (employeeData) {
        return true;
      }
      
      // Get user profile data from auth
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user data:", userError);
        return false;
      }
      
      // Create employee record with basic info
      const firstName = userData.user.user_metadata?.first_name || userData.user.email.split('@')[0];
      const lastName = userData.user.user_metadata?.last_name || '';

      const { error: insertError } = await supabase
        .from("Employee")
        .insert([{
          id: userId,
          email: userData.user.email,
          username: userData.user.email.split('@')[0], 
          first_name: firstName, 
          last_name: lastName,
          created_at: new Date().toISOString()
        }]);
      
      if (insertError) {
        console.error("Error creating employee record:", insertError);
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Unexpected error in ensureEmployeeRecord:", err);
      return false;
    }
  };

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return;

      setLoading(true);
      
      try {
        // Ensure user has an Employee record
        const employeeExists = await ensureEmployeeRecord(user.id);
        
        if (!employeeExists) {
          console.error("Failed to ensure employee record exists");
          setLoading(false);
          return;
        }
        
        // Fetch applications with job details
        const { data, error } = await supabase
          .from("Applications")
          .select(`
            Application_id, 
            created_at, 
            status,
            resume_file_name,
            cover_letter,
            job_posting_id,
            Job_Posting (
              posting_id, 
              title, 
              company_ID,
              Employer (
                company_name
              )
            )
          `)
          .eq("employee_ID", user.id)
          .order("created_at", { ascending: false });
  
        if (error) {
          console.error("Error fetching applications:", error);
        } else {
          setApplications(data || []);
        }
      } catch (err) {
        console.error("Unexpected error in fetchApplications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [user]);

  // Helper to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Get badge color based on status
  const getStatusBadge = (status) => {
    const statusMap = {
      "pending": "bg-yellow-100 text-yellow-800",
      "reviewed": "bg-blue-100 text-blue-800",
      "interview": "bg-purple-100 text-purple-800",
      "rejected": "bg-red-100 text-red-800",
      "accepted": "bg-green-100 text-green-800"
    };
    
    return statusMap[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center space-x-2 mb-6">
        <Link href="/dashboard" className="flex items-center text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Your Applications</h1>
      
      {loading ? (
        <p className="text-center text-gray-500 my-8">Loading your applications...</p>
      ) : applications.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't applied to any jobs yet.</p>
              <Link 
                href="/dashboard" 
                className="text-blue-600 hover:underline"
              >
                Browse jobs to apply
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((application) => (
            <Card key={application.Application_id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      <Link 
                        href={`/dashboard/listing/${application.job_posting_id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {application.Job_Posting?.title || "Job Unavailable"}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {application.Job_Posting?.Employer?.company_name || "Unknown Company"}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Applied on {formatDate(application.created_at)}
                    </p>
                  </div>
                  
                  <div className="mt-4 md:mt-0 flex flex-col md:items-end">
                    <Badge className={`${getStatusBadge(application.status)} px-2 py-1 text-xs uppercase hover:no-underline`}>
                      {application.status}
                    </Badge>
                    
                    {application.resume_file_name && (
                      <a 
                        href={application.resume_file_name} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-2"
                      >
                        View Resume
                      </a>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
