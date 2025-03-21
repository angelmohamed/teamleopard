"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProfile() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form fields state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [company_name, setCompanyName] = useState("");
  const [company_description, setCompanyDescription] = useState("");
  const [phone_num, setPhoneNum] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const params = useParams();
  const id = params.id;

  // Fetch current user data
  useEffect(() => {
    async function fetchEmployeeData() {
      if (!id) return;

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("Employee")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        
        if (data) {
          setUsername(data.username || "");
          setEmail(data.email || "");
          setCompanyName(data.company_name || "");
          setCompanyDescription(data.company_description || "");
          setPhoneNum(data.phone_num || "");
          setPassword(data.password || "");
        }
      } catch (err) {
        console.error("Error fetching employee data:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    }

    fetchEmployeeData();
  }, [id]);

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
          email,
          company_name,
          company_description,
          phone_num,
          password
        })
        .eq("id", id);

      if (error) throw error;
      
      setSuccess(true);
      // Redirect back to dashboard after successful update
      setTimeout(() => {
        router.push(`/dashboard/${id}`);
      }, 2000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Link href={`/dashboard/${id}`} className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Edit Your Profile</CardTitle>
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
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input 
                  id="company_name" 
                  value={company_name}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Company Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_description">Company Description</Label>
                <Input 
                  id="company_description" 
                  value={company_description}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder="Company Description"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_num">Phone Number</Label>
                <Input 
                  id="phone_num" 
                  value={phone_num}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  placeholder="Phone Number"
                /> 
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
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