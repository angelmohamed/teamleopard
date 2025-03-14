"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../layout"; // Using session-based auth from layout as instructed
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function EditProfile() {
  const router = useRouter();
  const { user, loading } = useAuth(); // user and loading state from session

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form fields state
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  // Handle unauthenticated state without redirecting:
  if (!loading && !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 text-lg">You must be logged in to edit your profile.</p>
      </div>
    );
  }

  // Fetch employee data when user is available
  useEffect(() => {
    if (!user) return; // Wait for session

    async function fetchEmployeeData() {
      const { data, error } = await supabase
        .from("Employee")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching employee data:", error);
        setError("Failed to load profile data");
      } else if (data) {
        setUsername(data.username || "");
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setEmail(data.email || "");
        setBio(data.bio || "");
      }
    }

    fetchEmployeeData();
  }, [user]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from("Employee")
        .update({
          username,
          first_name: firstName,
          last_name: lastName,
          email,
          bio,
        })
        .eq("id", user.id);

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };
  
  // While authentication state is loading, show a message.
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Edit Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
              Profile updated successfully! Redirecting...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                {submitting ? "Saving Changes..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
