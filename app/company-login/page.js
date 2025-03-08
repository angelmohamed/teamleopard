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
import { FaGoogle, FaApple, FaFacebook } from "react-icons/fa";

export default function CompanyLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Query the Employer table to check the email and password
    const { data, error: queryError } = await supabase
      .from("Employer")
      .select("*")
      .eq("email", email)
      .single();

    if (queryError) {
      setError("An error occurred while fetching the employer data.");
      setLoading(false);
      return;
    }

    // Verify password (assuming the password is stored as plain text for simplicity, ideally you should hash passwords)
    if (data && data.password === password) {
      // Set session data or redirect to the dashboard with employer's id
      window.location.href = `/company-dashboard/${data.id}`; // Pass the employer's ID in the URL
    } else {
      setError("Invalid email or password.");
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-row min-h-screen">
      {/* Left Side - Login Form */}
      <div className="flex w-full md:w-1/2 justify-center items-center bg-white p-10">
        <Card className="w-full max-w-md shadow-lg rounded-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">
              Log In as Employer
            </CardTitle>
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
              <p className="mx-3 text-gray-500 text-sm">or sign up with</p>
              <div className="border-b flex-grow"></div>
            </div>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="icon">
                <FaFacebook className="text-blue-600" />
              </Button>
              <Button variant="outline" size="icon">
                <FaGoogle className="text-red-500" />
              </Button>
              <Button variant="outline" size="icon">
                <FaApple className="text-black" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/company-sign-up"
                className="text-blue-600 hover:underline"
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Right Side - Image Background */}
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: "url('/login_image.jpg')",
        }}
      ></div>
    </div>
  );
}
