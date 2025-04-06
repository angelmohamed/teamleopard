"use client";

import "../globals.css";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";

export default function EmployeeSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Checking if email already exists in Employee table...");

      // 1️⃣ First, check if email already exists in Employee table
      const { data: existingEmployee, error: employeeCheckError } =
        await supabase
          .from("Employee")
          .select("id")
          .eq("email", email)
          .single();

      if (existingEmployee) {
        setError("Email is already registered. Try logging in.");
        setLoading(false);
        return;
      }

      console.log("🚀 Signing up employee in Supabase Auth...");

      // 2️⃣ Sign up the user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${location.origin}/auth/callback` },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          setError("Email is already registered. Try logging in.");
        } else {
          setError(authError.message || "Error creating account.");
        }
        throw authError;
      }

      console.log("✅ Supabase Auth signup successful:", authData);

      // 3️⃣ Ensure `user.id` exists (may be null if email verification is required)
      const userId = authData.user?.id;
      if (!userId) {
        setError("Check your email to verify your account.");
        return;
      }

      console.log("🔗 Linking employee to Employee table...");

      // 4️⃣ Insert the employee into Employee table
      const { error: employeeError } = await supabase.from("Employee").insert([
        {
          id: userId, // Use Auth-generated user ID to keep them linked
          email,
          username,
          first_name: firstName,
          last_name: lastName,
          phone_num: phoneNum,
          bio,
        },
      ]);

      if (employeeError) throw employeeError;

      //send starter notification
      const { error: notiError } = await supabase.from("Notifications").insert([
        {
          employee_receiver_id: userId,
          title: "Welcome to Connect.",
          content: "Before you begin, we recommend uploading your CV in Resume IQ. After that, you're all set!",
          link: "/resume-iq",
        },
      ]);
      if (notiError) console.log("Notification error: ", notiError);

      setSuccess("Account created successfully! Please log in.");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      console.error("❌ Signup error:", error);
      setError(error.message || "Error creating account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row min-h-screen">
      {/* Left Side - Signup Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-white p-10">
        <Card className="w-full max-w-md shadow-lg rounded-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">
              Employee Sign Up
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            {success && (
              <p className="text-green-600 text-sm mb-2">{success}</p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNum">Phone Number</Label>
                  <Input
                    id="phoneNum"
                    type="text"
                    placeholder="+(555) 555-1234"
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    type="text"
                    placeholder="Tell us about yourself"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="********"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Signing Up..." : "Sign Up"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Log In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <div
        className="hidden md:block w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/sign_up_bg.jpg')" }}
      ></div>
    </div>
  );
}
