"use client";

import "../globals.css";
import React, { useState, useEffect } from "react";
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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fetch CAPTCHA on component mount
  const fetchCaptcha = async () => {
    const res = await fetch("/api/captcha");
    const data = await res.json();
    setCaptchaImage(data.svg);
    setCaptchaText(data.text);
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate CAPTCHA first
    if (captcha !== captchaText) {
      setError("Incorrect CAPTCHA. Please try again.");
      fetchCaptcha();
      setLoading(false);
      return;
    }

    try {
      console.log("🚀 Authenticating with Supabase...");
      // 1️⃣ Authenticate using Supabase Auth
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

      if (authError) throw authError;

      console.log("✅ Supabase Auth successful:", authData);

      // 2️⃣ Get authenticated user's ID
      const userId = authData.user.id;

      // 3️⃣ Check if user exists in Employee table
      const { data: employeeData, error: employeeError } = await supabase
        .from("Employee")
        .select("*")
        .eq("id", userId)
        .single();

      // 4️⃣ Check if user exists in Employer table
      const { data: employerData, error: employerError } = await supabase
        .from("Employer")
        .select("*")
        .eq("id", userId)
        .single();

      // 5️⃣ Determine user role and redirect accordingly
      if (employeeData) {
        console.log("✅ Employee login successful.");
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("role", "Employee");
        router.push("/dashboard/");
      } else if (employerData) {
        console.log("✅ Employer login successful.");
        sessionStorage.setItem("userId", userId);
        sessionStorage.setItem("role", "Employer");
        router.push("/company-dashboard/");
      } else {
        throw new Error("User profile not found.");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(error.message || "Authentication failed.");
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-row min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-white p-10">
        <Card className="w-full max-w-md shadow-lg rounded-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Log In</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
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

                {/* CAPTCHA */}
                <div className="flex flex-col items-center">
                  <Label>Enter the code shown below:</Label>
                  <div dangerouslySetInnerHTML={{ __html: captchaImage }} />
                  <Input
                    id="captcha"
                    type="text"
                    placeholder="Enter CAPTCHA"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="text-blue-600 text-sm mt-1"
                    onClick={fetchCaptcha}
                  >
                    Refresh CAPTCHA
                  </button>
                </div>

                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm">Don&apos;t have an account?</p>
            <p className="text-sm">
              <Link href="/sign-up" className="text-blue-600 hover:underline">
                Sign Up as Employee
              </Link>
            </p>
            <p className="text-sm">
              <Link href="/company-sign-up" className="text-blue-600 hover:underline">
                Sign Up as Employer
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      <div
        className="hidden md:block w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/login_image.jpg')" }}
      ></div>
    </div>
  );
}
