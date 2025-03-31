"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, Mail, Phone, Info } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EditCompanyProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [phoneNum, setPhoneNum] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) return router.replace("/login");

      const { data, error } = await supabase
        .from("Employer")
        .select("username, email, company_name, company_description, phone_num")
        .eq("id", authData.user.id)
        .single();

      if (error) {
        console.error("Error loading employer profile:", error);
        setError("Failed to load profile data.");
      } else {
        setUsername(data.username || "");
        setEmail(data.email || "");
        setCompanyName(data.company_name || "");
        setCompanyDescription(data.company_description || "");
        setPhoneNum(data.phone_num || "");
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;
    if (!userId) return;

    const { error } = await supabase
      .from("Employer")
      .update({
        username,
        email,
        company_name: companyName,
        company_description: companyDescription,
        phone_num: phoneNum,
      })
      .eq("id", userId);

    if (error) {
      setError("Failed to update profile.");
    } else {
      setSuccess(true);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-600">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Edit Your Company Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-red-600 bg-red-50 border border-red-200 p-2 rounded">{error}</p>}
          {success && <p className="mb-4 text-green-600 bg-green-50 border border-green-200 p-2 rounded">Profile updated successfully!</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="username" className="flex gap-1 items-center pb-1"><User size={14} /> Username</Label>
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="email" className="flex gap-1 items-center pb-1"><Mail size={14} /> Email</Label>
                <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="company_name" className="flex gap-1 items-center pb-1"><Info size={14} /> Company Name</Label>
                <Input id="company_name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="company_description" className="flex gap-1 items-center pb-1"><Info size={14} /> Company Description</Label>
                <Input id="company_description" value={companyDescription} onChange={(e) => setCompanyDescription(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone_num" className="flex gap-1 items-center pb-1"><Phone size={14} /> Phone Number</Label>
                <Input id="phone_num" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}