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

export default function CompanySignup() {
  const [username, setUsername] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

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

    const { error } = await supabase.from("Employer").insert([
      {
        username,
        email,
        company_name: companyName,
        company_description: companyDescription,
        phone_num: phoneNum,
        password, // Store securely with hashing in a real implementation
      },
    ]);

    if (error) {
      setError(error.message);
    } else {
      setSuccess("Account created successfully!");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex w-1/2 justify-center items-center bg-white p-10">
        <Card className="w-full max-w-md shadow-lg rounded-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Register As Employer</CardTitle>
          </CardHeader>
          <CardContent>
            {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
            {success && <p className="text-green-600 text-sm mb-2">{success}</p>}
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
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
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companyDescription">Company Description</Label>
                  <Input
                    id="companyDescription"
                    type="text"
                    placeholder="A short description"
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNum">Phone Number</Label>
                  <Input
                    id="phoneNum"
                    type="text"
                    placeholder="Your phone number"
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
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
              <Link href="/companyLogin" className="text-blue-600 hover:underline">
                Log In
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
      <div
        className="hidden md:block w-1/2 bg-cover bg-center"
        style={{
          backgroundImage: "url('/sign_up_bg.jpg')",
        }}
      ></div>
    </div>
  );
}
