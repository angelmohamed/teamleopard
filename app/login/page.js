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

export default function EmployeeLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
      // 1. Authenticate using Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) throw authError;

      // 2. Get employee data using the authenticated user's ID
      const { data: employeeData, error: queryError } = await supabase
        .from("Employee")
        .select("*")
        .eq("email", email) // Match by email since user_id might not be set yet
        .single();

      if (queryError) throw queryError;

      // 3. Verify employee exists
      if (!employeeData) {
        throw new Error("Employee record not found");
      }

      // 4. Store session and redirect
      sessionStorage.setItem("employeeId", employeeData.id);
      window.location.href = `/dashboard/${employeeData.id}`;

    } catch (error) {
      setError(error.message || "Authentication failed");
      fetchCaptcha();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex w-1/2 justify-center items-center bg-white p-10">
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
            <p className="text-sm">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-blue-600 hover:underline">
                Sign Up
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
