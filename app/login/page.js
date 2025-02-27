"use client";

import "../globals.css";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Adjust imports as necessary
import { Button } from "@/components/ui/button"; // Adjust import as necessary
import { Input } from "@/components/ui/input"; // Adjust import as necessary
import { Label } from "@/components/ui/label"; // Adjust import as necessary
import Link from "next/link"; // Correct import for Next.js Link
import { supabase } from "@/lib/supabaseClient"; // Import Supabase

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Reset error before new attempt

    // Supabase sign-in request
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message); // Show error message
    } else {
      window.location.href = "/dashboard"; // Redirect on success
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              {/* Email and Password Inputs */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button className="w-full" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex items-center justify-between">
          {/* Link to Sign Up page */}
          <div className="mt-4 text-center w-full">
            <p className="text-sm">
              Don't have an account?{" "}
              <Link href="/" className="text-blue-600 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
