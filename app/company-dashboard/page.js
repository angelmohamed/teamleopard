"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // shadcn button

export default function CompanyDashboard() {
  const [expanded, setExpanded] = useState(false);

  const recentActivities = [
    "🟢 Jane Doe has applied for Frontend Developer",
    "🟡 Interview scheduled for Nash Shook",
    "🔵 3 new applications received for UX Designer",
    "🔵 4 new applications received for Senior VP",
    "🔵 3 new applications received for Toilet Opener",
    "🔵 5 new applications received for Backend Engineer", // Extra line (should be hidden initially)
  ];

  return (
    <main className="flex flex-col gap-6 p-6">
      <h1 className="text-2xl font-bold">Company Dashboard</h1>

      {/* ✅ Two-column responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 📊 Left Column (Metrics + Charts) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Stats Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">12 Days</p>
                <p className="text-sm text-gray-500">Avg Time to Fill Position</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">245</p>
                <p className="text-sm text-gray-500">Total Job Listings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">7</p>
                <p className="text-sm text-gray-500">Active Job Listings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">8%</p>
                <p className="text-sm text-gray-500">Application Conversion Rate</p>
              </div>
            </CardContent>
          </Card>

          {/* Vacancy Start Chart (Placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle>Job Vacancy Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <p>📊 Chart Goes Here</p>
            </CardContent>
          </Card>
        </div>

        {/* 📌 Right Column (User Profile + Recent Activity) */}
        <div className="flex flex-col gap-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>John Doe</CardTitle>
              <p className="text-sm text-gray-500">HR Manager</p>
            </CardHeader>
            <CardContent>
              <button className="w-full bg-blue-500 text-white py-2 rounded-md">Update Profile</button>
            </CardContent>
          </Card>

          {/* ✅ Recent Activity with 'Show More' */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex flex-col gap-4 ${expanded ? "" : "max-h-32 overflow-hidden"}`}>
                {recentActivities.map((activity, index) => (
                  <p key={index} className="text-sm">{activity}</p>
                ))}
              </div>

              {/* Show More / Show Less Button */}
              {recentActivities.length > 5 && (
                <Button
                  variant="ghost"
                  className="mt-2 w-full text-blue-500"
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Show Less" : "Show More"}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
