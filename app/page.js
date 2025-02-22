"use client";

import "./globals.css";
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Adjusted import assuming named export
import { Input } from "@/components/ui/input"; // Adjusted import assuming named export
import { Label } from "@/components/ui/label"; // Adjusted import assuming named export
import Link from "next/link"; // Correct import for Link from Next.js

export default function SignUp() {
  const [dob, setDob] = useState(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateSelect = (date) => {
    setDob(date);
    setIsCalendarOpen(false);
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
        </CardHeader>
        <CardContent>
          <form>
            {/* First Name, Last Name, Email, Password Fields */}
            <div className="grid w-full items-center gap-4">
              <div className="flex gap-4">
                <div className="flex flex-col space-y-1.5 w-full">
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="First Name" />
                </div>
                <div className="flex flex-col space-y-1.5 w-full">
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Last Name" />
                </div>
              </div>

              {/* Email and Password Fields */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="Email" />
              </div>

              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Password" />
              </div>

              {/* Date of Birth Input */}
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="dob">Date of Birth</Label>
                <div className="relative">
                  <Input
                    id="dob"
                    type="text"
                    placeholder="Select Date of Birth"
                    value={dob ? dob.toLocaleDateString() : ""}
                    onClick={toggleCalendar}
                  />
                  {isCalendarOpen && (
                    <div className="bg-white absolute z-50 top-full left-0 mt-2">
                      {/* Calendar component */}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button className="w-full" type="submit">Sign Up</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center items-center">
          <div className="text-s text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>

        {/* Link to Login page */}
      </Card>
    </div>
  );
}
