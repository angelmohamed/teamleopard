"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Local useAuth hook for demo (you can extract this if preferred)
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

export default function SendRequestPage() {
  const { applicationId } = useParams();
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [application, setApplication] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState("");

  // Fetch application details (to get the applicant's ID)
  const fetchApplication = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("Applications")
      .select("Application_id, employee_ID, Job_Posting(title)")
      .eq("Application_id", applicationId)
      .single();
    if (error) {
      console.error("Error fetching application:", error);
    } else {
      setApplication(data);
    }
    setLoading(false);
  }, [user, applicationId]);

  useEffect(() => {
    if (user && applicationId) {
      fetchApplication();
    }
  }, [user, applicationId, fetchApplication]);

  // Handler for sending the request.
  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!requestMessage.trim()) {
      setError("Please enter a request message.");
      return;
    }
    setError(null);
    setSending(true);

    const newRequest = {
      employee_receiver_id: application?.employee_ID,
      employer_receiver_id: user.id,
      title: "Request from Employer",
      content: requestMessage.trim(),
      link: `/dashboard/requests/${applicationId}`, // Conversation identifier
      read: false,
      hidden: false,
    };

    const { error: insertError } = await supabase
      .from("Notifications")
      .insert([newRequest]);

    if (insertError) {
      console.error("Error sending request:", insertError);
      setError("Failed to send request. Please try again.");
    } else {
      setSuccess("Request sent successfully!");
      setRequestMessage("");
      // Optionally, redirect back to applications after a delay:
      // router.push("/dashboard/applications");
    }
    setSending(false);
  };

  if (authLoading || loading) return <p>Loading...</p>;
  if (!user) return <p>You must be logged in to send a request.</p>;
  if (!application) return <p>Application not found.</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="py-4 bg-white shadow-md mb-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-bold">Send Request</h1>
          <Link href="/dashboard/applications" className="text-blue-500 hover:underline">
            Back to Applications
          </Link>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">
          Request for: {application.Job_Posting?.title || "Job Application"}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}
        <form onSubmit={handleSendRequest} className="space-y-4">
          <Textarea
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
            placeholder="Type your request message here..."
            rows={4}
            className="w-full p-2 border rounded"
          />
          <Button
            type="submit"
            disabled={sending}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2"
          >
            {sending ? "Sending..." : "Send Request"}
          </Button>
        </form>
      </main>
    </div>
  );
}
