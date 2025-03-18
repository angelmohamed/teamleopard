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

export default function EmployerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch CAPTCHA when the component loads
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

    // Validate CAPTCHA
    if (captcha !== captchaText) {
      setError("Incorrect CAPTCHA. Please try again.");
      fetchCaptcha(); // Refresh CAPTCHA on failure
      setLoading(false);
      return;
    }

    // Authenticate user using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Extract user ID from Supabase Auth
    const userId = authData.user?.id;
    if (!userId) {
      setError("Authentication failed. Please try again.");
      setLoading(false);
      return;
    }

    // Verify that the authenticated user has an Employer profile
    const { data: employerData, error: employerError } = await supabase
      .from("Employer")
      .select("*")
      .eq("id", userId)
      .single();

    if (employerError || !employerData) {
      setError("Employer profile not found.");
      setLoading(false);
      return;
    }

    // Save session and redirect upon successful login
    sessionStorage.setItem("employerId", employerData.id);
    window.location.href = `/dashboard/${employerData.id}`;
    setLoading(false);
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

                {/* CAPTCHA Section */}
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

            {/* Social Login */}
            <div className="flex items-center my-4">
              <div className="border-b flex-grow"></div>
              <p className="mx-3 text-gray-500 text-sm">or sign in with</p>
              <div className="border-b flex-grow"></div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="icon">
                {/* Social login icons */}
              </Button>
              <Button variant="outline" size="icon">
                {/* Social login icons */}
              </Button>
              <Button variant="outline" size="icon">
                {/* Social login icons */}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/sign-up" className="text-blue-600 hover:underline">
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Right Side - Image Background */}
      <div
        className="hidden md:block w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/login_image.jpg')" }}
      ></div>
    </div>
  );
}