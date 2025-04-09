"use client";
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../layout"; // Adjust the path as needed
import Link from "next/link";

// This Requests page shows a unified list of "request" notifications.
// We assume that all notifications related to request conversations have a link
// that starts with '/dashboard/requests/'
export default function RequestsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [groupedConversations, setGroupedConversations] = useState({});
  const [loading, setLoading] = useState(true);
  // replyInputs holds the reply text for each conversation (keyed by conversation link)
  const [replyInputs, setReplyInputs] = useState({});

  // Function to fetch notifications that are part of request conversations.
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("Notifications")
      .select("*")
      .eq("employee_receiver_id", user.id)
      .eq("hidden", false)
      // Filter for notifications whose link starts with '/dashboard/requests/'
      .ilike("link", "/dashboard/requests/%")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } else {
      setNotifications(data);
      // Group notifications by their conversation link.
      const groups = data.reduce((acc, notif) => {
        const key = notif.link || "unknown";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(notif);
        return acc;
      }, {});
      setGroupedConversations(groups);
    }
    setLoading(false);
  }, [user]);

  // Real-time subscription: update notifications when changes occur.
  useEffect(() => {
    fetchNotifications();
    const sub = supabase
      .channel("notifications_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Notifications" },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, [fetchNotifications]);

  // Handlers for reply form input, keyed by conversation link.
  const handleReplyChange = (convLink, value) => {
    setReplyInputs((prev) => ({
      ...prev,
      [convLink]: value,
    }));
  };

  // When sending a reply, we need to determine the appropriate employer_receiver_id.
  // Here we simply check the existing messages in the conversation.
  const handleReplySubmit = async (convLink, e) => {
    e.preventDefault();
    const replyText = replyInputs[convLink];
    if (!replyText || !replyText.trim()) return;

    // Find the current conversation group.
    const conv = groupedConversations[convLink];
    let employerReceiverId = null;
    // We assume that if any notification in the conversation has an employer_receiver_id,
    // that is the intended recipient.
    if (conv && conv.length > 0) {
      for (let notif of conv) {
        if (notif.employer_receiver_id) {
          employerReceiverId = notif.employer_receiver_id;
          break;
        }
      }
    }

    // Construct the new notification as the employee's reply.
    const newNotif = {
      // Since this is a reply from the employee, the notification should be addressed
      // to the employer. We set employer_receiver_id accordingly.
      employer_receiver_id: employerReceiverId,
      // The notification for the employee might not need an employee_receiver_id,
      // or you could set it to user.id if you wish to keep a record.
      employee_receiver_id: user.id,
      title: "Employee Reply",
      content: replyText,
      // Use the same conversation link.
      link: convLink,
      read: false,
      hidden: false,
    };

    const { error } = await supabase.from("Notifications").insert([newNotif]);
    if (error) {
      console.error("Error sending reply:", error);
    } else {
      // Clear the reply input for this conversation.
      setReplyInputs((prev) => ({
        ...prev,
        [convLink]: "",
      }));
      fetchNotifications();
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>You must be logged in to view requests.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header with page title and a link back to applications */}
      <header className="py-4 bg-white shadow-md mb-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
          <h1 className="text-2xl font-semibold text-gray-800">Requests</h1>
          <Link href="/job-status" className="text-blue-500 hover:underline">
            Back to Applications
            </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto bg-white p-4 rounded shadow">
        {loading ? (
          <p>Loading requests...</p>
        ) : Object.keys(groupedConversations).length === 0 ? (
          <p className="text-gray-500">No requests available.</p>
        ) : (
          Object.entries(groupedConversations).map(([convLink, msgs]) => (
            <div key={convLink} className="mb-6 border p-4 rounded">
              <h2 className="text-lg font-bold mb-2">
                Conversation: {convLink}
              </h2>
              <div className="space-y-2 mb-2">
                {msgs.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded ${
                      msg.employer_receiver_id ? "bg-blue-100" : "bg-green-100"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              {/* Reply form for the conversation */}
              <form
                onSubmit={(e) => handleReplySubmit(convLink, e)}
                className="flex space-x-2"
              >
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={replyInputs[convLink] || ""}
                  onChange={(e) =>
                    handleReplyChange(convLink, e.target.value)
                  }
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Send Reply
                </button>
              </form>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
