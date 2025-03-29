"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileText, User, Mail, Phone, Info } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "../layout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EditProfile() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [username, setUsername] = useState("");
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");

  const [cvInfo, setCvInfo] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("Employee")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) return setError("Failed to load profile");

      setUsername(data.username || "");
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setEmail(data.email || "");
      setPhoneNum(data.phone_num || "");
      setBio(data.bio || "");

      const { data: list } = await supabase.storage.from("cv-uploads").list(`cv/${user.id}`);

      if (list && list.length > 0) {
        const file = list[0];
        const { data: signedUrlData, error: signedUrlError } = await supabase.storage
          .from("cv-uploads")
          .createSignedUrl(`cv/${user.id}/${file.name}`, 60 * 60);

        if (!signedUrlError) {
          setCvInfo({ name: file.name, uploadedAt: file.updated_at, url: signedUrlData.signedUrl });
        }
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    const checkUsername = async () => {
      if (!username || !user?.id) return;
      const { data, error } = await supabase
        .from("Employee")
        .select("id")
        .eq("username", username)
        .neq("id", user.id)
        .maybeSingle();

      setUsernameTaken(!!data && !error);
    };

    checkUsername();
  }, [username, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(false);

    if (usernameTaken) {
      setError("This username is already taken.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("Employee")
      .update({
        username,
        first_name: firstName,
        last_name: lastName,
        email,
        phone_num: phoneNum,
        bio,
      })
      .eq("id", user.id);

    if (error) {
      setError("Failed to update profile.");
    } else {
      setSuccess(true);
    }

    setSubmitting(false);
  };

  const handleFileUpload = async (file) => {
    const filePath = `cv/${user.id}/${file.name}`;
    const { error } = await supabase.storage
      .from("cv-uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      alert("Upload failed: " + error.message);
    } else {
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from("cv-uploads")
        .createSignedUrl(filePath, 60 * 60);

      if (!signedUrlError) {
        setCvInfo({ name: file.name, uploadedAt: new Date().toISOString(), url: signedUrlData.signedUrl });
      }
      alert("CV uploaded successfully!");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><p className="text-gray-600">Checking authentication...</p></div>;
  }

  if (!user) {
    return <div className="min-h-screen flex justify-center items-center"><p className="text-gray-600 text-lg">You must be logged in to edit your profile.</p></div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Edit Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="mb-4 text-red-600 bg-red-50 border border-red-200 p-2 rounded">{error}</p>}
            {success && <p className="mb-4 text-green-600 bg-green-50 border border-green-200 p-2 rounded">Profile updated successfully!</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username" className="flex gap-1 items-center pb-1"><User size={14} /> Username</Label>
                  <Input id="username" required value={username} onChange={(e) => setUsername(e.target.value)} className={usernameTaken ? "border-red-500" : ""} />
                  {usernameTaken && <p className="text-sm text-red-500 mt-1">Username already taken</p>}
                </div>
                <div>
                  <Label htmlFor="firstName" className="flex gap-1 items-center pb-1"><User size={14} /> First Name</Label>
                  <Input id="firstName" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="lastName" className="flex gap-1 items-center pb-1"><User size={14} /> Last Name</Label>
                  <Input id="lastName" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email" className="flex gap-1 items-center pb-1"><Mail size={14} /> Email</Label>
                  <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone" className="flex gap-1 items-center pb-1"><Phone size={14} /> Phone Number</Label>
                  <Input id="phone" value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="bio" className="flex gap-1 items-center pb-1"><Info size={14} /> Bio</Label>
                <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself" />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <FileText size={18} /> Upload Your CV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              onDrop={async (e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) await handleFileUpload(file);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center bg-gray-50 cursor-pointer hover:border-gray-400"
              onClick={() => fileInputRef.current?.click()}
            >
              <p className="text-sm text-gray-600">Drag & drop your CV or click to upload</p>
              <input
                type="file"
                accept=".pdf"
                hidden
                ref={fileInputRef}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (file) await handleFileUpload(file);
                }}
              />
            </div>
            {cvInfo && (
              <p className="text-sm text-gray-700 mt-2">
                Current CV: <a href={cvInfo.url} download className="underline" target="_blank">{cvInfo.name}</a><br />
                <span className="text-xs text-gray-500">Uploaded: {new Date(cvInfo.uploadedAt).toLocaleString()}</span>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}